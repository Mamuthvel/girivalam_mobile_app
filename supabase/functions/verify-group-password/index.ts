import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PBKDF2 parameters - must match hash-group-password function
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits

function decodeHexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function verifyPasswordWithPBKDF2(password: string, storedHash: string): Promise<boolean> {
  // Check if it's the new format (salt:hash) or legacy format (plain SHA-256)
  if (!storedHash.includes(':')) {
    // Legacy SHA-256 format - verify using old method for backwards compatibility
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const legacyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return timingSafeEqual(storedHash, legacyHash);
  }
  
  // New PBKDF2 format: salt:hash
  const [saltHex, expectedHashHex] = storedHash.split(':');
  if (!saltHex || !expectedHashHex) {
    return false;
  }
  
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltBytes = decodeHexToBytes(saltHex);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2 with the stored salt
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(saltBytes.buffer, saltBytes.byteOffset, saltBytes.byteLength) as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    KEY_LENGTH * 8
  );
  
  const computedHash = encodeHex(new Uint8Array(derivedBits));
  
  return timingSafeEqual(expectedHashHex, computedHash);
}

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { groupId, password, passwordHash: legacyPasswordHash } = await req.json();

    if (!groupId) {
      return new Response(
        JSON.stringify({ error: 'Group ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Support both new (password) and legacy (passwordHash) verification
    const passwordToVerify = password;
    if (!passwordToVerify && !legacyPasswordHash) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the group and its password hash
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('password_hash, group_type')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return new Response(
        JSON.stringify({ error: 'Group not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If group is public, no password needed
    if (group.group_type === 'public') {
      return new Response(
        JSON.stringify({ valid: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For private groups, verify password hash
    if (!group.password_hash) {
      return new Response(
        JSON.stringify({ error: 'Private group has no password set' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let isValid = false;
    
    if (passwordToVerify) {
      // New method: verify password directly using PBKDF2
      isValid = await verifyPasswordWithPBKDF2(passwordToVerify, group.password_hash);
    } else if (legacyPasswordHash) {
      // Legacy method: for backwards compatibility with old clients
      // Only works with legacy SHA-256 hashes (no colon)
      if (!group.password_hash.includes(':')) {
        isValid = timingSafeEqual(group.password_hash, legacyPasswordHash);
      }
    }

    return new Response(
      JSON.stringify({ valid: isValid }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying password:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PBKDF2 parameters for secure password hashing
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

async function hashPasswordWithPBKDF2(password: string, salt?: Uint8Array): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Generate salt if not provided
  const saltBytes = salt || crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
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
  
  const hashBytes = new Uint8Array(derivedBits);
  
  return {
    hash: encodeHex(hashBytes),
    salt: encodeHex(saltBytes)
  };
}

function decodeHexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { password, action = 'hash' } = await req.json();

    // Validate password input
    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Password is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 4) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 4 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password.length > 128) {
      return new Response(
        JSON.stringify({ error: 'Password must be less than 128 characters' }),
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

    // Hash the password with PBKDF2 and a new random salt
    const { hash, salt } = await hashPasswordWithPBKDF2(password);
    
    // Return combined salt:hash format for storage
    const passwordHash = `${salt}:${hash}`;

    return new Response(
      JSON.stringify({ passwordHash }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error hashing password:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

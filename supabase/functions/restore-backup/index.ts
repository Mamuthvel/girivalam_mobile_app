import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed tables for restore (whitelist approach)
const ALLOWED_TABLES = [
  'profiles', 'services', 'bookings', 'groups', 'group_members',
  'group_messages', 'group_events', 'group_challenges', 'live_locations',
  'community_posts', 'post_likes', 'post_comments', 'mantra_audio',
  'service_providers', 'spiritual_events', 'support_messages', 'user_analytics',
  'feedback', 'food_locations', 'landmarks', 'saved_locations'
];

// Expected backup version
const SUPPORTED_BACKUP_VERSIONS = ['1.0', '1.1'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SECURITY: Restrict to super_admin only (not just admin)
    const { data: isSuperAdmin, error: superAdminError } = await supabaseClient.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'super_admin' 
    });

    if (superAdminError || !isSuperAdmin) {
      console.error('Restore attempt by non-super-admin:', user.id);
      return new Response(JSON.stringify({ error: 'Forbidden: Super admin role required for database restore' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { filename, confirmRestore } = requestBody;

    if (!filename || typeof filename !== 'string') {
      return new Response(JSON.stringify({ error: 'Filename is required and must be a string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SECURITY: Require explicit confirmation
    if (confirmRestore !== true) {
      return new Response(JSON.stringify({ error: 'Explicit confirmation required. Set confirmRestore: true to proceed.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate filename format (prevent path traversal)
    if (filename.includes('..') || filename.includes('/') || !filename.endsWith('.json')) {
      return new Response(JSON.stringify({ error: 'Invalid filename format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting database restore from: ${filename} by user: ${user.id}`);

    // Download backup file
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('database-backups')
      .download(filename);

    if (downloadError) {
      throw new Error(`Failed to download backup: ${downloadError.message}`);
    }

    const backupText = await fileData.text();
    let backupData;
    
    try {
      backupData = JSON.parse(backupText);
    } catch {
      throw new Error('Invalid backup file: not valid JSON');
    }

    // SECURITY: Validate backup structure
    if (!backupData.tables || typeof backupData.tables !== 'object') {
      throw new Error('Invalid backup format: missing tables object');
    }

    // Validate backup version
    if (!backupData.version || !SUPPORTED_BACKUP_VERSIONS.includes(backupData.version)) {
      throw new Error(`Unsupported backup version: ${backupData.version}. Supported: ${SUPPORTED_BACKUP_VERSIONS.join(', ')}`);
    }

    // SECURITY: Validate all table names against whitelist
    const tablesToRestore = Object.keys(backupData.tables);
    const invalidTables = tablesToRestore.filter(table => !ALLOWED_TABLES.includes(table));
    
    if (invalidTables.length > 0) {
      throw new Error(`Invalid tables in backup: ${invalidTables.join(', ')}. Only whitelisted tables can be restored.`);
    }

    console.log(`Backup version: ${backupData.version}, timestamp: ${backupData.timestamp}`);
    console.log(`Tables to restore: ${tablesToRestore.join(', ')}`);

    let restoredTables = 0;
    let restoredRows = 0;
    const errors: string[] = [];

    // Restore each table (in order to respect foreign key constraints)
    const restoreOrder = ALLOWED_TABLES.filter(table => tablesToRestore.includes(table));

    for (const table of restoreOrder) {
      if (!backupData.tables[table]) continue;

      const tableData = backupData.tables[table];
      if (tableData.error || !tableData.rows || tableData.rows.length === 0) {
        console.log(`Skipping ${table}: ${tableData.error || 'no data'}`);
        continue;
      }

      // SECURITY: Validate row data structure
      if (!Array.isArray(tableData.rows)) {
        errors.push(`Invalid data structure for table ${table}: rows must be an array`);
        continue;
      }

      console.log(`Restoring ${tableData.rows.length} rows to ${table}`);

      try {
        // Delete existing data
        const { error: deleteError } = await supabaseClient
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) {
          errors.push(`Failed to clear ${table}: ${deleteError.message}`);
          continue;
        }

        // Insert backup data
        const { error: insertError } = await supabaseClient
          .from(table)
          .insert(tableData.rows);

        if (insertError) {
          errors.push(`Failed to restore ${table}: ${insertError.message}`);
        } else {
          restoredTables++;
          restoredRows += tableData.rows.length;
        }
      } catch (err) {
        errors.push(`Error restoring ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    console.log(`Restore completed: ${restoredTables} tables, ${restoredRows} rows`);

    return new Response(
      JSON.stringify({
        success: true,
        restoredTables,
        restoredRows,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Restore error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

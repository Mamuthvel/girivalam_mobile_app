import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin using secure RPC function
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin', { _user_id: user.id });

    if (adminError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting database backup...');

    // Tables to backup
    const tables = [
      'bookings', 'community_posts', 'group_challenges', 'group_events',
      'group_members', 'group_messages', 'groups', 'live_locations',
      'mantra_audio', 'post_comments', 'post_likes', 'profiles',
      'service_providers', 'services', 'spiritual_events', 'support_messages',
      'user_analytics', 'backup_logs'
    ];

    const backupData: any = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tables: {}
    };

    let totalRows = 0;

    // Backup each table
    for (const table of tables) {
      console.log(`Backing up table: ${table}`);
      const { data, error } = await supabaseClient
        .from(table)
        .select('*');

      if (error) {
        console.error(`Error backing up ${table}:`, error);
        backupData.tables[table] = { error: error.message, rows: [] };
      } else {
        backupData.tables[table] = { rows: data || [] };
        totalRows += (data || []).length;
        console.log(`Backed up ${(data || []).length} rows from ${table}`);
      }
    }

    // Convert to JSON string
    const backupJson = JSON.stringify(backupData, null, 2);
    const backupSize = new Blob([backupJson]).size;

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from('database-backups')
      .upload(filename, backupJson, {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload backup: ${uploadError.message}`);
    }

    // Log backup metadata
    const { error: logError } = await supabaseClient
      .from('backup_logs')
      .insert({
        backup_file_path: filename,
        backup_size_bytes: backupSize,
        backup_type: 'full',
        status: 'completed',
        created_by: user.id,
        table_count: tables.length,
        total_rows: totalRows
      });

    if (logError) {
      console.error('Failed to log backup:', logError);
    }

    console.log(`Backup completed: ${filename}`);

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        size: backupSize,
        tableCount: tables.length,
        totalRows
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

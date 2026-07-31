-- Create storage bucket for database backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'database-backups',
  'database-backups',
  false,
  104857600, -- 100MB limit
  ARRAY['application/json', 'application/sql', 'application/gzip']
);

-- RLS policies for database-backups bucket
-- Only authenticated users with admin role can upload backups
CREATE POLICY "Admin users can upload backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'database-backups' 
  AND (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
);

-- Only authenticated users with admin role can view backups
CREATE POLICY "Admin users can view backups"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'database-backups'
  AND (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
);

-- Only authenticated users with admin role can delete backups
CREATE POLICY "Admin users can delete backups"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'database-backups'
  AND (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
);

-- Create a table to track backup metadata
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_file_path TEXT NOT NULL,
  backup_size_bytes BIGINT,
  backup_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'completed',
  created_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  table_count INTEGER,
  total_rows BIGINT,
  error_message TEXT
);

-- Enable RLS on backup_logs
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for backup_logs
CREATE POLICY "Admin users can view backup logs"
ON public.backup_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admin users can create backup logs"
ON public.backup_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Create index for faster queries
CREATE INDEX idx_backup_logs_created_at ON public.backup_logs(created_at DESC);
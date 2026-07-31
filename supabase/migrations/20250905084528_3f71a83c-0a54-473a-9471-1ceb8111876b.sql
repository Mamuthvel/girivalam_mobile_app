-- Add group type and password fields to groups table
ALTER TABLE public.groups 
ADD COLUMN group_type text NOT NULL DEFAULT 'public' CHECK (group_type IN ('public', 'private')),
ADD COLUMN password_hash text DEFAULT NULL;

-- Update existing groups to be public by default
UPDATE public.groups SET group_type = 'public' WHERE group_type IS NULL;
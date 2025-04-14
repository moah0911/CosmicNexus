-- Add relationship_type column to connections table
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'related';

-- Create tables for Resonance Map

-- Interest Nodes table
CREATE TABLE IF NOT EXISTS public.interest_nodes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on interest_nodes
ALTER TABLE public.interest_nodes ENABLE ROW LEVEL SECURITY;

-- Create policy for interest_nodes
CREATE POLICY "Users can only access their own interest nodes"
  ON public.interest_nodes
  FOR ALL
  USING (auth.uid() = user_id);

-- Connections table
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_node_id UUID REFERENCES public.interest_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES public.interest_nodes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  strength INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create policy for connections
CREATE POLICY "Users can only access their own connections"
  ON public.connections
  FOR ALL
  USING (auth.uid() = user_id);

-- Discovery Prompts table
CREATE TABLE IF NOT EXISTS public.discovery_prompts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  related_nodes TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on discovery_prompts
ALTER TABLE public.discovery_prompts ENABLE ROW LEVEL SECURITY;

-- Create policy for discovery_prompts
CREATE POLICY "Users can only access their own discovery prompts"
  ON public.discovery_prompts
  FOR ALL
  USING (auth.uid() = user_id);
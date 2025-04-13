import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupDatabase() {
  try {
    console.log('Starting database setup...')
    console.log(`Using Supabase URL: ${supabaseUrl}`)
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20231026000000_create_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      });
      
      if (error) {
        // If the error is about the function not existing, we need to create it first
        if (error.message.includes('function "exec_sql" does not exist')) {
          console.log('Creating exec_sql function...');
          
          // Create the exec_sql function
          const createFunctionSQL = `
            CREATE OR REPLACE FUNCTION exec_sql(sql text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$;
          `;
          
          const { error: funcError } = await supabase.rpc('exec_sql', { 
            sql: createFunctionSQL 
          });
          
          if (funcError) {
            console.error('Error creating exec_sql function:', funcError);
            
            // Try direct SQL execution as a fallback
            console.log('Attempting direct SQL execution...');
            try {
              // For tables
              if (statement.toLowerCase().includes('create table')) {
                const { error: tableError } = await supabase.from('interest_nodes').select('count(*)');
                if (tableError && tableError.code === '42P01') { // relation does not exist
                  console.log('Creating interest_nodes table directly...');
                  await supabase.sql(`
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
                    
                    ALTER TABLE public.interest_nodes ENABLE ROW LEVEL SECURITY;
                    
                    CREATE POLICY "Users can only access their own interest nodes"
                      ON public.interest_nodes
                      FOR ALL
                      USING (auth.uid() = user_id);
                  `);
                  
                  console.log('Creating connections table directly...');
                  await supabase.sql(`
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
                    
                    ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
                    
                    CREATE POLICY "Users can only access their own connections"
                      ON public.connections
                      FOR ALL
                      USING (auth.uid() = user_id);
                  `);
                  
                  console.log('Creating discovery_prompts table directly...');
                  await supabase.sql(`
                    CREATE TABLE IF NOT EXISTS public.discovery_prompts (
                      id UUID PRIMARY KEY,
                      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                      content TEXT NOT NULL,
                      related_nodes TEXT[] DEFAULT '{}',
                      is_favorite BOOLEAN DEFAULT false,
                      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
                      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
                    );
                    
                    ALTER TABLE public.discovery_prompts ENABLE ROW LEVEL SECURITY;
                    
                    CREATE POLICY "Users can only access their own discovery prompts"
                      ON public.discovery_prompts
                      FOR ALL
                      USING (auth.uid() = user_id);
                  `);
                }
              }
            } catch (directError) {
              console.error('Error with direct SQL execution:', directError);
            }
          } else {
            // Try executing the statement again
            const { error: retryError } = await supabase.rpc('exec_sql', { 
              sql: statement + ';' 
            });
            
            if (retryError) {
              console.error(`Error executing statement ${i + 1}:`, retryError);
            }
          }
        } else {
          console.error(`Error executing statement ${i + 1}:`, error);
        }
      }
    }
    
    // Verify tables exist
    console.log('Verifying tables...');
    
    const { data: interestNodes, error: interestNodesError } = await supabase
      .from('interest_nodes')
      .select('count(*)', { count: 'exact', head: true });
      
    if (interestNodesError) {
      console.error('Error verifying interest_nodes table:', interestNodesError);
    } else {
      console.log('interest_nodes table exists!');
    }
    
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('count(*)', { count: 'exact', head: true });
      
    if (connectionsError) {
      console.error('Error verifying connections table:', connectionsError);
    } else {
      console.log('connections table exists!');
    }
    
    const { data: discoveryPrompts, error: discoveryPromptsError } = await supabase
      .from('discovery_prompts')
      .select('count(*)', { count: 'exact', head: true });
      
    if (discoveryPromptsError) {
      console.error('Error verifying discovery_prompts table:', discoveryPromptsError);
    } else {
      console.log('discovery_prompts table exists!');
    }
    
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
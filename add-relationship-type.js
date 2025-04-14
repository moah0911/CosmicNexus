import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config()

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function addRelationshipTypeColumn() {
  try {
    console.log('Adding relationship_type column to connections table...')
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240414000001_add_relationship_type.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Execute the SQL directly
    const { error } = await supabase.sql(migrationSQL)
    
    if (error) {
      console.error('Error adding relationship_type column:', error)
      process.exit(1)
    }
    
    console.log('Successfully added relationship_type column to connections table!')
    
    // Verify the column exists
    const { data, error: verifyError } = await supabase
      .from('connections')
      .select('relationship_type')
      .limit(1)
    
    if (verifyError) {
      if (verifyError.message.includes('column "relationship_type" does not exist')) {
        console.error('Failed to add relationship_type column. Column does not exist after migration.')
        process.exit(1)
      } else {
        console.warn('Warning: Could not verify column, but it might still exist:', verifyError)
      }
    } else {
      console.log('Verified relationship_type column exists!')
    }
    
  } catch (error) {
    console.error('Error running migration:', error)
    process.exit(1)
  }
}

// Run the migration
addRelationshipTypeColumn()

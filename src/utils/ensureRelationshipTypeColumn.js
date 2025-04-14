import { supabase } from '../lib/supabase'
import { refreshSchemaCache } from './refreshSchemaCache'

/**
 * Ensures the relationship_type column exists in the connections table
 * This is a workaround for the schema cache issue
 */
export const ensureRelationshipTypeColumn = async () => {
  try {
    // First try to refresh the schema cache
    await refreshSchemaCache()
    
    // Try to add the column if it doesn't exist
    await supabase.sql(`
      ALTER TABLE public.connections 
      ADD COLUMN IF NOT EXISTS relationship_type TEXT DEFAULT 'related';
    `)
    
    // Refresh the schema cache again
    await refreshSchemaCache()
    
    return true
  } catch (error) {
    console.error('Error ensuring relationship_type column exists:', error)
    return false
  }
}

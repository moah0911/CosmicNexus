import { supabase } from '../lib/supabase'

/**
 * Refreshes the Supabase client's schema cache
 * This can resolve issues where the client doesn't recognize columns that exist in the database
 */
export const refreshSchemaCache = async () => {
  try {
    // Force a schema refresh by making a metadata query
    await supabase.rpc('get_schema_version')
      .catch(() => {
        // This RPC might not exist, which is fine
        // The attempt itself should trigger a schema refresh
      })

    // Alternative approach: query the table structure directly
    const { error } = await supabase
      .from('connections')
      .select('id, is_manual, relationship_type')
      .limit(1)

    if (error && (error.message.includes('column "is_manual" does not exist') ||
                 error.message.includes('column "relationship_type" does not exist'))) {
      console.error('Schema cache refresh failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error refreshing schema cache:', error)
    return false
  }
}
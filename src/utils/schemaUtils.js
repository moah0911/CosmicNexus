import { supabase } from '../lib/supabase'

/**
 * Database schema definitions for consistent use across the application
 */
export const DB_SCHEMA = {
  TABLES: {
    INTEREST_NODES: 'interest_nodes',
    CONNECTIONS: 'connections',
    DISCOVERY_PROMPTS: 'discovery_prompts'
  },
  COLUMNS: {
    INTEREST_NODES: [
      'id', 'user_id', 'title', 'description', 'category',
      'notes', 'created_at', 'updated_at'
    ],
    CONNECTIONS: [
      'id', 'user_id', 'source_node_id', 'target_node_id',
      'description', 'strength', 'created_at', 'updated_at'
      // Note: relationship_type is intentionally omitted to avoid schema cache issues
    ],
    DISCOVERY_PROMPTS: [
      'id', 'user_id', 'prompt', 'response', 'is_completed',
      'created_at', 'updated_at'
    ]
  },
  // Client-side only fields that should be added after fetching from DB
  CLIENT_FIELDS: {
    CONNECTIONS: {
      is_manual: false,
      relationship_type: 'related'
    }
  }
}

/**
 * Safely select columns from a table, avoiding schema cache issues
 * @param {string} table - The table name
 * @returns {string} - A comma-separated list of safe columns
 */
export const getSafeColumns = (table) => {
  const tableKey = Object.keys(DB_SCHEMA.TABLES)
    .find(key => DB_SCHEMA.TABLES[key] === table)

  if (!tableKey || !DB_SCHEMA.COLUMNS[tableKey]) {
    console.warn(`No safe columns defined for table: ${table}`)
    return '*' // Fallback to all columns, but this might cause issues
  }

  return DB_SCHEMA.COLUMNS[tableKey].join(', ')
}

/**
 * Add client-side fields to database records
 * @param {string} table - The table name
 * @param {Array} records - The database records
 * @returns {Array} - Records with client-side fields added
 */
export const addClientFields = (table, records) => {
  if (!records || !Array.isArray(records)) return []

  const tableKey = Object.keys(DB_SCHEMA.TABLES)
    .find(key => DB_SCHEMA.TABLES[key] === table)

  if (!tableKey || !DB_SCHEMA.CLIENT_FIELDS[tableKey]) {
    return records // No client fields to add
  }

  return records.map(record => ({
    ...record,
    ...DB_SCHEMA.CLIENT_FIELDS[tableKey]
  }))
}

/**
 * Remove client-side fields from records before sending to the database
 * @param {string} table - The table name
 * @param {Object} record - The record to sanitize
 * @returns {Object} - Record with client-side fields removed
 */
export const sanitizeForDB = (table, record) => {
  if (!record || typeof record !== 'object') return {}

  const tableKey = Object.keys(DB_SCHEMA.TABLES)
    .find(key => DB_SCHEMA.TABLES[key] === table)

  if (!tableKey) return record

  // Create a new object with only the allowed columns
  const sanitized = {}
  DB_SCHEMA.COLUMNS[tableKey].forEach(column => {
    if (record[column] !== undefined) {
      sanitized[column] = record[column]
    }
  })

  return sanitized
}

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
    // Use only the safe columns we know exist
    const { error } = await supabase
      .from(DB_SCHEMA.TABLES.CONNECTIONS)
      .select('id, source_node_id, target_node_id')
      .limit(1)

    if (error) {
      console.error('Schema cache refresh failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error refreshing schema cache:', error)
    return false
  }
}
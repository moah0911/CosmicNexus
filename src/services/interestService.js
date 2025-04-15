import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { generateAIConnections } from './geminiService'
import {
  DB_SCHEMA,
  getSafeColumns,
  addClientFields,
  sanitizeForDB,
  refreshSchemaCache
} from '../utils/schemaUtils'

// Fetch all interest nodes for the current user
export const fetchInterestNodes = async () => {
  try {
    console.log("fetchInterestNodes: Starting to fetch nodes");

    const authResponse = await supabase.auth.getUser();
    console.log("fetchInterestNodes: Auth response received", { hasUser: !!authResponse.data.user });

    const { data: { user } } = authResponse;

    if (!user) {
      console.error("fetchInterestNodes: No authenticated user found");
      throw new Error('User not authenticated')
    }

    console.log("fetchInterestNodes: Querying database for nodes");
    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.INTEREST_NODES)
      .select(getSafeColumns(DB_SCHEMA.TABLES.INTEREST_NODES))
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("fetchInterestNodes: Database error", error);
      throw error;
    }

    console.log(`fetchInterestNodes: Successfully fetched ${data?.length || 0} nodes`);

    // Return empty array if data is null or undefined
    const safeData = data || [];
    return { success: true, data: safeData };
  } catch (error) {
    console.error('Error fetching interest nodes:', error);
    return { success: false, error };
  }
}

// Create a new interest node
export const createInterestNode = async (nodeData) => {
  try {
    // Validate required fields
    if (!nodeData.title || !nodeData.title.trim()) {
      return { success: false, error: { message: 'Title is required' } }
    }

    if (!nodeData.description || !nodeData.description.trim()) {
      return { success: false, error: { message: 'Description is required' } }
    }

    if (!nodeData.category) {
      return { success: false, error: { message: 'Category is required' } }
    }

    // Validate title length
    if (nodeData.title.trim().length > 50) {
      return { success: false, error: { message: 'Title must be less than 50 characters' } }
    }

    // Clean the data
    const cleanedData = {
      title: nodeData.title.trim(),
      category: nodeData.category,
      description: nodeData.description.trim(),
      notes: nodeData.notes ? nodeData.notes.trim() : ''
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check for duplicate title
    const { data: existingNodes, error: checkError } = await supabase
      .from(DB_SCHEMA.TABLES.INTEREST_NODES)
      .select('id, title')
      .eq('user_id', user.id)
      .ilike('title', cleanedData.title)

    if (checkError) throw checkError

    if (existingNodes && existingNodes.length > 0) {
      return {
        success: false,
        error: { message: 'A node with a similar title already exists' },
        duplicates: existingNodes
      }
    }

    // Create a sanitized record for the database
    const nodeRecord = sanitizeForDB(DB_SCHEMA.TABLES.INTEREST_NODES, {
      id: uuidv4(),
      user_id: user.id,
      ...cleanedData
    });

    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.INTEREST_NODES)
      .insert([nodeRecord])
      .select(getSafeColumns(DB_SCHEMA.TABLES.INTEREST_NODES))

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error creating interest node:', error)
    return { success: false, error }
  }
}

// Update an existing interest node
export const updateInterestNode = async (id, nodeData) => {
  try {
    // Validate required fields
    if (!nodeData.title || !nodeData.title.trim()) {
      return { success: false, error: { message: 'Title is required' } }
    }

    if (!nodeData.description || !nodeData.description.trim()) {
      return { success: false, error: { message: 'Description is required' } }
    }

    if (!nodeData.category) {
      return { success: false, error: { message: 'Category is required' } }
    }

    // Validate title length
    if (nodeData.title.trim().length > 50) {
      return { success: false, error: { message: 'Title must be less than 50 characters' } }
    }

    // Clean the data
    const cleanedData = {
      title: nodeData.title.trim(),
      category: nodeData.category,
      description: nodeData.description.trim(),
      notes: nodeData.notes ? nodeData.notes.trim() : '',
      updated_at: new Date().toISOString()
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check for duplicate title but exclude the current node
    const { data: existingNodes, error: checkError } = await supabase
      .from('interest_nodes')
      .select('id, title')
      .eq('user_id', user.id)
      .neq('id', id) // Exclude the current node
      .ilike('title', cleanedData.title)

    if (checkError) throw checkError

    if (existingNodes && existingNodes.length > 0) {
      return {
        success: false,
        error: { message: 'A node with a similar title already exists' },
        duplicates: existingNodes
      }
    }

    const { data, error } = await supabase
      .from('interest_nodes')
      .update(cleanedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating interest node:', error)
    return { success: false, error }
  }
}

// Delete an interest node
export const deleteInterestNode = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log(`deleteInterestNode: Deleting connections for node with id ${id}`);

    // Refresh schema cache to ensure we have the latest schema
    await refreshSchemaCache()

    // First delete all connections involving this node
    const { error: connectionsError } = await supabase
      .from(DB_SCHEMA.TABLES.CONNECTIONS)
      .delete()
      .or(`source_node_id.eq.${id},target_node_id.eq.${id}`)
      .eq('user_id', user.id)

    if (connectionsError) {
      console.error('Error deleting connections for node:', connectionsError);
      throw connectionsError;
    }

    console.log(`deleteInterestNode: Deleting node with id ${id}`);

    // Then delete the node itself
    const { error } = await supabase
      .from(DB_SCHEMA.TABLES.INTEREST_NODES)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting node:', error);
      throw error;
    }

    console.log(`deleteInterestNode: Successfully deleted node with id ${id}`);
    return { success: true }
  } catch (error) {
    console.error('Error deleting interest node:', error)
    return { success: false, error }
  }
}

// Fetch connections between interest nodes
export const fetchConnections = async () => {
  try {
    console.log("fetchConnections: Starting to fetch connections");

    const authResponse = await supabase.auth.getUser();
    console.log("fetchConnections: Auth response received", { hasUser: !!authResponse.data.user });

    const { data: { user } } = authResponse;

    if (!user) {
      console.error("fetchConnections: No authenticated user found");
      throw new Error('User not authenticated')
    }

    // Use our schema utility to get safe columns
    console.log("fetchConnections: Querying database for connections with safe columns");
    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.CONNECTIONS)
      .select(getSafeColumns(DB_SCHEMA.TABLES.CONNECTIONS))
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("fetchConnections: Database error", error);
      throw error;
    }

    console.log(`fetchConnections: Successfully fetched ${data?.length || 0} connections`);

    // Add client-side fields to the connections
    const connectionsWithClientFields = addClientFields(DB_SCHEMA.TABLES.CONNECTIONS, data || []);

    return { success: true, data: connectionsWithClientFields };
  } catch (error) {
    console.error('Error fetching connections:', error);
    return { success: false, error };
  }
}

// Generate connections using Gemini API or manually
export const generateConnections = async (selectedNodeIds, options = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: nodes, error } = await supabase
      .from(DB_SCHEMA.TABLES.INTEREST_NODES)
      .select(getSafeColumns(DB_SCHEMA.TABLES.INTEREST_NODES))
      .in('id', selectedNodeIds)
      .eq('user_id', user.id)

    if (error) throw error

    if (!nodes || nodes.length < 2) {
      throw new Error('Please select at least two interest nodes to find connections')
    }

    // Check if this is a manual connection creation
    if (options.manualDescription && selectedNodeIds.length === 2) {
      // Create a sanitized connection record for the database
      const connectionData = sanitizeForDB(DB_SCHEMA.TABLES.CONNECTIONS, {
        id: uuidv4(),
        user_id: user.id,
        source_node_id: selectedNodeIds[0],
        target_node_id: selectedNodeIds[1],
        description: options.manualDescription,
        strength: options.strength || 3,
        created_at: new Date().toISOString()
      });

      console.log("generateConnections: Creating manual connection with strength:", options.strength);

      try {
        const { error: insertError } = await supabase
          .from(DB_SCHEMA.TABLES.CONNECTIONS)
          .insert([connectionData])

        if (insertError) {
          console.error('Error inserting manual connection:', insertError);
          throw insertError;
        }
      } catch (insertError) {
        console.error('Error inserting manual connection:', insertError);
        throw insertError;
      }

      // Add client-side fields for the frontend
      const manualConnection = {
        ...connectionData,
        relationship_type: options.relationshipType || 'related',
        is_manual: true
      };

      return { success: true, connections: [manualConnection] };
    }

    // Call Gemini API directly for AI-generated connections
    const aiResults = await generateAIConnections(nodes)

    // Save the generated connections
    if (aiResults.connections && aiResults.connections.length > 0) {
      // Create connections without the is_manual field to avoid schema cache issues
      const connectionsToInsert = aiResults.connections.map(connection => ({
        id: uuidv4(),
        user_id: user.id,
        source_node_id: connection.sourceNodeId,
        target_node_id: connection.targetNodeId,
        description: connection.description,
        strength: connection.strength || 1
        // Intentionally omitting is_manual
      }));

      console.log("generateConnections: Creating AI connections without is_manual field");

      try {
        const { error: insertError } = await supabase
          .from('connections')
          .insert(connectionsToInsert)

        if (insertError) {
          console.error('Error inserting AI connections:', insertError);
          throw insertError;
        }
      } catch (insertError) {
        console.error('Error inserting AI connections:', insertError);
        throw insertError;
      }

      // Add is_manual for the client-side representation
      const connectionsWithManualFlag = connectionsToInsert.map(conn => ({
        ...conn,
        is_manual: false
      }));

      // Update the connections in the aiResults for the return value
      aiResults.connections = connectionsWithManualFlag;
    }

    // Save discovery prompts
    if (aiResults.discoveryPrompts && aiResults.discoveryPrompts.length > 0) {
      const promptsToInsert = aiResults.discoveryPrompts.map(prompt => ({
        id: uuidv4(),
        user_id: user.id,
        content: prompt.content,
        related_nodes: prompt.related_nodes || []
      }))

      const { error: insertError } = await supabase
        .from('discovery_prompts')
        .insert(promptsToInsert)

      if (insertError) throw insertError
    }

    // Make sure we return a consistent response format
    return {
      success: true,
      connections: aiResults.connections || [],
      discoveryPrompts: aiResults.discoveryPrompts || []
    }
  } catch (error) {
    console.error('Error generating connections:', error)
    return { success: false, error }
  }
}

// Save discovery prompts
export const saveDiscoveryPrompt = async (prompt) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Refresh schema cache to ensure we have the latest schema
    await refreshSchemaCache()

    // Prepare the data with proper sanitization
    const promptData = sanitizeForDB(DB_SCHEMA.TABLES.DISCOVERY_PROMPTS, {
      id: uuidv4(),
      user_id: user.id,
      ...prompt
    })

    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.DISCOVERY_PROMPTS)
      .insert([promptData])
      .select()

    if (error) {
      console.error('Error saving discovery prompt:', error)
      throw error
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error saving discovery prompt:', error)
    return { success: false, error }
  }
}

// Fetch discovery prompts
export const fetchDiscoveryPrompts = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Refresh schema cache to ensure we have the latest schema
    await refreshSchemaCache()

    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.DISCOVERY_PROMPTS)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching discovery prompts:', error)
      throw error
    }
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching discovery prompts:', error)
    return { success: false, error }
  }
}

// Toggle favorite status of a discovery prompt
export const toggleFavoritePrompt = async (id, isFavorite) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Refresh schema cache to ensure we have the latest schema
    await refreshSchemaCache()

    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.DISCOVERY_PROMPTS)
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('Error toggling favorite status:', error)
      throw error
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error toggling favorite status:', error)
    return { success: false, error }
  }
}

// Delete a connection
export const deleteConnection = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log(`deleteConnection: Deleting connection with id ${id}`);

    // Use the schema constants for consistency
    const { error } = await supabase
      .from(DB_SCHEMA.TABLES.CONNECTIONS)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }

    console.log(`deleteConnection: Successfully deleted connection with id ${id}`);
    return { success: true }
  } catch (error) {
    console.error('Error deleting connection:', error)
    return { success: false, error }
  }
}

// Delete a discovery prompt
export const deleteDiscoveryPrompt = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Refresh schema cache to ensure we have the latest schema
    await refreshSchemaCache()

    const { error } = await supabase
      .from(DB_SCHEMA.TABLES.DISCOVERY_PROMPTS)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting discovery prompt:', error)
      throw error
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting discovery prompt:', error)
    return { success: false, error }
  }
}

// Fetch a single interest node by ID
export const fetchInterestNodeById = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.INTEREST_NODES)
      .select(getSafeColumns(DB_SCHEMA.TABLES.INTEREST_NODES))
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching interest node by ID:', error)
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching interest node by ID:', error)
    return { success: false, error }
  }
}

// Fetch connections for a specific node
export const fetchNodeConnections = async (nodeId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Use our schema utility to get safe columns
    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.CONNECTIONS)
      .select(`
        ${getSafeColumns(DB_SCHEMA.TABLES.CONNECTIONS)},
        source_node:${DB_SCHEMA.TABLES.INTEREST_NODES}!source_node_id(id, title, category),
        target_node:${DB_SCHEMA.TABLES.INTEREST_NODES}!target_node_id(id, title, category)
      `)
      .or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching node connections:', error)
      throw error
    }

    // Process the connections to add source_name and target_name
    const processedConnections = (data || []).map(conn => ({
      ...conn,
      source_name: conn.source_node?.title || 'Unknown',
      target_name: conn.target_node?.title || 'Unknown',
      relationship_type: conn.relationship_type || 'related',
      is_manual: conn.is_manual || false
    }))

    return { success: true, data: processedConnections }
  } catch (error) {
    console.error('Error fetching node connections:', error)
    return { success: false, error }
  }
}

// Create a new connection
export const createConnection = async (connectionData) => {
  try {
    // Validate required fields
    if (!connectionData.source_node_id) {
      return { success: false, error: { message: 'Source node is required' } }
    }

    if (!connectionData.target_node_id) {
      return { success: false, error: { message: 'Target node is required' } }
    }

    if (connectionData.source_node_id === connectionData.target_node_id) {
      return { success: false, error: { message: 'Source and target nodes must be different' } }
    }

    if (!connectionData.description || !connectionData.description.trim()) {
      return { success: false, error: { message: 'Description is required' } }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if a similar connection already exists
    const { data: existingConnections, error: checkError } = await supabase
      .from(DB_SCHEMA.TABLES.CONNECTIONS)
      .select('id')
      .eq('user_id', user.id)
      .eq('source_node_id', connectionData.source_node_id)
      .eq('target_node_id', connectionData.target_node_id)

    if (checkError) throw checkError

    if (existingConnections && existingConnections.length > 0) {
      return {
        success: false,
        error: { message: 'A connection between these nodes already exists' }
      }
    }

    // Create a sanitized connection record for the database
    const connectionRecord = sanitizeForDB(DB_SCHEMA.TABLES.CONNECTIONS, {
      id: uuidv4(),
      user_id: user.id,
      source_node_id: connectionData.source_node_id,
      target_node_id: connectionData.target_node_id,
      description: connectionData.description.trim(),
      strength: connectionData.strength || 3,
      relationship_type: connectionData.relationship_type || 'related',
      created_at: new Date().toISOString()
    })

    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.CONNECTIONS)
      .insert([connectionRecord])
      .select()

    if (error) throw error

    // Fetch the source and target node names for the response
    const { data: nodes, error: nodesError } = await supabase
      .from(DB_SCHEMA.TABLES.INTEREST_NODES)
      .select('id, title')
      .in('id', [connectionData.source_node_id, connectionData.target_node_id])

    if (nodesError) throw nodesError

    const sourceNode = nodes.find(n => n.id === connectionData.source_node_id)
    const targetNode = nodes.find(n => n.id === connectionData.target_node_id)

    // Add client-side fields
    const connectionWithClientFields = {
      ...data[0],
      source_name: sourceNode?.title || 'Unknown',
      target_name: targetNode?.title || 'Unknown',
      is_manual: true
    }

    return { success: true, data: connectionWithClientFields }
  } catch (error) {
    console.error('Error creating connection:', error)
    return { success: false, error }
  }
}

// Update a discovery prompt
export const updateDiscoveryPrompt = async (id, promptData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Refresh schema cache to ensure we have the latest schema
    await refreshSchemaCache()

    // Sanitize the data for the database
    const sanitizedData = sanitizeForDB(DB_SCHEMA.TABLES.DISCOVERY_PROMPTS, {
      ...promptData,
      updated_at: new Date().toISOString()
    })

    const { data, error } = await supabase
      .from(DB_SCHEMA.TABLES.DISCOVERY_PROMPTS)
      .update(sanitizedData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) {
      console.error('Error updating discovery prompt:', error)
      throw error
    }
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating discovery prompt:', error)
    return { success: false, error }
  }
}

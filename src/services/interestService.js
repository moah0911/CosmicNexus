import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { generateAIConnections } from './geminiService'
import { refreshSchemaCache } from '../utils/refreshSchemaCache'

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
      .from('interest_nodes')
      .select('*')
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
      .from('interest_nodes')
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

    const { data, error } = await supabase
      .from('interest_nodes')
      .insert([
        {
          id: uuidv4(),
          user_id: user.id,
          ...cleanedData
        }
      ])
      .select()

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

    // First delete all connections involving this node
    // This operation doesn't need to reference the is_manual column
    const { error: connectionsError } = await supabase
      .from('connections')
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
      .from('interest_nodes')
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

    // Instead of trying to use '*' which might include the problematic is_manual column,
    // explicitly list all the columns we need except is_manual
    console.log("fetchConnections: Querying database for connections with explicit columns");
    const { data, error } = await supabase
      .from('connections')
      .select('id, user_id, source_node_id, target_node_id, description, strength, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("fetchConnections: Database error", error);
      throw error;
    }

    console.log(`fetchConnections: Successfully fetched ${data?.length || 0} connections`);

    // Add the is_manual property to each connection with a default value
    const connectionsWithManualFlag = (data || []).map(conn => ({
      ...conn,
      is_manual: false // Default value as per schema
    }));

    return { success: true, data: connectionsWithManualFlag };
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
      .from('interest_nodes')
      .select('*')
      .in('id', selectedNodeIds)
      .eq('user_id', user.id)

    if (error) throw error

    if (!nodes || nodes.length < 2) {
      throw new Error('Please select at least two interest nodes to find connections')
    }

    // Check if this is a manual connection creation
    if (options.manualDescription && selectedNodeIds.length === 2) {
      // Create a single manual connection without the relationship_type field
      // to avoid schema cache issues
      const connectionData = {
        id: uuidv4(),
        user_id: user.id,
        source_node_id: selectedNodeIds[0],
        target_node_id: selectedNodeIds[1],
        description: options.manualDescription,
        strength: options.strength || 3
        // Intentionally omitting relationship_type to avoid schema cache issues
      };

      console.log("generateConnections: Creating manual connection with strength:", options.strength);

      try {
        const { error: insertError } = await supabase
          .from('connections')
          .insert([connectionData])

        if (insertError) {
          console.error('Error inserting manual connection:', insertError);
          throw insertError;
        }
      } catch (insertError) {
        console.error('Error inserting manual connection:', insertError);
        throw insertError;
      }

      // Add is_manual and relationship_type for the client-side representation only
      const manualConnection = {
        ...connectionData,
        is_manual: true,
        relationship_type: options.relationshipType || 'related',
        created_at: new Date().toISOString()
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

    const { data, error } = await supabase
      .from('discovery_prompts')
      .insert([
        {
          id: uuidv4(),
          user_id: user.id,
          ...prompt
        }
      ])
      .select()

    if (error) throw error
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

    const { data, error } = await supabase
      .from('discovery_prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
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

    const { data, error } = await supabase
      .from('discovery_prompts')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) throw error
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

    // Delete operation doesn't need to reference the is_manual column,
    // so this should work regardless of schema cache issues
    const { error } = await supabase
      .from('connections')
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

    const { error } = await supabase
      .from('discovery_prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting discovery prompt:', error)
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

    const { data, error } = await supabase
      .from('discovery_prompts')
      .update({
        ...promptData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error updating discovery prompt:', error)
    return { success: false, error }
  }
}

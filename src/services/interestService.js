import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { generateAIConnections } from './geminiService'

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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('interest_nodes')
      .insert([
        { 
          id: uuidv4(),
          user_id: user.id,
          ...nodeData 
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('interest_nodes')
      .update({
        ...nodeData,
        updated_at: new Date().toISOString()
      })
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
    
    // First delete all connections involving this node
    const { error: connectionsError } = await supabase
      .from('connections')
      .delete()
      .or(`source_node_id.eq.${id},target_node_id.eq.${id}`)
      .eq('user_id', user.id)
    
    if (connectionsError) throw connectionsError
    
    // Then delete the node itself
    const { error } = await supabase
      .from('interest_nodes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
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
    
    console.log("fetchConnections: Querying database for connections");
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("fetchConnections: Database error", error);
      throw error;
    }
    
    console.log(`fetchConnections: Successfully fetched ${data?.length || 0} connections`);
    
    // Return empty array if data is null or undefined
    const safeData = data || [];
    return { success: true, data: safeData };
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
      // Create a single manual connection
      const manualConnection = {
        id: uuidv4(),
        user_id: user.id,
        source_node_id: selectedNodeIds[0],
        target_node_id: selectedNodeIds[1],
        description: options.manualDescription,
        strength: options.strength || 1,
        is_manual: true
      };
      
      const { error: insertError } = await supabase
        .from('connections')
        .insert([manualConnection])
      
      if (insertError) throw insertError
      
      return { success: true, connections: [manualConnection] };
    }
    
    // Call Gemini API directly for AI-generated connections
    const aiResults = await generateAIConnections(nodes)
    
    // Save the generated connections
    if (aiResults.connections && aiResults.connections.length > 0) {
      const connectionsToInsert = aiResults.connections.map(connection => ({
        id: uuidv4(),
        user_id: user.id,
        source_node_id: connection.sourceNodeId,
        target_node_id: connection.targetNodeId,
        description: connection.description,
        strength: connection.strength || 1,
        is_manual: false
      }))
      
      const { error: insertError } = await supabase
        .from('connections')
        .insert(connectionsToInsert)
      
      if (insertError) throw insertError
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
    
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
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

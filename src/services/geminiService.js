import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateAIConnections = async (nodes) => {
  try {
    if (!nodes || nodes.length < 2) {
      throw new Error('At least two nodes are required');
    }

    // Format the nodes data for the prompt
    const nodesInfo = nodes.map(node => {
      return `
        Title: ${node.title}
        Category: ${node.category}
        Description: ${node.description}
        ${node.notes ? `Notes: ${node.notes}` : ''}
        ID: ${node.id}
      `;
    }).join('\n\n');

    // Create the prompt for connections
    const connectionsPrompt = `
      You are an expert at finding meaningful connections between different topics, interests, and concepts.
      
      I have the following interests/topics:
      
      ${nodesInfo}
      
      Task 1: Analyze these interests and identify meaningful connections between them. For each pair of interests, provide:
      1. A detailed description of how they connect (thematic overlaps, historical context, conceptual bridges, etc.)
      2. A connection strength rating from 1-5 (5 being strongest)
      
      Format your response for connections as a JSON array with this structure:
      [
        {
          "sourceNodeId": "id of first interest",
          "targetNodeId": "id of second interest",
          "sourceName": "title of first interest",
          "targetName": "title of second interest",
          "description": "detailed description of the connection",
          "strength": connection strength (1-5)
        },
        ...
      ]
      
      Task 2: Generate 3-5 discovery prompts that would help me explore new dimensions or intersections of these interests.
      
      Format your discovery prompts as a JSON array with this structure:
      [
        {
          "content": "the discovery prompt text",
          "related_nodes": ["titles of related interests"]
        },
        ...
      ]
      
      Return your complete response as a single JSON object with two properties: "connections" and "discoveryPrompts", each containing the respective arrays.
    `;

    // Generate content with Gemini
    const result = await model.generateContent(connectionsPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    // This handles cases where the model might add markdown code blocks or extra text
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    try {
      const parsedResponse = JSON.parse(jsonString.trim());
      return {
        connections: parsedResponse.connections || [],
        discoveryPrompts: parsedResponse.discoveryPrompts || []
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      
      // Fallback to simulated response if parsing fails
      return simulateResponse(nodes);
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to simulated response
    return simulateResponse(nodes);
  }
};

// Fallback function to simulate AI response if the API call fails
const simulateResponse = (nodes) => {
  // Extract node titles for easier reference
  const nodeTitles = nodes.map(node => node.title);
  
  // Generate simulated connections
  const connections = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const sourceNode = nodes[i];
      const targetNode = nodes[j];
      
      connections.push({
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        sourceName: sourceNode.title,
        targetName: targetNode.title,
        description: `${sourceNode.title} and ${targetNode.title} share interesting connections in terms of historical context, conceptual frameworks, and cultural significance.`,
        strength: Math.floor(Math.random() * 5) + 1
      });
    }
  }
  
  // Generate simulated discovery prompts
  const discoveryPrompts = [
    {
      content: `Explore how ${nodeTitles[0]} influenced the development of ${nodeTitles[1]} during the 20th century.`,
      related_nodes: [nodeTitles[0], nodeTitles[1]]
    },
    {
      content: `Consider the question: How might the principles of ${nodeTitles[0]} be applied to solve challenges in ${nodeTitles[1]}?`,
      related_nodes: [nodeTitles[0], nodeTitles[1]]
    }
  ];
  
  if (nodeTitles.length > 2) {
    discoveryPrompts.push({
      content: `Research the key figures who bridged the worlds of ${nodeTitles[0]} and ${nodeTitles[2]}.`,
      related_nodes: [nodeTitles[0], nodeTitles[2]]
    });
  }
  
  return {
    connections,
    discoveryPrompts
  };
};

// Mock API implementation for development

// Mock database
let mockConversations = [
  {
    id: "mock-conversation-1",
    title: "Welcome to PromptPolish",
    date: new Date().toISOString(),
    messages: [
      {
        id: "mock-message-1",
        content: "Hello! How can I help you with prompt engineering today?",
        isUser: false,
        timestamp: new Date().toISOString(),
      }
    ]
  }
];

// Helper function to create a mock Response object
function createResponse(status: number, data: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  };
}

// Mock API response function
export async function mockApiResponse(method: string, url: string, data?: any) {
  // Add delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log(`Mock API call: ${method} ${url}`);
  
  // Handle conversations endpoint
  if (url === '/api/conversations') {
    if (method === 'GET') {
      return createResponse(200, mockConversations);
    } 
    
    if (method === 'POST') {
      const newConversation = {
        id: `mock-conversation-${Date.now()}`,
        title: data?.title || "New Conversation",
        date: new Date().toISOString(),
        messages: []
      };
      
      mockConversations = [newConversation, ...mockConversations];
      return createResponse(201, newConversation);
    }
  }
  
  // Handle single conversation endpoints
  if (url.match(/^\/api\/conversations\/[\w-]+$/)) {
    const conversationId = url.split('/').pop();
    const conversation = mockConversations.find(c => c.id === conversationId);
    
    if (method === 'GET') {
      if (!conversation) {
        return createResponse(404, { message: "Conversation not found" });
      }
      return createResponse(200, conversation);
    }
    
    if (method === 'DELETE') {
      if (!conversation) {
        return createResponse(404, { message: "Conversation not found" });
      }
      mockConversations = mockConversations.filter(c => c.id !== conversationId);
      return createResponse(200, { success: true });
    }
  }
  
  // Handle messages endpoints
  if (url.match(/^\/api\/conversations\/[\w-]+\/messages$/)) {
    const conversationId = url.split('/')[3];
    const conversation = mockConversations.find(c => c.id === conversationId);
    
    if (!conversation) {
      return createResponse(404, { message: "Conversation not found" });
    }
    
    if (method === 'POST') {
      const newMessage = {
        id: `mock-message-${Date.now()}`,
        content: data?.content || "",
        isUser: data?.isUser || false,
        timestamp: new Date().toISOString(),
      };
      
      conversation.messages = [...(conversation.messages || []), newMessage];
      return createResponse(201, newMessage);
    }
  }
  
  // Handle chat endpoint
  if (url === '/api/chat') {
    if (method === 'POST') {
      const userMessage = data?.message || '';
      
      // Generate a simple response based on the user's message
      let response;
      
      if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        response = "Hello! How can I help you with prompt engineering today?";
      } else if (userMessage.toLowerCase().includes('prompt')) {
        response = "Prompt engineering is the process of designing and refining input prompts to effectively communicate with AI models. Would you like some tips on creating better prompts?";
      } else if (userMessage.toLowerCase().includes('help')) {
        response = "I'd be happy to help! You can ask me about prompt engineering best practices, how to structure prompts for specific tasks, or get feedback on your existing prompts.";
      } else if (userMessage.toLowerCase().includes('gpt') || userMessage.toLowerCase().includes('ai')) {
        response = "Large language models like GPT, Claude, or Gemini understand natural language, but they can be sensitive to how you phrase your requests. Clear, specific prompts with examples often work best.";
      } else {
        response = "That's an interesting question about prompt engineering. When crafting prompts, remember to be specific, provide context, and break down complex tasks into smaller steps. Is there anything specific you'd like to know about this topic?";
      }
      
      return createResponse(200, { response });
    }
  }
  
  // Handle enhance endpoint
  if (url === '/api/enhance') {
    if (method === 'POST') {
      const prompt = data?.prompt || '';
      const enhancedPrompt = `Enhanced: ${prompt}\n\nThe improved version includes more specific instructions, better context, and clearer expectations for the AI model. This will help you get better results.`;
      
      return createResponse(200, { 
        enhanced: enhancedPrompt,
        original: prompt,
        improvements: ['Added specificity', 'Provided context', 'Clarified expectations']
      });
    }
  }

  // Default response for unhandled routes
  return createResponse(404, { message: "Not found" });
} 
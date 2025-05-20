// Simple API client for unauthenticated requests

// Define the server URL (using direct port instead of proxy)
const SERVER_URL = 'http://localhost:5004';

/**
 * Send an API request without authentication
 */
export async function sendApiRequest(
  method: string,
  url: string,
  data?: unknown
) {
  // Use direct server URL instead of relying on proxy
  const fullUrl = `${SERVER_URL}${url}`;
  console.log(`Sending ${method} request to ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Send a chat message to the API
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: { role: 'user' | 'assistant', content: string }[]
) {
  console.log('Sending chat message:', message);
  
  const result = await sendApiRequest('POST', '/api/chat', {
    message,
    conversationHistory
  });
  
  return result.response;
} 
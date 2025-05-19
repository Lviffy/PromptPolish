import { useState, useCallback } from 'react';
import { useApiRequest } from './useApiRequest';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export function useChatSession() {
  const { apiRequest } = useApiRequest();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new chat session
  const startChat = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('POST', '/api/chat');
      if (!res.ok) throw new Error('Failed to create chat');
      const data = await res.json();
      setChatId(data.chatId);
      setMessages([]);
      return data.chatId;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Send a message and get AI response
  const sendMessage = useCallback(async (content: string) => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('POST', `/api/chat/${chatId}/message`, { content });
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      setMessages((prev) => [...prev, data.user, data.ai]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiRequest, chatId]);

  // Fetch chat history
  const fetchHistory = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('GET', `/api/chat/${chatId}`);
      if (!res.ok) throw new Error('Failed to fetch chat history');
      const data = await res.json();
      setMessages(data.messages);
      return data.messages;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiRequest, chatId]);

  return {
    chatId,
    messages,
    loading,
    error,
    startChat,
    sendMessage,
    fetchHistory,
  };
} 
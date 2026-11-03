'use client';

import { useState, useCallback } from 'react';
import { useCharlieContext } from './context.js';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Array<{ metric: string; value: string | number }>;
  createdAt: string;
}

export interface UseAdvisorChatOptions {
  conversationId?: string;
  initialMessages?: ChatMessageItem[];
}

export function useAdvisorChat(options: UseAdvisorChatOptions = {}) {
  const context = useCharlieContext();
  const [messages, setMessages] = useState<ChatMessageItem[]>(options.initialMessages || []);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string, conversationId?: string) => {
      const activeConvoId = conversationId || options.conversationId;
      if (!text.trim()) return;

      const userMsg: ChatMessageItem = {
        id: `usr_${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev: ChatMessageItem[]) => [...prev, userMsg]);
      setIsSending(true);
      setError(null);

      if (!activeConvoId || !context.apiKey) {
        // Fallback simulated response if no backend connection
        setTimeout(() => {
          const aiReply: ChatMessageItem = {
            id: `ai_${Date.now()}`,
            role: 'assistant',
            content: `I received your question: "${text}". Connect a valid Charlie API key to query your live business analytics.`,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev: ChatMessageItem[]) => [...prev, aiReply]);
          setIsSending(false);
        }, 300);
        return;
      }

      try {
        const res = await fetch(
          `${context.apiUrl}/api/v1/chat/conversations/${activeConvoId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${context.apiKey}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ message: text }),
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to send message: ${res.statusText}`);
        }

        const data = await res.json();
        const aiMsg: ChatMessageItem = {
          id: data.id || `ai_${Date.now()}`,
          role: 'assistant',
          content: data.content,
          citations: data.citations || [],
          createdAt: data.created_at || new Date().toISOString(),
        };

        setMessages((prev: ChatMessageItem[]) => [...prev, aiMsg]);
      } catch (err: any) {
        setError(err.message || 'Error sending chat message');
      } finally {
        setIsSending(false);
      }
    },
    [context.apiKey, context.apiUrl, options.conversationId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    isSending,
    error,
    clearMessages,
  };
}

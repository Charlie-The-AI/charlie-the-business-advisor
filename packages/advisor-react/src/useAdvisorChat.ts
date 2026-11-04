'use client';

import { useState, useCallback } from 'react';
import { useCharlieContext } from './context.js';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Array<{ metric: string; value: string | number; isVerified?: boolean }>;
  createdAt: string;
}

export interface UseAdvisorChatOptions {
  apiEndpoint?: string;
  conversationId?: string;
  initialMessages?: ChatMessageItem[];
  sendFn?: (
    question: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  ) => Promise<{
    answer: string;
    evidence?: Array<{ metric: string; value: string | number; isVerified?: boolean }>;
  }>;
}

export function useAdvisorChat(options: UseAdvisorChatOptions = {}) {
  const context = useCharlieContext();
  const [messages, setMessages] = useState<ChatMessageItem[]>(options.initialMessages || []);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = options.apiEndpoint || (context as any).apiEndpoint || '/api/charlie/chat';

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessageItem = {
        id: `usr_${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setIsSending(true);
      setError(null);

      try {
        if (options.sendFn) {
          const res = await options.sendFn(
            text,
            messages.map((m) => ({ role: m.role, content: m.content }))
          );
          const aiMsg: ChatMessageItem = {
            id: `ai_${Date.now()}`,
            role: 'assistant',
            content: res.answer,
            citations: res.evidence || [],
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              question: text,
              history: messages.map((m) => ({ role: m.role, content: m.content })),
            }),
          });

          if (!res.ok) {
            throw new Error(`Failed to send message: ${res.statusText}`);
          }

          const data = await res.json();
          const aiMsg: ChatMessageItem = {
            id: data.id || `ai_${Date.now()}`,
            role: 'assistant',
            content: data.answer || data.content || '',
            citations: data.evidence || data.citations || [],
            createdAt: data.createdAt || new Date().toISOString(),
          };

          setMessages((prev) => [...prev, aiMsg]);
        }
      } catch (err: any) {
        setError(err.message || 'Error sending chat message');
      } finally {
        setIsSending(false);
      }
    },
    [endpoint, messages, options]
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

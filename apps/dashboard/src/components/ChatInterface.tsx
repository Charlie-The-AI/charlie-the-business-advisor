'use client';

import { useState } from 'react';
import { ChatMessage } from '../lib/types';
import { mockInitialChatMessages } from '../lib/mockData';
import { Send, Sparkles, ShieldCheck, User, Bot, Tag } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockInitialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'Why did net revenue decline this month?',
    'Which product generates the most revenue?',
    'What is our customer repeat purchase rate?',
    'How should we address the 80/20 revenue concentration?',
  ];

  const handleSend = (text?: string) => {
    const question = text || inputValue;
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: question,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Realistic grounded response generator
    setTimeout(() => {
      let aiResponse: ChatMessage;
      const lower = question.toLowerCase();

      if (lower.includes('product') || lower.includes('best seller') || lower.includes('most revenue')) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content:
            "Your top-performing product by recognized revenue is the **5kVA Hybrid Solar Inverter**, generating **₦8,500,000.00** across 34 units sold (representing **46.1%** of your total catalogue revenue).",
          citations: [
            { metric: 'products.bestSellersByRevenue.0.name', value: '5kVA Hybrid Solar Inverter' },
            { metric: 'products.bestSellersByRevenue.0.revenueFormatted', value: '₦8,500,000.00' },
            { metric: 'products.bestSellersByRevenue.0.revenuePercentage', value: '46.1%' },
          ],
          created_at: new Date().toISOString(),
        };
      } else if (lower.includes('decline') || lower.includes('revenue') || lower.includes('sales')) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content:
            "Recognized net revenue was **₦18,450,000.00**, representing a **14.2% decline** compared to the preceding period. The primary contributing measurable factors were an **11.0% drop in completed orders** (342 completed vs 384 previously) and higher refund write-downs (₦1,250,000.00).",
          citations: [
            { metric: 'sales.netRevenueFormatted', value: '₦18,450,000.00' },
            { metric: 'sales.periodOverPeriodRevenueGrowthRate', value: '-14.2%' },
            { metric: 'sales.totalCompletedOrders', value: 342 },
          ],
          created_at: new Date().toISOString(),
        };
      } else if (lower.includes('customer') || lower.includes('repeat') || lower.includes('retention')) {
        aiResponse = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content:
            'Your repeat purchase rate is currently **22.4%** across 241 unique buyers. Only 54 customers have returned for a second order. Cohort analytics show that customers purchasing solar components drop off steeply after 30 days without post-purchase engagement.',
          citations: [
            { metric: 'customers.uniqueCustomersCount', value: 241 },
            { metric: 'customers.repeatCustomersCount', value: 54 },
            { metric: 'customers.repeatPurchaseRatePercentage', value: '22.4%' },
          ],
          created_at: new Date().toISOString(),
        };
      } else {
        aiResponse = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content:
            "Based on your latest verified analytics snapshot, your business achieved **₦18,450,000.00** in net recognized revenue across 342 orders with an AOV of **₦53,947.36**. Would you like to review product margins, marketing channel retention, or inventory concentration?",
          citations: [
            { metric: 'sales.netRevenueFormatted', value: '₦18,450,000.00' },
            { metric: 'sales.averageOrderValueFormatted', value: '₦53,947.36' },
          ],
          created_at: new Date().toISOString(),
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden shadow-lg">
      {/* Chat Sub-Header */}
      <div className="p-4 bg-[#0d131f] border-b border-[#1f2937] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Charlie AI Advisory Assistant</h4>
            <span className="text-[11px] text-gray-400">Strict Numerical Grounding Active</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Hallucination Guard</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-[#141d2e] border border-[#1e293b] text-gray-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Verified Snapshot Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 mr-1">
                    <Tag className="w-2.5 h-2.5 text-blue-400" />
                    Verified Citations:
                  </span>
                  {msg.citations.map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-gray-900 border border-gray-700 text-blue-300 font-mono"
                    >
                      {c.metric}: <strong>{String(c.value)}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-lg">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-xl bg-[#141d2e] border border-[#1e293b] text-gray-400 text-xs flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>Analyzing snapshot & verifying numerical grounding...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="px-6 py-2.5 bg-[#0d131f] border-t border-[#1e293b] flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0">
          Suggested:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-300 whitespace-nowrap transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-[#0d131f] border-t border-[#1e293b]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Charlie a question about your business performance, margins, or retention..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium flex items-center gap-1.5 transition text-xs sm:text-sm shadow-sm"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

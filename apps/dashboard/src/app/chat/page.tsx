'use client';

import { Header } from '../../components/Header';
import { ChatInterface } from '../../components/ChatInterface';
import { Bot, HelpCircle, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex-1 pb-16">
      <Header
        title="AI Business Advisor Chat"
        description="Ask natural-language questions about financial performance, margins, retention, and growth strategies."
      />

      <main className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chat Box */}
        <div className="lg:col-span-8">
          <ChatInterface />
        </div>

        {/* Advisory Context & Grounding Rules Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937]">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>How Charlie Advises You</span>
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Charlie combines your ingested deterministic analytics snapshots with LLM reasoning. Every numerical claim is verified against your underlying data contracts before being presented.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Zero fabricated metrics or invented causes.</span>
              </div>
              <div className="flex items-start gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>All cited figures link directly to snapshot fields.</span>
              </div>
              <div className="flex items-start gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Guaranteed financial outcomes are strictly prohibited.</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#141d2e] border border-blue-500/20 text-xs">
            <h5 className="font-semibold text-white mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Recommended Queries</span>
            </h5>
            <ul className="space-y-2 text-gray-300">
              <li className="p-2 rounded bg-gray-900/50 border border-gray-800">
                "What factors contributed to the revenue drop this month?"
              </li>
              <li className="p-2 rounded bg-gray-900/50 border border-gray-800">
                "Which product generates the most revenue?"
              </li>
              <li className="p-2 rounded bg-gray-900/50 border border-gray-800">
                "What is our repeat purchase rate, and how does it compare to industry benchmarks?"
              </li>
              <li className="p-2 rounded bg-gray-900/50 border border-gray-800">
                "Are there any products missing cost of goods sold records?"
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

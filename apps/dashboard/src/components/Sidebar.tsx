'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  PieChart,
  MessageSquare,
  KeyRound,
  CreditCard,
  Building2,
  ExternalLink,
} from 'lucide-react';

const navItems = [
  { name: 'Executive Overview', href: '/', icon: LayoutDashboard },
  { name: 'AI Recommendations', href: '/recommendations', icon: Sparkles, badge: '4 New' },
  { name: 'Pareto 80/20 Distribution', href: '/pareto', icon: PieChart },
  { name: 'AI Business Advisor Chat', href: '/chat', icon: MessageSquare },
  { name: 'API Keys & Developer', href: '/developer', icon: KeyRound },
  { name: 'Billing & Entitlements', href: '/billing', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d131f] border-r border-[#1e293b] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e293b] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-none">Charlie</h1>
          <span className="text-[11px] text-blue-400 font-medium tracking-wide uppercase">Business Advisor</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Analytics & Advisory
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Workspace Plan Pill */}
      <div className="p-4 border-t border-[#1e293b]">
        <div className="p-3 rounded-lg bg-[#141d2e] border border-blue-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-300">Apex Energy Ltd</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
              Growth Plan
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-2">34 / 100 Monthly Snapshots</p>
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '34%' }} />
          </div>
        </div>
      </div>
    </aside>
  );
}

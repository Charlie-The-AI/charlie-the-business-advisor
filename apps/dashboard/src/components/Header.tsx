'use client';

import { Building2, Calendar, ChevronDown, RefreshCw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Business Selector Dropdown */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141d2e] border border-[#1e293b] text-xs font-medium text-gray-200 hover:border-gray-600 transition cursor-pointer">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Apex Mega Store (NGN)</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>

        {/* Reporting Period */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1e293b] text-xs text-gray-300">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>Last 30 Days (Trailing)</span>
        </div>

        {/* Grounding & Evidence Verified Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Evidence Grounded</span>
        </div>
      </div>
    </header>
  );
}

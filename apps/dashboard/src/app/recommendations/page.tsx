'use client';

import { useState } from 'react';
import { Header } from '../../components/Header';
import { RecommendationCard } from '../../components/RecommendationCard';
import { mockRecommendations } from '../../lib/mockData';
import { Recommendation } from '../../lib/types';
import { Sparkles, Filter, CheckCircle2, RefreshCw } from 'lucide-react';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'revenue_concentration', label: 'Revenue Concentration' },
    { id: 'customer_retention', label: 'Customer Retention' },
    { id: 'sales_growth', label: 'Sales Growth' },
    { id: 'product_profitability', label: 'Product Margins' },
  ];

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'new', label: 'New' },
    { id: 'reviewing', label: 'In Review' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'dismissed', label: 'Dismissed' },
  ];

  const handleStatusChange = (id: string, newStatus: Recommendation['status']) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filtered = recommendations.filter((r) => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (activeStatus !== 'all' && r.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="flex-1 pb-16">
      <Header
        title="AI Business Advisory & Strategic Recommendations"
        description="Grounded, evidence-backed action playbooks generated from your latest verified transaction snapshot."
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Filter Controls */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1f2937] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              Category:
            </span>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                  activeCategory === c.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStatus(s.id)}
                className={`px-2.5 py-1 rounded-md transition text-xs font-medium ${
                  activeStatus === s.id
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-xl bg-[#111827] border border-[#1f2937]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-white">No recommendations match your filters</h4>
            <p className="text-xs text-gray-400 mt-1">Adjust category or status selections to view active actions.</p>
          </div>
        )}
      </main>
    </div>
  );
}

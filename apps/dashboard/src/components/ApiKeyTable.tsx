'use client';

import { useState } from 'react';
import { ApiKeyItem } from '../lib/types';
import { mockApiKeys } from '../lib/mockData';
import { KeyRound, Plus, Copy, Check, Trash2, ShieldAlert } from 'lucide-react';

export function ApiKeyTable() {
  const [keys, setKeys] = useState<ApiKeyItem[]>(mockApiKeys);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    const prefix = 'cta_live_' + Math.random().toString(36).substring(2, 10);
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fullKey = `${prefix}_${secret}`;

    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: keyName,
      key_prefix: prefix,
      scopes: ['snapshots:write', 'snapshots:read', 'recommendations:read'],
      business_scopes: ['*'],
      last_used_at: 'Just now',
      created_at: new Date().toISOString().split('T')[0],
    };

    setKeys([newKey, ...keys]);
    setGeneratedSecret(fullKey);
    setKeyName('');
  };

  const handleCopy = () => {
    if (generatedSecret) {
      navigator.clipboard.writeText(generatedSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Generated Token Alert Banner */}
      {generatedSecret && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">Save your private API secret</h4>
              <p className="text-xs text-amber-300/90 mb-3">
                This secret will never be displayed again. Store it securely in your backend environment variables (`.env`).
              </p>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1.5 rounded-lg bg-gray-900 border border-amber-500/30 text-amber-200 font-mono text-xs flex-1 truncate">
                  {generatedSecret}
                </code>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => setGeneratedSecret(null)}
              className="text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Active Scoped API Keys</h3>
          <p className="text-xs text-gray-400">
            Use scoped API credentials to ingest snapshots from Shopify, WooCommerce, or custom Laravel systems.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedSecret(null);
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* Keys Table */}
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0d131f] border-b border-[#1f2937] text-gray-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3 font-semibold">Key Identifier</th>
              <th className="px-4 py-3 font-semibold">Prefix</th>
              <th className="px-4 py-3 font-semibold">Permissions</th>
              <th className="px-4 py-3 font-semibold">Last Ingest</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-gray-800/30 transition">
                <td className="px-4 py-3.5 font-medium text-white">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    <span>{k.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-gray-300">{k.key_prefix}••••</td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] border border-gray-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-400">{k.last_used_at || 'Never'}</td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => handleRevoke(k.id)}
                    className="p-1 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating New Key */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">Generate Scoped API Key</h4>
            <p className="text-xs text-gray-400 mb-4">
              Create an authentication key for backend automated analytics snapshot ingestion.
            </p>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Key Description / Application Name
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Production WooCommerce Sync"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Required Scopes
                </label>
                <div className="space-y-2 text-xs text-gray-300">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked disabled className="rounded border-gray-700 text-blue-600" />
                    <span>snapshots:write (Ingest business snapshots)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked disabled className="rounded border-gray-700 text-blue-600" />
                    <span>snapshots:read (Retrieve historical periods)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked disabled className="rounded border-gray-700 text-blue-600" />
                    <span>recommendations:read (Read advisory actions)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

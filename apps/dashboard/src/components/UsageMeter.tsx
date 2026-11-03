'use client';

interface UsageMeterProps {
  label: string;
  used: number;
  quota: number;
  isUnlimited?: boolean;
  unit?: string;
}

export function UsageMeter({
  label,
  used,
  quota,
  isUnlimited,
  unit = '',
}: UsageMeterProps) {
  const percentage = isUnlimited
    ? 0
    : quota > 0
    ? Math.min(100, Math.round((used / quota) * 100))
    : 100;

  const isWarning = percentage >= 80 && !isUnlimited;
  const isDanger = percentage >= 95 && !isUnlimited;

  return (
    <div className="p-4 rounded-xl bg-[#141d2e] border border-[#1e293b]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <span className="text-xs font-bold text-white">
          {used.toLocaleString()} {unit} /{' '}
          {isUnlimited ? 'Unlimited' : `${quota.toLocaleString()} ${unit}`}
        </span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-1.5">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${isUnlimited ? 5 : percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>{isUnlimited ? 'Unlimited quota enabled' : `${percentage}% consumed`}</span>
        <span>{isUnlimited ? 'Always active' : `${Math.max(0, quota - used).toLocaleString()} remaining`}</span>
      </div>
    </div>
  );
}

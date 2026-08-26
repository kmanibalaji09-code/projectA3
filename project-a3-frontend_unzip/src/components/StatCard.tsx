import type { LucideIcon } from "lucide-react";

type Tone = "accent" | "success" | "warning" | "critical" | "neutral";

const iconBg: Record<Tone, string> = {
  accent: "bg-accent-100 text-accent-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  critical: "bg-critical-100 text-critical-700",
  neutral: "bg-ink-100 text-ink-700",
};

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "accent",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-ink-900">{value}</p>
        {delta && <p className="mt-1 text-xs font-medium text-success-600">{delta}</p>}
      </div>
    </div>
  );
}

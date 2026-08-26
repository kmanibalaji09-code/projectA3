import type { ReactNode } from "react";

type Tone = "success" | "warning" | "critical" | "accent" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  critical: "bg-critical-100 text-critical-700",
  accent: "bg-accent-100 text-accent-700",
  neutral: "bg-ink-100 text-ink-700",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function severityTone(severity: string): Tone {
  switch (severity) {
    case "Critical":
      return "critical";
    case "High":
      return "warning";
    case "Medium":
      return "accent";
    default:
      return "success";
  }
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "Resolved":
    case "Approved":
      return "success";
    case "In Progress":
    case "Active":
      return "accent";
    case "Waiting Response":
    case "Pending Approval":
      return "warning";
    case "Rejected":
    case "Failed":
      return "critical";
    default:
      return "neutral";
  }
}

export function sentimentTone(sentiment: string): Tone {
  switch (sentiment) {
    case "Positive":
      return "success";
    case "Negative":
      return "critical";
    default:
      return "warning";
  }
}

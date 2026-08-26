import { Check, Loader2, Clock } from "lucide-react";

const steps = (hasIssue: boolean) => [
  { label: "Review Received", state: "completed" as const },
  { label: "Product Sentinel", state: "completed" as const },
  { label: "Customer Resolution Agent", state: "completed" as const },
  { label: "Product Innovation Architect", state: hasIssue ? ("completed" as const) : ("active" as const) },
  { label: "Human Approval", state: hasIssue ? ("waiting" as const) : ("waiting" as const) },
];

const stateStyles = {
  completed: { bg: "bg-success-600", text: "text-white", icon: Check },
  active: { bg: "bg-accent-600", text: "text-white", icon: Loader2 },
  waiting: { bg: "bg-ink-200", text: "text-ink-500", icon: Clock },
  failed: { bg: "bg-critical-600", text: "text-white", icon: Clock },
};

export function AgentWorkflowPanel({ hasIssue }: { hasIssue: boolean }) {
  const items = steps(hasIssue);

  return (
    <div className="mx-auto max-w-md">
      {items.map((step, i) => {
        const style = stateStyles[step.state];
        const Icon = style.icon;
        return (
          <div key={step.label} className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${style.bg} ${style.text}`}>
                <Icon size={18} className={step.state === "active" ? "animate-spin" : ""} />
              </div>
              <p
                className={`text-sm font-semibold ${
                  step.state === "waiting" ? "text-ink-400" : "text-ink-900"
                }`}
              >
                {step.label}
              </p>
            </div>
            {i < items.length - 1 && <div className="my-1 h-8 w-0.5 bg-ink-200" />}
          </div>
        );
      })}
      <p className="mt-6 text-center text-xs text-ink-400">
        Structured results only — chain-of-thought reasoning is never shown to end users.
      </p>
    </div>
  );
}

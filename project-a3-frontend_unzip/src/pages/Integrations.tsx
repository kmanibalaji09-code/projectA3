import { GitBranch, Mail, Phone, Cpu } from "lucide-react";
import { Layout } from "../components/Layout";
import { Badge } from "../components/Badge";

const integrations = [
  { name: "GitHub", desc: "Push approved engineering issues as GitHub issues.", icon: GitBranch, connected: false },
  { name: "Jira", desc: "Sync engineering issues to a Jira project.", icon: Cpu, connected: false },
  { name: "Email", desc: "Notify customers by email during case conversations.", icon: Mail, connected: false },
  { name: "Voice", desc: "Let customers describe issues over a voice call.", icon: Phone, connected: false },
];

export function Integrations() {
  return (
    <Layout title="Integrations" subtitle="Connect A³ to the rest of your stack">
      <div className="mb-6 card p-5">
        <p className="text-sm font-semibold text-ink-900">AI Provider</p>
        <p className="mt-1 text-sm text-ink-500">
          Currently running on <span className="font-semibold text-accent-700">Mock AI Service</span>. Set{" "}
          <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">AI_PROVIDER=ollama</code> in your backend{" "}
          <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">.env</code> once CrewAI + Ollama are configured.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {integrations.map((i) => (
          <div key={i.name} className="card flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
              <i.icon size={20} />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">{i.name}</p>
                <Badge tone="neutral">Not Connected</Badge>
              </div>
              <p className="text-sm text-ink-500">{i.desc}</p>
              <button className="focus-ring mt-3 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

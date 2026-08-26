import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Package, MessageSquare, AlertTriangle, FolderOpen, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Layout } from "../components/Layout";
import { StatCard } from "../components/StatCard";
import { Badge, severityTone, statusTone } from "../components/Badge";
import { listCasesApi, listProductsApi, type BackendCase } from "../services/apiClient";

const donutData = [
  { name: "Positive (4-5★)", value: 773, color: "var(--color-success-600)" },
  { name: "Neutral (3★)", value: 224, color: "var(--color-warning-600)" },
  { name: "Negative (1-2★)", value: 251, color: "var(--color-critical-600)" },
];

const workflowSteps = [
  { label: "Review Received", count: 1248, state: "completed" as const },
  { label: "Product Sentinel", count: 1248, state: "completed" as const },
  { label: "Customer Resolution Agent", count: 312, state: "active" as const },
  { label: "Innovation Architect", count: 87, state: "active" as const },
  { label: "Human Approval", count: 23, state: "waiting" as const },
];

const stateDot: Record<string, string> = {
  completed: "bg-success-600",
  active: "bg-accent-600",
  waiting: "bg-ink-300",
  failed: "bg-critical-600",
};

export function Dashboard() {
  const totalReviews = 1248;
  const [customerCases, setCustomerCases] = useState<BackendCase[]>([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    listCasesApi().then(setCustomerCases).catch(() => undefined);
    listProductsApi().then((items) => setProductCount(items.length)).catch(() => undefined);
  }, []);

  return (
    <Layout title="Developer Dashboard" subtitle="Welcome back, Alex 👋">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Products" value={String(productCount)} delta="Live from backend" icon={Package} tone="accent" />
        <StatCard label="Total Reviews" value="1,248" delta="+18% this week" icon={MessageSquare} tone="accent" />
        <StatCard label="Negative Reviews" value="312" delta="+8% this week" icon={AlertTriangle} tone="critical" />
        <StatCard label="Open Cases" value="87" delta="+5% this week" icon={FolderOpen} tone="warning" />
        <StatCard label="Critical Cases" value="23" delta="+3% this week" icon={ShieldAlert} tone="critical" />
        <StatCard label="Resolved Cases" value="156" delta="+12% this week" icon={CheckCircle2} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent Customer Cases */}
        <div className="card col-span-1 p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink-900">Recent Customer Cases</h2>
            <Link to="/cases" className="text-sm font-semibold text-accent-600 hover:text-accent-700">
              View all cases →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                  <th className="pb-2 font-semibold">Case ID</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Product</th>
                  <th className="pb-2 font-semibold">Severity</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                  {customerCases.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="py-3 pr-2">
                      <Link to={`/cases/${c.id}`} className="font-semibold text-accent-600 hover:underline">
                        {c.id}
                      </Link>
                    </td>
                    <td className="py-3 pr-2 text-ink-700">{c.customer_name}</td>
                    <td className="py-3 pr-2 text-ink-700">{c.product_name}</td>
                    <td className="py-3 pr-2">
                      <Badge tone={severityTone(c.severity)}>{c.severity}</Badge>
                    </td>
                    <td className="py-3 pr-2">
                      <Badge tone={statusTone(c.status)}>{c.status.replaceAll("_", " ")}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviews Overview */}
        <div className="card p-5">
          <h2 className="mb-4 text-base font-bold text-ink-900">Reviews Overview</h2>
          <div className="relative flex h-40 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute flex flex-col items-center">
              <span className="text-xl font-bold text-ink-900">{totalReviews.toLocaleString()}</span>
              <span className="text-xs text-ink-500">Total Reviews</span>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {donutData.map((d) => (
              <li key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink-700">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold text-ink-900">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {customerCases[0] && (
        <div className="mt-6 card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink-900">Latest Agent Feedback</h2>
            <Link to={`/cases/${customerCases[0].id}`} className="text-sm font-semibold text-accent-600 hover:underline">Open case</Link>
          </div>
          <p className="text-sm text-ink-600">{customerCases[0].product_name} for {customerCases[0].customer_name}</p>
          {customerCases[0].agent_feedback && <p className="mt-3 rounded-lg bg-accent-50 p-3 text-sm leading-relaxed text-ink-700">{customerCases[0].agent_feedback}</p>}
          <ul className="mt-3 space-y-1 text-sm text-ink-700">
            {(customerCases[0].known_facts ?? []).slice(-5).map((fact, index) => <li key={`${fact}-${index}`}>• {fact}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Agent Workflow Overview */}
        <div className="card p-5 xl:col-span-2">
          <h2 className="mb-4 text-base font-bold text-ink-900">Agent Workflow Overview</h2>
          <ol className="relative ml-3 space-y-5 border-l-2 border-ink-100 pl-6">
            {workflowSteps.map((step) => (
              <li key={step.label} className="relative">
                <span
                  className={`absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${stateDot[step.state]}`}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">{step.label}</p>
                  <span className="text-sm font-bold text-ink-700">{step.count.toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Quick Actions + System Status */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold text-ink-900">Quick Actions</h2>
            <div className="space-y-1">
              <Link to="/products" className="block rounded-lg px-2 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50">
                + Add New Product
              </Link>
              <Link to="/reviews" className="block rounded-lg px-2 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50">
                View All Reviews
              </Link>
              <Link to="/cases" className="block rounded-lg px-2 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50">
                Open New Case
              </Link>
              <Link to="/analytics" className="block rounded-lg px-2 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50">
                View Analytics
              </Link>
              <Link to="/integrations" className="block rounded-lg px-2 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50">
                Manage Integrations
              </Link>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-base font-bold text-ink-900">System Status</h2>
            <ul className="space-y-2.5 text-sm">
              <StatusRow label="AI Service" detail="Mock AI" online />
              <StatusRow label="Database" detail="SQLite" online />
              <StatusRow label="Email Service" detail="Not Configured" online={false} />
              <StatusRow label="GitHub Integration" detail="Not Connected" online={false} />
              <StatusRow label="Voice Service" detail="Not Configured" online={false} />
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-400">Live case feedback is loaded from the backend.</p>
    </Layout>
  );
}

function StatusRow({ label, detail, online }: { label: string; detail: string; online: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-ink-700">
        <span className={`h-2 w-2 rounded-full ${online ? "bg-success-600" : "bg-ink-300"}`} />
        {label}
      </span>
      <span className={`text-xs font-medium ${online ? "text-success-700" : "text-ink-400"}`}>{detail}</span>
    </li>
  );
}

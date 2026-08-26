import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { Layout } from "../components/Layout";

const sentimentData = [
  { name: "Positive", value: 62, color: "var(--color-success-600)" },
  { name: "Neutral", value: 18, color: "var(--color-warning-600)" },
  { name: "Negative", value: 20, color: "var(--color-critical-600)" },
];

const severityData = [
  { name: "Low", value: 30, color: "var(--color-success-600)" },
  { name: "Medium", value: 40, color: "var(--color-accent-500)" },
  { name: "High", value: 20, color: "var(--color-warning-600)" },
  { name: "Critical", value: 10, color: "var(--color-critical-600)" },
];

const trendData = [
  { date: "Apr 20", total: 32, negative: 6 },
  { date: "Apr 26", total: 41, negative: 8 },
  { date: "May 3", total: 38, negative: 7 },
  { date: "May 10", total: 52, negative: 12 },
  { date: "May 17", total: 47, negative: 10 },
];

const rootCauses = [
  { name: "Battery Issues", pct: 45 },
  { name: "Charging Problems", pct: 25 },
  { name: "Connectivity", pct: 18 },
  { name: "Build Quality", pct: 7 },
  { name: "Other", pct: 5 },
];

const casesStatusData = [
  { name: "Open", value: 87, color: "var(--color-warning-600)" },
  { name: "In Progress", value: 140, color: "var(--color-accent-500)" },
  { name: "Resolved", value: 156, color: "var(--color-success-600)" },
];

const resolutionTrend = [
  { date: "Apr", rate: 74 },
  { date: "Apr", rate: 79 },
  { date: "May", rate: 82 },
  { date: "May", rate: 89 },
];

export function Analytics() {
  return (
    <Layout title="Analytics Dashboard" subtitle="Product health at a glance">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Average Rating" value="4.2" delta="+0.3" />
        <MetricCard label="Negative Review %" value="20%" delta="-2%" negative />
        <MetricCard label="Resolution Rate" value="89%" delta="+5%" />
        <MetricCard label="Avg Resolution Time" value="2.4 days" delta="-0.5" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Sentiment Distribution">
          <DonutChart data={sentimentData} />
        </ChartCard>
        <ChartCard title="Severity Distribution">
          <DonutChart data={severityData} />
        </ChartCard>
        <ChartCard title="Reviews Trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="var(--color-accent-600)" strokeWidth={2} dot={false} name="Total Reviews" />
              <Line type="monotone" dataKey="negative" stroke="var(--color-critical-600)" strokeWidth={2} dot={false} name="Negative Reviews" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Top Root Causes">
          <div className="space-y-3 py-2">
            {rootCauses.map((r) => (
              <div key={r.name}>
                <div className="mb-1 flex justify-between text-xs text-ink-500">
                  <span>{r.name}</span>
                  <span className="font-semibold text-ink-700">{r.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-accent-500" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Cases Status">
          <DonutChart data={casesStatusData} />
        </ChartCard>
        <ChartCard title="Resolution Trend">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={resolutionTrend}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-ink-400)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="rate" fill="var(--color-accent-500)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </Layout>
  );
}

function MetricCard({
  label,
  value,
  delta,
  negative,
}: {
  label: string;
  value: string;
  delta: string;
  negative?: boolean;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-ink-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <span className={`text-xs font-semibold ${negative ? "text-success-600" : "text-success-600"}`}>
          {delta}
        </span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 text-sm font-bold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={38} outerRadius={58} paddingAngle={2} stroke="none">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between text-xs text-ink-600">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
            </span>
            <span className="font-semibold text-ink-900">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

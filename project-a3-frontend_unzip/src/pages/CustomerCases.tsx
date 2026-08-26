import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Badge, severityTone, statusTone } from "../components/Badge";
import { customerCases } from "../data/mockData";

export function CustomerCases() {
  return (
    <Layout title="Customer Cases" subtitle="Cases opened automatically from negative reviews">
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3 font-semibold">Case ID</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Severity</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {customerCases.map((c) => (
              <tr key={c.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-5 py-3">
                  <Link to={`/cases/${c.id}`} className="font-semibold text-accent-600 hover:underline">
                    {c.id.replace("case-", "CASE-")}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-700">{c.customerName}</td>
                <td className="px-5 py-3 text-ink-700">{c.productName}</td>
                <td className="px-5 py-3">
                  <Badge tone={severityTone(c.severity)}>{c.severity}</Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                </td>
                <td className="px-5 py-3 text-ink-500">
                  {new Date(c.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

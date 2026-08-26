import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Badge, severityTone, statusTone } from "../components/Badge";
import { getIssueById } from "../data/mockData";

export function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const issue = id ? getIssueById(id) : undefined;
  const [status, setStatus] = useState(issue?.status);

  if (!issue) {
    return (
      <Layout title="Issue not found">
        <p className="text-sm text-ink-500">This engineering issue doesn't exist in the demo dataset.</p>
      </Layout>
    );
  }

  return (
    <Layout title="Engineering Issue">
      <div className="mb-5 flex items-center gap-2">
        <Link to="/issues" className="text-sm font-medium text-ink-500 hover:text-ink-900">
          Engineering Issues
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-sm font-semibold text-ink-900">{issue.id}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-accent-700">{issue.id}</span>
            <Badge tone={severityTone(issue.severity)}>{issue.severity} Priority</Badge>
            <Badge tone={statusTone(status ?? issue.status)}>{status}</Badge>
          </div>
          <h2 className="mb-6 text-xl font-bold text-ink-900">{issue.title}</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Component" value={issue.component} />
            <Field label="Root Cause" value={issue.rootCause} />
          </div>
          <div className="mt-6">
            <Field label="Customer Impact" value={issue.customerImpact} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ListField label="Evidence" items={issue.evidence} />
            <ListField label="Suggested Investigation" items={issue.suggestedInvestigation} ordered />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ListField label="Suggested Fix" items={issue.suggestedFix} />
            <ListField label="Acceptance Criteria" items={issue.acceptanceCriteria} />
          </div>

          <div className="mt-6">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">Reproduction Steps</p>
            <ol className="list-decimal space-y-1 pl-4 text-sm leading-relaxed text-ink-700">
              {issue.reproductionSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex gap-2 border-t border-ink-100 pt-6">
            <button
              onClick={() => setStatus("Approved")}
              className="focus-ring rounded-lg bg-success-600 px-4 py-2 text-sm font-semibold text-white hover:bg-success-700"
            >
              Approve Issue
            </button>
            <button
              onClick={() => setStatus("Edited")}
              className="focus-ring rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Edit Issue
            </button>
            <button
              onClick={() => setStatus("Rejected")}
              className="focus-ring rounded-lg border border-critical-200 px-4 py-2 text-sm font-semibold text-critical-700 hover:bg-critical-100"
            >
              Reject Issue
            </button>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900">Markdown Ticket</p>
            <button
              onClick={() => navigator.clipboard?.writeText(issue.markdownTicket)}
              className="text-xs font-semibold text-accent-600 hover:underline"
            >
              Copy
            </button>
          </div>
          <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-ink-900 p-4 text-xs leading-relaxed text-ink-100">
            {issue.markdownTicket}
          </pre>
          <Link
            to={`/cases/${issue.caseId}`}
            className="mt-4 block text-center text-xs font-semibold text-accent-600 hover:underline"
          >
            View source case ({issue.caseId.replace("case-", "CASE-")}) →
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="text-sm leading-relaxed text-ink-700">{value}</p>
    </div>
  );
}

function ListField({ label, items, ordered }: { label: string; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <Tag className={`space-y-1 text-sm leading-relaxed text-ink-700 ${ordered ? "list-decimal pl-4" : ""}`}>
        {items.map((item, i) => (
          <li key={i} className={ordered ? "" : "flex gap-2"}>
            {!ordered && <span className="text-accent-500">•</span>}
            {item}
          </li>
        ))}
      </Tag>
    </div>
  );
}

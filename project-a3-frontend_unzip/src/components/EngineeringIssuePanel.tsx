import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, severityTone, statusTone } from "./Badge";
import type { EngineeringIssue } from "../types";

export function EngineeringIssuePanel({ issue, caseId }: { issue?: EngineeringIssue; caseId: string }) {
  const [status, setStatus] = useState(issue?.status ?? "Pending Approval");

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-200 py-12 text-center">
        <p className="text-sm font-semibold text-ink-700">No engineering issue yet</p>
        <p className="mt-1 max-w-sm text-sm text-ink-500">
          The Innovation Architect creates an issue once the resolution agent has gathered enough information
          for case {caseId.replace("case-", "CASE-")}.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-bold text-accent-700">{issue.id}</span>
            <Badge tone={severityTone(issue.severity)}>{issue.severity} Priority</Badge>
            <Badge tone={statusTone(status)}>{status}</Badge>
          </div>
          <h3 className="text-base font-bold text-ink-900">{issue.title}</h3>
        </div>
        <Link to={`/issues/${issue.id}`} className="text-sm font-semibold text-accent-600 hover:underline">
          Open full issue →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4 text-sm">
          <Field label="Component" value={issue.component} />
          <Field label="Root Cause" value={issue.rootCause} />
          <Field label="Customer Impact" value={issue.customerImpact} />
          <ListField label="Evidence" items={issue.evidence} />
        </div>
        <div className="space-y-4 text-sm">
          <ListField label="Suggested Investigation" items={issue.suggestedInvestigation} ordered />
          <ListField label="Suggested Fix" items={issue.suggestedFix} />
          <ListField label="Acceptance Criteria" items={issue.acceptanceCriteria} />
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-t border-ink-100 pt-5">
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
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="leading-relaxed text-ink-700">{value}</p>
    </div>
  );
}

function ListField({ label, items, ordered }: { label: string; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-400">{label}</p>
      <Tag className={`space-y-1 leading-relaxed text-ink-700 ${ordered ? "list-decimal pl-4" : ""}`}>
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

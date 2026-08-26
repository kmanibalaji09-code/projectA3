import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Badge, severityTone, statusTone, sentimentTone } from "../components/Badge";
import { getCaseById, getMessagesForCase, getIssueForCase } from "../data/mockData";
import { CaseConversation } from "../components/CaseConversation";
import { AgentWorkflowPanel } from "../components/AgentWorkflowPanel";
import { EngineeringIssuePanel } from "../components/EngineeringIssuePanel";

const tabs = ["Case Overview", "Conversation", "Agent Workflow", "Engineering Issue"] as const;
type Tab = (typeof tabs)[number];

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("Case Overview");

  const caseData = id ? getCaseById(id) : undefined;
  const messages = id ? getMessagesForCase(id) : [];
  const issue = id ? getIssueForCase(id) : undefined;

  if (!caseData) {
    return (
      <Layout title="Case not found">
        <p className="text-sm text-ink-500">This case doesn't exist in the demo dataset.</p>
      </Layout>
    );
  }

  return (
    <Layout title="Customer Case Detail">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-ink-900">{caseData.id.replace("case-", "CASE-")}</h2>
          <Badge tone={severityTone(caseData.severity)}>{caseData.severity} Severity</Badge>
          <Badge tone={statusTone(caseData.status)}>{caseData.status}</Badge>
        </div>
        <div className="flex gap-6 text-sm text-ink-500">
          <span>
            Customer <span className="font-semibold text-ink-900">{caseData.customerName}</span>
          </span>
          <span>
            Product <span className="font-semibold text-ink-900">{caseData.productName}</span>
          </span>
          <span>
            Created{" "}
            <span className="font-semibold text-ink-900">
              {new Date(caseData.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
          </span>
        </div>
      </div>

      <div className="card p-0">
        <div className="flex border-b border-ink-100 px-4">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`focus-ring relative px-4 py-3.5 text-sm font-semibold transition-colors ${
                activeTab === t ? "text-accent-700" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {t}
              {activeTab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent-600" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "Case Overview" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-bold text-ink-900">Sentinel Analysis</h3>
                <dl className="space-y-3 text-sm">
                  <Row label="Sentiment">
                    <Badge tone={sentimentTone(caseData.analysis.sentiment)}>{caseData.analysis.sentiment}</Badge>
                  </Row>
                  <Row label="Emotion">{caseData.analysis.emotion}</Row>
                  <Row label="Severity">
                    <Badge tone={severityTone(caseData.analysis.severity)}>{caseData.analysis.severity}</Badge>
                  </Row>
                  <Row label="Category">{caseData.analysis.category}</Row>
                  <Row label="Root Cause">{caseData.analysis.rootCause}</Row>
                  <Row label="Safety Concern">
                    <Badge tone={caseData.analysis.safetyConcern ? "critical" : "success"}>
                      {caseData.analysis.safetyConcern ? "Yes" : "No"}
                    </Badge>
                  </Row>
                  <Row label="Confidence">{Math.round(caseData.analysis.confidence * 100)}%</Row>
                  <Row label="Missing Info">
                    {caseData.analysis.missingInformation.length > 0
                      ? caseData.analysis.missingInformation.join(", ")
                      : "None"}
                  </Row>
                </dl>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-ink-900">Original Review</h3>
                <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-4">
                  <p className="text-sm leading-relaxed text-ink-700">{caseData.originalReviewText}</p>
                  <p className="mt-2 text-xs font-medium text-ink-400">
                    Rating: {"★".repeat(caseData.originalRating)}
                    {"☆".repeat(5 - caseData.originalRating)} ({caseData.originalRating}/5)
                  </p>
                </div>

                <h3 className="mb-3 mt-5 text-sm font-bold text-ink-900">Case Summary</h3>
                <p className="text-sm leading-relaxed text-ink-600">{caseData.memory.currentHypothesis}</p>

                {issue && (
                  <Link
                    to={`/issues/${issue.id}`}
                    className="mt-4 inline-block text-sm font-semibold text-accent-600 hover:underline"
                  >
                    View linked engineering issue ({issue.id}) →
                  </Link>
                )}
              </div>
            </div>
          )}

          {activeTab === "Conversation" && <CaseConversation caseData={caseData} initialMessages={messages} />}

          {activeTab === "Agent Workflow" && <AgentWorkflowPanel hasIssue={caseData.hasEngineeringIssue} />}

          {activeTab === "Engineering Issue" && <EngineeringIssuePanel issue={issue} caseId={caseData.id} />}
        </div>
      </div>
    </Layout>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-50 pb-3 last:border-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-ink-900">{children}</dd>
    </div>
  );
}

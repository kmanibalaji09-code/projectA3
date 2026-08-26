import { Layout } from "../components/Layout";
import { AgentWorkflowPanel } from "../components/AgentWorkflowPanel";

export function AgentWorkflow() {
  return (
    <Layout title="Agent Workflow" subtitle="How a review becomes an engineering issue">
      <div className="card p-8">
        <AgentWorkflowPanel hasIssue={false} />
      </div>

      <div className="card mt-4 p-6">
        <h3 className="mb-2 text-sm font-bold text-ink-900">Behind each step</h3>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-ink-900">Product Sentinel</dt>
            <dd className="text-ink-500">Analyzes sentiment, emotion, severity, and likely root cause.</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Customer Resolution Agent</dt>
            <dd className="text-ink-500">Asks diagnostic questions and maintains structured case memory.</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Product Innovation Architect</dt>
            <dd className="text-ink-500">Converts a resolved case into a structured engineering issue.</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Human Approval</dt>
            <dd className="text-ink-500">A developer approves, edits, or rejects the generated issue.</dd>
          </div>
        </dl>
      </div>
    </Layout>
  );
}

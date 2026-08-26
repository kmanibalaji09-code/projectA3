import { Layout } from "../components/Layout";
import { useApp } from "../context/AppContext";

export function Settings() {
  const { user } = useApp();

  return (
    <Layout title="Settings" subtitle="Account and workspace preferences">
      <div className="card max-w-xl p-6">
        <h3 className="mb-4 text-sm font-bold text-ink-900">Profile</h3>
        <div className="space-y-4">
          <Field label="Name" value={user?.name ?? ""} />
          <Field label="Email" value={user?.email ?? ""} />
          <Field label="Role" value={user?.role === "DEVELOPER" ? "Developer" : "Customer"} />
        </div>
      </div>

      <div className="card mt-4 max-w-xl p-6">
        <h3 className="mb-4 text-sm font-bold text-ink-900">Environment</h3>
        <div className="space-y-2 text-sm text-ink-600">
          <p>
            <span className="font-semibold text-ink-900">Database:</span> SQLite (a3.db)
          </p>
          <p>
            <span className="font-semibold text-ink-900">AI Provider:</span> Mock
          </p>
          <p>
            <span className="font-semibold text-ink-900">Ollama Model:</span> llama3.1:8b (not yet active)
          </p>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</label>
      <input
        readOnly
        value={value}
        className="focus-ring w-full rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-700"
      />
    </div>
  );
}

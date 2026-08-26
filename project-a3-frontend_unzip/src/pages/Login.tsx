import { useNavigate } from "react-router-dom";
import { Code2, ShoppingBag } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Login() {
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = (role: "DEVELOPER" | "CUSTOMER") => {
    login(role);
    navigate(role === "DEVELOPER" ? "/dashboard" : "/feed");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-600 text-lg font-extrabold text-white">
            A³
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">PROJECT A³</h1>
          <p className="mt-1 text-sm text-ink-500">Customer-to-product intelligence platform</p>
        </div>

        <div className="card p-6">
          <p className="mb-4 text-sm font-semibold text-ink-700">Sign in with a demo account</p>
          <div className="space-y-3">
            <button
              onClick={() => handleLogin("DEVELOPER")}
              className="focus-ring flex w-full items-center gap-3 rounded-lg border border-ink-200 p-4 text-left transition-colors hover:border-accent-500 hover:bg-accent-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                <Code2 size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Continue as Developer</p>
                <p className="text-xs text-ink-500">alex@a3-demo.dev</p>
              </div>
            </button>

            <button
              onClick={() => handleLogin("CUSTOMER")}
              className="focus-ring flex w-full items-center gap-3 rounded-lg border border-ink-200 p-4 text-left transition-colors hover:border-accent-500 hover:bg-accent-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-700">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Continue as Customer</p>
                <p className="text-xs text-ink-500">john@a3-demo.dev</p>
              </div>
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-400">
          Demo mode — no password required. Mock AI service is active.
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Login() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("customer@a3.demo");
  const [password, setPassword] = useState("password123");
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"DEVELOPER" | "CUSTOMER">("CUSTOMER");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setLoggingIn(true);
    setError("");
    try {
      const user = isRegistering ? await register(name, email, password, role) : await login(email, password);
      navigate(user.role === "DEVELOPER" ? "/dashboard" : "/feed");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to connect to the backend.");
      setLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-600 text-lg font-black text-white shadow-lg shadow-accent-200/60">
            A³
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-700">Agentic AI</div>
            <div className="text-xl font-black tracking-tight text-ink-900">PROJECT A³</div>
          </div>
        </div>

        <div className="card p-5 lg:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-700">Access portal</p>
            <h2 className="mt-2 text-2xl font-bold text-ink-900">{isRegistering ? "Create account" : "Sign in"}</h2>
            <p className="mt-1 text-sm text-ink-500">Customer-to-product intelligence workflow</p>
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            {isRegistering && (
              <label className="block text-sm font-medium text-ink-700">
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} required className="focus-ring mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5" />
              </label>
            )}
            <label className="block text-sm font-medium text-ink-700">
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="focus-ring mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5" />
            </label>
            {isRegistering && (
              <label className="block text-sm font-medium text-ink-700">
                Account type
                <select value={role} onChange={(event) => setRole(event.target.value as "DEVELOPER" | "CUSTOMER")} className="focus-ring mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5">
                  <option value="CUSTOMER">Customer</option>
                  <option value="DEVELOPER">Developer</option>
                </select>
              </label>
            )}
            <label className="block text-sm font-medium text-ink-700">
              Password
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="focus-ring mt-1 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5" />
            </label>
            <button disabled={loggingIn} type="submit" className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-3 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60">
              <LogIn size={16} />
              {loggingIn ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
            </button>
          </form>

          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="mt-4 w-full text-sm font-semibold text-accent-600 hover:underline">
            {isRegistering ? "Already have an account? Sign in" : "Create a new account"}
          </button>

          <div className="mt-5 rounded-2xl border border-ink-100 bg-ink-50 p-3 text-xs text-ink-600">
            <div className="flex items-center justify-between">
              <span>Demo developer</span>
              <span className="font-semibold text-ink-700">developer@a3.demo</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Demo customer</span>
              <span className="font-semibold text-ink-700">customer@a3.demo</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Password</span>
              <span className="font-semibold text-ink-700">password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

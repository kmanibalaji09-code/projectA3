import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bot, BrainCircuit, LogIn, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";

const heroMetrics = [
  { label: "Signal map", value: "10K+" },
  { label: "Avg. triage", value: "< 30s" },
  { label: "Issue detection", value: "96%" },
];

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
    <div className="hero-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hero-panel relative overflow-hidden rounded-[28px] border border-white/20 p-8 text-white shadow-2xl lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.28),transparent_30%)]" />
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
              <Sparkles size={12} /> Agentic AI for e-commerce
            </div>

            <h1 className="max-w-xl text-4xl font-black tracking-tight text-white md:text-5xl">
              Product intelligence that acts before customers churn.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-indigo-100 md:text-lg">
              A³ coordinates product review analysis, case triage, engineering diagnosis, and customer resolution into one autonomous workflow built for AI competition demos.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-white">{metric.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.12em] text-indigo-100">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-indigo-50">
              {['10K+ keyword signal map', 'Human-readable fixes', 'Customer + engineer workflow', 'Autonomous issue routing'].map((tag) => (
                <span key={tag} className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5">{tag}</span>
              ))}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <BrainCircuit className="mb-3 h-5 w-5 text-cyan-300" />
                <div className="text-sm font-semibold text-white">Product Sentinel</div>
                <div className="mt-1 text-xs text-indigo-100">Detects failures from customer language and product symptoms.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <Bot className="mb-3 h-5 w-5 text-emerald-300" />
                <div className="text-sm font-semibold text-white">Customer Resolution Agent</div>
                <div className="mt-1 text-xs text-indigo-100">Asks smart follow-up questions and explains next steps clearly.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-amber-300" />
                <div className="text-sm font-semibold text-white">Engineering Reviewer</div>
                <div className="mt-1 text-xs text-indigo-100">Routes issues to actions with confidence, safety, and fix guidance.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6 lg:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-700">Access portal</p>
              <h2 className="mt-2 text-2xl font-bold text-ink-900">{isRegistering ? "Create account" : "Sign in"}</h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
              <TrendingUp size={20} />
            </div>
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
              {loggingIn ? "Please wait..." : isRegistering ? "Create account" : "Continue to dashboard"}
            </button>
          </form>

          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="mt-4 w-full text-sm font-semibold text-accent-600 hover:underline">
            {isRegistering ? "Already have an account? Sign in" : "Create a new account"}
          </button>

          <div className="mt-6 space-y-2 rounded-2xl border border-ink-100 bg-ink-50 p-4 text-xs text-ink-600">
            <div className="flex items-center justify-between">
              <span>Demo developer</span>
              <span className="font-semibold text-ink-700">developer@a3.demo</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Demo customer</span>
              <span className="font-semibold text-ink-700">customer@a3.demo</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Password</span>
              <span className="font-semibold text-ink-700">password123</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-400">
            <span>Live backend</span>
            <ArrowRight size={12} />
            <span>project-a3-vgr4.vercel.app</span>
          </div>
        </section>
      </div>
    </div>
  );
}

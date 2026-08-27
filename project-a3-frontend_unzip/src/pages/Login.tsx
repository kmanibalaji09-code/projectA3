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
          <p className="mb-4 text-sm font-semibold text-ink-700">{isRegistering ? "Create your account" : "Sign in to your account"}</p>
          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            {isRegistering && <label className="block text-sm font-medium text-ink-700">Name<input value={name} onChange={(event) => setName(event.target.value)} required className="focus-ring mt-1 w-full rounded-lg border border-ink-200 px-3 py-2.5" /></label>}
            <label className="block text-sm font-medium text-ink-700">
              Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="focus-ring mt-1 w-full rounded-lg border border-ink-200 px-3 py-2.5" />
            </label>
            {isRegistering && <label className="block text-sm font-medium text-ink-700">Account type<select value={role} onChange={(event) => setRole(event.target.value as "DEVELOPER" | "CUSTOMER")} className="focus-ring mt-1 w-full rounded-lg border border-ink-200 px-3 py-2.5"><option value="CUSTOMER">Customer</option><option value="DEVELOPER">Developer</option></select></label>}
            <label className="block text-sm font-medium text-ink-700">
              Password
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="focus-ring mt-1 w-full rounded-lg border border-ink-200 px-3 py-2.5" />
            </label>
            <button disabled={loggingIn} type="submit" className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60">
              <LogIn size={16} />
              {loggingIn ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
            </button>
          </form>
          <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="mt-4 w-full text-sm font-semibold text-accent-600 hover:underline">{isRegistering ? "Already have an account? Sign in" : "Create a new account"}</button>
          <div className="mt-5 border-t border-ink-100 pt-4 text-xs text-ink-500">
            Demo accounts: `developer@a3.demo` or `customer@a3.demo`, password `password123`.
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-400">
          Backend API: https://project-a3-vgr4.vercel.app
        </p>
      </div>
    </div>
  );
}

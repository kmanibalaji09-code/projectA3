import { Search, Bell } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useApp();

  return (
    <header className="flex items-center justify-between gap-6 border-b border-ink-200 bg-white px-8 py-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="relative hidden max-w-sm flex-1 sm:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            placeholder="Search anything..."
            className="focus-ring w-full rounded-lg border border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:bg-white"
          />
        </div>

        <button
          className="focus-ring relative rounded-lg p-2 text-ink-500 hover:bg-ink-50"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-critical-600" />
        </button>

        {user && (
          <div className="flex items-center gap-2.5 border-l border-ink-200 pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700">
              {user.avatarInitials}
            </div>
            <div className="hidden text-left leading-tight md:block">
              <p className="text-sm font-semibold text-ink-900">{user.name}</p>
              <p className="text-xs text-ink-500">{user.role === "DEVELOPER" ? "Developer" : "Customer"}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

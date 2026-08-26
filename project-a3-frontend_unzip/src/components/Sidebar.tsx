import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Users,
  Wrench,
  BarChart3,
  GitBranch,
  Plug,
  Settings,
  ShoppingBag,
  Star,
  LogOut,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const developerNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/cases", label: "Customer Cases", icon: Users },
  { to: "/issues", label: "Engineering Issues", icon: Wrench },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/workflow", label: "Agent Workflow", icon: GitBranch },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
];

const customerNav = [
  { to: "/feed", label: "Product Feed", icon: ShoppingBag },
  { to: "/my-reviews", label: "My Reviews", icon: Star },
];

export function Sidebar() {
  const { user, logout } = useApp();
  if (!user) return null;

  const isDeveloper = user.role === "DEVELOPER";
  const primaryNav = isDeveloper ? developerNav : customerNav;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-ink-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-600 text-sm font-extrabold text-white">
          A³
        </div>
        <span className="text-[15px] font-bold tracking-tight text-ink-900">PROJECT A³</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-400">
          {isDeveloper ? "Developer" : "Customer"}
        </p>
        <ul className="space-y-0.5">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `focus-ring flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-50 text-accent-700"
                      : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                  }`
                }
              >
                <item.icon size={17} strokeWidth={2} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {isDeveloper && (
          <>
            <p className="px-2 pb-2 pt-6 text-[11px] font-bold uppercase tracking-wider text-ink-400">
              Customer View
            </p>
            <ul className="space-y-0.5">
              {customerNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `focus-ring flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent-50 text-accent-700"
                          : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                      }`
                    }
                  >
                    <item.icon size={17} strokeWidth={2} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="border-t border-ink-200 p-3">
        <button
          onClick={logout}
          className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-900"
        >
          <LogOut size={17} />
          Switch Role
        </button>
      </div>
    </aside>
  );
}

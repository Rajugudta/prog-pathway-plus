import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Binary,
  BookOpen,
  Braces,
  GraduationCap,
  LayoutDashboard,
  Map as MapIcon,
  MessagesSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Trophy,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeProvider";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Lectures", icon: BookOpen },
  { to: "/dsa", label: "DSA Academy", icon: Binary },
  { to: "/problems", label: "Problems", icon: Braces },
  { to: "/tutor", label: "AI Tutor", icon: MessagesSquare },
  { to: "/interviews", label: "Interview Studio", icon: Mic },
  { to: "/roadmaps", label: "Roadmaps", icon: MapIcon },
  { to: "/placement", label: "Placement Hub", icon: GraduationCap },
  { to: "/achievements", label: "Achievements", icon: Trophy },
] as const;

/** Primary tabs surfaced in the mobile bottom bar. */
const TABS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/problems", label: "Practice", icon: Braces },
  { to: "/placement", label: "Placement", icon: GraduationCap },
  { to: "/interviews", label: "Mocks", icon: Mic },
  { to: "/learn", label: "Lectures", icon: BookOpen },
] as const;

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user } = useAuth();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-2xl transition-[width] duration-300 md:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground">
            {"</>"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">CodeDev</p>
              <p className="truncate text-[11px] text-muted-foreground">Placement prep studio</p>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "text-sidebar-accent-foreground",
                )}
                title={item.label}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-lg bg-sidebar-accent"
                  />
                )}
                <span
                  className={cn(
                    "h-5 w-[3px] shrink-0 rounded-full transition-colors",
                    active ? "bg-sidebar-primary" : "bg-transparent",
                  )}
                />
                <item.icon className="size-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          {!collapsed && <ThemeToggle className="mb-2 w-fit" />}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="size-[18px]" />
            {!collapsed && <span className="truncate">Sign out</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/70 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <ThemeToggle className="md:hidden" />
            <span className="hidden max-w-[180px] truncate rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground sm:inline">
              {user?.email ?? "Signed in"}
            </span>
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-muted-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>

        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/85 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        >
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium"
              >
                {active && (
                  <motion.span
                    layoutId="tab-active"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-2 top-1 h-9 rounded-xl bg-secondary"
                  />
                )}
                <tab.icon
                  className={cn(
                    "relative size-[18px] transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className={cn("relative", active ? "text-foreground" : "text-muted-foreground")}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function PageSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rise-in mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10", className)}>{children}</div>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <div className="mica rounded-2xl p-8 text-center text-sm text-muted-foreground">{children}</div>;
}

export { Button };

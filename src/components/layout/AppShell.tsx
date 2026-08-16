import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, Plus, ShoppingBag, SquareStack } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { cartCount, useJournal } from "@/lib/store";
import { AddSheet } from "@/components/add/AddSheet";

const TABS = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { to: "/health", label: "Health", icon: Heart, match: (p: string) => p.startsWith("/health") },
  { to: "/shop", label: "Shop", icon: ShoppingBag, match: (p: string) => p.startsWith("/shop") || p.startsWith("/cart") },
  { to: "/more", label: "More", icon: SquareStack, match: (p: string) => ["/more", "/journal", "/documents", "/guide", "/pets", "/calendar", "/care", "/spend", "/aid", "/train", "/travel", "/cover", "/tag", "/inbox", "/album"].some((x) => p === x || (x !== "/more" && p.startsWith(x))) },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const rehydrate = useJournal.persist.rehydrate;
  const setHydrated = useJournal((s) => s.setHydrated);
  const addKind = useJournal((s) => s.addKind);
  const requestAdd = useJournal((s) => s.requestAdd);
  const cart = useJournal((s) => s.cart);
  const [openAdd, setOpenAdd] = useState(false);
  const n = cartCount(cart);

  useEffect(() => {
    if (useJournal.getState().hydrated) return;
    void Promise.resolve(rehydrate()).then(() => setHydrated(true));
  }, [rehydrate, setHydrated]);

  useEffect(() => {
    if (addKind) setOpenAdd(true);
  }, [addKind]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-sky">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <span className="cloud left-[-8%] top-[8%] h-10 w-28" />
        <span className="cloud right-[-6%] top-[16%] h-8 w-24" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[402px] flex-col bg-canvas phone-shadow sm:min-h-[874px] sm:my-4 sm:rounded-[1.85rem] sm:overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>

        <nav className="sticky bottom-0 z-30 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5">
          <div className="flex items-end justify-between rounded-[1.55rem] bg-ink px-2 py-1.5 text-card shadow-[var(--shadow-nav)]">
            {TABS.slice(0, 2).map((tab) => (
              <NavItem key={tab.to} tab={tab} active={tab.match(pathname)} />
            ))}
            <button
              type="button"
              aria-label="Add"
              onClick={() => {
                requestAdd(null);
                setOpenAdd(true);
              }}
              className="press -mt-6 grid size-14 place-items-center rounded-full bg-sun text-sun-ink shadow-[0_8px_20px_-8px_rgb(180,140,20)]"
            >
              <Plus className="size-6" strokeWidth={2.4} />
            </button>
            {TABS.slice(2).map((tab) => (
              <NavItem
                key={tab.to}
                tab={tab}
                active={tab.match(pathname)}
                badge={tab.to === "/shop" && n ? n : 0}
              />
            ))}
          </div>
        </nav>
      </div>

      <AddSheet
        open={openAdd}
        onOpenChange={(v) => {
          setOpenAdd(v);
          if (!v) requestAdd(null);
        }}
      />
    </div>
  );
}

function NavItem({
  tab,
  active,
  badge = 0,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  badge?: number;
}) {
  const Icon = tab.icon;
  return (
    <Link
      to={tab.to}
      aria-label={tab.label}
      className={cn(
        "press relative flex w-14 flex-col items-center gap-0.5 py-1 text-[10px] font-medium tracking-wide",
        active ? "text-card" : "text-card/50",
      )}
    >
      <Icon className="size-5" strokeWidth={active ? 2.2 : 1.75} />
      {tab.label}
      {badge > 0 && (
        <span className="absolute right-2 top-0 grid min-w-4 place-items-center rounded-full bg-sun px-1 text-[9px] font-semibold text-sun-ink">
          {badge}
        </span>
      )}
    </Link>
  );
}

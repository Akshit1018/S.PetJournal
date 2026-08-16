import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cartCount, useActivePet, useJournal } from "@/lib/store";
import { ShoppingBag } from "lucide-react";

export function TopBar({
  title,
  kicker,
  action,
}: {
  title: string;
  kicker?: string;
  action?: ReactNode;
}) {
  const pet = useActivePet();
  const n = useJournal((s) => cartCount(s.cart));
  return (
    <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(0.85rem,env(safe-area-inset-top))]">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          {kicker ?? (pet ? pet.name : "PetJournal")}
        </p>
        <h1 className="font-display text-[1.65rem] font-medium leading-none tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {action}
        <Link to="/cart" aria-label="Cart" className="press relative grid size-10 place-items-center rounded-full bg-card ring-1 ring-line">
          <ShoppingBag className="size-4" />
          {n > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-sun px-1 text-[9px] font-semibold text-sun-ink">
              {n}
            </span>
          )}
        </Link>
        {pet && (
          <Link to="/pets" className="press shrink-0">
            <img src={pet.photo} alt="" className="size-10 rounded-full object-cover ring-2 ring-card" />
          </Link>
        )}
      </div>
    </header>
  );
}

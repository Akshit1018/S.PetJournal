import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { money, productById } from "@/lib/catalog";
import { useJournal } from "@/lib/store";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

export function ProductView({ id }: { id: string }) {
  const p = productById(id);
  const addToCart = useJournal((s) => s.addToCart);
  const saved = useJournal((s) => s.saved);
  const toggleSaved = useJournal((s) => s.toggleSaved);
  const nav = useNavigate();
  if (!p) {
    return (
      <div className="px-4 py-20 text-center">
        <p>Missing item.</p>
        <Link to="/shop" className="mt-3 inline-block text-sky-deep">
          Back to shop
        </Link>
      </div>
    );
  }
  const on = saved.includes(p.id);
  return (
    <div className="flex flex-col pb-8">
      <TopBar title={p.name} kicker={p.brand} />
      <div className="reveal px-3.5">
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-line">
          <img src={p.image} alt="" className="h-56 w-full object-cover" />
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-medium leading-none tabular-nums">{money(p.price)}</p>
            {p.compareAt && <p className="text-[12px] text-muted line-through">{money(p.compareAt)}</p>}
            <p className="mt-1 text-[12px] text-muted">
              {p.rating} · {p.reviews.toLocaleString()} reviews · {p.size}
            </p>
          </div>
          <button
            type="button"
            aria-label="Save"
            onClick={() => toggleSaved(p.id)}
            className="press grid size-11 place-items-center rounded-full bg-card ring-1 ring-line"
          >
            <Heart className={`size-4 ${on ? "fill-bad text-bad" : ""}`} />
          </button>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed">{p.blurb}</p>
        <ul className="mt-3 space-y-1 text-[13px] text-muted">
          {p.bullets.map((b) => (
            <li key={b}>· {b}</li>
          ))}
        </ul>
        {p.rx && <p className="mt-3 rounded-lg bg-blush/60 px-3 py-2 text-[12px]">Rx — we’ll ping the clinic on file after checkout.</p>}
        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => {
              addToCart(p.id, p.autoship);
              toast.success(p.autoship ? "Added with Autoship" : "Added");
            }}
          >
            <Plus className="size-4" /> Cart
          </Button>
          <Button
            className="flex-1"
            variant="sun"
            onClick={() => {
              addToCart(p.id, p.autoship);
              void nav({ to: "/cart" });
            }}
          >
            Buy
          </Button>
        </div>
        {p.autoship && <p className="mt-2 text-center text-[11px] text-muted">Autoship: skip or cancel anytime.</p>}
        <Link to="/shop" className="mt-4 flex items-center justify-center gap-1 text-[13px] text-muted">
          <Minus className="size-3" /> Keep browsing
        </Link>
      </div>
    </div>
  );
}

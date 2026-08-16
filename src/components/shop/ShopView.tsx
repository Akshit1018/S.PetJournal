import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PRODUCTS, SHOP_CATS, money, productsFor, type ShopCatId } from "@/lib/catalog";
import { useActivePet, useJournal } from "@/lib/store";
import { TopBar } from "@/components/layout/TopBar";

export function ShopView({ cat }: { cat?: ShopCatId }) {
  const pet = useActivePet();
  const [q, setQ] = useState("");
  const [mine, setMine] = useState(true);
  const list = useMemo(
    () => productsFor(mine && pet ? pet.species : undefined, cat, q),
    [mine, pet, cat, q],
  );
  const title = cat ? SHOP_CATS.find((c) => c.id === cat)?.label ?? "Shop" : "Shop";

  return (
    <div className="flex flex-col pb-6">
      <TopBar title={title} kicker={mine && pet ? `For ${pet.name}` : "All species"} />
      <div className="px-3.5">
        <label className="flex h-11 items-center gap-2 rounded-xl bg-card px-3 ring-1 ring-line">
          <Search className="size-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Food, UVB, hay…"
            className="h-full w-full bg-transparent text-sm outline-none"
          />
        </label>
        <div className="mt-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMine((v) => !v)}
            className="press h-8 rounded-full bg-sky-soft px-3 text-[12px] font-medium"
          >
            {mine && pet ? `${pet.name} only` : "Every species"}
          </button>
          <Link to="/cart" className="text-[12px] font-medium text-sky-deep">
            Cart
          </Link>
        </div>

        {!cat && (
          <div className="reveal mt-3 grid grid-cols-4 gap-2">
            {SHOP_CATS.map((c) => (
              <Link
                key={c.id}
                to="/shop/c/$catId"
                params={{ catId: c.id }}
                className="press flex min-h-16 flex-col items-start justify-end rounded-xl bg-card px-2 py-2 ring-1 ring-line"
              >
                <span className="text-[12px] font-semibold leading-tight">{c.label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="reveal d1 mt-4 grid grid-cols-2 gap-2.5">
          {list.map((p) => (
            <Link
              key={p.id}
              to="/shop/p/$id"
              params={{ id: p.id }}
              className="press overflow-hidden rounded-xl bg-card ring-1 ring-line"
            >
              <img src={p.image} alt="" className="h-28 w-full object-cover" />
              <div className="px-2.5 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted">{p.brand}</p>
                <p className="truncate text-[13px] font-semibold">{p.name}</p>
                <p className="mt-0.5 text-[13px] tabular-nums">
                  {money(p.price)}
                  {p.rx && <span className="ml-1 text-[10px] font-semibold text-warn">Rx</span>}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {list.length === 0 && <p className="py-10 text-center text-[13px] text-muted">Nothing in this filter.</p>}

        {!cat && (
          <p className="mt-4 text-center text-[11px] text-muted">{PRODUCTS.length} items · Autoship + pharmacy</p>
        )}
      </div>
    </div>
  );
}

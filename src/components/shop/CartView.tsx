import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { money, productById } from "@/lib/catalog";
import { cartTotal, useJournal } from "@/lib/store";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

export function CartView() {
  const cart = useJournal((s) => s.cart);
  const setQty = useJournal((s) => s.setQty);
  const toggleAutoship = useJournal((s) => s.toggleAutoship);
  const checkout = useJournal((s) => s.checkout);
  const orders = useJournal((s) => s.orders);
  const nav = useNavigate();
  const total = cartTotal(cart);

  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Cart" kicker={`${cart.length} lines`} />
      <div className="px-3.5">
        {cart.length === 0 && (
          <div className="rounded-xl bg-card px-4 py-10 text-center ring-1 ring-line">
            <p className="text-sm">Cart is empty.</p>
            <Link to="/shop" className="mt-2 inline-block text-sm font-medium text-sky-deep">
              Open shop
            </Link>
          </div>
        )}
        <ul className="space-y-2">
          {cart.map((l) => {
            const p = productById(l.productId);
            if (!p) return null;
            return (
              <li key={l.productId} className="reveal flex gap-3 rounded-xl bg-card p-2.5 ring-1 ring-line">
                <img src={p.image} alt="" className="size-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{p.name}</p>
                  <p className="text-[12px] tabular-nums text-muted">{money(p.price)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button type="button" className="press size-7 rounded-full bg-canvas" onClick={() => setQty(p.id, l.qty - 1)}>
                      −
                    </button>
                    <span className="w-4 text-center text-sm tabular-nums">{l.qty}</span>
                    <button type="button" className="press size-7 rounded-full bg-canvas" onClick={() => setQty(p.id, l.qty + 1)}>
                      +
                    </button>
                    {p.autoship && (
                      <button
                        type="button"
                        onClick={() => toggleAutoship(p.id)}
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${l.autoship ? "bg-chip text-chip-ink" : "bg-canvas text-muted"}`}
                      >
                        {l.autoship ? "Autoship" : "Once"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {cart.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Total</span>
              <span className="font-display text-2xl tabular-nums">{money(total)}</span>
            </div>
            <Button
              className="mt-3 w-full"
              variant="sun"
              onClick={() => {
                const o = checkout();
                if (o) {
                  toast.success("Packed — tracking in Inbox");
                  void nav({ to: "/inbox" });
                }
              }}
            >
              Place order
            </Button>
          </div>
        )}
        {orders[0] && (
          <div className="mt-6">
            <p className="text-[13px] font-semibold">Recent</p>
            <ul className="mt-2 space-y-1.5">
              {orders.slice(0, 4).map((o) => (
                <li key={o.id} className="flex justify-between rounded-lg bg-card px-3 py-2 text-[13px] ring-1 ring-line">
                  <span className="capitalize">{o.status}</span>
                  <span className="tabular-nums">{money(o.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

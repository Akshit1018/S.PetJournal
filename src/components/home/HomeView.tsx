import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Footprints, Mars, Mic, ShoppingBag, Stethoscope, Venus } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SEED_OWNER } from "@/lib/seed";
import { speciesOf } from "@/lib/species";
import { KIND_META, latestMetric, useActivePet, useJournal } from "@/lib/store";
import { ageLabel, formatDue, greeting } from "@/lib/utils";
import { buildSuggestions } from "@/lib/ai-local";
import { productsFor } from "@/lib/catalog";

export function HomeView() {
  const pet = useActivePet();
  const pets = useJournal((s) => s.pets);
  const metrics = useJournal((s) => s.metrics);
  const entries = useJournal((s) => s.entries);
  const prefs = useJournal((s) => s.prefs);
  const requestAdd = useJournal((s) => s.requestAdd);
  const toggleEntry = useJournal((s) => s.toggleEntry);
  const { user, isPending } = useCurrentUserState();
  const nav = useNavigate();
  if (!pet) return <EmptyHome />;

  const spec = speciesOf(pet.species);
  const chartable = spec.metrics.filter((m) => m.chart).slice(0, 2);
  const ownerName = (user?.displayName ?? SEED_OWNER.name).split(" ")[0];
  const ownerPhoto = user?.profileImageUrl ?? SEED_OWNER.photo;
  const tip = buildSuggestions(pet, metrics, entries, prefs)[0];
  const upcoming = entries
    .filter((e) => e.petId === pet.id && e.dueAt && !e.completed)
    .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""))
    .slice(0, 3);
  const picks = productsFor(pet.species).slice(0, 3);

  return (
    <div className="flex flex-col pb-4">
      <header className="relative h-[46vw] max-h-[280px] min-h-[210px] overflow-hidden bg-sky">
        <img src={pet.photo} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_18%]" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/25 via-transparent to-canvas" />
        <div className="relative z-10 flex items-start justify-between px-4 pt-[max(0.85rem,env(safe-area-inset-top))]">
          <Link to="/pets" className="press flex items-center gap-2">
            {isPending ? (
              <span className="size-9 animate-pulse rounded-full bg-card/50" />
            ) : (
              <img src={ownerPhoto} alt="" className="size-9 rounded-full object-cover ring-2 ring-card/80" />
            )}
            <div className="leading-tight">
              <p className="text-[11px] font-medium text-card/90">{greeting()}</p>
              <p className="text-sm font-semibold text-card">{ownerName}</p>
            </div>
          </Link>
          <Link to="/inbox" aria-label="Inbox" className="press grid size-10 place-items-center rounded-full bg-card/90 text-ink">
            <Bell className="size-5" />
          </Link>
        </div>
      </header>

      <section className="reveal relative z-10 -mt-14 px-3.5">
        <div className="rounded-[1.5rem] bg-card px-4 pb-3.5 pt-4 shadow-[var(--shadow-card)] ring-1 ring-line">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-[1.85rem] font-medium leading-none">{pet.name}</h1>
              <p className="mt-1 text-[13px] text-muted">
                {pet.breed} · {ageLabel(pet.birthDate)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-muted">
              {pet.sex === "female" ? <Venus className="size-4" /> : pet.sex === "male" ? <Mars className="size-4" /> : null}
              <span className="text-[11px] font-semibold uppercase tracking-wide">{spec.label}</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {chartable.map((m) => {
              const last = latestMetric(metrics, pet.id, m.key);
              return (
                <Link key={m.key} to="/health" className="press rounded-lg bg-canvas px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{m.label}</p>
                  <p className="font-display text-[1.45rem] font-medium tabular-nums leading-none">
                    {last ? last.value : "—"}
                    <span className="ml-1 font-sans text-xs font-medium text-muted">{m.unit}</span>
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="reveal d1 mt-4 px-3.5">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Log", icon: Mic, run: () => requestAdd("voice") },
            { label: "Vet", icon: Stethoscope, run: () => requestAdd("vet") },
            { label: "Shop", icon: ShoppingBag, run: () => nav({ to: "/shop" }) },
            { label: "Care", icon: Footprints, run: () => nav({ to: "/care" }) },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.run}
              className="press flex flex-col items-center gap-1 rounded-xl bg-card py-2.5 ring-1 ring-line"
            >
              <a.icon className="size-4 text-sky-deep" />
              <span className="text-[11px] font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="reveal d2 mt-4 px-3.5">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-[13px] font-semibold">Household</h2>
          <Link to="/pets" className="text-[12px] font-medium text-sky-deep">
            All
          </Link>
        </div>
        <div className="hide-scroll flex gap-2.5 overflow-x-auto">
          {pets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => useJournal.getState().setActivePet(p.id)}
              className="press flex w-14 shrink-0 flex-col items-center gap-1"
            >
              <img
                src={p.photo}
                alt=""
                className={`size-12 rounded-full object-cover ring-2 ${p.id === pet.id ? "ring-sky" : "ring-transparent"}`}
              />
              <span className="w-full truncate text-center text-[10px] font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      {tip && (
        <section className="reveal d3 mt-4 px-3.5">
          <Link to="/guide" className="press block rounded-xl bg-sky-soft/80 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-deep">Guide</p>
            <p className="mt-0.5 text-[13px] font-semibold">{tip.title}</p>
            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{tip.body}</p>
          </Link>
        </section>
      )}

      <section className="reveal d4 mt-4 px-3.5">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-[13px] font-semibold">Due</h2>
          <Link to="/calendar" className="text-[12px] font-medium text-sky-deep">
            Calendar
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-line">
          {upcoming.length === 0 && <p className="px-3.5 py-5 text-[13px] text-muted">Nothing open. Tap + to date it.</p>}
          {upcoming.map((e, i) => (
            <button
              key={e.id}
              type="button"
              onClick={() => toggleEntry(e.id)}
              className={`press flex w-full items-center gap-2.5 px-3.5 py-3 text-left ${i ? "border-t border-line" : ""}`}
            >
              <span className="grid size-8 place-items-center rounded-full bg-canvas text-[9px] font-bold uppercase text-muted">
                {KIND_META[e.kind].label.slice(0, 3)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{e.title}</span>
                <span className="text-[11px] text-muted">{e.provider ?? KIND_META[e.kind].label}</span>
              </span>
              <span className="text-[11px] font-semibold text-sky-deep">{e.dueAt ? formatDue(e.dueAt) : ""}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="reveal d5 mt-4 px-3.5">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-[13px] font-semibold">For {pet.name}</h2>
          <Link to="/shop" className="text-[12px] font-medium text-sky-deep">
            Shop
          </Link>
        </div>
        <div className="hide-scroll flex gap-2 overflow-x-auto">
          {picks.map((p) => (
            <Link
              key={p.id}
              to="/shop/p/$id"
              params={{ id: p.id }}
              className="press w-28 shrink-0 overflow-hidden rounded-xl bg-card ring-1 ring-line"
            >
              <img src={p.image} alt="" className="h-20 w-full object-cover" />
              <div className="px-2 py-1.5">
                <p className="truncate text-[12px] font-medium">{p.name}</p>
                <p className="text-[12px] text-muted">${p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyHome() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-24 text-center">
      <p className="font-display text-2xl">Add a pet</p>
      <Link to="/pets" className="press mt-2 rounded-md bg-sun px-4 py-2.5 text-sm font-medium text-sun-ink">
        Household
      </Link>
    </div>
  );
}

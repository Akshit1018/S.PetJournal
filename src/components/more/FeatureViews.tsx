import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { AID, LESSONS, PLACES, PLANS, SITTERS, TRAVEL_LIST } from "@/lib/extras";
import { money } from "@/lib/catalog";
import { buildSuggestions } from "@/lib/ai-local";
import { KIND_META, useActivePet, useJournal } from "@/lib/store";
import { formatDue } from "@/lib/utils";
import { speciesOf } from "@/lib/species";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";

export function CalendarView() {
  const pet = useActivePet();
  const entries = useJournal((s) => s.entries);
  const bookings = useJournal((s) => s.bookings);
  const toggle = useJournal((s) => s.toggleEntry);
  const requestAdd = useJournal((s) => s.requestAdd);
  if (!pet) return null;
  const due = entries
    .filter((e) => e.petId === pet.id && e.dueAt)
    .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Calendar" action={<Button size="sm" variant="sun" onClick={() => requestAdd("vet")}>Add</Button>} />
      <div className="px-3.5">
        <ul className="overflow-hidden rounded-xl bg-card ring-1 ring-line">
          {due.length === 0 && <li className="px-3.5 py-6 text-[13px] text-muted">No dated care.</li>}
          {due.map((e, i) => (
            <li key={e.id} className={i ? "border-t border-line" : ""}>
              <button type="button" onClick={() => toggle(e.id)} className="press flex w-full items-center gap-3 px-3.5 py-3 text-left">
                <span className={`size-2 rounded-full ${e.completed ? "bg-good" : "bg-sun"}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-[13px] font-medium ${e.completed ? "text-muted line-through" : ""}`}>{e.title}</span>
                  <span className="text-[11px] text-muted">{KIND_META[e.kind].label}</span>
                </span>
                <span className="text-[11px] font-semibold text-sky-deep">{e.dueAt ? formatDue(e.dueAt) : ""}</span>
              </button>
            </li>
          ))}
        </ul>
        {bookings.filter((b) => b.petId === pet.id).length > 0 && (
          <p className="mt-4 text-[12px] text-muted">
            {bookings.filter((b) => b.petId === pet.id).length} booked sits — see Walk & sit.
          </p>
        )}
      </div>
    </div>
  );
}

export function CareView() {
  const pet = useActivePet();
  const book = useJournal((s) => s.book);
  const bookings = useJournal((s) => s.bookings);
  if (!pet) return null;
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Walk & sit" kicker="Neighborhood care" />
      <div className="space-y-2 px-3.5">
        {SITTERS.map((s) => (
          <article key={s.id} className="reveal rounded-xl bg-card p-3.5 ring-1 ring-line">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-semibold">{s.name}</p>
                <p className="text-[12px] text-muted">
                  {s.role} · {s.rating} · {s.walks} jobs
                </p>
              </div>
              <p className="font-display text-xl tabular-nums">${s.rate}</p>
            </div>
            <p className="mt-1.5 text-[13px] text-muted">{s.bio}</p>
            <Button
              size="sm"
              variant="sun"
              className="mt-2"
              onClick={() => {
                const when = new Date(Date.now() + 86400000 * 2).toISOString();
                book({ petId: pet.id, sitterId: s.name, kind: s.role, when });
                toast.success(`Booked ${s.role.toLowerCase()} for ${pet.name}`);
              }}
            >
              Book {s.role.toLowerCase()}
            </Button>
          </article>
        ))}
        {bookings[0] && (
          <p className="pt-2 text-[12px] text-muted">
            Next: {bookings[0].kind} with {bookings[0].sitterId}
          </p>
        )}
      </div>
    </div>
  );
}

export function SpendView() {
  const pet = useActivePet();
  const expenses = useJournal((s) => s.expenses);
  const addExpense = useJournal((s) => s.addExpense);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  if (!pet) return null;
  const mine = expenses.filter((e) => e.petId === pet.id);
  const total = mine.reduce((n, e) => n + e.amount, 0);
  const by = mine.reduce<Record<string, number>>((a, e) => ({ ...a, [e.cat]: (a[e.cat] ?? 0) + e.amount }), {});
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Spend" kicker={`${money(total)} on ${pet.name}`} />
      <div className="px-3.5">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(by).map(([k, v]) => (
            <div key={k} className="rounded-xl bg-card px-2 py-2 ring-1 ring-line">
              <p className="text-[10px] uppercase text-muted">{k}</p>
              <p className="font-display text-lg tabular-nums">{money(v)}</p>
            </div>
          ))}
        </div>
        <form
          className="mt-3 space-y-2 rounded-xl bg-card p-3 ring-1 ring-line"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(amount);
            if (!n) return;
            addExpense({ petId: pet.id, amount: n, cat: "other", note: note || "Logged" });
            setAmount("");
            setNote("");
            toast.success("Logged");
          }}
        >
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount" className="h-11 w-full rounded-md border border-line px-3 text-sm" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What for" className="h-11 w-full rounded-md border border-line px-3 text-sm" />
          <Button type="submit" className="w-full" variant="sun">
            Add spend
          </Button>
        </form>
        <ul className="mt-3 space-y-1.5">
          {mine.map((e) => (
            <li key={e.id} className="flex justify-between rounded-lg bg-card px-3 py-2 text-[13px] ring-1 ring-line">
              <span className="truncate">{e.note}</span>
              <span className="tabular-nums">{money(e.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AlbumView() {
  const pet = useActivePet();
  const memories = useJournal((s) => s.memories);
  const addMemory = useJournal((s) => s.addMemory);
  if (!pet) return null;
  const mine = memories.filter((m) => m.petId === pet.id);
  return (
    <div className="flex flex-col pb-8">
      <TopBar
        title="Album"
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              addMemory({ petId: pet.id, src: pet.photo, caption: "Today" });
              toast.success("Pinned today’s face");
            }}
          >
            Pin
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-2 px-3.5">
        {mine.map((m) => (
          <figure key={m.id} className="reveal overflow-hidden rounded-xl bg-card ring-1 ring-line">
            <img src={m.src} alt="" className="h-36 w-full object-cover" />
            <figcaption className="px-2 py-1.5 text-[12px]">{m.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function AidView() {
  const pet = useActivePet();
  const spec = pet ? speciesOf(pet.species) : null;
  const rows = AID.filter((a) => a.species === "all" || a.species === pet?.species);
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="First aid" kicker={spec?.label} />
      <div className="space-y-2 px-3.5">
        {spec && (
          <article className="rounded-xl bg-blush/50 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide">Red flags</p>
            <ul className="mt-1 list-disc pl-4 text-[13px] leading-snug">
              {spec.redFlags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </article>
        )}
        {rows.map((r) => (
          <article key={r.title} className="rounded-xl bg-card p-3.5 ring-1 ring-line">
            <p className="text-[14px] font-semibold">{r.title}</p>
            <ol className="mt-1 list-decimal pl-4 text-[13px] leading-snug text-muted">
              {r.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </article>
        ))}
        <a href="tel:8884264435" className="press block rounded-xl bg-ink px-3.5 py-3 text-center text-[13px] font-medium text-card">
          ASPCA poison — 888-426-4435
        </a>
      </div>
    </div>
  );
}

export function TrainView() {
  const pet = useActivePet();
  const done = useJournal((s) => s.lessonsDone);
  const toggle = useJournal((s) => s.toggleLesson);
  if (!pet) return null;
  const list = LESSONS.filter((l) => l.species === "all" || l.species === pet.species);
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Train" kicker={`${done.length} done`} />
      <div className="space-y-2 px-3.5">
        {list.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => toggle(l.id)}
            className="press w-full rounded-xl bg-card p-3.5 text-left ring-1 ring-line"
          >
            <div className="flex justify-between gap-2">
              <p className="text-[14px] font-semibold">{l.title}</p>
              <span className="text-[11px] text-muted">{l.mins} min</span>
            </div>
            <p className="mt-1 text-[13px] leading-snug text-muted">{l.body}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-sky-deep">
              {done.includes(l.id) ? "Done" : "Mark done"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TravelView() {
  const done = useJournal((s) => s.travelDone);
  const toggle = useJournal((s) => s.toggleTravel);
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Travel" kicker="Pack + places" />
      <div className="px-3.5">
        <ul className="overflow-hidden rounded-xl bg-card ring-1 ring-line">
          {TRAVEL_LIST.map((item, i) => (
            <li key={item} className={i ? "border-t border-line" : ""}>
              <button type="button" onClick={() => toggle(item)} className="press flex w-full items-center gap-3 px-3.5 py-3 text-left">
                <span className={`grid size-5 place-items-center rounded-full text-[10px] ${done.includes(item) ? "bg-good text-card" : "bg-canvas"}`}>
                  {done.includes(item) ? "✓" : ""}
                </span>
                <span className={`text-[13px] ${done.includes(item) ? "text-muted line-through" : ""}`}>{item}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] font-semibold">Nearby</p>
        <ul className="mt-2 space-y-2">
          {PLACES.map((p) => (
            <li key={p.id} className="rounded-xl bg-card px-3.5 py-3 ring-1 ring-line">
              <p className="text-[13px] font-semibold">{p.name}</p>
              <p className="text-[12px] text-muted">
                {p.kind} · {p.note}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CoverView() {
  const pet = useActivePet();
  const planId = useJournal((s) => s.planId);
  const setPlan = useJournal((s) => s.setPlan);
  const addDocument = useJournal((s) => s.addDocument);
  if (!pet) return null;
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Cover" kicker="Not a quote — a shortlist" />
      <div className="space-y-2 px-3.5">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPlan(p.id);
              addDocument({ petId: pet.id, title: `${p.name} plan`, kind: "insurance", note: `${money(p.month)}/mo · ${p.cover}` });
              toast.success(`${p.name} saved to passport`);
            }}
            className={`press w-full rounded-xl p-3.5 text-left ring-1 ${planId === p.id ? "bg-sky-soft ring-sky" : "bg-card ring-line"}`}
          >
            <div className="flex items-baseline justify-between">
              <p className="text-[14px] font-semibold">{p.name}</p>
              <p className="font-display text-xl tabular-nums">${p.month}</p>
            </div>
            <p className="mt-1 text-[13px] text-muted">{p.cover}</p>
            {p.best && <p className="mt-1 text-[11px] font-semibold text-sky-deep">Most owners pick this</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TagView() {
  const pet = useActivePet();
  if (!pet) return null;
  const spec = speciesOf(pet.species);
  const copy = async () => {
    const text = `${pet.name} · ${spec.label} · chip ${pet.microchip ?? "none"} · ${pet.passportId ?? ""}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("ID copied");
    } catch {
      toast.message(text);
    }
  };
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Lost ID" />
      <div className="px-3.5">
        <article className="reveal overflow-hidden rounded-2xl bg-ink p-4 text-card">
          <p className="text-[10px] uppercase tracking-[0.16em] text-card/60">If found</p>
          <p className="mt-2 font-display text-3xl">{pet.name}</p>
          <p className="text-[13px] text-card/75">
            {pet.breed} · {spec.label}
          </p>
          <img src={pet.photo} alt="" className="mt-4 h-40 w-full rounded-xl object-cover" />
          <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <dt className="text-card/50">Chip</dt>
              <dd className="font-medium">{pet.microchip ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-card/50">Passport</dt>
              <dd className="font-medium">{pet.passportId ?? "—"}</dd>
            </div>
          </dl>
        </article>
        <Button className="mt-3 w-full" variant="sun" onClick={() => void copy()}>
          Copy ID
        </Button>
        <Link to="/handoff" className="mt-2 block text-center text-[13px] text-sky-deep">
          Sitter one-pager
        </Link>
      </div>
    </div>
  );
}

export function HandoffView() {
  const pet = useActivePet();
  const entries = useJournal((s) => s.entries);
  if (!pet) return null;
  const meds = entries.filter((e) => e.petId === pet.id && e.kind === "medication").slice(0, 3);
  const text = [
    `${pet.name} (${pet.breed})`,
    pet.notes,
    ...meds.map((m) => `Med: ${m.title}`),
    "Emergency: Willow Exotic / usual clinic",
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Handoff" kicker="For the sitter" />
      <div className="px-3.5">
        <pre className="whitespace-pre-wrap rounded-xl bg-card p-3.5 text-[13px] leading-relaxed ring-1 ring-line">{text}</pre>
        <Button
          className="mt-3 w-full"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              toast.success("Copied");
            } catch {
              toast.message("Select and copy");
            }
          }}
        >
          Copy sheet
        </Button>
      </div>
    </div>
  );
}

export function InboxView() {
  const pet = useActivePet();
  const prefs = useJournal((s) => s.prefs);
  const metrics = useJournal((s) => s.metrics);
  const entries = useJournal((s) => s.entries);
  const orders = useJournal((s) => s.orders);
  if (!pet) return null;
  const tips = buildSuggestions(pet, metrics, entries, prefs);
  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Inbox" />
      <div className="space-y-2 px-3.5">
        {orders.map((o) => (
          <Link key={o.id} to="/cart" className="press block rounded-xl bg-card px-3.5 py-3 ring-1 ring-line">
            <p className="text-[11px] font-semibold uppercase text-sky-deep">Order {o.status}</p>
            <p className="text-[13px] font-medium">
              {money(o.total)} · {format(parseISO(o.at), "MMM d")}
            </p>
          </Link>
        ))}
        {tips.map((t) => (
          <Link key={t.id} to="/guide" className="press block rounded-xl bg-card px-3.5 py-3 ring-1 ring-line">
            <p className="text-[11px] font-semibold uppercase text-muted">{t.focus}</p>
            <p className="text-[13px] font-semibold">{t.title}</p>
            <p className="mt-1 text-[13px] leading-snug text-muted">{t.body}</p>
          </Link>
        ))}
        {!orders.length && !tips.length && <p className="py-8 text-center text-[13px] text-muted">Quiet inbox.</p>}
      </div>
    </div>
  );
}

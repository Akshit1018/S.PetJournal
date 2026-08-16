import { useMemo, useState } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Mic } from "lucide-react";
import { KIND_META, useActivePet, useJournal } from "@/lib/store";
import type { EntryKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";

const FILTERS: Array<{ id: "all" | EntryKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "voice", label: "Voice" },
  { id: "note", label: "Notes" },
  { id: "vet", label: "Vet" },
  { id: "vaccine", label: "Vaccines" },
  { id: "medication", label: "Meds" },
  { id: "metric", label: "Metrics" },
];

export function JournalView() {
  const pet = useActivePet();
  const entries = useJournal((s) => s.entries);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  if (!pet) return null;

  const mine = useMemo(() => {
    return entries
      .filter((e) => e.petId === pet.id)
      .filter((e) => (filter === "all" ? true : e.kind === filter))
      .slice()
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [entries, pet.id, filter]);

  let lastDay = "";

  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Journal" />
      <p className="px-5 text-sm text-muted">
        A single timeline — shots, voice memos, stool scores, water tests.
      </p>

      <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3.5 text-sm font-medium",
              filter === f.id ? "bg-ink text-card" : "bg-card text-muted ring-1 ring-line",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ol className="relative mt-5 px-5">
        <span className="absolute bottom-4 left-[29px] top-2 w-px bg-line" aria-hidden />
        {mine.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">Nothing in this filter yet.</p>
        )}
        {mine.map((e) => {
          const day = format(parseISO(e.at), "yyyy-MM-dd");
          const showDay = day !== lastDay;
          lastDay = day;
          const d = parseISO(e.at);
          const label = isToday(d)
            ? "Today"
            : isYesterday(d)
              ? "Yesterday"
              : format(d, "EEEE, MMM d");
          return (
            <li key={e.id}>
              {showDay && (
                <p className="relative z-10 mb-3 mt-5 first:mt-0 text-xs font-semibold uppercase tracking-wide text-muted">
                  {label}
                </p>
              )}
              <article className="relative mb-3 ml-7 rounded-xl bg-card p-3.5 ring-1 ring-line">
                <span
                  className={cn(
                    "absolute top-4 -left-7 grid size-6 place-items-center rounded-full ring-4 ring-canvas",
                    e.kind === "voice"
                      ? "bg-sky text-card"
                      : e.kind === "vaccine" || e.kind === "vet"
                        ? "bg-good text-card"
                        : "bg-blush text-ink",
                  )}
                >
                  {e.kind === "voice" ? (
                    <Mic className="size-3" />
                  ) : (
                    <span className="text-[8px] font-bold uppercase">
                      {KIND_META[e.kind].label.slice(0, 1)}
                    </span>
                  )}
                </span>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      {KIND_META[e.kind].label}
                    </p>
                    <h3 className="text-sm font-semibold">{e.title}</h3>
                  </div>
                  <time className="shrink-0 text-[11px] tabular-nums text-muted">
                    {format(d, "h:mm a")}
                  </time>
                </div>
                {e.transcript ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink">“{e.transcript}”</p>
                ) : e.detail ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted">{e.detail}</p>
                ) : null}
                {e.provider && (
                  <p className="mt-2 text-xs text-muted">{e.provider}</p>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

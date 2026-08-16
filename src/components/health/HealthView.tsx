import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { speciesOf } from "@/lib/species";
import { KIND_META, latestMetric, metricSeries, useActivePet, useJournal } from "@/lib/store";
import { formatDue } from "@/lib/utils";
import { buildSuggestions } from "@/lib/ai-local";
import { TopBar } from "@/components/layout/TopBar";

export function HealthView() {
  const pet = useActivePet();
  const metrics = useJournal((s) => s.metrics);
  const entries = useJournal((s) => s.entries);
  const prefs = useJournal((s) => s.prefs);
  const requestAdd = useJournal((s) => s.requestAdd);
  if (!pet) return null;

  const spec = speciesOf(pet.species);
  const chartMetrics = spec.metrics.filter((m) => m.chart).slice(0, 2);
  const suggestions = buildSuggestions(pet, metrics, entries, prefs);
  const upcoming = entries
    .filter((e) => e.petId === pet.id && (e.kind === "vet" || e.kind === "medication" || e.kind === "vaccine" || e.kind === "grooming") && e.dueAt)
    .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));

  return (
    <div className="flex flex-col pb-6 reveal">
      <TopBar
        title="Health"
        action={
          <button type="button" onClick={() => requestAdd("metric")} className="press h-9 rounded-full bg-sun px-3 text-[12px] font-semibold text-sun-ink">
            Log
          </button>
        }
      />

      <div className="px-4">
        <div className="flex flex-wrap gap-2">
          {pet.statusTags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-chip px-3 py-1 text-[11px] font-medium text-chip-ink"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {chartMetrics.map((m, idx) => {
            const last = latestMetric(metrics, pet.id, m.key);
            const series = metricSeries(metrics, pet.id, m.key).map((s) => ({
              t: format(s.at, "M/d"),
              v: s.value,
            }));
            const color = idx === 0 ? "#3d94d4" : "#d4892a";
            return (
              <div key={m.key} className="rounded-xl bg-card p-3.5 ring-1 ring-line">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold">{m.label}</p>
                  <span className="text-[11px] text-muted">Today</span>
                </div>
                <p className="mt-1 font-display text-[1.7rem] font-medium leading-none tabular-nums">
                  {last ? last.value : "—"}
                  <span className="ml-1 text-sm font-sans text-muted">{m.unit}</span>
                </p>
                <div className="mt-2 h-16">
                  {series.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`g-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" hide />
                        <Tooltip
                          contentStyle={{
                            fontSize: 12,
                            borderRadius: 10,
                            border: "1px solid #eadfd4",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke={color}
                          fill={`url(#g-${m.key})`}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="pt-4 text-xs text-muted">Log twice to see a trend.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <article className="mt-4 rounded-xl bg-card p-4 ring-1 ring-line">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-deep">
            Why these metrics — {spec.label}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{spec.problem}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{spec.solution}</p>
          <ul className="mt-3 space-y-2">
            {spec.metrics.slice(0, 4).map((m) => (
              <li key={m.key} className="text-sm leading-relaxed">
                <span className="font-medium">{m.label}.</span>{" "}
                <span className="text-muted">{m.why}</span>
              </li>
            ))}
          </ul>
        </article>

        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            {suggestions.map((s) => (
              <Link
                key={s.id}
                to="/guide"
                className="block rounded-xl bg-card px-4 py-3 ring-1 ring-line"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {s.severity === "urgent" ? "Act now" : s.severity === "watch" ? "Watch" : "Guide"}
                  <span className="mx-1">·</span>
                  {s.focus}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
              </Link>
            ))}
          </div>
        )}

        <h2 className="mt-6 text-sm font-semibold">Upcoming care</h2>
        <div className="mt-2 overflow-hidden rounded-xl bg-card ring-1 ring-line">
          {upcoming.length === 0 && (
            <p className="px-4 py-5 text-sm text-muted">No dated care yet.</p>
          )}
          {upcoming.map((e, i) => (
            <div
              key={e.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${i ? "border-t border-line" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted">
                  {e.provider ?? KIND_META[e.kind].label}
                </p>
              </div>
              <span className="text-xs font-medium text-sky-deep">
                {e.dueAt ? formatDue(e.dueAt) : ""}
              </span>
            </div>
          ))}
        </div>

        {spec.redFlags.length > 0 && (
          <article className="mt-4 rounded-xl bg-blush/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/70">
              Same-day red flags
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed">
              {spec.redFlags.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </div>
  );
}

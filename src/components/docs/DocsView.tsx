import { format, parseISO } from "date-fns";
import { speciesOf } from "@/lib/species";
import { useActivePet, useJournal } from "@/lib/store";
import { ageLabel } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";

export function DocsView() {
  const pet = useActivePet();
  const docs = useJournal((s) => s.documents);
  const entries = useJournal((s) => s.entries);
  const requestAdd = useJournal((s) => s.requestAdd);
  const addEntry = useJournal((s) => s.addEntry);
  if (!pet) return null;
  const spec = speciesOf(pet.species);
  const mine = docs.filter((d) => d.petId === pet.id);
  const vaccines = entries
    .filter((e) => e.petId === pet.id && e.kind === "vaccine")
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Documents" />

      <div className="px-4">
        <article className="overflow-hidden rounded-[1.4rem] bg-card shadow-[var(--shadow-card)] ring-1 ring-line">
          <div className="bg-sky px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-card">
            Pet passport
          </div>
          <div className="grid grid-cols-[7.5rem_1fr] gap-3 p-4">
            <img
              src={pet.photo}
              alt=""
              className="h-28 w-full rounded-lg object-cover"
            />
            <dl className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs">
              <Row k="Born" v={format(parseISO(pet.birthDate), "dd.MM.yyyy")} />
              <Row k="Age" v={ageLabel(pet.birthDate)} />
              <Row k="Sex" v={pet.sex} />
              <Row k="Species" v={spec.label} />
              <Row k="ID" v={pet.passportId ?? "—"} />
              <Row k="Chip" v={pet.microchip ? pet.microchip.slice(-8) : "—"} />
            </dl>
          </div>
          <div className="flex items-end justify-between border-t border-line px-4 py-3">
            <div>
              <p className="font-display text-2xl font-medium leading-none">{pet.name}</p>
              <p className="mt-1 text-sm text-muted">{pet.breed}</p>
            </div>
            <p className="max-w-[45%] text-right text-[10px] uppercase leading-relaxed tracking-wide text-muted">
              Updated {format(parseISO(mine[0]?.updatedAt ?? pet.birthDate), "dd.MM.yyyy")}
            </p>
          </div>
        </article>

        <p className="mt-6 text-sm font-semibold">On file</p>
        <ul className="mt-2 space-y-2">
          {mine.map((d) => (
            <li
              key={d.id}
              className="rounded-xl bg-card px-4 py-3 ring-1 ring-line"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                    {d.kind}
                  </p>
                  <p className="text-sm font-semibold">{d.title}</p>
                </div>
                <time className="text-[11px] text-muted">
                  {format(parseISO(d.issuedAt), "MMM d, yyyy")}
                </time>
              </div>
              {d.note && <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.note}</p>}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm font-semibold">Vaccine record</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          The thing that goes missing in a move or a boarding drop-off. Core vs optional differs by species.
        </p>
        <ul className="mt-3 overflow-hidden rounded-xl bg-card ring-1 ring-line">
          {spec.vaccines.length === 0 && (
            <li className="px-4 py-4 text-sm text-muted">
              {spec.label}s typically have no core vaccine schedule — environment and diet are the record.
            </li>
          )}
          {spec.vaccines.map((v) => {
            const logged = vaccines.find((e) =>
              e.title.toLowerCase().includes(v.name.toLowerCase().split(" ")[0] ?? ""),
            );
            return (
              <li
                key={v.name}
                className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{v.name}</p>
                  <p className="text-xs text-muted">
                    {v.required ? "Core" : "Lifestyle"} · {v.cadence}
                  </p>
                </div>
                {logged ? (
                  <span className="rounded-full bg-chip px-2 py-0.5 text-[11px] font-medium text-chip-ink">On file</span>
                ) : (
                  <button
                    type="button"
                    className="press rounded-full bg-blush px-2 py-0.5 text-[11px] font-medium"
                    onClick={() => {
                      addEntry({ petId: pet.id, kind: "vaccine", title: v.name, completed: true, detail: "Logged from passport" });
                    }}
                  >
                    Add
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-muted">{k}</dt>
      <dd className="font-medium capitalize">{v}</dd>
    </div>
  );
}

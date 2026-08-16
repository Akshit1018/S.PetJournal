import { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import {
  Activity,
  Mic,
  Pill,
  Scissors,
  Stethoscope,
  StickyNote,
  Syringe,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import type { EntryKind } from "@/lib/types";
import { useActivePet, useJournal } from "@/lib/store";
import { speciesOf } from "@/lib/species";

const KINDS: Array<{
  kind: EntryKind;
  label: string;
  hint: string;
  icon: typeof StickyNote;
}> = [
  { kind: "note", label: "Daily note", hint: "What you noticed", icon: StickyNote },
  { kind: "voice", label: "Voice note", hint: "Talk, we transcribe", icon: Mic },
  { kind: "metric", label: "Log metric", hint: "Species-specific", icon: Activity },
  { kind: "vet", label: "Vet visit", hint: "Exam or follow-up", icon: Stethoscope },
  { kind: "vaccine", label: "Vaccine", hint: "Keep the passport honest", icon: Syringe },
  { kind: "medication", label: "Medication", hint: "Dose + next due", icon: Pill },
  { kind: "grooming", label: "Grooming", hint: "Bath, nails, shed", icon: Scissors },
  { kind: "meal", label: "Meal", hint: "What they ate", icon: Utensils },
  { kind: "walk", label: "Walk / sit", hint: "Log a session", icon: Activity },
  { kind: "expense", label: "Expense", hint: "What it cost", icon: Pill },
];

export function AddSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const pet = useActivePet();
  const addEntry = useJournal((s) => s.addEntry);
  const logMetric = useJournal((s) => s.logMetric);
  const addKind = useJournal((s) => s.addKind);
  const [kind, setKind] = useState<EntryKind | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [due, setDue] = useState("");
  const [provider, setProvider] = useState("");
  const [metricKey, setMetricKey] = useState("");
  const [metricVal, setMetricVal] = useState("");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (open && addKind) setKind(addKind);
  }, [open, addKind]);

  const spec = pet ? speciesOf(pet.species) : null;
  const metrics = spec?.metrics ?? [];

  const reset = () => {
    setKind(null);
    setTitle("");
    setDetail("");
    setDue("");
    setProvider("");
    setMetricKey("");
    setMetricVal("");
    setTranscript("");
    setDuration(0);
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const canSave = useMemo(() => {
    if (!kind || !pet) return false;
    if (kind === "voice") return transcript.trim().length > 0 || title.trim().length > 0;
    if (kind === "metric") return Boolean(metricKey) && metricVal !== "";
    return title.trim().length > 0 || detail.trim().length > 0;
  }, [kind, pet, transcript, title, detail, metricKey, metricVal]);

  const save = () => {
    if (!pet || !kind) return;
    if (kind === "metric") {
      const def = metrics.find((m) => m.key === metricKey);
      const n = Number(metricVal);
      if (!def || Number.isNaN(n)) return;
      logMetric(pet.id, def.key, n, def.unit);
      toast.success(`Logged ${def.label} for ${pet.name}`);
      close();
      return;
    }
    addEntry({
      petId: pet.id,
      kind,
      title:
        title.trim() ||
        (kind === "voice" ? "Voice note" : KINDS.find((k) => k.kind === kind)?.label ?? "Entry"),
      detail: detail.trim() || undefined,
      dueAt: due ? new Date(due).toISOString() : undefined,
      provider: provider.trim() || undefined,
      transcript: transcript.trim() || undefined,
      durationSec: duration || undefined,
      completed: kind === "vet" || kind === "vaccine" || kind === "grooming" ? true : undefined,
    });
    toast.success("Saved to the timeline");
    close();
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setTimeout(reset, 200);
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] max-w-[430px] flex-col rounded-t-2xl bg-canvas outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-line" />
          <div className="flex items-center justify-between px-5 pb-2 pt-3">
            <Drawer.Title className="font-display text-xl font-medium tracking-tight">
              {kind ? KINDS.find((k) => k.kind === kind)?.label : "Add to journal"}
            </Drawer.Title>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="grid size-10 place-items-center rounded-full text-muted hover:bg-blush/40"
            >
              <X className="size-5" />
            </button>
          </div>
          <p className="px-5 pb-3 text-sm text-muted">
            {pet ? `For ${pet.name} · ${spec?.label}` : "Pick a pet first"}
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
            {!kind ? (
              <div className="grid grid-cols-2 gap-2.5">
                {KINDS.map((k) => {
                  const Icon = k.icon;
                  return (
                    <button
                      key={k.kind}
                      type="button"
                      onClick={() => {
                        setKind(k.kind);
                        if (k.kind === "metric" && metrics[0]) setMetricKey(metrics[0].key);
                      }}
                      className="flex min-h-[5.5rem] flex-col items-start gap-2 rounded-xl bg-card p-3.5 text-left shadow-[var(--shadow-card)] ring-1 ring-line"
                    >
                      <Icon className="size-5 text-sky-deep" strokeWidth={1.8} />
                      <span className="text-sm font-medium">{k.label}</span>
                      <span className="text-xs text-muted">{k.hint}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  save();
                }}
              >
                {kind === "voice" && (
                  <VoiceRecorder
                    onTranscript={(t, sec) => {
                      setTranscript(t);
                      setDuration(sec);
                      if (!title) setTitle("Voice note");
                    }}
                  />
                )}

                {kind === "metric" && spec ? (
                  <>
                    <label className="text-xs font-medium text-muted">
                      Metric
                      <select
                        value={metricKey}
                        onChange={(e) => setMetricKey(e.target.value)}
                        className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm text-ink"
                      >
                        {metrics.map((m) => (
                          <option key={m.key} value={m.key}>
                            {m.label} ({m.unit || "score"})
                          </option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="Value"
                      value={metricVal}
                      onChange={setMetricVal}
                      type="number"
                      placeholder={metrics.find((m) => m.key === metricKey)?.hint}
                    />
                    <p className="text-xs leading-relaxed text-muted">
                      {metrics.find((m) => m.key === metricKey)?.why}
                    </p>
                  </>
                ) : (
                  <>
                    <Field
                      label="Title"
                      value={title}
                      onChange={setTitle}
                      placeholder={kind === "voice" ? "Optional title" : "What happened"}
                    />
                    {kind !== "voice" && (
                      <label className="text-xs font-medium text-muted">
                        Details
                        <textarea
                          value={detail}
                          onChange={(e) => setDetail(e.target.value)}
                          rows={4}
                          className="mt-1 w-full resize-none rounded-md border border-line bg-card px-3 py-2 text-sm text-ink"
                          placeholder="Symptoms, dose, what the vet said…"
                        />
                      </label>
                    )}
                    {kind === "voice" && transcript && (
                      <p className="rounded-md bg-sky-soft/70 px-3 py-2 text-sm leading-relaxed">
                        {transcript}
                      </p>
                    )}
                    {(kind === "vet" || kind === "vaccine" || kind === "medication") && (
                      <Field
                        label="Clinic or provider"
                        value={provider}
                        onChange={setProvider}
                        placeholder="Dr. name or clinic"
                      />
                    )}
                    {(kind === "vet" || kind === "medication" || kind === "grooming" || kind === "vaccine") && (
                      <Field
                        label="Next due"
                        value={due}
                        onChange={setDue}
                        type="datetime-local"
                      />
                    )}
                  </>
                )}

                <div className="mt-2 flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setKind(null)}>
                    Back
                  </Button>
                  <Button type="submit" variant="sun" className="flex-1" disabled={!canSave}>
                    Save
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="text-xs font-medium text-muted">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm text-ink"
      />
    </label>
  );
}

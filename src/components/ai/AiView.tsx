import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { askPetGuide } from "@/lib/ask-grok";
import { buildSuggestions, systemPrompt } from "@/lib/ai-local";
import type { FocusArea, GuideTone } from "@/lib/types";
import { latestMetric, useActivePet, useJournal } from "@/lib/store";
import { speciesOf } from "@/lib/species";
import { cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";

const TONES: { id: GuideTone; label: string }[] = [
  { id: "warm", label: "Warm" },
  { id: "clinical", label: "Clinical" },
  { id: "brief", label: "Brief" },
];

const FOCUSES: { id: FocusArea; label: string; why: string }[] = [
  { id: "preventive", label: "Preventive", why: "Vaccines, weight, yearly gaps" },
  { id: "nutrition", label: "Nutrition", why: "Hay, pellets, water, kibble" },
  { id: "behavior", label: "Behavior", why: "Walks, play, vocalizing" },
  { id: "environment", label: "Environment", why: "UVB, tank chemistry, humidity" },
  { id: "emergency", label: "Emergency", why: "When to stop googling and go" },
];

export function AiView() {
  const pet = useActivePet();
  const prefs = useJournal((s) => s.prefs);
  const setPrefs = useJournal((s) => s.setPrefs);
  const toggleFocus = useJournal((s) => s.toggleFocus);
  const metrics = useJournal((s) => s.metrics);
  const entries = useJournal((s) => s.entries);
  const chat = useJournal((s) => s.chat);
  const addChat = useJournal((s) => s.addChat);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  const suggestions = pet ? buildSuggestions(pet, metrics, entries, prefs) : [];
  const thread = useMemo(
    () => (pet ? chat.filter((c) => !c.petId || c.petId === pet.id) : []),
    [chat, pet],
  );

  if (!pet) return null;
  const spec = speciesOf(pet.species);

  const extras = () => {
    const bits = spec.metrics
      .map((m) => {
        const last = latestMetric(metrics, pet.id, m.key);
        return last ? `${m.label}: ${last.value}${m.unit}` : null;
      })
      .filter(Boolean);
    const recent = entries
      .filter((e) => e.petId === pet.id)
      .slice(0, 6)
      .map((e) => `${e.kind}: ${e.title}${e.transcript ? ` — ${e.transcript}` : e.detail ? ` — ${e.detail}` : ""}`);
    return `Latest metrics: ${bits.join("; ") || "none"}\nRecent journal:\n${recent.join("\n")}`;
  };

  const ask = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || busy) return;
    setQ("");
    addChat({ role: "user", content: prompt, petId: pet.id });
    setBusy(true);
    try {
      const history = [...thread, { role: "user" as const, content: prompt }].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await askPetGuide({
        data: {
          system: systemPrompt(pet, prefs, extras()),
          messages: history,
        },
      });
      if (!res.ok) {
        addChat({
          role: "assistant",
          petId: pet.id,
          content:
            suggestions[0]?.body ??
            `${spec.solution} I can't reach the live guide right now — use the species cards on Health while we're offline.`,
        });
        toast.message("Offline guide used");
      } else {
        addChat({ role: "assistant", petId: pet.id, content: res.text });
      }
    } catch {
      toast.error("Could not reach the guide");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Guide" />
      <p className="px-5 text-sm leading-relaxed text-muted">
        Advice is species-strict when you want it: a beardie’s UVB is not a betta’s nitrate.
      </p>

      <div className="mt-4 px-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Tone</p>
        <div className="mt-2 flex gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPrefs({ tone: t.id })}
              className={cn(
                "h-9 rounded-full px-3.5 text-sm font-medium",
                prefs.tone === t.id ? "bg-ink text-card" : "bg-card ring-1 ring-line",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
          What to watch
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FOCUSES.map((f) => {
            const on = prefs.focuses.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleFocus(f.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm",
                  on ? "bg-sky-soft text-ink" : "bg-card text-muted ring-1 ring-line",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <label className="mt-4 flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-line">
          <span>
            <span className="block text-sm font-medium">Species-strict</span>
            <span className="text-xs text-muted">Don’t apply dog logic to fish</span>
          </span>
          <input
            type="checkbox"
            checked={prefs.speciesStrict}
            onChange={(e) => setPrefs({ speciesStrict: e.target.checked })}
            className="size-5 accent-sky-deep"
          />
        </label>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-5 px-4">
          <h2 className="text-sm font-semibold">For {pet.name} today</h2>
          <div className="mt-2 space-y-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => void ask(`About this: ${s.title}. ${s.body} What should I do this week?`)}
                className="w-full rounded-xl bg-card px-4 py-3 text-left ring-1 ring-line"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-deep">
                  {s.focus}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5 px-4">
        <h2 className="text-sm font-semibold">Ask about {pet.name}</h2>
        <div className="mt-2 space-y-2">
          {thread.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[92%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-ink text-card"
                  : "bg-card ring-1 ring-line",
              )}
            >
              {m.content}
            </div>
          ))}
          {busy && <p className="text-xs text-muted">Reading the journal…</p>}
        </div>

        {showVoice && (
          <div className="mt-3">
            <VoiceRecorder
              onTranscript={(t) => {
                setQ(t);
              }}
            />
          </div>
        )}

        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(q);
          }}
        >
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            rows={3}
            placeholder={`e.g. ${pet.name} skipped breakfast — worry or wait?`}
            className="w-full resize-none rounded-xl border border-line bg-card px-3 py-2.5 text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowVoice((v) => !v)}
            >
              Voice
            </Button>
            <Button type="submit" variant="sun" className="flex-1" disabled={busy || !q.trim()}>
              Ask guide
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

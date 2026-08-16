import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type Recog = {
  start: () => void;
  stop: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
};

function getRecog(): Recog | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recog;
    webkitSpeechRecognition?: new () => Recog;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function VoiceRecorder({
  onTranscript,
}: {
  onTranscript: (text: string, seconds: number) => void;
}) {
  const [live, setLive] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const started = useRef<number>(0);
  const recogRef = useRef<Recog | null>(null);
  const acc = useRef("");

  useEffect(() => {
    return () => {
      try {
        recogRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const start = () => {
    setErr(null);
    const recog = getRecog();
    if (!recog) {
      setErr("Voice typing isn’t available in this browser. Type the note instead.");
      return;
    }
    acc.current = "";
    setText("");
    recog.lang = "en-US";
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = (ev) => {
      let next = "";
      for (let i = 0; i < ev.results.length; i++) {
        next += ev.results[i]?.[0]?.transcript ?? "";
      }
      acc.current = next.trim();
      setText(acc.current);
    };
    recog.onerror = () => {
      setErr("Mic was blocked or failed. You can still type.");
      setLive(false);
    };
    recogRef.current = recog;
    started.current = Date.now();
    try {
      recog.start();
      setLive(true);
    } catch {
      setErr("Could not start the microphone.");
    }
  };

  const stop = () => {
    try {
      recogRef.current?.stop();
    } catch {
      /* ignore */
    }
    setLive(false);
    const sec = Math.max(1, Math.round((Date.now() - started.current) / 1000));
    if (acc.current) onTranscript(acc.current, sec);
  };

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-line">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Hold a thought out loud</p>
          <p className="text-xs text-muted">
            Species-aware guide can read this later. Nothing leaves the device until you ask.
          </p>
        </div>
        <button
          type="button"
          onClick={live ? stop : start}
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-full transition-transform duration-150 active:scale-95",
            live ? "bg-bad text-card" : "bg-sky text-card",
          )}
          aria-label={live ? "Stop recording" : "Start recording"}
        >
          {live ? <Square className="size-5 fill-current" /> : <Mic className="size-6" />}
        </button>
      </div>
      {live && (
        <p className="mt-3 text-xs font-medium tracking-wide text-sky-deep">Listening…</p>
      )}
      {text && (
        <p className="mt-3 text-sm leading-relaxed text-ink">{text}</p>
      )}
      {err && (
        <div className="mt-3">
          <p className="text-xs text-bad">{err}</p>
          <textarea
            className="mt-2 w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm"
            rows={3}
            placeholder="Type what you would have said"
            onChange={(e) => {
              setText(e.target.value);
              onTranscript(e.target.value, Math.max(1, Math.round(e.target.value.length / 12)));
            }}
          />
        </div>
      )}
    </div>
  );
}

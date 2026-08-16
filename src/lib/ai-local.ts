import type { AiPrefs, JournalEntry, MetricSample, Pet, Suggestion } from "./types";
import { speciesOf } from "./species";
import { latestMetric, metricSeries } from "./store";
import { differenceInDays, parseISO } from "date-fns";

export function buildSuggestions(
  pet: Pet,
  metrics: MetricSample[],
  entries: JournalEntry[],
  prefs: AiPrefs,
): Suggestion[] {
  const spec = speciesOf(pet.species);
  const mine = entries.filter((e) => e.petId === pet.id);
  const out: Suggestion[] = [];
  const allow = (focus: Suggestion["focus"]) =>
    prefs.focuses.length === 0 || prefs.focuses.includes(focus);

  const weight = metricSeries(metrics, pet.id, "weight");
  if (weight.length >= 2 && allow("preventive")) {
    const first = weight[0]!;
    const last = weight[weight.length - 1]!;
    const delta = ((last.value - first.value) / first.value) * 100;
    if (Math.abs(delta) >= 5) {
      out.push({
        id: `${pet.id}-wt`,
        petId: pet.id,
        focus: "preventive",
        severity: Math.abs(delta) >= 10 ? "urgent" : "watch",
        title: `${pet.name}'s weight ${delta > 0 ? "up" : "down"} ${Math.abs(delta).toFixed(1)}%`,
        body:
          pet.species === "bird"
            ? "In birds a 10% swing can be an emergency. Weigh again tomorrow at the same hour."
            : pet.species === "cat"
              ? "Unexplained cat weight change often precedes kidney, thyroid, or diabetes findings. Book the overdue exam."
              : "Same-scale weekly weights catch this earlier than a yearly visit. Mention the trend at the next appointment.",
      });
    }
  }

  const lastVet = mine
    .filter((e) => e.kind === "vet")
    .sort((a, b) => b.at.localeCompare(a.at))[0];
  if (spec.careIntervalDays.vet > 0 && allow("preventive")) {
    const days = lastVet
      ? differenceInDays(new Date(), parseISO(lastVet.at))
      : 999;
    if (days > spec.careIntervalDays.vet) {
      out.push({
        id: `${pet.id}-vet`,
        petId: pet.id,
        focus: "preventive",
        severity: pet.species === "cat" ? "watch" : "info",
        title: `${spec.label} wellness gap`,
        body:
          pet.species === "cat"
            ? "Most cats skip the annual exam. They hide pain — a quiet year is not a clean bill of health."
            : `It's been ${Math.round(days / 30)} months since a recorded exam. ${spec.label}s do better on a ${Math.round(spec.careIntervalDays.vet / 30)}-month cadence.`,
      });
    }
  }

  if (pet.species === "fish" && allow("environment")) {
    const nitrate = latestMetric(metrics, pet.id, "nitrate");
    const ammonia = latestMetric(metrics, pet.id, "ammonia");
    if (ammonia && ammonia.value > 0) {
      out.push({
        id: `${pet.id}-amm`,
        petId: pet.id,
        focus: "environment",
        severity: "urgent",
        title: "Ammonia is not zero",
        body: "The tank is the patient. Any ammonia burns gills — change water and stop feeding extra.",
      });
    } else if (nitrate && nitrate.value >= 40) {
      out.push({
        id: `${pet.id}-no3`,
        petId: pet.id,
        focus: "environment",
        severity: "watch",
        title: "Nitrate climbing",
        body: `${nitrate.value} ppm. A 30–40% water change is the cheapest medicine. Don't add fish.`,
      });
    }
  }

  if (pet.species === "reptile" && allow("environment")) {
    const hot = latestMetric(metrics, pet.id, "hot_spot");
    if (hot && hot.value < 100) {
      out.push({
        id: `${pet.id}-bask`,
        petId: pet.id,
        focus: "environment",
        severity: "watch",
        title: "Basking surface is cool",
        body: `${hot.value}°F. Beardies need a true surface basking spot to digest. Check the halogen before the next feed.`,
      });
    }
  }

  if (pet.species === "rabbit" && allow("emergency")) {
    const fecals = latestMetric(metrics, pet.id, "fecals");
    if (fecals && fecals.value < 12) {
      out.push({
        id: `${pet.id}-gi`,
        petId: pet.id,
        focus: "emergency",
        severity: fecals.value < 8 ? "urgent" : "watch",
        title: "Pellet count is low",
        body: "Rabbits can crash from GI stasis in hours. If she goes four hours with no poops and a hunched posture, call an exotic vet today.",
      });
    }
  }

  if (pet.species === "bird" && allow("preventive")) {
    const w = latestMetric(metrics, pet.id, "weight");
    if (w) {
      out.push({
        id: `${pet.id}-g`,
        petId: pet.id,
        focus: "preventive",
        severity: "info",
        title: "Keep the gram ritual",
        body: `${pet.name} is ${w.value}g. Daily same-hour weights are the only vital sign that reliably precedes a crash.`,
      });
    }
  }

  const dueMeds = mine.filter(
    (e) =>
      e.kind === "medication" &&
      e.dueAt &&
      differenceInDays(parseISO(e.dueAt), new Date()) <= 14,
  );
  if (dueMeds.length && allow("preventive")) {
    const next = dueMeds.sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""))[0]!;
    out.push({
      id: `${pet.id}-med`,
      petId: pet.id,
      focus: "preventive",
      severity: "info",
      title: next.title,
      body: `On the calendar ${next.dueAt?.slice(0, 10)}. Prevention only works if the monthly chew actually happens.`,
    });
  }

  if (allow("nutrition") && pet.species === "dog") {
    out.push({
      id: `${pet.id}-kibble`,
      petId: pet.id,
      focus: "nutrition",
      severity: "info",
      title: "Transition is day-sensitive",
      body: "If stool drops below a 3 during the kibble switch, slow the mix and add a bland meal rather than pushing to 100%.",
    });
  }

  return out.slice(0, 4);
}

export function toneInstruction(prefs: AiPrefs) {
  if (prefs.tone === "clinical")
    return "Write like a concise veterinary technician. No slang. Lead with the action.";
  if (prefs.tone === "brief")
    return "Four sentences max. Imperative verbs. No preamble.";
  return "Warm, plain language. Like a trusted neighbor who happens to know exotic pets. No exclamation spam.";
}

export function systemPrompt(pet: Pet, prefs: AiPrefs, extras: string) {
  const spec = speciesOf(pet.species);
  const focus = prefs.focuses.join(", ") || "general care";
  return [
    `You are PetJournal's on-device care guide for a household with many species.`,
    `Never invent a diagnosis. Flag emergencies. Prefer home observations a vet can use.`,
    `Species-strict: ${prefs.speciesStrict ? "yes — do not apply dog advice to other species" : "flexible"}.`,
    `Tone: ${toneInstruction(prefs)}`,
    `Focus areas the owner enabled: ${focus}.`,
    `This pet: ${pet.name}, ${pet.sex} ${spec.label}, ${pet.breed}, born ${pet.birthDate}.`,
    `Species problem this product exists to solve: ${spec.problem}`,
    `Species solution: ${spec.solution}`,
    `Red flags: ${spec.redFlags.join("; ")}`,
    extras,
    `If asked for medical certainty, say what to record and when to call a vet.`,
  ].join("\n");
}

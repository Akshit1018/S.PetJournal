import type { SpeciesId } from "./types";

export const SITTERS = [
  { id: "s1", name: "Maya Chen", role: "Walker", rate: 28, rating: 4.9, walks: 420, bio: "River-path specialist. Soft recalls." },
  { id: "s2", name: "Owen Park", role: "Sitter", rate: 65, rating: 4.8, walks: 180, bio: "Overnight in your home. Meds-capable." },
  { id: "s3", name: "Rae Okonkwo", role: "Drop-in", rate: 22, rating: 5, walks: 90, bio: "Litter, hay, and tank checks." },
  { id: "s4", name: "Luis Ortega", role: "Boarding", rate: 55, rating: 4.7, walks: 260, bio: "Fenced yard. Exotic-curious." },
];

export const LESSONS: Array<{ id: string; species: SpeciesId | "all"; title: string; mins: number; body: string }> = [
  { id: "l1", species: "dog", title: "Warm-out limp protocol", mins: 4, body: "Two minutes of sniffing, then a short recall, then walk. Log if the limp returns after rest." },
  { id: "l2", species: "cat", title: "Hunt before bowl", mins: 3, body: "Wand play, then meal. Cuts 3 a.m. zoomies and grazing boredom." },
  { id: "l3", species: "bird", title: "Same-hour weigh-in", mins: 2, body: "Perch on the scale before breakfast. A 10% drop is a same-day exotic visit." },
  { id: "l4", species: "rabbit", title: "Four-hour pellet rule", mins: 3, body: "No poops + hunched = call. Keep critical care and a carrier ready." },
  { id: "l5", species: "reptile", title: "Surface, not air", mins: 3, body: "Temp gun the basking rock. Air probes lie. Digest only happens at the right surface." },
  { id: "l6", species: "fish", title: "Change, don’t dose", mins: 2, body: "Ammonia above 0? Water change. Medicine on a dirty tank is theater." },
  { id: "l7", species: "all", title: "Vet-ready voice note", mins: 2, body: "30 seconds: what changed, when, appetite, stool, energy. Play it in the exam room." },
];

export const AID: Array<{ species: SpeciesId | "all"; title: string; steps: string[] }> = [
  { species: "dog", title: "Bloat / hard belly", steps: ["No food or water", "Do not walk it off", "ER now — minutes matter"] },
  { species: "cat", title: "Blocked bladder", steps: ["Male, straining, no urine", "This is not constipation", "ER same hour"] },
  { species: "bird", title: "Bleeding", steps: ["Cornstarch or flour on the nail", "Dark, warm, quiet", "Exotic ER if it will not stop"] },
  { species: "rabbit", title: "GI stasis", steps: ["Syringe water / critical care", "Keep warm", "Exotic vet within hours"] },
  { species: "fish", title: "Gasping", steps: ["Test ammonia", "40% change with conditioner", "Increase surface agitation"] },
  { species: "reptile", title: "Stuck shed on toes", steps: ["Warm humid hide, not a soak battle", "Never peel", "Vet if toes darken"] },
  { species: "all", title: "Toxin / chocolate / lily", steps: ["What, how much, when", "Do not induce unless a vet says", "ASPCA APCC 888-426-4435"] },
];

export const PLACES = [
  { id: "p1", name: "Salt River Path", kind: "Walk", note: "On-leash. Geese in season." },
  { id: "p2", name: "Willow Exotic", kind: "Vet", note: "Rabbits, birds, reptiles." },
  { id: "p3", name: "Hearth Cafe", kind: "Patio", note: "Water bowls. No birds inside." },
  { id: "p4", name: "North Kennels", kind: "Board", note: "Accepts Luna’s passport pack." },
];

export const PLANS = [
  { id: "ins1", name: "Accident", month: 18, cover: "ER + fractures", best: false },
  { id: "ins2", name: "Wellness+", month: 42, cover: "Accident + illness + dental", best: true },
  { id: "ins3", name: "Whole life", month: 68, cover: "Above + Rx food + extras", best: false },
];

export const TRAVEL_LIST = [
  "Passport + rabies cert (photos too)",
  "Microchip number on the collar",
  "7 days of food in original bag",
  "Meds in original bottles",
  "Carrier that zips from the top",
  "Sitter one-pager printed",
];

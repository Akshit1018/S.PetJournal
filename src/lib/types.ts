export type SpeciesId =
  | "dog"
  | "cat"
  | "bird"
  | "rabbit"
  | "reptile"
  | "fish"
  | "horse"
  | "small_mammal"
  | "ferret"
  | "amphibian"
  | "other";

export type Sex = "female" | "male" | "unknown";

export type EntryKind =
  | "note"
  | "voice"
  | "vet"
  | "vaccine"
  | "medication"
  | "grooming"
  | "metric"
  | "meal"
  | "document"
  | "walk"
  | "expense";

export type FocusArea =
  | "preventive"
  | "nutrition"
  | "behavior"
  | "emergency"
  | "environment";

export type GuideTone = "warm" | "clinical" | "brief";

export interface MetricDef {
  key: string;
  label: string;
  unit: string;
  kind: "number" | "score";
  hint: string;
  why: string;
  min?: number;
  max?: number;
  target?: string;
  chart?: boolean;
}

export interface VaccineDef {
  name: string;
  cadence: string;
  required: boolean;
}

export interface SpeciesProfile {
  id: SpeciesId;
  label: string;
  plural: string;
  blurb: string;
  problem: string;
  solution: string;
  metrics: MetricDef[];
  vaccines: VaccineDef[];
  careIntervalDays: {
    vet: number;
    groom?: number;
    medsCheck?: number;
  };
  redFlags: string[];
  defaultWeightUnit: "lb" | "kg" | "g";
}

export interface Pet {
  id: string;
  name: string;
  species: SpeciesId;
  breed: string;
  sex: Sex;
  birthDate: string;
  photo: string;
  color?: string;
  microchip?: string;
  passportId?: string;
  notes?: string;
  statusTags: string[];
}

export interface MetricSample {
  id: string;
  petId: string;
  key: string;
  value: number;
  unit: string;
  at: string;
}

export interface JournalEntry {
  id: string;
  petId: string;
  kind: EntryKind;
  title: string;
  detail?: string;
  at: string;
  dueAt?: string;
  completed?: boolean;
  provider?: string;
  transcript?: string;
  durationSec?: number;
  tags?: string[];
  metricKey?: string;
  metricValue?: number;
}

export interface DocumentItem {
  id: string;
  petId: string;
  title: string;
  kind: "passport" | "lab" | "vaccine" | "rx" | "insurance" | "other";
  issuedAt: string;
  updatedAt: string;
  note?: string;
}

export interface AiPrefs {
  tone: GuideTone;
  focuses: FocusArea[];
  voiceReplies: boolean;
  speciesStrict: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  petId?: string;
  at: string;
}

export interface Suggestion {
  id: string;
  petId: string;
  title: string;
  body: string;
  severity: "info" | "watch" | "urgent";
  focus: FocusArea;
}

export interface CartLine {
  productId: string;
  qty: number;
  autoship: boolean;
}

export interface Order {
  id: string;
  at: string;
  total: number;
  lines: CartLine[];
  status: "packed" | "shipped" | "delivered";
}

export interface Expense {
  id: string;
  petId: string;
  amount: number;
  cat: "food" | "vet" | "groom" | "shop" | "care" | "other";
  note: string;
  at: string;
}

export interface Booking {
  id: string;
  petId: string;
  sitterId: string;
  kind: string;
  when: string;
  status: "booked" | "done" | "cancel";
}

export interface Memory {
  id: string;
  petId: string;
  src: string;
  caption: string;
  at: string;
}

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AiPrefs,
  Booking,
  CartLine,
  ChatMessage,
  DocumentItem,
  EntryKind,
  Expense,
  JournalEntry,
  Memory,
  MetricSample,
  Order,
  Pet,
  SpeciesId,
} from "./types";
import {
  SEED_CHAT,
  SEED_DOCS,
  SEED_ENTRIES,
  SEED_METRICS,
  SEED_PETS,
  SEED_PREFS,
} from "./seed";
import { uid } from "./utils";
import { productById } from "./catalog";

interface JournalState {
  hydrated: boolean;
  pets: Pet[];
  activePetId: string;
  metrics: MetricSample[];
  entries: JournalEntry[];
  documents: DocumentItem[];
  prefs: AiPrefs;
  chat: ChatMessage[];
  cart: CartLine[];
  orders: Order[];
  expenses: Expense[];
  bookings: Booking[];
  memories: Memory[];
  saved: string[];
  lessonsDone: string[];
  travelDone: string[];
  planId: string | null;
  addKind: EntryKind | null;
  setHydrated: (v: boolean) => void;
  setActivePet: (id: string) => void;
  requestAdd: (kind?: EntryKind | null) => void;
  addPet: (pet: Omit<Pet, "id" | "statusTags" | "photo"> & { photo?: string }) => string;
  updatePet: (id: string, patch: Partial<Pet>) => void;
  removePet: (id: string) => void;
  logMetric: (petId: string, key: string, value: number, unit: string) => void;
  addEntry: (entry: Omit<JournalEntry, "id" | "at"> & { at?: string }) => string;
  toggleEntry: (id: string) => void;
  addDocument: (doc: Omit<DocumentItem, "id" | "issuedAt" | "updatedAt">) => void;
  setPrefs: (patch: Partial<AiPrefs>) => void;
  toggleFocus: (focus: AiPrefs["focuses"][number]) => void;
  addChat: (msg: Omit<ChatMessage, "id" | "at"> & { at?: string }) => void;
  addToCart: (productId: string, autoship?: boolean) => void;
  setQty: (productId: string, qty: number) => void;
  toggleAutoship: (productId: string) => void;
  toggleSaved: (productId: string) => void;
  checkout: () => Order | null;
  addExpense: (e: Omit<Expense, "id" | "at"> & { at?: string }) => void;
  book: (b: Omit<Booking, "id" | "status">) => void;
  addMemory: (m: Omit<Memory, "id" | "at"> & { at?: string }) => void;
  toggleLesson: (id: string) => void;
  toggleTravel: (item: string) => void;
  setPlan: (id: string) => void;
  resetDemo: () => void;
}

const SEED_EXPENSES: Expense[] = [
  { id: "x1", petId: "luna", amount: 186, cat: "vet", note: "Annual + DHPP", at: "2026-08-01T10:30:00" },
  { id: "x2", petId: "luna", amount: 68, cat: "food", note: "Kibble bag", at: "2026-08-04T16:00:00" },
  { id: "x3", petId: "miso", amount: 36, cat: "food", note: "Indoor recipe", at: "2026-08-06T12:00:00" },
  { id: "x4", petId: "nori", amount: 13, cat: "shop", note: "Conditioner", at: "2026-08-10T09:00:00" },
  { id: "x5", petId: "clover", amount: 84, cat: "vet", note: "RHDV2", at: "2026-08-04T16:20:00" },
];

const SEED_MEM: Memory[] = [
  { id: "mm1", petId: "luna", src: "/pets/luna.jpg", caption: "River face", at: "2026-08-12T19:00:00" },
  { id: "mm2", petId: "miso", src: "/pets/miso.jpg", caption: "Window tax", at: "2026-08-09T08:00:00" },
  { id: "mm3", petId: "pip", src: "/pets/pip.jpg", caption: "33.4 g morning", at: "2026-08-13T07:20:00" },
  { id: "mm4", petId: "ember", src: "/pets/ember.jpg", caption: "New hide", at: "2026-08-03T14:00:00" },
  { id: "mm5", petId: "nori", src: "/pets/nori.jpg", caption: "Flare Tuesday", at: "2026-08-11T18:00:00" },
  { id: "mm6", petId: "clover", src: "/pets/clover.jpg", caption: "Herb hour", at: "2026-08-12T17:30:00" },
];

const empty: Pick<
  JournalState,
  | "pets"
  | "activePetId"
  | "metrics"
  | "entries"
  | "documents"
  | "prefs"
  | "chat"
  | "cart"
  | "orders"
  | "expenses"
  | "bookings"
  | "memories"
  | "saved"
  | "lessonsDone"
  | "travelDone"
  | "planId"
  | "addKind"
> = {
  pets: SEED_PETS,
  activePetId: "luna",
  metrics: SEED_METRICS,
  entries: SEED_ENTRIES,
  documents: SEED_DOCS,
  prefs: SEED_PREFS,
  chat: SEED_CHAT,
  cart: [],
  orders: [],
  expenses: SEED_EXPENSES,
  bookings: [],
  memories: SEED_MEM,
  saved: ["nexgard", "uvb"],
  lessonsDone: [],
  travelDone: [],
  planId: null,
  addKind: null,
};

export const useJournal = create<JournalState>()(
  persist(
    (set, get) => ({
      ...empty,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setActivePet: (id) => set({ activePetId: id }),
      requestAdd: (kind = null) => set({ addKind: kind }),
      addPet: (input) => {
        const id = uid("pet");
        const pet: Pet = {
          id,
          statusTags: ["New"],
          photo: input.photo ?? "",
          ...input,
        };
        set((s) => ({ pets: [...s.pets, pet], activePetId: id }));
        return id;
      },
      updatePet: (id, patch) =>
        set((s) => ({ pets: s.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePet: (id) =>
        set((s) => {
          const pets = s.pets.filter((p) => p.id !== id);
          return {
            pets,
            activePetId: s.activePetId === id ? (pets[0]?.id ?? "") : s.activePetId,
            metrics: s.metrics.filter((m) => m.petId !== id),
            entries: s.entries.filter((e) => e.petId !== id),
            documents: s.documents.filter((d) => d.petId !== id),
          };
        }),
      logMetric: (petId, key, value, unit) => {
        const at = new Date().toISOString();
        set((s) => ({
          metrics: [...s.metrics, { id: uid("m"), petId, key, value, unit, at }],
          entries: [
            {
              id: uid("e"),
              petId,
              kind: "metric",
              title: `Logged ${key.replace("_", " ")}`,
              detail: `${value} ${unit}`.trim(),
              at,
              metricKey: key,
              metricValue: value,
            },
            ...s.entries,
          ],
        }));
      },
      addEntry: (partial) => {
        const id = uid("e");
        const entry: JournalEntry = { ...partial, id, at: partial.at ?? new Date().toISOString() };
        set((s) => ({ entries: [entry, ...s.entries] }));
        return id;
      },
      toggleEntry: (id) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)),
        })),
      addDocument: (doc) => {
        const now = new Date().toISOString();
        set((s) => ({
          documents: [{ ...doc, id: uid("d"), issuedAt: now, updatedAt: now }, ...s.documents],
        }));
      },
      setPrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),
      toggleFocus: (focus) =>
        set((s) => {
          const has = s.prefs.focuses.includes(focus);
          return {
            prefs: {
              ...s.prefs,
              focuses: has ? s.prefs.focuses.filter((f) => f !== focus) : [...s.prefs.focuses, focus],
            },
          };
        }),
      addChat: (msg) =>
        set((s) => ({
          chat: [...s.chat, { ...msg, id: uid("c"), at: msg.at ?? new Date().toISOString() }],
        })),
      addToCart: (productId, autoship = false) =>
        set((s) => {
          const hit = s.cart.find((l) => l.productId === productId);
          if (hit) {
            return { cart: s.cart.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l)) };
          }
          return { cart: [...s.cart, { productId, qty: 1, autoship }] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((l) => l.productId !== productId) : s.cart.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        })),
      toggleAutoship: (productId) =>
        set((s) => ({
          cart: s.cart.map((l) => (l.productId === productId ? { ...l, autoship: !l.autoship } : l)),
        })),
      toggleSaved: (productId) =>
        set((s) => ({
          saved: s.saved.includes(productId) ? s.saved.filter((id) => id !== productId) : [...s.saved, productId],
        })),
      checkout: () => {
        const { cart, activePetId } = get();
        if (!cart.length) return null;
        const total = cart.reduce((n, l) => n + (productById(l.productId)?.price ?? 0) * l.qty, 0);
        const order: Order = { id: uid("o"), at: new Date().toISOString(), total, lines: cart, status: "packed" };
        set((s) => ({
          orders: [order, ...s.orders],
          cart: [],
          expenses: [
            {
              id: uid("x"),
              petId: activePetId,
              amount: total,
              cat: "shop",
              note: `Order ${order.id.slice(-6)}`,
              at: order.at,
            },
            ...s.expenses,
          ],
        }));
        return order;
      },
      addExpense: (e) =>
        set((s) => ({
          expenses: [{ ...e, id: uid("x"), at: e.at ?? new Date().toISOString() }, ...s.expenses],
        })),
      book: (b) => {
        const booking: Booking = { ...b, id: uid("b"), status: "booked" };
        set((s) => ({
          bookings: [booking, ...s.bookings],
          entries: [
            {
              id: uid("e"),
              petId: b.petId,
              kind: "walk",
              title: `${b.kind} booked`,
              detail: `With ${b.sitterId}`,
              at: new Date().toISOString(),
              dueAt: b.when,
              completed: false,
            },
            ...s.entries,
          ],
        }));
      },
      addMemory: (m) =>
        set((s) => ({
          memories: [{ ...m, id: uid("mm"), at: m.at ?? new Date().toISOString() }, ...s.memories],
        })),
      toggleLesson: (id) =>
        set((s) => ({
          lessonsDone: s.lessonsDone.includes(id)
            ? s.lessonsDone.filter((x) => x !== id)
            : [...s.lessonsDone, id],
        })),
      toggleTravel: (item) =>
        set((s) => ({
          travelDone: s.travelDone.includes(item)
            ? s.travelDone.filter((x) => x !== item)
            : [...s.travelDone, item],
        })),
      setPlan: (id) => set({ planId: id }),
      resetDemo: () => set({ ...empty }),
    }),
    {
      name: "petjournal-v2",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
        }
        return localStorage;
      }),
      skipHydration: true,
      partialize: (s) => ({
        pets: s.pets,
        activePetId: s.activePetId,
        metrics: s.metrics,
        entries: s.entries,
        documents: s.documents,
        prefs: s.prefs,
        chat: s.chat,
        cart: s.cart,
        orders: s.orders,
        expenses: s.expenses,
        bookings: s.bookings,
        memories: s.memories,
        saved: s.saved,
        lessonsDone: s.lessonsDone,
        travelDone: s.travelDone,
        planId: s.planId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useActivePet() {
  return useJournal((s) => s.pets.find((p) => p.id === s.activePetId) ?? s.pets[0]);
}

export function latestMetric(samples: MetricSample[], petId: string, key: string) {
  return samples
    .filter((m) => m.petId === petId && m.key === key)
    .slice()
    .sort((a, b) => b.at.localeCompare(a.at))[0];
}

export function metricSeries(samples: MetricSample[], petId: string, key: string) {
  return samples
    .filter((m) => m.petId === petId && m.key === key)
    .slice()
    .sort((a, b) => a.at.localeCompare(b.at));
}

export const KIND_META: Record<
  EntryKind,
  { label: string; tone: "sky" | "good" | "warn" | "ink" | "blush" }
> = {
  note: { label: "Note", tone: "ink" },
  voice: { label: "Voice", tone: "sky" },
  vet: { label: "Vet", tone: "sky" },
  vaccine: { label: "Vaccine", tone: "good" },
  medication: { label: "Meds", tone: "warn" },
  grooming: { label: "Groom", tone: "blush" },
  metric: { label: "Metric", tone: "ink" },
  meal: { label: "Meal", tone: "blush" },
  document: { label: "Doc", tone: "ink" },
  walk: { label: "Care", tone: "sky" },
  expense: { label: "Spend", tone: "warn" },
};

export function defaultPhoto(species: SpeciesId) {
  const map: Partial<Record<SpeciesId, string>> = {
    dog: "/pets/luna.jpg",
    cat: "/pets/miso.jpg",
    bird: "/pets/pip.jpg",
    reptile: "/pets/ember.jpg",
    fish: "/pets/nori.jpg",
    rabbit: "/pets/clover.jpg",
  };
  return map[species] ?? "";
}

export function cartCount(cart: CartLine[]) {
  return cart.reduce((n, l) => n + l.qty, 0);
}

export function cartTotal(cart: CartLine[]) {
  return cart.reduce((n, l) => n + (productById(l.productId)?.price ?? 0) * l.qty, 0);
}

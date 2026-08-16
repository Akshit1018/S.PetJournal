import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { defaultPhoto, useJournal } from "@/lib/store";
import { SPECIES_LIST } from "@/lib/species";
import type { Sex, SpeciesId } from "@/lib/types";
import { ageLabel, cn } from "@/lib/utils";
import { SEED_OWNER } from "@/lib/seed";
import { TopBar } from "@/components/layout/TopBar";

export function PetsView() {
  const pets = useJournal((s) => s.pets);
  const active = useJournal((s) => s.activePetId);
  const setActive = useJournal((s) => s.setActivePet);
  const addPet = useJournal((s) => s.addPet);
  const resetDemo = useJournal((s) => s.resetDemo);
  const { user, isPending } = useCurrentUserState();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<SpeciesId>("dog");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState<Sex>("unknown");
  const [birth, setBirth] = useState("2024-06-01");

  const submit = () => {
    if (!name.trim()) {
      toast.error("Give them a name");
      return;
    }
    addPet({
      name: name.trim(),
      species,
      breed: breed.trim() || SPECIES_LIST.find((s) => s.id === species)?.label || "Companion",
      sex,
      birthDate: birth,
      photo: defaultPhoto(species),
    });
    toast.success(`${name.trim()} joined the household`);
    setOpen(false);
    setName("");
    setBreed("");
  };

  return (
    <div className="flex flex-col pb-8">
      <TopBar title="Household" />

      <div className="px-4">
        <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-line">
          <div className="flex items-center gap-3">
            {isPending ? (
              <span className="size-10 animate-pulse rounded-full bg-blush" />
            ) : (
              <img
                src={user?.profileImageUrl ?? SEED_OWNER.photo}
                alt=""
                className="size-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-sm font-semibold">
                {user?.displayName ?? SEED_OWNER.name}
              </p>
              <p className="text-xs text-muted">Keeper of the passports</p>
            </div>
          </div>
          <SignedIn>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-sm font-medium text-sky-deep underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          </SignedIn>
          <SignedOut>
            <Link
              to="/login"
              className="text-sm font-medium text-sky-deep underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </SignedOut>
        </div>

        <ul className="mt-4 space-y-2.5">
          {pets.map((p) => {
            const spec = SPECIES_LIST.find((s) => s.id === p.species);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActive(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left ring-1",
                    p.id === active ? "ring-sky" : "ring-line",
                  )}
                >
                  <img src={p.photo} alt="" className="size-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="truncate text-sm text-muted">
                      {p.breed} · {spec?.label} · {ageLabel(p.birthDate)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <Button className="mt-4 w-full" variant="sun" onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : "Add a pet"}
        </Button>

        {open && (
          <form
            className="mt-3 space-y-3 rounded-xl bg-card p-4 ring-1 ring-line"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="block text-xs font-medium text-muted">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm text-ink"
              />
            </label>
            <label className="block text-xs font-medium text-muted">
              Species — metrics change with this
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as SpeciesId)}
                className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
              >
                {SPECIES_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs leading-relaxed text-muted">
              {SPECIES_LIST.find((s) => s.id === species)?.problem}
            </p>
            <label className="block text-xs font-medium text-muted">
              Breed or morph
              <input
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-muted">
                Sex
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="unknown">Unknown</option>
                </select>
              </label>
              <label className="text-xs font-medium text-muted">
                Born
                <input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm"
                />
              </label>
            </div>
            <Button type="submit" className="w-full">
              Save pet
            </Button>
          </form>
        )}

        <section className="mt-6">
          <h2 className="text-sm font-semibold">Why metrics differ</h2>
          <ul className="mt-2 space-y-2">
            {SPECIES_LIST.filter((s) => s.id !== "other").map((s) => (
              <li key={s.id} className="rounded-xl bg-card px-4 py-3 ring-1 ring-line">
                <p className="text-sm font-semibold">{s.plural}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.solution}</p>
              </li>
            ))}
          </ul>
        </section>

        <button
          type="button"
          onClick={() => {
            resetDemo();
            toast.success("Demo household restored");
          }}
          className="mt-6 w-full text-center text-xs text-muted underline-offset-4 hover:underline"
        >
          Restore demo household
        </button>
      </div>
    </div>
  );
}

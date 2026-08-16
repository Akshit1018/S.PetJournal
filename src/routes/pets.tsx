import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PetsView } from "@/components/pets/PetsView";

export const Route = createFileRoute("/pets")({ component: Pets });

function Pets() {
  return (
    <AppShell>
      <PetsView />
    </AppShell>
  );
}

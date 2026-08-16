import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { JournalView } from "@/components/journal/JournalView";

export const Route = createFileRoute("/journal")({ component: Journal });

function Journal() {
  return (
    <AppShell>
      <JournalView />
    </AppShell>
  );
}

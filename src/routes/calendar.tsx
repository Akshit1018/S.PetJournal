import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/calendar")({ component: Page });
function Page() {
  return (
    <AppShell>
      <CalendarView />
    </AppShell>
  );
}

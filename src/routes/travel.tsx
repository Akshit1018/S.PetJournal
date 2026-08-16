import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { TravelView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/travel")({ component: Page });
function Page() {
  return (
    <AppShell>
      <TravelView />
    </AppShell>
  );
}

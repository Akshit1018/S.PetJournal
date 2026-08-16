import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AidView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/aid")({ component: Page });
function Page() {
  return (
    <AppShell>
      <AidView />
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SpendView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/spend")({ component: Page });
function Page() {
  return (
    <AppShell>
      <SpendView />
    </AppShell>
  );
}

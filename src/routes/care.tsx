import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CareView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/care")({ component: Page });
function Page() {
  return (
    <AppShell>
      <CareView />
    </AppShell>
  );
}

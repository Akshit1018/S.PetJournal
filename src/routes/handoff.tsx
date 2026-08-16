import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HandoffView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/handoff")({ component: Page });
function Page() {
  return (
    <AppShell>
      <HandoffView />
    </AppShell>
  );
}

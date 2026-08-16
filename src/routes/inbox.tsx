import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { InboxView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/inbox")({ component: Page });
function Page() {
  return (
    <AppShell>
      <InboxView />
    </AppShell>
  );
}

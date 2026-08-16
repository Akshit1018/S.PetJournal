import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CoverView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/cover")({ component: Page });
function Page() {
  return (
    <AppShell>
      <CoverView />
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { TrainView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/train")({ component: Page });
function Page() {
  return (
    <AppShell>
      <TrainView />
    </AppShell>
  );
}

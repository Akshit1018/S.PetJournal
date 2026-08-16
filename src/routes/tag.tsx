import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { TagView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/tag")({ component: Page });
function Page() {
  return (
    <AppShell>
      <TagView />
    </AppShell>
  );
}

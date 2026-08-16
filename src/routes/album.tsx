import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AlbumView } from "@/components/more/FeatureViews";

export const Route = createFileRoute("/album")({ component: Page });
function Page() {
  return (
    <AppShell>
      <AlbumView />
    </AppShell>
  );
}

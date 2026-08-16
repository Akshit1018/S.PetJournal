import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MoreView } from "@/components/more/MoreView";

export const Route = createFileRoute("/more")({ component: Page });
function Page() {
  return (
    <AppShell>
      <MoreView />
    </AppShell>
  );
}

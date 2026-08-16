import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HealthView } from "@/components/health/HealthView";

export const Route = createFileRoute("/health")({ component: Health });

function Health() {
  return (
    <AppShell>
      <HealthView />
    </AppShell>
  );
}

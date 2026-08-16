import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { AiView } from "@/components/ai/AiView";

export const Route = createFileRoute("/guide")({ component: Guide });

function Guide() {
  return (
    <AppShell>
      <AiView />
    </AppShell>
  );
}

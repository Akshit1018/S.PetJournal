import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DocsView } from "@/components/docs/DocsView";

export const Route = createFileRoute("/documents")({ component: Documents });

function Documents() {
  return (
    <AppShell>
      <DocsView />
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HomeView } from "@/components/home/HomeView";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell>
      <HomeView />
    </AppShell>
  );
}

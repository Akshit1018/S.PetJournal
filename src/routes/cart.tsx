import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CartView } from "@/components/shop/CartView";

export const Route = createFileRoute("/cart")({ component: Page });
function Page() {
  return (
    <AppShell>
      <CartView />
    </AppShell>
  );
}

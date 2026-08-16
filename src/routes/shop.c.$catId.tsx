import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/shop/ShopView";
import type { ShopCatId } from "@/lib/catalog";

export const Route = createFileRoute("/shop/c/$catId")({ component: Page });

function Page() {
  const { catId } = Route.useParams();
  return <ShopView cat={catId as ShopCatId} />;
}

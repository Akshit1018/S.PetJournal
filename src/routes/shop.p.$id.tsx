import { createFileRoute } from "@tanstack/react-router";
import { ProductView } from "@/components/shop/ProductView";

export const Route = createFileRoute("/shop/p/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  return <ProductView id={id} />;
}

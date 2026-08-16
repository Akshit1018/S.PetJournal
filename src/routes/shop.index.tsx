import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/shop/ShopView";

export const Route = createFileRoute("/shop/")({ component: ShopView });

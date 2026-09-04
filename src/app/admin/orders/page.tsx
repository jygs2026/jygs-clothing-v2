import type { Metadata } from "next";
import { Suspense } from "react";

import { OrdersScreen } from "@/components/admin/orders/orders-screen";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  // The screen reads ?q= from the top bar's search, so it needs a boundary
  // above it — the page stays static and the query arrives on the client.
  return (
    <Suspense>
      <OrdersScreen />
    </Suspense>
  );
}

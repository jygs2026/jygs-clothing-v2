import type { Metadata } from "next";
import { Suspense } from "react";

import { InventoryScreen } from "@/components/admin/inventory/inventory-screen";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryScreenPage() {
  return (
    <Suspense>
      <InventoryScreen />
    </Suspense>
  );
}

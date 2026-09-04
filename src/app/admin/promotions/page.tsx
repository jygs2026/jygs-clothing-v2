import type { Metadata } from "next";
import { Suspense } from "react";

import { PromotionsScreen } from "@/components/admin/promotions/promotions-screen";

export const metadata: Metadata = { title: "Promotions" };

export default function PromotionsScreenPage() {
  return (
    <Suspense>
      <PromotionsScreen />
    </Suspense>
  );
}

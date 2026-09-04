import type { Metadata } from "next";
import { Suspense } from "react";

import { PricingScreen } from "@/components/admin/pricing/pricing-screen";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingScreenPage() {
  return (
    <Suspense>
      <PricingScreen />
    </Suspense>
  );
}

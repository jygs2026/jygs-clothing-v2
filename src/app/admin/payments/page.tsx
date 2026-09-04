import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentsScreen } from "@/components/admin/payments/payments-screen";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsScreenPage() {
  return (
    <Suspense>
      <PaymentsScreen />
    </Suspense>
  );
}

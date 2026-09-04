import type { Metadata } from "next";
import { Suspense } from "react";

import { CustomersScreen } from "@/components/admin/customers/customers-screen";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  // The screen reads ?q= from the top bar's search, so it needs a boundary
  // above it — the page stays static and the query arrives on the client.
  return (
    <Suspense>
      <CustomersScreen />
    </Suspense>
  );
}

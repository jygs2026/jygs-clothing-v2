import type { Metadata } from "next";

import { CustomerDetail } from "@/components/admin/customers/customer-detail";

export const metadata: Metadata = { title: "Customer" };

export default function CustomerPage() {
  return <CustomerDetail />;
}

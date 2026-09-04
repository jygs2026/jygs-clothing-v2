import type { Metadata } from "next";

import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return <AdminPlaceholder href="/admin/reports" />;
}

import type { Metadata } from "next";

import { ReportsScreen } from "@/components/admin/reports/reports-screen";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return <ReportsScreen />;
}

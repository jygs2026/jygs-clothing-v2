import type { Metadata } from "next";

import { DashboardScreen } from "@/components/admin/dashboard/dashboard-screen";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return <DashboardScreen />;
}

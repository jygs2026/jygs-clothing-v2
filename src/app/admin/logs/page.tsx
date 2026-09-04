import type { Metadata } from "next";
import { Suspense } from "react";

import { LogsScreen } from "@/components/admin/logs/logs-screen";

export const metadata: Metadata = { title: "System Logs" };

export default function LogsScreenPage() {
  return (
    <Suspense>
      <LogsScreen />
    </Suspense>
  );
}

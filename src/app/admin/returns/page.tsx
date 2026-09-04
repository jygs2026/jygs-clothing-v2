import type { Metadata } from "next";
import { Suspense } from "react";

import { ReturnsScreen } from "@/components/admin/returns/returns-screen";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsScreenPage() {
  return (
    <Suspense>
      <ReturnsScreen />
    </Suspense>
  );
}

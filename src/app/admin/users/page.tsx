import type { Metadata } from "next";
import { Suspense } from "react";

import { UsersScreen } from "@/components/admin/users/users-screen";

export const metadata: Metadata = { title: "Users & Roles" };

export default function UsersPage() {
  // The screen reads ?q= from the top bar's search, so it needs a boundary
  // above it — the page itself stays static and the query arrives on the client.
  return (
    <Suspense>
      <UsersScreen />
    </Suspense>
  );
}

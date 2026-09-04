import type { Metadata } from "next";

import { RolesScreen } from "@/components/admin/users/roles-screen";

export const metadata: Metadata = { title: "Roles" };

export default function RolesPage() {
  return <RolesScreen />;
}

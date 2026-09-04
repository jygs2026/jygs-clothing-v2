import type { Metadata } from "next";

import { EditRoleScreen } from "@/components/admin/users/edit-role-screen";

export const metadata: Metadata = { title: "Edit role" };

export default function EditRolePage() {
  return <EditRoleScreen />;
}

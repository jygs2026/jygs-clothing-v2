import type { Metadata } from "next";

import { RoleForm } from "@/components/admin/users/role-form";

export const metadata: Metadata = { title: "Create role" };

export default function CreateRolePage() {
  return <RoleForm />;
}

import { redirect } from "next/navigation";

import { isMasterAdmin } from "@/domain/access";
import { getCurrentUser } from "@/lib/auth/session";

export default async function NoahOpsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isMasterAdmin(user)) redirect("/");
  redirect("/admin?tab=noah");
}

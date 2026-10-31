import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { isMasterAdmin } from "@/domain/access";
import { toMemberships } from "@/lib/auth/session";
import { isPlatformAdminUserId } from "@/lib/admin/platform";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) redirect("/login");

  let user: User | null = null;
  let memberships: ReturnType<typeof toMemberships> = [];
  let activeMembership: ReturnType<typeof toMemberships>[number] | null = null;

  try {
    const supabase = await createClient();
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
    if (!user) redirect("/login");

    const { data: membershipRows, error } = await supabase
      .from("memberships")
      .select("congregation_id, role, congregations(id, name, city, state, parent_id, active, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read, hierarchy_view, hierarchy_financial_read)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Authenticated layout membership load failed:", error);
    } else {
      const allMemberships = toMemberships(user, membershipRows ?? []);
      const isDeveloper = isMasterAdmin(user);
      let visibleMemberships = allMemberships;

      if (!isDeveloper) {
        const headquartersMemberships = allMemberships.filter((membership) => membership.congregation.isHeadquarters && Boolean(membership.permissions?.["hierarchy.view"]));
        if (headquartersMemberships.length > 0) {
          const allowedSet = new Set<string>();
          for (const headquarters of headquartersMemberships) {
            allowedSet.add(headquarters.congregationId);
            for (const child of allMemberships) {
              if (child.congregation.parentId === headquarters.congregationId) allowedSet.add(child.congregationId);
            }
          }
          visibleMemberships = allMemberships.filter((membership) => allowedSet.has(membership.congregationId));
        } else {
          visibleMemberships = allMemberships;
        }
      }

      memberships = visibleMemberships;
      const requestedId = (await cookies()).get("active_congregation_id")?.value;
      activeMembership = memberships.find((membership) => membership.congregationId === requestedId) ?? memberships[0] ?? null;
    }
  } catch (error) {
    console.error("Authenticated layout failed:", error);
    redirect("/login");
  }

  if (!user) redirect("/login");

  return <AuthenticatedShell user={user} memberships={memberships} activeMembership={activeMembership} isPlatformAdmin={isPlatformAdminUserId(user.id)}>{children}</AuthenticatedShell>;
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthenticatedShell } from "@/components/AuthenticatedShell";
import { isMasterAdmin } from "@/domain/access";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  let memberships: Awaited<ReturnType<typeof getUserMemberships>> = [];
  let activeMembership: Awaited<ReturnType<typeof getUserMemberships>>[number] | null = null;

  try {
    const allMemberships = await getUserMemberships(user);
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
      }
    }
    memberships = visibleMemberships;
    const requestedId = (await cookies()).get("active_congregation_id")?.value;
    activeMembership = memberships.find((membership) => membership.congregationId === requestedId) ?? memberships[0] ?? null;
  } catch (error) {
    console.error("Authenticated layout failed:", error);
    redirect("/login");
  }

  return <AuthenticatedShell user={user} memberships={memberships} activeMembership={activeMembership} isPlatformAdmin={isMasterAdmin(user)}>{children}</AuthenticatedShell>;
}
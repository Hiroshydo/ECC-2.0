import { NextResponse } from "next/server";

import { getPlatformAdminContext } from "@/lib/admin/platform";
import { adminQuery } from "@/lib/db/pool";
import { callAdminFunction } from "@/lib/db/rpc";
import type { OrganizationLevel, OrganizationType } from "@/domain/vocabulary";

type CreateOrganizationRequest = {
  name: string;
  city: string;
  state: string;
  organizationType: OrganizationType;
  isHeadquarters: boolean;
  parent_id?: string | null;
  organizationLevel: OrganizationLevel;
};

export async function POST(request: Request) {
  const context = await getPlatformAdminContext();
  if (!context.ok) return NextResponse.json({ error: context.error }, { status: context.status });

  let input: CreateOrganizationRequest;
  try {
    input = await request.json() as CreateOrganizationRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!input.name?.trim() || !input.city?.trim() || !input.state?.trim()) {
    return NextResponse.json({ error: "name_city_state_required" }, { status: 400 });
  }
  if (input.organizationType !== "church" && input.organizationType !== "ong") {
    return NextResponse.json({ error: "organization_type_invalid" }, { status: 400 });
  }
  const levels: OrganizationLevel[] = ["national_hq", "state_hq", "sub_hq", "local_congregation"];
  if (!levels.includes(input.organizationLevel)) {
    return NextResponse.json({ error: "organization_level_invalid" }, { status: 400 });
  }
  const parentLevels: Record<OrganizationLevel, OrganizationLevel[]> = {
    national_hq: [],
    state_hq: ["national_hq"],
    sub_hq: ["national_hq", "state_hq"],
    local_congregation: ["national_hq", "state_hq", "sub_hq"],
  };
  const isHeadquarters = input.organizationLevel !== "local_congregation";
  if (input.isHeadquarters !== isHeadquarters) {
    return NextResponse.json({ error: "headquarters_level_mismatch" }, { status: 400 });
  }
  if (input.parent_id !== undefined && input.parent_id !== null && typeof input.parent_id !== "string") {
    return NextResponse.json({ error: "parent_id_invalid" }, { status: 400 });
  }
  const parentId = input.organizationLevel === "national_hq" ? null : input.parent_id ?? null;
  if (parentLevels[input.organizationLevel].length > 0 && !parentId && input.organizationLevel !== "local_congregation") {
    return NextResponse.json({ error: "parent_organization_required" }, { status: 400 });
  }
  if (parentId) {
    const parentResult = await adminQuery<{ organization_level: OrganizationLevel }>(
      "select organization_level from public.congregations where id = $1 and organization_type = $2",
      [parentId, input.organizationType],
    );
    const parent = parentResult.rows[0];
    if (!parent || !parentLevels[input.organizationLevel].includes(parent.organization_level)) {
      return NextResponse.json({ error: "parent_organization_level_invalid" }, { status: 400 });
    }
  }

  const data = await callAdminFunction("admin_create_congregation", {
    p_actor_id: context.user.id,
    p_name: input.name.trim(),
    p_city: input.city.trim(),
    p_state: input.state.trim(),
    p_organization_type: input.organizationType,
    p_is_headquarters: isHeadquarters,
    p_parent_id: parentId,
    p_organization_level: input.organizationLevel,
  });
  return NextResponse.json({ data }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
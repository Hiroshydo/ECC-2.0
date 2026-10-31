import { NextResponse } from "next/server";

import { getPlatformAdminContext } from "@/lib/admin/platform";
import { adminQuery } from "@/lib/db/pool";
import type { OrganizationLevel, OrganizationType } from "@/domain/vocabulary";

type UpdateOrganizationRequest = {
  name?: unknown;
  city?: unknown;
  state?: unknown;
  organizationType?: unknown;
  organization_type?: unknown;
  organizationLevel?: unknown;
  organization_level?: unknown;
  isHeadquarters?: unknown;
  is_headquarters?: unknown;
  parent_id?: unknown;
  leader_name?: unknown;
  active?: unknown;
};

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorization = await getPlatformAdminContext();
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  }

  const { id } = await context.params;
  let input: UpdateOrganizationRequest;
  try {
    input = await request.json() as UpdateOrganizationRequest;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const organizationType = input.organizationType ?? input.organization_type;
  const organizationLevel = input.organizationLevel ?? input.organization_level;
  const validLevels: OrganizationLevel[] = ["national_hq", "state_hq", "sub_hq", "local_congregation"];
  if (
    typeof input.name !== "string" || !input.name.trim() ||
    typeof input.city !== "string" || !input.city.trim() ||
    typeof input.state !== "string" || !input.state.trim() ||
    (organizationType !== "church" && organizationType !== "ong") ||
    !validLevels.includes(organizationLevel as OrganizationLevel)
  ) {
    return NextResponse.json({ error: "organization_fields_invalid" }, { status: 400 });
  }
  const typedLevel = organizationLevel as OrganizationLevel;
  const declaredHeadquarters = input.isHeadquarters ?? input.is_headquarters;
  if (declaredHeadquarters !== undefined && declaredHeadquarters !== (typedLevel !== "local_congregation")) {
    return NextResponse.json({ error: "headquarters_level_mismatch" }, { status: 400 });
  }
  if (input.parent_id === undefined) {
    return NextResponse.json({ error: "parent_id_required" }, { status: 400 });
  }
  const isHeadquarters = typedLevel !== "local_congregation";
  const parentLevels: Record<OrganizationLevel, OrganizationLevel[]> = {
    national_hq: [],
    state_hq: ["national_hq"],
    sub_hq: ["national_hq", "state_hq"],
    local_congregation: ["national_hq", "state_hq", "sub_hq"],
  };

  const updates: {
    name: string;
    city: string;
    state: string;
    organization_type: OrganizationType;
    organization_level: OrganizationLevel;
    is_headquarters: boolean;
    leader_name?: string | null;
    parent_id?: string | null;
    active?: boolean;
  } = {
    name: input.name.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    organization_type: organizationType,
    organization_level: typedLevel,
    is_headquarters: isHeadquarters,
  };

  if (input.leader_name !== undefined) {
    if (input.leader_name !== null && typeof input.leader_name !== "string") {
      return NextResponse.json({ error: "leader_name_invalid" }, { status: 400 });
    }
    updates.leader_name = typeof input.leader_name === "string" ? input.leader_name.trim() || null : null;
  }
  if (input.parent_id !== undefined) {
    if (input.parent_id !== null && typeof input.parent_id !== "string") {
      return NextResponse.json({ error: "parent_id_invalid" }, { status: 400 });
    }
    if (input.parent_id === id && typedLevel !== "national_hq") {
      return NextResponse.json({ error: "congregation_cannot_parent_itself" }, { status: 400 });
    }
    const parentId = typedLevel === "national_hq" ? null : input.parent_id;
    if (typeof parentId === "string") {
      const parentResult = await adminQuery<{ organization_level: OrganizationLevel }>(
        "select organization_level from public.congregations where id = $1 and organization_type = $2",
        [parentId, organizationType],
      );
      const parent = parentResult.rows[0];
      if (!parent || !parentLevels[typedLevel].includes(parent.organization_level)) {
        return NextResponse.json({ error: "parent_organization_level_invalid" }, { status: 400 });
      }
    }
    if (parentLevels[typedLevel].length > 0 && !parentId && typedLevel !== "local_congregation") {
      return NextResponse.json({ error: "parent_organization_required" }, { status: 400 });
    }
    updates.parent_id = parentId;
  } else if (isHeadquarters) {
    updates.parent_id = null;
  }

  const allowedChildLevels: Record<OrganizationLevel, OrganizationLevel[]> = {
    national_hq: ["state_hq", "sub_hq", "local_congregation"],
    state_hq: ["sub_hq", "local_congregation"],
    sub_hq: ["local_congregation"],
    local_congregation: [],
  };
  const childrenResult = await adminQuery<{ organization_level: OrganizationLevel; organization_type: OrganizationType }>(
    "select organization_level, organization_type from public.congregations where parent_id = $1",
    [id],
  );
  if (childrenResult.rows.some((child) =>
    child.organization_type !== organizationType ||
    !allowedChildLevels[typedLevel].includes(child.organization_level)
  )) {
    return NextResponse.json({ error: "organization_has_incompatible_children" }, { status: 400 });
  }

  if (input.active !== undefined) {
    if (typeof input.active !== "boolean") {
      return NextResponse.json({ error: "active_invalid" }, { status: 400 });
    }
    updates.active = input.active;
  }

  const columns: Record<keyof typeof updates, string> = {
    name: "name",
    city: "city",
    state: "state",
    organization_type: "organization_type",
    organization_level: "organization_level",
    is_headquarters: "is_headquarters",
    leader_name: "leader_name",
    parent_id: "parent_id",
    active: "active",
  };
  const entries = Object.entries(updates) as [keyof typeof updates, (typeof updates)[keyof typeof updates]][];
  const parameters = entries.map(([, value]) => value);
  const assignments = entries.map(([key], index) => `${columns[key]} = $${index + 1}`).join(", ");
  const result = await adminQuery(
    `update public.congregations set ${assignments}
      where id = $${parameters.length + 1}
      returning id, name, city, state, parent_id, leader_name, organization_type, organization_level, is_headquarters, active`,
    [...parameters, id],
  );
  const data = result.rows[0];
  if (!data) return NextResponse.json({ error: "congregation_not_found" }, { status: 404 });

  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}

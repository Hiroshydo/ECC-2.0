import assert from "node:assert/strict";
import test from "node:test";

import {
  computeAlertsByUnitId,
  computeUnitAlerts,
  countUnitsWithAlerts,
  groupMembersByUnit,
  findDuplicateUnits,
  organizationDisplayLabel,
  roleLabelFor,
} from "./unit-access.ts";

const emptyPermissions = {
  "financial.read": true,
  "financial.write": false,
  "financial.approve": false,
  "closing.submit": false,
  "audit.read": false,
  "hierarchy.view": false,
  "hierarchy.financial.read": false,
};

function makeOrg(overrides = {}) {
  return {
    id: "org-1",
    name: "Igreja Central",
    city: "Avaré",
    state: "SP",
    parent_id: null,
    leader_name: null,
    organization_type: "church",
    organization_level: "local_congregation",
    is_headquarters: false,
    active: true,
    ...overrides,
  };
}

function makeUser(id, name, assignments) {
  return {
    id,
    name,
    email: `${id}@ecclesia.test`,
    role: assignments[0]?.role ?? "viewer",
    assignments: assignments.map((item) => ({
      congregationId: item.congregationId,
      role: item.role,
      permissions: { ...emptyPermissions },
    })),
  };
}

test("active unit with a treasurer has zero alerts", () => {
  const unit = makeOrg({ id: "u1" });
  const users = [makeUser("usr-1", "Ana", [{ congregationId: "u1", role: "treasurer" }])];
  const members = groupMembersByUnit(users).get("u1") ?? [];

  assert.deepEqual(computeUnitAlerts(unit, members), []);
  assert.equal(countUnitsWithAlerts([unit], users), 0);
});

test("active unit with no users reports one actionable alert", () => {
  const unit = makeOrg({ id: "u1", organization_type: "church" });
  const alerts = computeUnitAlerts(unit, []);

  assert.deepEqual(alerts.map((alert) => alert.id), ["no-users"]);
  assert.equal(countUnitsWithAlerts([unit], []), 1);
});

test("active ONG without treasurer uses Gestor Financeiro label", () => {
  const ong = makeOrg({ id: "ong-1", name: "Instituto Esperança", organization_type: "ong" });
  const users = [makeUser("usr-1", "Bruno", [{ congregationId: "ong-1", role: "viewer" }])];
  const members = groupMembersByUnit(users).get("ong-1") ?? [];
  const alerts = computeUnitAlerts(ong, members);

  assert.deepEqual(alerts.map((alert) => alert.id), ["no-treasurer"]);
  assert.match(alerts[0].label, /Gestor Financeiro/);
  assert.equal(roleLabelFor("treasurer", "ong"), "Gestor Financeiro");
});

test("inactive unit with zero users has zero alerts", () => {
  const inactiveEmpty = makeOrg({ id: "u-off", active: false });
  assert.deepEqual(computeUnitAlerts(inactiveEmpty, []), []);
  assert.equal(countUnitsWithAlerts([inactiveEmpty], []), 0);
});

test("inactive unit with active users triggers inactive-with-access alert only", () => {
  const inactiveUsed = makeOrg({ id: "u-off", active: false });
  const users = [makeUser("usr-1", "Carlos", [{ congregationId: "u-off", role: "viewer" }])];
  const members = groupMembersByUnit(users).get("u-off") ?? [];
  const alerts = computeUnitAlerts(inactiveUsed, members);

  assert.deepEqual(alerts.map((alert) => alert.id), ["inactive-with-access"]);
  assert.equal(alerts[0].severity, "danger");
  assert.equal(countUnitsWithAlerts([inactiveUsed], users), 1);
});

test("countUnitsWithAlerts matches computeAlertsByUnitId across mixed organizations", () => {
  const orgs = [
    makeOrg({ id: "healthy", active: true }),
    makeOrg({ id: "no-treasurer", active: true }),
    makeOrg({ id: "inactive-ok", active: false }),
    makeOrg({ id: "inactive-bad", active: false }),
  ];
  const users = [
    makeUser("u1", "Zilda", [{ congregationId: "healthy", role: "treasurer" }]),
    makeUser("u2", "Bruno", [
      { congregationId: "no-treasurer", role: "auditor" },
      { congregationId: "inactive-bad", role: "viewer" },
    ]),
  ];

  const grouped = groupMembersByUnit(users);
  const alertsMap = computeAlertsByUnitId(orgs, grouped);
  const countedFromMap = orgs.filter((org) => (alertsMap.get(org.id)?.length ?? 0) > 0).length;

  assert.equal(countedFromMap, 2);
  assert.equal(countUnitsWithAlerts(orgs, users), countedFromMap);
});

test("duplicate unit names are matched without accents or casing and get distinct labels", () => {
  const first = makeOrg({ id: "unit-a", name: "Congregação A", city: "Avaré" });
  const second = makeOrg({ id: "unit-b", name: "CONGREGACAO A", city: "Avare", organization_level: "sub_hq" });
  const organizations = [first, second];

  assert.deepEqual(findDuplicateUnits("Congregacao A", "AVARE", organizations).map((unit) => unit.id), ["unit-a", "unit-b"]);
  assert.notEqual(organizationDisplayLabel(first, organizations), organizationDisplayLabel(second, organizations));
  assert.match(organizationDisplayLabel(first, organizations), /unit-a/);
});

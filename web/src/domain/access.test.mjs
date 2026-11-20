import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { isPlatformOperator, platformOperatorAccessStatus } from "./access.ts";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function findRouteFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findRouteFiles(entryPath);
    return entry.name === "route.ts" ? [entryPath] : [];
  }));
  return nested.flat();
}

test("only the database-controlled platform_operator role grants operator access", () => {
  assert.equal(isPlatformOperator({ app_metadata: { role: "platform_operator" } }), true);
  assert.equal(platformOperatorAccessStatus({ app_metadata: { role: "platform_operator" } }), null);

  const ordinaryUsers = [
    { email: "ordinary@example.test", app_metadata: {} },
    { email: "renanmarianosd@hotmail.com", app_metadata: {} },
    { email: "ordinary@example.test", app_metadata: { role: "central_admin" } },
    { email: "ordinary@example.test", app_metadata: { is_dev: true } },
    { email: "ordinary@example.test", app_metadata: { is_super_admin: true } },
  ];

  for (const user of ordinaryUsers) {
    assert.equal(isPlatformOperator(user), false);
    assert.equal(platformOperatorAccessStatus(user), 403);
  }
  assert.equal(platformOperatorAccessStatus(null), 401);
});

test("admin pages and every /api/admin route enforce platform-operator access", async () => {
  const adminPage = await readFile(path.join(sourceRoot, "app", "(authenticated)", "admin", "page.tsx"), "utf8");
  assert.match(adminPage, /getPlatformAdminContext\(\)/);

  const noahPage = await readFile(path.join(sourceRoot, "app", "(authenticated)", "noah-ops", "page.tsx"), "utf8");
  assert.match(noahPage, /isPlatformOperator\(user\)/);

  const adminApiRoot = path.join(sourceRoot, "app", "api", "admin");
  const routes = await findRouteFiles(adminApiRoot);
  assert.ok(routes.length > 0);

  for (const route of routes) {
    const source = await readFile(route, "utf8");
    assert.match(source, /getPlatformAdminContext/);
    assert.match(source, /await getPlatformAdminContext\(\)/);
  }
});

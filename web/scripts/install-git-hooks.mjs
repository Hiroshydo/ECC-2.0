import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = path.resolve(webDir, "..");
const hooksPath = execFileSync("git", ["rev-parse", "--git-path", "hooks"], {
  cwd: repoDir,
  encoding: "utf8",
}).trim();
const hooksDir = path.isAbsolute(hooksPath) ? hooksPath : path.resolve(repoDir, hooksPath);

const hookContent = `#!/bin/sh
# ECC Obsidian docs sync (installed by npm run hooks:install)
repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
(
  cd "$repo_root" || exit 0
  node web/scripts/sync-obsidian-docs.mjs >/dev/null 2>&1
) </dev/null >/dev/null 2>&1 &
exit 0
`;

fs.mkdirSync(hooksDir, { recursive: true });
for (const hookName of ["post-commit", "post-merge"]) {
  const hookPath = path.join(hooksDir, hookName);
  if (fs.existsSync(hookPath)) {
    const current = fs.readFileSync(hookPath, "utf8");
    if (!current.includes("ECC Obsidian docs sync")) {
      throw new Error(`Hook já existe e não será sobrescrito: ${hookPath}`);
    }
  }
  fs.writeFileSync(hookPath, hookContent, { encoding: "utf8", mode: 0o755 });
}

console.log(`Hooks post-commit e post-merge instalados em ${hooksDir}.`);

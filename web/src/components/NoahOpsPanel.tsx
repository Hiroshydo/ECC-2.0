"use client";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { NoahTelemetryGrid } from "@/modules/core/canaa/components/NoahTelemetryGrid";
import type { ModuleTelemetry } from "@/modules/core/canaa/types";

const telemetry: ModuleTelemetry[] = [
  { module: "khatam", health: "unknown" },
  { module: "hiram", health: "unknown" },
  { module: "elias", health: "unknown" },
  { module: "enoch", health: "unknown" },
  { module: "sefer", health: "unknown" },
];

export function NoahOpsPanel() {
  return (
    <div className="noah-ops-panel">
      <header className="noah-ops-panel__heading">
        <ModuleIcon module="noah" variant="icon" size={44} decorative />
        <div>
          <p className="eyebrow">TELEMETRIA E INFRAESTRUTURA</p>
          <h2>Noah Ops</h2>
        </div>
      </header>
      <NoahTelemetryGrid modules={telemetry} />
      <section className="noah-ops-plugins" aria-label="Plugins em breve">
        <h3>Plugins · Em breve</h3>
        <div>
          {(["gideon", "shofeet"] as const).map((module) => (
            <article key={module}>
              <ModuleIcon module={module} variant="badge" size={96} muted decorative />
              <span>Em breve</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

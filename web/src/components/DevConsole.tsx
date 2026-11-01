"use client";

import { useState } from "react";

import { AdminManager } from "@/components/AdminManager";
import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { NoahOpsPanel } from "@/components/NoahOpsPanel";

type DevConsoleTab = "access" | "noah";

export function DevConsole({ initialTab = "access", organizationId }: { initialTab?: DevConsoleTab; organizationId?: string }) {
  const [activeTab, setActiveTab] = useState<DevConsoleTab>(initialTab);

  return (
    <section className="dev-console">
      <nav className="dev-console__tabs" role="tablist" aria-label="Console Dev">
        <button type="button" role="tab" aria-selected={activeTab === "access"} className={activeTab === "access" ? "is-active" : ""} onClick={() => setActiveTab("access")}>
          <ModuleIcon module="canaa-access" variant="icon" size={24} decorative />
          <span>Canaã Access</span>
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "noah"} className={activeTab === "noah" ? "is-active" : ""} onClick={() => setActiveTab("noah")}>
          <ModuleIcon module="noah" variant="icon" size={24} decorative />
          <span>Noah Ops</span>
        </button>
      </nav>
      <div role="tabpanel" hidden={activeTab !== "access"}>
        {activeTab === "access" ? <AdminManager focusOrganizationId={organizationId} /> : null}
      </div>
      <div role="tabpanel" hidden={activeTab !== "noah"}>
        {activeTab === "noah" ? <NoahOpsPanel /> : null}
      </div>
    </section>
  );
}

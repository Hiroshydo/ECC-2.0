import type { ReactNode } from "react";

import { ModuleSeal } from "@/modules/core/canaa/components/ModuleSeal";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  moduleSeal?: "khatam" | "hiram";
};

export function Section({ title, subtitle, children, icon, action, moduleSeal }: Props) {
  return (
    <section className="ui-section" aria-label={title}>
      <div className="ui-section__heading">
        <div className="ui-section__copy">
          {icon ? <span className="ui-section__icon" aria-hidden="true">{icon}</span> : null}
          <div className="ui-section__text">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        {action ? <div className="ui-section__action">{action}</div> : null}
      </div>
      <div className="ui-section__card">
        {children}
        {moduleSeal ? <div className="ui-section__seal"><ModuleSeal module={moduleSeal} /></div> : null}
      </div>
    </section>
  );
}

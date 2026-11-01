import type { ReactNode } from "react";
import { UsersRound } from "lucide-react";

import type { LocalOperator } from "@/modules/core/canaa/types";

export function LocalTeamManager({ members = [], inviteAction }: { members?: LocalOperator[]; inviteAction?: ReactNode }) {
  return (
    <div className="local-team">
      {members.length === 0 ? (
        <div className="local-team__empty-state">
          <UsersRound size={22} strokeWidth={1.6} aria-hidden="true" />
          <p>Nenhum operador cadastrado.</p>
          {inviteAction}
        </div>
      ) : (
        <table className="local-team__table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Papel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td className="local-team__name">{member.name}</td>
                <td>{member.email}</td>
                <td className="local-team__role">{member.role}</td>
                <td>
                  <span className={`local-team__status${member.active ? " is-active" : ""}`}>
                    {member.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

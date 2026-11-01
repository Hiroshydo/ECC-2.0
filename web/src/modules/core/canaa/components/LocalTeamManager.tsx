import type { ReactNode } from "react";
import { UsersRound } from "lucide-react";

import type { LocalOperator } from "@/modules/core/canaa/types";

export function LocalTeamManager({ members = [], inviteAction, loadError }: { members?: LocalOperator[]; inviteAction?: ReactNode; loadError?: string | null }) {
  return (
    <div className="local-team">
      {loadError ? (
        <div className="local-team__empty-state" role="status">{loadError}</div>
      ) : members.length === 0 ? (
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
                <td className="local-team__role">{roleLabel(member.role)}</td>
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

function roleLabel(role: LocalOperator["role"]): string {
  const labels: Record<LocalOperator["role"], string> = {
    central_admin: "Pastor / Diretor responsável",
    congregation_admin: "Secretário / Coordenador",
    treasurer: "Tesoureiro / Gestor financeiro",
    auditor: "Auditor / Conselho fiscal",
    viewer: "Visualizador",
  };
  return labels[role];
}

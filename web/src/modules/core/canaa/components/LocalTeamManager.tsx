import type { LocalOperator } from "@/modules/core/canaa/types";

export function LocalTeamManager({ members = [] }: { members?: LocalOperator[] }) {
  return (
    <div className="local-team">
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
          {members.length === 0 ? (
            <tr>
              <td colSpan={4} className="local-team__empty">Nenhum operador cadastrado.</td>
            </tr>
          ) : (
            members.map((member) => (
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

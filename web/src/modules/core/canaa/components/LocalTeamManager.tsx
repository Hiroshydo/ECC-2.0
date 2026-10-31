import { ModuleIcon } from "@/components/brand/ModuleIcon";
import type { LocalOperator } from "@/modules/core/canaa/types";

export function LocalTeamManager({ members = [] }: { members?: LocalOperator[] }) {
  return (
    <div style={{ width: "100%", border: "1px solid #dfeae6", borderRadius: 18, background: "#fff", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 0" }}>
        <ModuleIcon module="canaa-access" variant="icon" size={28} decorative />
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Equipe local</h3>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f3f8f5" }}>
          <tr>
            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#52645d", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nome</th>
            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#52645d", textTransform: "uppercase", letterSpacing: "0.06em" }}>E-mail</th>
            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#52645d", textTransform: "uppercase", letterSpacing: "0.06em" }}>Papel</th>
            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#52645d", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "18px 16px", color: "#52645d", fontSize: 14, textAlign: "center" }}>Nenhum operador cadastrado.</td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member.id} style={{ borderTop: "1px solid #edf3f1" }}>
                <td style={{ padding: "12px 16px", color: "#0b1f1a", fontWeight: 600 }}>{member.name}</td>
                <td style={{ padding: "12px 16px", color: "#52645d" }}>{member.email}</td>
                <td style={{ padding: "12px 16px", color: "#52645d", textTransform: "capitalize" }}>{member.role}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ display: "inline-flex", borderRadius: 999, padding: "4px 10px", background: member.active ? "#dcefe7" : "#edf2ef", color: member.active ? "#0f6a50" : "#52645d", fontSize: 11, fontWeight: 700 }}>
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

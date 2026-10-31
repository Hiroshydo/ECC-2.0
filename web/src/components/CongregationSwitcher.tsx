"use client";

import { useRouter } from "next/navigation";

import { getVocabulary } from "@/domain/vocabulary";
import type { AuthenticatedMembership } from "@/lib/auth/session";

const ACTIVE_CONGREGATION_COOKIE = "active_congregation_id";

export function CongregationSwitcher({ memberships, activeId }: { memberships: AuthenticatedMembership[]; activeId: string | null }) {
  const router = useRouter();
  const terms = getVocabulary(memberships.find((item) => item.congregationId === activeId)?.congregation.organizationType ?? memberships[0]?.congregation.organizationType);

  function selectCongregation(congregationId: string) {
    document.cookie = `${ACTIVE_CONGREGATION_COOKIE}=${encodeURIComponent(congregationId)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  function formatLocation(congregation: AuthenticatedMembership["congregation"]) {
    const city = congregation.city?.trim();
    const state = congregation.state?.trim();
    if (city && state) return `${city}/${state}`;
    if (city) return city;
    if (state) return state;
    return "Local não informado";
  }

  if (memberships.length === 0) {
    return <div className="congregation-switcher"><span className="congregation-label"><BuildingIcon /><span className="congregation-label-text">{terms.unitSingular.toLocaleUpperCase("pt-BR")} ATIVA</span></span><strong>Nenhuma unidade disponível</strong></div>;
  }

  const churchOptions = memberships.filter(({ congregation }) => congregation.organizationType !== "ong");
  const ngoOptions = memberships.filter(({ congregation }) => congregation.organizationType === "ong");

  return (
    <div className="congregation-switcher" role="group" aria-label="Seleção de congregação ativa">
      <span className="congregation-label"><BuildingIcon /><span className="congregation-label-text">{terms.unitSingular.toLocaleUpperCase("pt-BR")} ATIVA</span></span>
      <div className="congregation-select-shell">
        <select value={activeId ?? memberships[0].congregationId} onChange={(event) => selectCongregation(event.target.value)} aria-label="Selecionar unidade ativa">
          {churchOptions.length > 0 && (
            <optgroup label="Igrejas & Sedes">
              {churchOptions.map(({ congregation }) => (
                <option key={congregation.id} value={congregation.id}>{congregation.name} — {formatLocation(congregation)}</option>
              ))}
            </optgroup>
          )}
          {ngoOptions.length > 0 && (
            <optgroup label="Projetos Sociais & ONGs">
              {ngoOptions.map(({ congregation }) => (
                <option key={congregation.id} value={congregation.id}>{congregation.name} — {formatLocation(congregation)}</option>
              ))}
            </optgroup>
          )}
        </select>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="congregation-select-chevron"><path d="m6 9 6 6 6-6" /></svg>
      </div>
    </div>
  );
}

function BuildingIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M11 21v-3h2v3" /></svg>;
}
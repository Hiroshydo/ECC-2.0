export type OrganizationType = "church" | "ong";
export type OrganizationLevel = "national_hq" | "state_hq" | "sub_hq" | "local_congregation";

export type OrganizationVocabulary = {
  unitSingular: string;
  unitPlural: string;
  recurringIncome: string;
  freeIncome: string;
  campaigns: string;
  headquarters: string;
  gathering: string;
  leader: string;
  dashboardEntries: string;
};

const vocabulary: Record<OrganizationType, OrganizationVocabulary> = {
  church: {
    unitSingular: "Congregação",
    unitPlural: "Congregações",
    recurringIncome: "Dízimos",
    freeIncome: "Ofertas",
    campaigns: "Missões",
    headquarters: "Sede",
    gathering: "Culto",
    leader: "Pastor",
    dashboardEntries: "Dízimos e ofertas",
  },
  ong: {
    unitSingular: "Unidade / Projeto",
    unitPlural: "Unidades / Projetos",
    recurringIncome: "Doações Recorrentes",
    freeIncome: "Doações Livres",
    campaigns: "Campanhas / Editais",
    headquarters: "Matriz",
    gathering: "Atividade",
    leader: "Diretor",
    dashboardEntries: "Doações",
  },
};

export function getVocabulary(type: OrganizationType | null | undefined): OrganizationVocabulary {
  return vocabulary[type ?? "church"];
}
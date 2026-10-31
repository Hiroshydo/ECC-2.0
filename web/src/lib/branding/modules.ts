export type BrandModule =
  | "ecclesia" | "khatam" | "gideon" | "shofeet" | "hiram" | "enoch"
  | "elias" | "sefer" | "canaa-access" | "canaa-local" | "noah";

export type BrandVariant = "icon" | "badge" | "logo";

const BASE = "/branding/Modulos";

const DIR: Record<BrandVariant, string> = {
  logo: "1_Logos_Completas_Com_Nomes",
  badge: "2_Badges_Com_Nome_Interno",
  icon: "3_Icones_Puros_Sem_Texto",
};

const FILE: Record<BrandModule, string> = {
  ecclesia: "00-ecclesia-finance-core.svg",
  khatam: "01-khatam-authenticate.svg",
  gideon: "02-gideon-security.svg",
  shofeet: "03-shofeet-note.svg",
  hiram: "04-hiram-architecture.svg",
  enoch: "05-enoch-audit.svg",
  elias: "06-elias-temp.svg",
  sefer: "07-sefer-reports.svg",
  "canaa-access": "08-canaa-access.svg",
  "canaa-local": "09-canaa-local.svg",
  noah: "10-noah-developer.svg",
};

export const BRAND_LABEL: Record<BrandModule, string> = {
  ecclesia: "Ecclesia Finance",
  khatam: "Khatam Authenticate",
  gideon: "Gideon Security",
  shofeet: "Shofeet Note",
  hiram: "Hiram Architecture",
  enoch: "Enoch Audit",
  elias: "Elias Temp",
  sefer: "Sefer Reports",
  "canaa-access": "Canaã Access",
  "canaa-local": "Canaã Local",
  noah: "Noah Developer",
};

export const brandSrc = (m: BrandModule, v: BrandVariant = "icon") => `${BASE}/${DIR[v]}/${FILE[m]}`;

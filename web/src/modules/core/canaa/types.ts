export type Role = "dev_master" | "pastor_local" | "tesoureiro" | "secretario";

export type ModuleName = "hiram" | "elias" | "enoch" | "sefer" | "khatam";
export type ModuleHealth = "ok" | "degraded" | "down";

export type ModuleTelemetry = {
  module: ModuleName;
  health: ModuleHealth;
  latencyMs?: number;
  updatedAt: string;
};

export type CongregationNodeData = {
  id: string;
  name: string;
  parentId: string | null;
  active: boolean;
  seatsUsed: number;
  seatsTotal: number;
} & Record<string, unknown>;

export type LocalOperator = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export const HOME_BY_ROLE: Record<Role, string> = {
  dev_master: "/noah-ops",
  pastor_local: "/canaa",
  tesoureiro: "/",
  secretario: "/",
};

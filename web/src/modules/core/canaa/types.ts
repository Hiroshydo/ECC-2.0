import type { Role } from "@/domain/access";
import type { OrganizationType } from "@/domain/vocabulary";

export type ModuleName = "hiram" | "elias" | "enoch" | "sefer" | "khatam";
export type ModuleHealth = "ok" | "degraded" | "down" | "unknown";

export type ModuleTelemetry = {
  module: ModuleName;
  health: ModuleHealth;
  latencyMs?: number;
  updatedAt?: string;
};

export type CongregationNodeData = {
  id: string;
  name: string;
  parentId: string | null;
  parentLabel: string;
  active: boolean;
  organizationType?: OrganizationType;
} & Record<string, unknown>;

export type LocalOperator = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

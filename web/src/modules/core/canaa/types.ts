import type { Role } from "@/domain/access";

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
  parentName?: string | null;
  active: boolean;
  organizationType?: "church" | "ong";
  organizationLevel?: "national_hq" | "state_hq" | "sub_hq" | "local_congregation";
  licenseActive?: boolean;
  seatsUsed?: number;
  seatsTotal?: number;
  editable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onDisconnect?: () => void;
} & Record<string, unknown>;

export type LocalOperator = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

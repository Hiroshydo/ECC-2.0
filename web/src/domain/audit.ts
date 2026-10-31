import type { CongregationId, UserId } from "./finance";

export type AuditEvent = {
  id: string;
  actorId: UserId;
  congregationId?: CongregationId;
  action: string;
  entity: string;
  entityId: string;
  occurredAt: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
};

export function appendAuditEvent(events: readonly AuditEvent[], event: AuditEvent): readonly AuditEvent[] {
  return Object.freeze([...events, Object.freeze(event)]);
}

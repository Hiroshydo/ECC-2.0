export type LicenseInfo = {
  seatsTotal: number;
  seatsUsed: number;
  expiresAt: string;
  status?: "active" | "grace_period" | "blocked";
  cycleDays?: number;
};

export type SeatCheckResult = {
  allowed: boolean;
  reason?: "expired" | "quota_exceeded" | "blocked";
  remaining: number;
};

export function checkSeat(license: LicenseInfo, now = new Date()): SeatCheckResult {
  const total = Math.max(0, license.seatsTotal);
  const used = Math.max(0, Math.min(license.seatsUsed, total));
  const expiresAt = new Date(license.expiresAt);
  const remaining = Math.max(0, total - used);

  if (license.status === "blocked") {
    return { allowed: false, reason: "blocked", remaining };
  }
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    return { allowed: false, reason: "expired", remaining: 0 };
  }

  if (used >= total) {
    return { allowed: false, reason: "quota_exceeded", remaining };
  }

  return { allowed: true, remaining };
}

export function usagePercent(license: LicenseInfo): number {
  const total = Math.max(1, license.seatsTotal);
  const used = Math.max(0, Math.min(license.seatsUsed, total));
  const value = (used / total) * 100;
  return Math.min(100, Math.max(0, value));
}

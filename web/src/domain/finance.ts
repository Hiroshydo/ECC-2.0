export type CongregationId = string;
export type UserId = string;
export type MoneyCents = number;

export type EntryCategory =
  | "tithe"
  | "offering"
  | "donation"
  | "campaign"
  | "event"
  | "canteen"
  | "sale"
  | "rent"
  | "reimbursement"
  | "other";

export type PaymentMethod = "cash" | "pix" | "transfer" | "card" | "check" | "other";

export type FinancialEntry = {
  id: string;
  congregationId: CongregationId;
  occurredOn: string;
  amount: MoneyCents;
  category: EntryCategory;
  origin: string;
  paymentMethod: PaymentMethod;
  purpose?: string;
  recordedBy: UserId;
};

export type Expense = {
  id: string;
  congregationId: CongregationId;
  occurredOn: string;
  amount: MoneyCents;
  category: string;
  description: string;
  vendor?: string;
  paymentMethod: PaymentMethod;
  purpose?: string;
  costCenter?: string;
  approvedBy?: UserId;
  recordedBy: UserId;
};

export type TransferStatus =
  | "planned"
  | "requested"
  | "approved"
  | "sent"
  | "confirmed"
  | "questioned"
  | "cancelled";

export type HeadquartersTransfer = {
  id: string;
  originCongregationId: CongregationId;
  destinationName: string;
  referencePeriod: string;
  amountSent?: MoneyCents;
  amountReceived?: MoneyCents;
  occurredOn?: string;
  status: TransferStatus;
  reason: string;
  requestedBy: UserId;
  approvedBy?: UserId;
};

export type ClosingAdjustment = {
  id: string;
  congregationId: CongregationId;
  amount: MoneyCents;
  reason: string;
  createdBy: UserId;
};

export type MonthlyClosing = {
  congregationId: CongregationId;
  referencePeriod: string;
  openingBalance: MoneyCents;
  entries: MoneyCents;
  expenses: MoneyCents;
  transfers: MoneyCents;
  adjustments: MoneyCents;
  closingBalance: MoneyCents;
  status: "open" | "submitted" | "approved" | "questioned" | "closed";
};

export function calculateClosing(input: Omit<MonthlyClosing, "closingBalance">): MonthlyClosing {
  return { ...input, closingBalance: input.openingBalance + input.entries - input.expenses - input.transfers + input.adjustments };
}

export function sumAmounts(amounts: MoneyCents[]): MoneyCents {
  return amounts.reduce((total, amount) => total + amount, 0);
}

"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { callUserFunction } from "@/lib/db/rpc";
import { withUserContext } from "@/lib/db/pool";

export type EntryInput = {
  congregationId: string;
  occurredOn: string;
  amountCents: number;
  category: string;
  origin: string;
  paymentMethod: string;
  purpose?: string;
};

export type ExpenseInput = {
  congregationId: string;
  occurredOn: string;
  amountCents: number;
  category: string;
  description: string;
  vendor?: string;
  paymentMethod: string;
  purpose?: string;
  costCenter?: string;
};

export type TransferInput = {
  originCongregationId: string;
  destinationName: string;
  referencePeriod: string;
  amountSentCents: number;
  reason: string;
  occurredOn?: string;
};

export type CashRegisterInput = { congregationId: string; name: string };
export type CashPeriodInput = { cashRegisterId: string; referencePeriod: string; openingBalanceCents: number };
export type CashMovementInput = { cashPeriodId: string; movementType: "cash_in" | "cash_expense" | "deposit"; amountCents: number; reason: string; idempotencyKey: string };

async function authenticatedUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error("authentication_required");
  return user.id;
}

function requirePositiveAmount(amountCents: number) {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error("amount_must_be_positive_cents");
}

function requireNonNegativeAmount(amountCents: number) {
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) throw new Error("amount_must_be_non_negative_cents");
}

export async function createEntry(input: EntryInput) {
  requirePositiveAmount(input.amountCents);
  const userId = await authenticatedUserId();
  return callUserFunction(userId, "create_entry", {
    p_congregation_id: input.congregationId,
    p_occurred_on: input.occurredOn,
    p_amount_cents: input.amountCents,
    p_category: input.category,
    p_origin: input.origin,
    p_payment_method: input.paymentMethod,
    p_purpose: input.purpose ?? null,
  });
}

export async function createExpense(input: ExpenseInput) {
  requirePositiveAmount(input.amountCents);
  const userId = await authenticatedUserId();
  return callUserFunction(userId, "create_expense", {
    p_congregation_id: input.congregationId,
    p_occurred_on: input.occurredOn,
    p_amount_cents: input.amountCents,
    p_category: input.category,
    p_description: input.description,
    p_vendor: input.vendor ?? null,
    p_payment_method: input.paymentMethod,
    p_purpose: input.purpose ?? null,
    p_cost_center: input.costCenter ?? null,
  });
}

export async function requestTransfer(input: TransferInput) {
  requirePositiveAmount(input.amountSentCents);
  const userId = await authenticatedUserId();
  return callUserFunction(userId, "request_transfer", {
    p_origin_congregation_id: input.originCongregationId,
    p_destination_name: input.destinationName,
    p_reference_period: input.referencePeriod,
    p_amount_sent_cents: input.amountSentCents,
    p_reason: input.reason,
    p_occurred_on: input.occurredOn ?? null,
  });
}

export async function approveExpense(expenseId: string) {
  return callUserFunction(await authenticatedUserId(), "approve_expense", { p_expense_id: expenseId });
}

export async function approveTransfer(transferId: string) {
  return callUserFunction(await authenticatedUserId(), "approve_transfer", { p_transfer_id: transferId });
}

export async function confirmTransfer(transferId: string, amountReceivedCents: number) {
  requirePositiveAmount(amountReceivedCents);
  const userId = await authenticatedUserId();
  return callUserFunction(userId, "confirm_transfer", {
    p_transfer_id: transferId,
    p_amount_received_cents: amountReceivedCents,
  });
}

export async function closeMonthlyPeriod(congregationId: string, referencePeriod: string) {
  const userId = await authenticatedUserId();
  return callUserFunction(userId, "close_monthly_period", {
    p_congregation_id: congregationId,
    p_reference_period: referencePeriod,
  });
}

export async function createCashRegister(input: CashRegisterInput) {
  return callUserFunction(await authenticatedUserId(), "create_cash_register", { p_congregation_id: input.congregationId, p_name: input.name });
}

export async function openCashPeriod(input: CashPeriodInput) {
  requireNonNegativeAmount(input.openingBalanceCents);
  return callUserFunction(await authenticatedUserId(), "open_cash_period", { p_cash_register_id: input.cashRegisterId, p_reference_period: input.referencePeriod, p_opening_balance_cents: input.openingBalanceCents });
}

export async function recordCashMovement(input: CashMovementInput) {
  requirePositiveAmount(input.amountCents);
  return callUserFunction(await authenticatedUserId(), "record_cash_movement", { p_cash_period_id: input.cashPeriodId, p_movement_type: input.movementType, p_amount_cents: input.amountCents, p_reason: input.reason, p_idempotency_key: input.idempotencyKey });
}

export async function listCongregations() {
  const userId = await authenticatedUserId();
  return withUserContext(userId, async (client) => {
    const result = await client.query("select id, name, city, active from public.congregations where active = true order by name");
    return result.rows;
  });
}

export async function listEntries(congregationId: string, from: string, to: string) {
  const userId = await authenticatedUserId();
  return withUserContext(userId, async (client) => {
    const result = await client.query(
      "select * from public.entries where congregation_id = $1 and occurred_on >= $2 and occurred_on <= $3 order by occurred_on desc",
      [congregationId, from, to],
    );
    return result.rows;
  });
}

export async function listExpenses(congregationId: string, from: string, to: string) {
  const userId = await authenticatedUserId();
  return withUserContext(userId, async (client) => {
    const result = await client.query(
      "select * from public.expenses where congregation_id = $1 and occurred_on >= $2 and occurred_on <= $3 order by occurred_on desc",
      [congregationId, from, to],
    );
    return result.rows;
  });
}

export async function listTransfers(congregationId: string, from: string, to: string) {
  const userId = await authenticatedUserId();
  return withUserContext(userId, async (client) => {
    const result = await client.query(
      "select * from public.headquarters_transfers where origin_congregation_id = $1 and reference_period >= $2 and reference_period <= $3 order by reference_period desc",
      [congregationId, from, to],
    );
    return result.rows;
  });
}

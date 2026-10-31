"use server";

import { createClient } from "@/lib/supabase/server";

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

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("authentication_required");
  return supabase;
}

function requirePositiveAmount(amountCents: number) {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error("amount_must_be_positive_cents");
}

function requireNonNegativeAmount(amountCents: number) {
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) throw new Error("amount_must_be_non_negative_cents");
}

export async function createEntry(input: EntryInput) {
  requirePositiveAmount(input.amountCents);
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("create_entry", {
    p_congregation_id: input.congregationId,
    p_occurred_on: input.occurredOn,
    p_amount_cents: input.amountCents,
    p_category: input.category,
    p_origin: input.origin,
    p_payment_method: input.paymentMethod,
    p_purpose: input.purpose ?? null,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function createExpense(input: ExpenseInput) {
  requirePositiveAmount(input.amountCents);
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("create_expense", {
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
  if (error) throw new Error(error.message);
  return data;
}

export async function requestTransfer(input: TransferInput) {
  requirePositiveAmount(input.amountSentCents);
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("request_transfer", {
    p_origin_congregation_id: input.originCongregationId,
    p_destination_name: input.destinationName,
    p_reference_period: input.referencePeriod,
    p_amount_sent_cents: input.amountSentCents,
    p_reason: input.reason,
    p_occurred_on: input.occurredOn ?? null,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function approveExpense(expenseId: string) {
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("approve_expense", { p_expense_id: expenseId });
  if (error) throw new Error(error.message);
  return data;
}

export async function approveTransfer(transferId: string) {
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("approve_transfer", { p_transfer_id: transferId });
  if (error) throw new Error(error.message);
  return data;
}

export async function confirmTransfer(transferId: string, amountReceivedCents: number) {
  requirePositiveAmount(amountReceivedCents);
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("confirm_transfer", {
    p_transfer_id: transferId,
    p_amount_received_cents: amountReceivedCents,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function closeMonthlyPeriod(congregationId: string, referencePeriod: string) {
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("close_monthly_period", {
    p_congregation_id: congregationId,
    p_reference_period: referencePeriod,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function createCashRegister(input: CashRegisterInput) {
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("create_cash_register", { p_congregation_id: input.congregationId, p_name: input.name });
  if (error) throw new Error(error.message);
  return data;
}

export async function openCashPeriod(input: CashPeriodInput) {
  requireNonNegativeAmount(input.openingBalanceCents);
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("open_cash_period", { p_cash_register_id: input.cashRegisterId, p_reference_period: input.referencePeriod, p_opening_balance_cents: input.openingBalanceCents });
  if (error) throw new Error(error.message);
  return data;
}

export async function recordCashMovement(input: CashMovementInput) {
  requirePositiveAmount(input.amountCents);
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.rpc("record_cash_movement", { p_cash_period_id: input.cashPeriodId, p_movement_type: input.movementType, p_amount_cents: input.amountCents, p_reason: input.reason, p_idempotency_key: input.idempotencyKey });
  if (error) throw new Error(error.message);
  return data;
}

export async function listCongregations() {
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.from("congregations").select("id, name, city, active").eq("active", true).order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function listEntries(congregationId: string, from: string, to: string) {
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.from("entries").select("*").eq("congregation_id", congregationId).gte("occurred_on", from).lte("occurred_on", to).order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function listExpenses(congregationId: string, from: string, to: string) {
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.from("expenses").select("*").eq("congregation_id", congregationId).gte("occurred_on", from).lte("occurred_on", to).order("occurred_on", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function listTransfers(congregationId: string, from: string, to: string) {
  const supabase = await authenticatedClient();
  const { data, error } = await supabase.from("headquarters_transfers").select("*").eq("origin_congregation_id", congregationId).gte("reference_period", from).lte("reference_period", to).order("reference_period", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

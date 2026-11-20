import { NextResponse } from "next/server";

import { authenticatedRpc } from "@/lib/api/rpc";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const methods = new Set(["pix", "transfer", "deposit", "cash"]);

export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "transfer_send_payload_invalid" }, { status: 400 });
    }
    input = body as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof input.transferId !== "string" || !uuidPattern.test(input.transferId)) {
    return NextResponse.json({ error: "transfer_id_invalid" }, { status: 400 });
  }
  if (typeof input.idempotencyKey !== "string" || !uuidPattern.test(input.idempotencyKey)) {
    return NextResponse.json({ error: "transfer_send_idempotency_key_invalid" }, { status: 400 });
  }
  if (typeof input.occurredOn !== "string" || !datePattern.test(input.occurredOn)) {
    return NextResponse.json({ error: "transfer_send_date_invalid" }, { status: 400 });
  }
  if (typeof input.amountSentCents !== "number" || !Number.isSafeInteger(input.amountSentCents) || input.amountSentCents <= 0) {
    return NextResponse.json({ error: "transfer_send_amount_invalid" }, { status: 400 });
  }
  if (typeof input.method !== "string" || !methods.has(input.method)) {
    return NextResponse.json({ error: "transfer_send_method_invalid" }, { status: 400 });
  }
  if (input.reference !== undefined && input.reference !== null && typeof input.reference !== "string") {
    return NextResponse.json({ error: "transfer_send_reference_invalid" }, { status: 400 });
  }
  if (input.note !== undefined && input.note !== null && typeof input.note !== "string") {
    return NextResponse.json({ error: "transfer_send_note_invalid" }, { status: 400 });
  }

  return authenticatedRpc("mark_transfer_sent", {
    p_transfer_id: input.transferId,
    p_occurred_on: input.occurredOn,
    p_amount_sent_cents: input.amountSentCents,
    p_method: input.method,
    p_reference: input.reference ?? null,
    p_note: input.note ?? null,
    p_idempotency_key: input.idempotencyKey,
  });
}

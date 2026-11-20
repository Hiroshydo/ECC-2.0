import assert from "node:assert/strict";
import test from "node:test";

import { collectPages } from "./pagination.ts";

test("collectPages includes every record beyond two full pages", async () => {
  const records = Array.from({ length: 60 }, (_, index) => index + 1);
  const requestedPages = [];
  const collected = await collectPages(async (page, pageSize) => {
    requestedPages.push(page);
    return records.slice((page - 1) * pageSize, page * pageSize);
  }, 25);

  assert.deepEqual(collected, records);
  assert.deepEqual(requestedPages, [1, 2, 3]);
});

test("collectPages requests the empty terminal page for exact page multiples", async () => {
  const records = Array.from({ length: 50 }, (_, index) => index + 1);
  const requestedPages = [];
  const collected = await collectPages(async (page, pageSize) => {
    requestedPages.push(page);
    return records.slice((page - 1) * pageSize, page * pageSize);
  }, 25);

  assert.deepEqual(collected, records);
  assert.deepEqual(requestedPages, [1, 2, 3]);
});

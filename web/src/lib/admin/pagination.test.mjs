import assert from "node:assert/strict";
import test from "node:test";

import { collectServerPages } from "./pagination.ts";

test("collectServerPages includes all records in three exact pages", async () => {
  const records = Array.from({ length: 60 }, (_, index) => index + 1);
  const requestedPages = [];
  const pageLengths = [];
  const result = await collectServerPages(async (page, pageSize) => {
    requestedPages.push(page);
    const data = records.slice((page - 1) * pageSize, page * pageSize);
    pageLengths.push(data.length);
    return {
      data,
      total: records.length,
      page,
      pageSize,
    };
  }, 25);

  assert.deepEqual(result.items, records);
  assert.equal(result.total, 60);
  assert.equal(new Set(result.items).size, 60);
  assert.deepEqual(requestedPages, [1, 2, 3]);
  assert.deepEqual(pageLengths, [25, 25, 10]);
});

test("collectServerPages rejects a missing record instead of silently truncating", async () => {
  await assert.rejects(
    collectServerPages(async (page, pageSize) => ({
      data: page === 1 ? Array.from({ length: 24 }, (_, index) => index + 1) : [],
      total: 60,
      page,
      pageSize,
    }), 25),
    { message: "admin_pagination_inconsistent" },
  );
});

test("collectServerPages returns an empty collection with a zero total", async () => {
  const result = await collectServerPages(async (page, pageSize) => ({
    data: [],
    total: 0,
    page,
    pageSize,
  }), 25);

  assert.deepEqual(result, { items: [], total: 0 });
});

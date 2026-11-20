import type { AdminPage } from "./types";

export async function collectServerPages<T>(
  loadPage: (page: number, pageSize: number) => Promise<AdminPage<T>>,
  pageSize: number,
): Promise<{ items: T[]; total: number }> {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error("invalid_page_size");

  const firstPage = await loadPage(1, pageSize);
  validatePage(firstPage, 1, pageSize, firstPage.total);
  const results = [...firstPage.data];
  const pageCount = Math.ceil(firstPage.total / pageSize);

  for (let page = 2; page <= pageCount; page += 1) {
    const result = await loadPage(page, pageSize);
    validatePage(result, page, pageSize, firstPage.total);
    results.push(...result.data);
  }
  if (results.length !== firstPage.total) throw new Error("admin_pagination_incomplete");
  return { items: results, total: firstPage.total };
}

function validatePage<T>(result: AdminPage<T>, page: number, pageSize: number, total: number): void {
  const expectedLength = Math.max(0, Math.min(pageSize, total - (page - 1) * pageSize));
  if (
    result.page !== page
    || result.pageSize !== pageSize
    || result.total !== total
    || result.data.length !== expectedLength
  ) {
    throw new Error("admin_pagination_inconsistent");
  }
}

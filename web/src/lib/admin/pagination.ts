export async function collectPages<T>(
  loadPage: (page: number, pageSize: number) => Promise<T[]>,
  pageSize: number,
): Promise<T[]> {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error("invalid_page_size");

  const results: T[] = [];
  for (let page = 1; ; page += 1) {
    const items = await loadPage(page, pageSize);
    results.push(...items);
    if (items.length < pageSize) return results;
  }
}

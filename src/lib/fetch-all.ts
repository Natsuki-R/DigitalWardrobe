// Supabase (PostgREST) returns at most 1,000 rows per request by default and
// silently drops the rest. Use this for any query that must see every row.

const PAGE_SIZE = 1000;

interface PageResult<T> {
  data: T[] | null;
  error: unknown;
}

/**
 * Reads every row of a query by requesting consecutive ranges until a short
 * page comes back.
 *
 * `page` must build the query with `.range(from, to)` and a stable, unique
 * ordering (e.g. `.order("id")`) — without one, rows can repeat or go missing
 * between pages.
 */
export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize: number = PAGE_SIZE
): Promise<PageResult<T>> {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error || !data) return { data: null, error: error ?? null };

    rows.push(...data);
    if (data.length < pageSize) return { data: rows, error: null };
  }
}

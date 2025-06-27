import type { PaginatedResponse } from '../types/relay.js';

export async function fetchAllPages<T>(
  fetcher: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  _filters: any,
  maxItems: number = 10000
): Promise<T[]> {
  const allItems: T[] = [];
  let page = 1;
  const limit = 100; // Max batch size

  while (true) {
    const response = await fetcher(page, limit);
    allItems.push(...response.data);

    if (!response.pagination.hasMore || allItems.length >= maxItems) {
      if (allItems.length >= maxItems) {
        console.warn(`Reached maximum item limit of ${maxItems}`);
      }
      break;
    }

    page++;
  }

  return allItems;
}

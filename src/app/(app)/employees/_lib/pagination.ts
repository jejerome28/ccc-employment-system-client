type Meta = { current_page: number; last_page: number };

// A key is omitted when it would point at the current page or outside 1..last_page.
export function pageLinks({ current_page: c, last_page: l }: Meta) {
  const links: { first?: number; prev?: number; next?: number; last?: number } = {};
  if (c > 1) links.first = 1;
  if (c > 1 && c - 1 <= l) links.prev = c - 1;
  if (c < l) links.next = c + 1;
  if (c < l) links.last = l;
  return links;
}

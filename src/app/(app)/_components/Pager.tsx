import Link from "next/link";
import { pageLinks } from "@/app/_lib/pagination";
import type { PageMeta } from "@/app/_lib/types";

export function Pager({ meta, href, empty }: { meta: PageMeta; href: (n: number) => string; empty: boolean }) {
  const links = pageLinks(meta);
  const a = "text-royal hover:text-navy underline underline-offset-2";
  return (
    <>
      {empty && meta.current_page > meta.last_page && (
        <p className="mt-4 text-sm text-muted">
          No rows on this page. <Link href={href(1)} className={a}>Go to page 1</Link>
        </p>
      )}

      {meta.last_page > 1 && (
        <nav className="mt-4 flex items-center gap-3 text-sm">
          {links.first && <Link href={href(links.first)} className={a}>First</Link>}
          {links.prev && <Link href={href(links.prev)} className={a}>Previous</Link>}
          <span className="text-muted tnum">Page {meta.current_page} of {meta.last_page}</span>
          {links.next && <Link href={href(links.next)} className={a}>Next</Link>}
          {links.last && <Link href={href(links.last)} className={a}>Last</Link>}
        </nav>
      )}
    </>
  );
}

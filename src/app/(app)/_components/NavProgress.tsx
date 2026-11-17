"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Click = Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">;

const sameApp = (to: URL, here: URL) => to.origin === here.origin && to.pathname + to.search !== here.pathname + here.search;

export function linkStarts(a: HTMLAnchorElement, e: Click, here: URL): boolean {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-no-progress")) return false;
  return sameApp(new URL(a.href, here), here);
}

export function formStarts(form: HTMLFormElement, here: URL): boolean {
  if (form.hasAttribute("data-no-progress")) return false;
  if ((form.getAttribute("method") ?? "get").toLowerCase() !== "get") return false;
  const action = form.getAttribute("action") ?? "";
  if (action.startsWith("javascript:")) return false;
  const to = new URL(action || here.pathname, here);
  to.search = new URLSearchParams(Array.from(new FormData(form), ([k, v]) => [k, String(v)])).toString();
  return sameApp(to, here);
}

export function NavProgress() {
  const current = `${usePathname()}?${useSearchParams().toString()}`;
  const [from, setFrom] = useState<string | null>(null);
  const [seen, setSeen] = useState(current);
  if (seen !== current) {
    setSeen(current);
    setFrom(null);
  }
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const here = () => new URL(window.location.href);
    const start = () => {
      const h = here();
      setFrom(`${h.pathname}?${h.searchParams.toString()}`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setFrom(null), 10_000);
    };
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest("a") : null;
      if (a && linkStarts(a, e, here())) start();
    };
    const onSubmit = (e: SubmitEvent) => {
      if (e.target instanceof HTMLFormElement && formStarts(e.target, here())) start();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      clearTimeout(timer.current);
    };
  }, []);

  if (from !== current) return null;
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-1">
      <div className="h-full w-4/5 origin-left bg-gold motion-safe:animate-[nav-progress_8s_ease-out_forwards]" />
    </div>
  );
}

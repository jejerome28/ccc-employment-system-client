import { Suspense, type ReactNode } from "react";
import Loading from "../loading";

export async function KeyedBySearch({ searchParams, children }: { searchParams: Promise<Record<string, string | string[] | undefined>>; children: ReactNode }) {
  return (
    <Suspense key={JSON.stringify(await searchParams)} fallback={<Loading />}>
      {children}
    </Suspense>
  );
}

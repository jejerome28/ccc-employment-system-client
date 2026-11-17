import type { RowError } from "@/app/(app)/attendance/_actions/import.action";

const th = "px-4 py-2 font-medium";
const td = "px-4 py-2";

export function RowErrors({ rows }: { rows: RowError[] }) {
  if (rows.length === 0) return null;
  return (
    <section>
      <h2 className="font-semibold mb-2">Nothing was imported</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white border border-line rounded">
          <thead className="text-left text-xs text-muted border-b border-line">
            <tr><th className={th}>Line</th><th className={th}>Problem</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((e, i) => (
              <tr key={i}><td className={`${td} tnum`}>{e.line}</td><td className={td}>{e.message}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

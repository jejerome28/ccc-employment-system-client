const block = "rounded bg-line motion-safe:animate-pulse";

export default function Loading() {
  return (
    <div role="status">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true">
        <div className="mb-6">
          <div className={`${block} h-7 w-48`} />
          <div className={`${block} mt-2 h-4 w-72 max-w-full`} />
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${block} h-20`} />
          ))}
        </div>
        <div className="space-y-2 rounded border border-line bg-white p-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`${block} h-5`} />
          ))}
        </div>
      </div>
    </div>
  );
}

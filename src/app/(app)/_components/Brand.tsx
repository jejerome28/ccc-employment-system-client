import Image from "next/image";

export function Brand({ size }: { size: "sm" | "md" }) {
  const h = size === "sm" ? 36 : 46;
  return (
    <div className="flex items-center gap-3">
      <Image src="/brand/ccc-logo.png" alt="City College of Calamba shield" width={Math.round((h * 216) / 204)} height={h} />
      <div className="leading-tight">
        <p className="font-wordmark text-sm text-white">CITY COLLEGE OF CALAMBA</p>
        <p className="text-gold text-xs font-semibold">HRDU · Staff Time Records</p>
      </div>
    </div>
  );
}

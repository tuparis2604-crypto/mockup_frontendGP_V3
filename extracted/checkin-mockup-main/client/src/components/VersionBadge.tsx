export type Version = "V1" | "V2" | "V3";

const VERSION_CONFIG: Record<Version, { label: string; className: string }> = {
  V1: { label: "V1 · MVP", className: "bg-blue-50 text-blue-700 border-blue-200" },
  V2: { label: "V2 · Operação", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  V3: { label: "V3 · Futuro", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function VersionBadge({ version }: { version: Version }) {
  const cfg = VERSION_CONFIG[version];
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-tight ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

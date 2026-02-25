import type { RiskHeatmapData } from "@/lib/kidney-simulation";

interface RiskHeatmapProps {
  data: RiskHeatmapData;
  comparisonData?: RiskHeatmapData;
}

function getColor(value: number): string {
  if (value >= 80) return "hsl(var(--medical-green))";
  if (value >= 60) return "hsl(var(--medical-amber))";
  return "hsl(var(--medical-red))";
}

function getBgColor(value: number): string {
  if (value >= 80) return "hsl(var(--medical-green-light))";
  if (value >= 60) return "hsl(var(--medical-amber-light))";
  return "hsl(var(--medical-red-light))";
}

const REGIONS = [
  { key: "glomerular" as const, label: "Glomerular", desc: "Filtration units" },
  { key: "tubular" as const, label: "Tubular", desc: "Reabsorption" },
  { key: "vascular" as const, label: "Vascular", desc: "Blood supply" },
  { key: "interstitial" as const, label: "Interstitial", desc: "Tissue health" },
  { key: "collecting" as const, label: "Collecting", desc: "Urine collection" },
  { key: "cortex" as const, label: "Cortex", desc: "Outer layer" },
  { key: "medulla" as const, label: "Medulla", desc: "Inner layer" },
];

export default function RiskHeatmap({ data, comparisonData }: RiskHeatmapProps) {
  return (
    <div className="medical-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Kidney Region Health Map</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {REGIONS.map(({ key, label, desc }) => {
          const val = Math.round(data[key]);
          const delta = comparisonData ? Math.round(data[key] - comparisonData[key]) : undefined;
          return (
            <div
              key={key}
              className="relative rounded-xl p-3 border transition-all"
              style={{
                borderColor: getColor(val),
                backgroundColor: getBgColor(val),
              }}
            >
              <p className="text-xs font-semibold" style={{ color: getColor(val) }}>{label}</p>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl font-bold font-mono" style={{ color: getColor(val) }}>
                  {val}
                </span>
                <span className="text-[10px] text-muted-foreground">%</span>
                {delta !== undefined && delta !== 0 && (
                  <span className={`text-[10px] font-medium ml-1 ${delta > 0 ? "text-medical-green" : "text-medical-red"}`}>
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                )}
              </div>
              {/* Mini bar */}
              <div className="mt-2 h-1.5 rounded-full bg-background/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${val}%`,
                    backgroundColor: getColor(val),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

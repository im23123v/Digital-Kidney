import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { DrugInteraction } from "@/lib/kidney-simulation";

interface DrugInteractionAlertProps {
  interactions: DrugInteraction[];
}

const severityConfig = {
  severe: {
    icon: AlertTriangle,
    bg: "bg-medical-red-light",
    border: "border-medical-red/30",
    text: "text-medical-red",
    label: "SEVERE",
  },
  moderate: {
    icon: AlertCircle,
    bg: "bg-medical-amber-light",
    border: "border-medical-amber/30",
    text: "text-medical-amber",
    label: "MODERATE",
  },
  mild: {
    icon: Info,
    bg: "bg-medical-blue-light",
    border: "border-medical-blue/30",
    text: "text-medical-blue",
    label: "MILD",
  },
};

export default function DrugInteractionAlert({ interactions }: DrugInteractionAlertProps) {
  if (interactions.length === 0) return null;

  // Sort severe first
  const sorted = [...interactions].sort((a, b) => {
    const order = { severe: 0, moderate: 1, mild: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-medical-red flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Drug Interactions Detected ({interactions.length})
      </h3>
      {sorted.map((interaction, i) => {
        const config = severityConfig[interaction.severity];
        const Icon = config.icon;
        return (
          <div
            key={i}
            className={`rounded-lg p-3 border ${config.bg} ${config.border} flex items-start gap-3`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.text}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.text} ${config.bg}`}>
                  {config.label}
                </span>
                <span className="text-xs font-medium text-foreground truncate">
                  {interaction.description}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-medium">{interaction.drug1}</span> + <span className="font-medium">{interaction.drug2}</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{interaction.effect}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

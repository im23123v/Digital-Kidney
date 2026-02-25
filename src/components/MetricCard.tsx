import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status?: "normal" | "warning" | "danger" | "info";
  reference?: string;
  delta?: number;
  className?: string;
}

const statusStyles = {
  normal: "bg-medical-green-light text-medical-green border-medical-green/20",
  warning: "bg-medical-amber-light text-medical-amber border-medical-amber/20",
  danger: "bg-medical-red-light text-medical-red border-medical-red/20",
  info: "bg-medical-blue-light text-medical-blue border-medical-blue/20",
};

const iconBgStyles = {
  normal: "bg-medical-green-light",
  warning: "bg-medical-amber-light",
  danger: "bg-medical-red-light",
  info: "bg-medical-blue-light",
};

const iconColorStyles = {
  normal: "text-medical-green",
  warning: "text-medical-amber",
  danger: "text-medical-red",
  info: "text-medical-blue",
};

export default function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  status = "info",
  reference,
  delta,
  className = "",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`medical-card flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBgStyles[status]}`}>
          <Icon className={`w-4.5 h-4.5 ${iconColorStyles[status]}`} size={18} />
        </div>
        {delta !== undefined && delta !== 0 && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${delta > 0 ? "bg-medical-green-light text-medical-green" : "bg-medical-red-light text-medical-red"}`}>
            {delta > 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
      </div>
      {reference && (
        <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-auto">
          Ref: {reference}
        </p>
      )}
    </motion.div>
  );
}

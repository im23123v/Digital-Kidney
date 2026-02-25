import { motion } from "framer-motion";
import { Trophy, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import type { TreatmentRanking } from "@/lib/kidney-simulation";

interface TreatmentRankingPanelProps {
  rankings: TreatmentRanking[];
}

export default function TreatmentRankingPanel({ rankings }: TreatmentRankingPanelProps) {
  if (rankings.length === 0) return null;

  return (
    <div className="medical-card">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-medical-amber" />
        AI Treatment Rankings
      </h3>
      <div className="space-y-3">
        {rankings.slice(0, 5).map((rank, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl p-3 border transition-all ${
              i === 0
                ? "bg-medical-green-light border-medical-green/20"
                : "bg-secondary/50 border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-medical-green text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {rank.combination.map(t => t.medicine).join(" + ")}
                </span>
              </div>
              <span className={`text-sm font-bold font-mono ${
                rank.score > 20 ? "text-medical-green" : rank.score > 0 ? "text-medical-amber" : "text-medical-red"
              }`}>
                {rank.score > 0 ? "+" : ""}{rank.score}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-medical-green" />
                GFR +{rank.gfrImprovement}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-medical-blue" />
                Risk -{rank.riskReduction}
              </span>
              {rank.interactionCount > 0 && (
                <span className="flex items-center gap-1 text-medical-amber">
                  <AlertTriangle className="w-3 h-3" />
                  {rank.interactionCount} interaction{rank.interactionCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{rank.reasoning}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

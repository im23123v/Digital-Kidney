import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Treatment } from "@/lib/kidney-simulation";
import { Plus, Trash2, Droplets, Zap, Beaker, Wind, Waves } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TreatmentSimulatorProps {
  treatments: Treatment[];
  adjustments: { hydration: number; proteinIntake: number; saltIntake: number; waterIntake: number; exerciseLevel: number };
  baselineHydration: number;
  baselineProtein: number;
  baselineSalt: number;
  baselineWater: number;
  baselineExercise: number;
  onTreatmentsChange: (treatments: Treatment[]) => void;
  onAdjustmentsChange: (adjustments: { hydration: number; proteinIntake: number; saltIntake: number; waterIntake: number; exerciseLevel: number }) => void;
  onSimulate: () => void;
}

const COMMON_MEDICINES = [
  { name: "Losartan 50mg", cat: "ARB" },
  { name: "Enalapril 10mg", cat: "ACEi" },
  { name: "Dapagliflozin 10mg", cat: "SGLT2i" },
  { name: "Empagliflozin 25mg", cat: "SGLT2i" },
  { name: "Allopurinol 300mg", cat: "XO Inhibitor" },
  { name: "Febuxostat 40mg", cat: "XO Inhibitor" },
  { name: "Metformin 500mg", cat: "Antidiabetic" },
  { name: "Amlodipine 5mg", cat: "CCB" },
  { name: "Hydrochlorothiazide 25mg", cat: "Diuretic" },
  { name: "Sodium Bicarbonate 650mg", cat: "Alkalizer" },
  { name: "Furosemide 40mg", cat: "Diuretic" },
  { name: "Telmisartan 40mg", cat: "ARB" },
  { name: "Atorvastatin 20mg", cat: "Statin" },
  { name: "Semaglutide 0.5mg", cat: "GLP-1" },
  { name: "Carvedilol 12.5mg", cat: "Beta Blocker" },
  { name: "Sevelamer 800mg", cat: "Phosphate Binder" },
];

export default function TreatmentSimulator({
  treatments,
  adjustments,
  baselineHydration,
  baselineProtein,
  baselineSalt,
  baselineWater,
  baselineExercise,
  onTreatmentsChange,
  onAdjustmentsChange,
  onSimulate,
}: TreatmentSimulatorProps) {
  const [newMedicine, setNewMedicine] = useState("");

  const addTreatment = (medicine?: string, category?: string) => {
    const med = medicine || newMedicine;
    if (!med.trim()) return;
    const t: Treatment = {
      id: Date.now().toString(),
      medicine: med,
      dosage: "1",
      frequency: "Once daily",
      tablets: 1,
      category,
    };
    onTreatmentsChange([...treatments, t]);
    setNewMedicine("");
  };

  const removeTreatment = (id: string) => onTreatmentsChange(treatments.filter((t) => t.id !== id));

  const updateTreatment = (id: string, field: keyof Treatment, value: any) => {
    onTreatmentsChange(treatments.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  return (
    <div className="space-y-5">
      {/* Medicines */}
      <div className="medical-card">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Beaker className="w-4 h-4 text-primary" />
          Treatment Medicines
        </h3>

        <div className="flex flex-wrap gap-1.5 mb-4 max-h-32 overflow-y-auto">
          {COMMON_MEDICINES.map((m) => (
            <button
              key={m.name}
              onClick={() => addTreatment(m.name, m.cat)}
              className="text-[10px] px-2 py-1 rounded-full bg-secondary hover:bg-accent text-secondary-foreground transition-colors leading-tight"
            >
              + {m.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Custom medicine..."
            value={newMedicine}
            onChange={(e) => setNewMedicine(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTreatment()}
            className="text-sm"
          />
          <Button variant="outline" size="icon" onClick={() => addTreatment()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {treatments.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 mb-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.medicine}</p>
                {t.category && <p className="text-[10px] text-muted-foreground">{t.category}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  className="w-14 text-center text-sm"
                  type="number"
                  min={1}
                  value={t.tablets}
                  onChange={(e) => updateTreatment(t.id, "tablets", Number(e.target.value))}
                />
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">tab/day</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeTreatment(t.id)} className="text-destructive hover:text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lifestyle adjustments */}
      <div className="medical-card">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-5">
          <Droplets className="w-4 h-4 text-medical-blue" />
          Lifestyle Adjustments
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Hydration Level</Label>
              <span className="font-mono text-xs text-muted-foreground">{adjustments.hydration}/10 (was {baselineHydration})</span>
            </div>
            <Slider value={[adjustments.hydration]} onValueChange={([v]) => onAdjustmentsChange({ ...adjustments, hydration: v })} min={1} max={10} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label className="flex items-center gap-1"><Waves className="w-3 h-3" /> Water (L/day)</Label>
              <span className="font-mono text-xs text-muted-foreground">{adjustments.waterIntake}L (was {baselineWater}L)</span>
            </div>
            <Slider value={[adjustments.waterIntake]} onValueChange={([v]) => onAdjustmentsChange({ ...adjustments, waterIntake: v })} min={0.5} max={5} step={0.5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Protein (g/day)</Label>
              <span className="font-mono text-xs text-muted-foreground">{adjustments.proteinIntake}g (was {baselineProtein}g)</span>
            </div>
            <Slider value={[adjustments.proteinIntake]} onValueChange={([v]) => onAdjustmentsChange({ ...adjustments, proteinIntake: v })} min={20} max={150} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Salt (g/day)</Label>
              <span className="font-mono text-xs text-muted-foreground">{adjustments.saltIntake}g (was {baselineSalt}g)</span>
            </div>
            <Slider value={[adjustments.saltIntake]} onValueChange={([v]) => onAdjustmentsChange({ ...adjustments, saltIntake: v })} min={1} max={15} step={0.5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label className="flex items-center gap-1"><Wind className="w-3 h-3" /> Exercise Level</Label>
              <span className="font-mono text-xs text-muted-foreground">{adjustments.exerciseLevel}/10 (was {baselineExercise})</span>
            </div>
            <Slider value={[adjustments.exerciseLevel]} onValueChange={([v]) => onAdjustmentsChange({ ...adjustments, exerciseLevel: v })} min={0} max={10} step={1} />
          </div>
        </div>
      </div>

      <Button onClick={onSimulate} className="w-full gradient-hero border-0 h-11">
        <Zap className="w-4 h-4 mr-2" />
        Run Advanced Simulation
      </Button>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Treatment } from "@/lib/kidney-simulation";
import { Plus, Trash2, Droplets, Zap, Beaker } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TreatmentSimulatorProps {
  treatments: Treatment[];
  adjustments: { hydration: number; proteinIntake: number; saltIntake: number };
  baselineHydration: number;
  baselineProtein: number;
  baselineSalt: number;
  onTreatmentsChange: (treatments: Treatment[]) => void;
  onAdjustmentsChange: (adjustments: { hydration: number; proteinIntake: number; saltIntake: number }) => void;
  onSimulate: () => void;
}

const COMMON_MEDICINES = [
  "Losartan 50mg",
  "Enalapril 10mg",
  "Allopurinol 300mg",
  "Febuxostat 40mg",
  "Metformin 500mg",
  "Amlodipine 5mg",
  "Hydrochlorothiazide 25mg",
  "Sodium Bicarbonate 650mg",
  "Furosemide 40mg",
  "Telmisartan 40mg",
];

export default function TreatmentSimulator({
  treatments,
  adjustments,
  baselineHydration,
  baselineProtein,
  baselineSalt,
  onTreatmentsChange,
  onAdjustmentsChange,
  onSimulate,
}: TreatmentSimulatorProps) {
  const [newMedicine, setNewMedicine] = useState("");

  const addTreatment = (medicine?: string) => {
    const med = medicine || newMedicine;
    if (!med.trim()) return;
    const t: Treatment = {
      id: Date.now().toString(),
      medicine: med,
      dosage: "1",
      frequency: "Once daily",
      tablets: 1,
    };
    onTreatmentsChange([...treatments, t]);
    setNewMedicine("");
  };

  const removeTreatment = (id: string) => onTreatmentsChange(treatments.filter((t) => t.id !== id));

  const updateTreatment = (id: string, field: keyof Treatment, value: any) => {
    onTreatmentsChange(treatments.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  return (
    <div className="space-y-6">
      {/* Medicines */}
      <div className="medical-card">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Beaker className="w-4 h-4 text-primary" />
          Treatment Medicines
        </h3>

        {/* Quick add */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {COMMON_MEDICINES.map((m) => (
            <button
              key={m}
              onClick={() => addTreatment(m)}
              className="text-xs px-2.5 py-1.5 rounded-full bg-secondary hover:bg-accent text-secondary-foreground transition-colors"
            >
              + {m}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Custom medicine name..."
            value={newMedicine}
            onChange={(e) => setNewMedicine(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTreatment()}
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
              <div className="flex-1">
                <p className="text-sm font-medium">{t.medicine}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  className="w-16 text-center text-sm"
                  type="number"
                  min={1}
                  value={t.tablets}
                  onChange={(e) => updateTreatment(t.id, "tablets", Number(e.target.value))}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">tab/day</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeTreatment(t.id)} className="text-destructive hover:text-destructive">
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
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Hydration Level</Label>
              <span className="font-mono text-muted-foreground">{adjustments.hydration}/10 (was {baselineHydration})</span>
            </div>
            <Slider value={[adjustments.hydration]} onValueChange={([v]) => onAdjustmentsChange({ ...adjustments, hydration: v })} min={1} max={10} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Protein Intake (g/day)</Label>
              <span className="font-mono text-muted-foreground">{adjustments.proteinIntake}g (was {baselineProtein}g)</span>
            </div>
            <Slider value={[adjustments.proteinIntake]} onValueChange={([v]) => onAdjustmentsChange({ ...adjustments, proteinIntake: v })} min={20} max={150} step={5} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Salt Intake (g/day)</Label>
              <span className="font-mono text-muted-foreground">{adjustments.saltIntake}g (was {baselineSalt}g)</span>
            </div>
            <Slider value={[adjustments.saltIntake]} onValueChange={([v]) => onAdjustmentsChange({ ...adjustments, saltIntake: v })} min={1} max={15} step={0.5} />
          </div>
        </div>
      </div>

      <Button onClick={onSimulate} className="w-full gradient-hero border-0 h-11">
        <Zap className="w-4 h-4 mr-2" />
        Run Simulation
      </Button>
    </div>
  );
}

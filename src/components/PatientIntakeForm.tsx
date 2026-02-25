import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { PatientData } from "@/lib/kidney-simulation";
import { User, Heart, Droplets, Activity, Pill, FileText, ArrowRight, Beaker, Wind } from "lucide-react";

interface PatientIntakeFormProps {
  onSubmit: (data: PatientData) => void;
}

const CONDITIONS = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hypertension" },
  { id: "kidney_stones", label: "Kidney Stones" },
  { id: "ckd", label: "Chronic Kidney Disease" },
  { id: "uti", label: "Urinary Tract Infection" },
  { id: "gout", label: "Gout" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "obesity", label: "Obesity" },
  { id: "anemia", label: "Anemia" },
  { id: "lupus", label: "Lupus / Autoimmune" },
  { id: "polycystic", label: "Polycystic Kidney Disease" },
  { id: "liver_disease", label: "Liver Disease" },
];

export default function PatientIntakeForm({ onSubmit }: PatientIntakeFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "male" as "male" | "female",
    weight: "",
    height: "",
    systolicBP: "",
    diastolicBP: "",
    glucose: "",
    uricAcid: "",
    hydrationLevel: 5,
    serumCreatinine: "",
    bun: "",
    serumCalcium: "",
    serumPotassium: "",
    serumSodium: "",
    serumPhosphorus: "",
    serumAlbumin: "",
    hemoglobin: "",
    hba1c: "",
    cholesterol: "",
    triglycerides: "",
    urineProtein: "",
    urineAlbumin: "",
    egfrCysC: "",
    parathyroidHormone: "",
    vitaminD: "",
    cReactiveProtein: "",
    existingConditions: [] as string[],
    currentMedicines: "",
    proteinIntake: "",
    saltIntake: "",
    waterIntake: "",
    exerciseLevel: 3,
    smokingStatus: "never" as "never" | "former" | "current",
    alcoholUnitsPerWeek: "",
  });

  const updateField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const toggleCondition = (id: string) => {
    setForm((f) => ({
      ...f,
      existingConditions: f.existingConditions.includes(id)
        ? f.existingConditions.filter((c) => c !== id)
        : [...f.existingConditions, id],
    }));
  };

  const handleSubmit = () => {
    const data: PatientData = {
      name: form.name || "Patient",
      age: Number(form.age) || 45,
      gender: form.gender,
      weight: Number(form.weight) || 70,
      height: Number(form.height) || 170,
      systolicBP: Number(form.systolicBP) || 120,
      diastolicBP: Number(form.diastolicBP) || 80,
      glucose: Number(form.glucose) || 95,
      uricAcid: Number(form.uricAcid) || 5.5,
      hydrationLevel: form.hydrationLevel,
      serumCreatinine: Number(form.serumCreatinine) || 1.0,
      bun: Number(form.bun) || 15,
      serumCalcium: Number(form.serumCalcium) || 9.5,
      serumPotassium: Number(form.serumPotassium) || 4.2,
      serumSodium: Number(form.serumSodium) || 140,
      serumPhosphorus: Number(form.serumPhosphorus) || 3.8,
      serumAlbumin: Number(form.serumAlbumin) || 4.0,
      hemoglobin: Number(form.hemoglobin) || (form.gender === "female" ? 13 : 14.5),
      hba1c: Number(form.hba1c) || 5.5,
      cholesterol: Number(form.cholesterol) || 180,
      triglycerides: Number(form.triglycerides) || 120,
      urineProtein: Number(form.urineProtein) || 50,
      urineAlbumin: Number(form.urineAlbumin) || 15,
      egfrCysC: Number(form.egfrCysC) || 0,
      parathyroidHormone: Number(form.parathyroidHormone) || 45,
      vitaminD: Number(form.vitaminD) || 35,
      cReactiveProtein: Number(form.cReactiveProtein) || 1.0,
      existingConditions: form.existingConditions,
      currentMedicines: form.currentMedicines ? form.currentMedicines.split(",").map((m) => m.trim()) : [],
      proteinIntake: Number(form.proteinIntake) || 60,
      saltIntake: Number(form.saltIntake) || 5,
      waterIntake: Number(form.waterIntake) || 2.0,
      exerciseLevel: form.exerciseLevel,
      smokingStatus: form.smokingStatus,
      alcoholUnitsPerWeek: Number(form.alcoholUnitsPerWeek) || 0,
    };
    onSubmit(data);
  };

  const steps = [
    {
      title: "Patient Profile",
      icon: User,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Patient full name" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" placeholder="Years" value={form.age} onChange={(e) => updateField("age", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => updateField("gender", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" placeholder="kg" value={form.weight} onChange={(e) => updateField("weight", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input id="height" type="number" placeholder="cm" value={form.height} onChange={(e) => updateField("height", e.target.value)} className="mt-1.5" />
          </div>
        </div>
      ),
    },
    {
      title: "Vitals & Blood Work",
      icon: Heart,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Systolic BP (mmHg)</Label>
            <Input type="number" placeholder="120" value={form.systolicBP} onChange={(e) => updateField("systolicBP", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Diastolic BP (mmHg)</Label>
            <Input type="number" placeholder="80" value={form.diastolicBP} onChange={(e) => updateField("diastolicBP", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Blood Glucose (mg/dL)</Label>
            <Input type="number" placeholder="95" value={form.glucose} onChange={(e) => updateField("glucose", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Serum Creatinine (mg/dL)</Label>
            <Input type="number" step="0.01" placeholder="1.0" value={form.serumCreatinine} onChange={(e) => updateField("serumCreatinine", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>BUN (mg/dL)</Label>
            <Input type="number" placeholder="15" value={form.bun} onChange={(e) => updateField("bun", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Uric Acid (mg/dL)</Label>
            <Input type="number" step="0.1" placeholder="5.5" value={form.uricAcid} onChange={(e) => updateField("uricAcid", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Serum Calcium (mg/dL)</Label>
            <Input type="number" step="0.1" placeholder="9.5" value={form.serumCalcium} onChange={(e) => updateField("serumCalcium", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Serum Potassium (mmol/L)</Label>
            <Input type="number" step="0.1" placeholder="4.2" value={form.serumPotassium} onChange={(e) => updateField("serumPotassium", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Serum Sodium (mmol/L)</Label>
            <Input type="number" placeholder="140" value={form.serumSodium} onChange={(e) => updateField("serumSodium", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Serum Phosphorus (mg/dL)</Label>
            <Input type="number" step="0.1" placeholder="3.8" value={form.serumPhosphorus} onChange={(e) => updateField("serumPhosphorus", e.target.value)} className="mt-1.5" />
          </div>
        </div>
      ),
    },
    {
      title: "Advanced Blood Markers",
      icon: Beaker,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label>Serum Albumin (g/dL)</Label>
            <Input type="number" step="0.1" placeholder="4.0" value={form.serumAlbumin} onChange={(e) => updateField("serumAlbumin", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Hemoglobin (g/dL)</Label>
            <Input type="number" step="0.1" placeholder="14" value={form.hemoglobin} onChange={(e) => updateField("hemoglobin", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>HbA1c (%)</Label>
            <Input type="number" step="0.1" placeholder="5.5" value={form.hba1c} onChange={(e) => updateField("hba1c", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Cholesterol (mg/dL)</Label>
            <Input type="number" placeholder="180" value={form.cholesterol} onChange={(e) => updateField("cholesterol", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Triglycerides (mg/dL)</Label>
            <Input type="number" placeholder="120" value={form.triglycerides} onChange={(e) => updateField("triglycerides", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>C-Reactive Protein (mg/L)</Label>
            <Input type="number" step="0.1" placeholder="1.0" value={form.cReactiveProtein} onChange={(e) => updateField("cReactiveProtein", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Parathyroid Hormone (pg/mL)</Label>
            <Input type="number" placeholder="45" value={form.parathyroidHormone} onChange={(e) => updateField("parathyroidHormone", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Vitamin D (ng/mL)</Label>
            <Input type="number" placeholder="35" value={form.vitaminD} onChange={(e) => updateField("vitaminD", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Urine Protein (mg/day)</Label>
            <Input type="number" placeholder="50" value={form.urineProtein} onChange={(e) => updateField("urineProtein", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Urine Albumin (mg/day)</Label>
            <Input type="number" placeholder="15" value={form.urineAlbumin} onChange={(e) => updateField("urineAlbumin", e.target.value)} className="mt-1.5" />
          </div>
        </div>
      ),
    },
    {
      title: "Lifestyle & Conditions",
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="mb-3 block">Hydration Level</Label>
              <div className="flex items-center gap-4">
                <Droplets className="w-5 h-5 text-medical-blue" />
                <Slider value={[form.hydrationLevel]} onValueChange={([v]) => updateField("hydrationLevel", v)} min={1} max={10} step={1} className="flex-1" />
                <span className="font-mono text-sm font-medium w-8 text-right">{form.hydrationLevel}/10</span>
              </div>
            </div>
            <div>
              <Label className="mb-3 block">Exercise Level</Label>
              <div className="flex items-center gap-4">
                <Wind className="w-5 h-5 text-medical-green" />
                <Slider value={[form.exerciseLevel]} onValueChange={([v]) => updateField("exerciseLevel", v)} min={0} max={10} step={1} className="flex-1" />
                <span className="font-mono text-sm font-medium w-8 text-right">{form.exerciseLevel}/10</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label>Protein Intake (g/day)</Label>
              <Input type="number" placeholder="60" value={form.proteinIntake} onChange={(e) => updateField("proteinIntake", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Salt Intake (g/day)</Label>
              <Input type="number" step="0.5" placeholder="5" value={form.saltIntake} onChange={(e) => updateField("saltIntake", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Water Intake (L/day)</Label>
              <Input type="number" step="0.5" placeholder="2.0" value={form.waterIntake} onChange={(e) => updateField("waterIntake", e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label>Smoking Status</Label>
              <Select value={form.smokingStatus} onValueChange={(v) => updateField("smokingStatus", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="former">Former</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Alcohol (units/week)</Label>
              <Input type="number" placeholder="0" value={form.alcoholUnitsPerWeek} onChange={(e) => updateField("alcoholUnitsPerWeek", e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label className="mb-3 block">Existing Conditions</Label>
            <div className="grid grid-cols-2 gap-3">
              {CONDITIONS.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                  <Checkbox checked={form.existingConditions.includes(c.id)} onCheckedChange={() => toggleCondition(c.id)} />
                  <span className="text-sm">{c.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>
              <Pill className="w-4 h-4 inline mr-1.5" />
              Current Medicines (comma-separated)
            </Label>
            <Input
              placeholder="e.g., Metformin, Losartan, Allopurinol"
              value={form.currentMedicines}
              onChange={(e) => updateField("currentMedicines", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                ? "bg-medical-green-light text-medical-green"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <s.icon size={16} />
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="medical-card-elevated"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <StepIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{currentStep.title}</h2>
            <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
          </div>
        </div>

        {currentStep.content}

        <div className="flex justify-between mt-8 pt-5 border-t border-border">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gradient-hero border-0">
              <FileText className="w-4 h-4 mr-2" />
              Generate Digital Kidney
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import KidneyVisualization from "./KidneyVisualization";
import MetricCard from "./MetricCard";
import TreatmentSimulator from "./TreatmentSimulator";
import {
  PatientData,
  KidneyMetrics,
  Treatment,
  calculateBaselineMetrics,
  simulateTreatment,
  predictFutureMetrics,
} from "@/lib/kidney-simulation";
import {
  Activity,
  Droplets,
  Gauge,
  Heart,
  Shield,
  Skull,
  ThermometerSun,
  Timer,
  Waves,
  Zap,
  ArrowLeft,
  FileText,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimulationDashboardProps {
  patient: PatientData;
  onBack: () => void;
  onGenerateReport: (data: {
    patient: PatientData;
    baseline: KidneyMetrics;
    simulated: KidneyMetrics | null;
    treatments: Treatment[];
    adjustments: { hydration: number; proteinIntake: number; saltIntake: number };
  }) => void;
}

function getMetricStatus(value: number, low: number, high: number): "normal" | "warning" | "danger" {
  if (value >= low && value <= high) return "normal";
  const deviation = value < low ? (low - value) / low : (value - high) / high;
  return deviation > 0.3 ? "danger" : "warning";
}

export default function SimulationDashboard({ patient, onBack, onGenerateReport }: SimulationDashboardProps) {
  const baseline = useMemo(() => calculateBaselineMetrics(patient), [patient]);
  const [simulated, setSimulated] = useState<KidneyMetrics | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [adjustments, setAdjustments] = useState({
    hydration: patient.hydrationLevel,
    proteinIntake: patient.proteinIntake,
    saltIntake: patient.saltIntake,
  });

  const runSimulation = () => {
    const result = simulateTreatment(baseline, patient, treatments, adjustments);
    setSimulated(result);
  };

  const active = simulated || baseline;
  const showDelta = simulated !== null;

  const calcDelta = (base: number, sim: number) => {
    if (!showDelta) return undefined;
    return Math.round(((sim - base) / base) * 100);
  };

  const predictionData = useMemo(() => {
    const source = simulated || baseline;
    return [
      { month: "Now", gfr: source.gfr, efficiency: source.efficiency, stress: source.stressIndex },
      ...[3, 6, 12].map((m) => {
        const p = predictFutureMetrics(source, m);
        return { month: `${m}m`, gfr: p.gfr, efficiency: p.efficiency, stress: p.stressIndex };
      }),
    ];
  }, [simulated, baseline]);

  const comparisonData = simulated
    ? [
        { metric: "GFR", baseline: baseline.gfr, simulated: simulated.gfr },
        { metric: "Efficiency", baseline: baseline.efficiency, simulated: simulated.efficiency },
        { metric: "Stress", baseline: baseline.stressIndex, simulated: simulated.stressIndex },
        { metric: "Stone Risk", baseline: baseline.stoneRisk, simulated: simulated.stoneRisk },
      ]
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{patient.name}'s Digital Kidney</h1>
            <p className="text-sm text-muted-foreground">
              {patient.age}y, {patient.gender}, {patient.weight}kg • BP: {patient.systolicBP}/{patient.diastolicBP}
            </p>
          </div>
        </div>
        <Button
          onClick={() => onGenerateReport({ patient, baseline, simulated, treatments, adjustments })}
          className="gradient-hero border-0"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Kidney Vis + Core Metrics */}
        <div className="lg:col-span-8 space-y-6">
          {/* Kidney vis + key metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="medical-card-elevated flex items-center justify-center py-8">
              <KidneyVisualization efficiency={active.efficiency} stressIndex={active.stressIndex} />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <MetricCard
                label="GFR"
                value={active.gfr}
                unit="mL/min"
                icon={Gauge}
                status={active.gfr >= 90 ? "normal" : active.gfr >= 60 ? "warning" : "danger"}
                reference="> 90"
                delta={calcDelta(baseline.gfr, active.gfr)}
              />
              <MetricCard
                label="Creatinine"
                value={active.creatinine}
                unit="mg/dL"
                icon={Droplets}
                status={getMetricStatus(active.creatinine, 0.55, 1.02)}
                reference="0.55 - 1.02"
                delta={calcDelta(baseline.creatinine, active.creatinine)}
              />
              <MetricCard
                label="Stone Risk"
                value={active.stoneRisk}
                unit="%"
                icon={Shield}
                status={active.stoneRisk < 25 ? "normal" : active.stoneRisk < 50 ? "warning" : "danger"}
                delta={calcDelta(baseline.stoneRisk, active.stoneRisk)}
              />
              <MetricCard
                label="Stress Index"
                value={active.stressIndex}
                unit="%"
                icon={ThermometerSun}
                status={active.stressIndex < 30 ? "normal" : active.stressIndex < 60 ? "warning" : "danger"}
                delta={calcDelta(baseline.stressIndex, active.stressIndex)}
              />
            </div>
          </div>

          {/* More metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Uric Acid" value={active.uricAcid} unit="mg/dL" icon={Zap} status={getMetricStatus(active.uricAcid, 2.6, 6)} reference="2.6 - 6.0" delta={calcDelta(baseline.uricAcid, active.uricAcid)} />
            <MetricCard label="BUN" value={active.bun} unit="mg/dL" icon={Activity} status={getMetricStatus(active.bun, 7.9, 20)} reference="7.9 - 20" delta={calcDelta(baseline.bun, active.bun)} />
            <MetricCard label="Kidney Age" value={active.kidneyAge} unit="yrs" icon={Timer} status={active.kidneyAge <= patient.age ? "normal" : "warning"} delta={calcDelta(baseline.kidneyAge, active.kidneyAge)} />
            <MetricCard label="Electrolytes" value={active.electrolyteBalance} unit="%" icon={Waves} status={active.electrolyteBalance >= 75 ? "normal" : active.electrolyteBalance >= 50 ? "warning" : "danger"} delta={calcDelta(baseline.electrolyteBalance, active.electrolyteBalance)} />
          </div>

          {/* GFR Category banner */}
          <div className={`rounded-xl p-4 border flex items-center gap-3 ${
            active.gfr >= 90 ? "bg-medical-green-light border-medical-green/20" :
            active.gfr >= 60 ? "bg-medical-amber-light border-medical-amber/20" :
            "bg-medical-red-light border-medical-red/20"
          }`}>
            <Gauge className={`w-5 h-5 ${active.gfr >= 90 ? "text-medical-green" : active.gfr >= 60 ? "text-medical-amber" : "text-medical-red"}`} />
            <div>
              <p className="text-sm font-semibold">{active.gfrCategory}</p>
              <p className="text-xs opacity-70">Estimated Glomerular Filtration Rate Classification</p>
            </div>
          </div>

          {/* Charts */}
          <Tabs defaultValue="prediction">
            <TabsList className="w-full">
              <TabsTrigger value="prediction" className="flex-1"><TrendingUp className="w-4 h-4 mr-1.5" />Prediction</TabsTrigger>
              {simulated && <TabsTrigger value="comparison" className="flex-1"><BarChart3 className="w-4 h-4 mr-1.5" />Comparison</TabsTrigger>}
            </TabsList>
            <TabsContent value="prediction">
              <div className="medical-card" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 88%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(210, 12%, 50%)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 12%, 50%)" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(200, 20%, 88%)", fontSize: 13 }} />
                    <Line type="monotone" dataKey="gfr" stroke="hsl(174, 62%, 38%)" strokeWidth={2} name="GFR" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="efficiency" stroke="hsl(210, 80%, 52%)" strokeWidth={2} name="Efficiency %" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="stress" stroke="hsl(0, 72%, 55%)" strokeWidth={2} name="Stress %" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            {simulated && (
              <TabsContent value="comparison">
                <div className="medical-card" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 88%)" />
                      <XAxis dataKey="metric" tick={{ fontSize: 12 }} stroke="hsl(210, 12%, 50%)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 12%, 50%)" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(200, 20%, 88%)", fontSize: 13 }} />
                      <Bar dataKey="baseline" fill="hsl(210, 12%, 75%)" name="Baseline" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="simulated" fill="hsl(174, 62%, 38%)" name="Simulated" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right: Treatment Simulator */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Treatment Simulator</h2>
            <TreatmentSimulator
              treatments={treatments}
              adjustments={adjustments}
              baselineHydration={patient.hydrationLevel}
              baselineProtein={patient.proteinIntake}
              baselineSalt={patient.saltIntake}
              onTreatmentsChange={setTreatments}
              onAdjustmentsChange={setAdjustments}
              onSimulate={runSimulation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

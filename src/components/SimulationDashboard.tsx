import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import KidneyVisualization from "./KidneyVisualization";
import MetricCard from "./MetricCard";
import TreatmentSimulator from "./TreatmentSimulator";
import RiskHeatmap from "./RiskHeatmap";
import DrugInteractionAlert from "./DrugInteractionAlert";
import TreatmentRankingPanel from "./TreatmentRankingPanel";
import {
  PatientData,
  KidneyMetrics,
  Treatment,
  DrugInteraction,
  TreatmentRanking,
  calculateBaselineMetrics,
  simulateTreatment,
  predictFutureMetrics,
  detectDrugInteractions,
  rankTreatmentCombinations,
} from "@/lib/kidney-simulation";
import {
  Activity,
  Droplets,
  Gauge,
  Heart,
  Shield,
  ThermometerSun,
  Timer,
  Waves,
  Zap,
  ArrowLeft,
  FileText,
  TrendingUp,
  BarChart3,
  Brain,
  Flame,
  Bone,
  Stethoscope,
  HeartPulse,
  ShieldAlert,
  AlertTriangle,
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
    adjustments: { hydration: number; proteinIntake: number; saltIntake: number; waterIntake: number; exerciseLevel: number };
    drugInteractions: DrugInteraction[];
    treatmentRankings: TreatmentRanking[];
  }) => void;
}

function getMetricStatus(value: number, low: number, high: number): "normal" | "warning" | "danger" {
  if (value >= low && value <= high) return "normal";
  const deviation = value < low ? (low - value) / low : (value - high) / high;
  return deviation > 0.3 ? "danger" : "warning";
}

function scoreStatus(v: number, goodAbove: number, warnAbove: number): "normal" | "warning" | "danger" {
  if (v >= goodAbove) return "normal";
  if (v >= warnAbove) return "warning";
  return "danger";
}

function riskStatus(v: number, safeBelow: number, warnBelow: number): "normal" | "warning" | "danger" {
  if (v < safeBelow) return "normal";
  if (v < warnBelow) return "warning";
  return "danger";
}

const TIME_PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "6m", days: 180 },
  { label: "1y", days: 365 },
];

export default function SimulationDashboard({ patient, onBack, onGenerateReport }: SimulationDashboardProps) {
  const baseline = useMemo(() => calculateBaselineMetrics(patient), [patient]);
  const [simulated, setSimulated] = useState<KidneyMetrics | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [treatmentRankings, setTreatmentRankings] = useState<TreatmentRanking[]>([]);
  const [adjustments, setAdjustments] = useState({
    hydration: patient.hydrationLevel,
    proteinIntake: patient.proteinIntake,
    saltIntake: patient.saltIntake,
    waterIntake: patient.waterIntake,
    exerciseLevel: patient.exerciseLevel,
  });

  const runSimulation = () => {
    const result = simulateTreatment(baseline, patient, treatments, adjustments);
    setSimulated(result);
    const interactions = detectDrugInteractions(treatments);
    setDrugInteractions(interactions);
    const rankings = rankTreatmentCombinations(baseline, patient, treatments);
    setTreatmentRankings(rankings);
  };

  const active = simulated || baseline;
  const showDelta = simulated !== null;

  const calcDelta = (base: number, sim: number) => {
    if (!showDelta) return undefined;
    if (base === 0) return undefined;
    return Math.round(((sim - base) / base) * 100);
  };

  // Prediction data for chart
  const predictionData = useMemo(() => {
    const source = simulated || baseline;
    return [
      { period: "Now", gfr: source.gfr, efficiency: source.efficiency, stress: source.stressIndex, ckdRisk: source.ckdProgressionRisk, cvRisk: source.cardiovascularRisk },
      ...TIME_PERIODS.map(({ label, days }) => {
        const p = predictFutureMetrics(source, days);
        return { period: label, gfr: p.gfr, efficiency: p.efficiency, stress: p.stressIndex, ckdRisk: p.ckdProgressionRisk, cvRisk: p.cardiovascularRisk };
      }),
    ];
  }, [simulated, baseline]);

  // Comparison bar data
  const comparisonData = simulated
    ? [
        { metric: "GFR", baseline: baseline.gfr, simulated: simulated.gfr },
        { metric: "Efficiency", baseline: baseline.efficiency, simulated: simulated.efficiency },
        { metric: "Stress", baseline: baseline.stressIndex, simulated: simulated.stressIndex },
        { metric: "Stone Risk", baseline: baseline.stoneRisk, simulated: simulated.stoneRisk },
        { metric: "CKD Risk", baseline: baseline.ckdProgressionRisk, simulated: simulated.ckdProgressionRisk },
        { metric: "CV Risk", baseline: baseline.cardiovascularRisk, simulated: simulated.cardiovascularRisk },
        { metric: "Health Score", baseline: baseline.overallHealthScore, simulated: simulated.overallHealthScore },
      ]
    : [];

  // Radar chart data
  const radarData = [
    { subject: "Nephron", value: active.nephronHealth },
    { subject: "Vascular", value: active.vascularHealth },
    { subject: "Interstitial", value: active.interstitialHealth },
    { subject: "Electrolyte", value: active.electrolyteBalance },
    { subject: "Mineral Bone", value: active.mineralBoneScore },
    { subject: "Anemia", value: active.anemiaScore },
    { subject: "Inflammation", value: active.inflammationScore },
    { subject: "Perfusion", value: active.kidneyPerfusionIndex },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{patient.name}'s Digital Kidney Twin</h1>
            <p className="text-sm text-muted-foreground">
              {patient.age}y, {patient.gender}, {patient.weight}kg • BP: {patient.systolicBP}/{patient.diastolicBP} • CKD Stage {active.ckdStage}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Overall health score badge */}
          <div className={`px-4 py-2 rounded-full font-bold font-mono text-sm ${
            active.overallHealthScore >= 75 ? "bg-medical-green-light text-medical-green" :
            active.overallHealthScore >= 50 ? "bg-medical-amber-light text-medical-amber" :
            "bg-medical-red-light text-medical-red"
          }`}>
            Score: {active.overallHealthScore}/100
          </div>
          <Button
            onClick={() => onGenerateReport({ patient, baseline, simulated, treatments, adjustments, drugInteractions, treatmentRankings })}
            className="gradient-hero border-0"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Main dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {/* 3D Kidney + Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="medical-card-elevated flex items-center justify-center py-4">
              <KidneyVisualization
                efficiency={active.efficiency}
                stressIndex={active.stressIndex}
                riskHeatmap={active.riskHeatmap}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <MetricCard label="GFR" value={active.gfr} unit="mL/min" icon={Gauge} status={active.gfr >= 90 ? "normal" : active.gfr >= 60 ? "warning" : "danger"} reference="> 90" delta={calcDelta(baseline.gfr, active.gfr)} />
              <MetricCard label="Creatinine" value={active.creatinine} unit="mg/dL" icon={Droplets} status={getMetricStatus(active.creatinine, 0.55, 1.02)} reference="0.55 - 1.02" delta={calcDelta(baseline.creatinine, active.creatinine)} />
              <MetricCard label="Overall Health" value={active.overallHealthScore} unit="/100" icon={HeartPulse} status={scoreStatus(active.overallHealthScore, 75, 50)} delta={calcDelta(baseline.overallHealthScore, active.overallHealthScore)} />
              <MetricCard label="Kidney Age" value={active.kidneyAge} unit="yrs" icon={Timer} status={active.kidneyAge <= patient.age ? "normal" : "warning"} reference={`≤ ${patient.age}`} delta={calcDelta(baseline.kidneyAge, active.kidneyAge)} />
            </div>
          </div>

          {/* Risk Scores Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <MetricCard label="Stone Risk" value={active.stoneRisk} unit="%" icon={Shield} status={riskStatus(active.stoneRisk, 25, 50)} delta={calcDelta(baseline.stoneRisk, active.stoneRisk)} />
            <MetricCard label="Stress" value={active.stressIndex} unit="%" icon={ThermometerSun} status={riskStatus(active.stressIndex, 30, 60)} delta={calcDelta(baseline.stressIndex, active.stressIndex)} />
            <MetricCard label="CKD Progress" value={active.ckdProgressionRisk} unit="%" icon={TrendingUp} status={riskStatus(active.ckdProgressionRisk, 25, 50)} delta={calcDelta(baseline.ckdProgressionRisk, active.ckdProgressionRisk)} />
            <MetricCard label="CV Risk" value={active.cardiovascularRisk} unit="%" icon={Heart} status={riskStatus(active.cardiovascularRisk, 25, 50)} delta={calcDelta(baseline.cardiovascularRisk, active.cardiovascularRisk)} />
            <MetricCard label="AKI Risk" value={active.akirisk} unit="%" icon={ShieldAlert} status={riskStatus(active.akirisk, 20, 40)} delta={calcDelta(baseline.akirisk, active.akirisk)} />
            <MetricCard label="Infection" value={active.infectionRisk} unit="%" icon={AlertTriangle} status={riskStatus(active.infectionRisk, 20, 40)} delta={calcDelta(baseline.infectionRisk, active.infectionRisk)} />
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Uric Acid" value={active.uricAcid} unit="mg/dL" icon={Zap} status={getMetricStatus(active.uricAcid, 2.6, 6)} reference="2.6 - 6.0" delta={calcDelta(baseline.uricAcid, active.uricAcid)} />
            <MetricCard label="BUN" value={active.bun} unit="mg/dL" icon={Activity} status={getMetricStatus(active.bun, 7.9, 20)} reference="7.9 - 20" delta={calcDelta(baseline.bun, active.bun)} />
            <MetricCard label="Electrolytes" value={active.electrolyteBalance} unit="%" icon={Waves} status={scoreStatus(active.electrolyteBalance, 75, 50)} delta={calcDelta(baseline.electrolyteBalance, active.electrolyteBalance)} />
            <MetricCard label="Perfusion" value={active.kidneyPerfusionIndex} unit="%" icon={Stethoscope} status={scoreStatus(active.kidneyPerfusionIndex, 75, 50)} delta={calcDelta(baseline.kidneyPerfusionIndex, active.kidneyPerfusionIndex)} />
          </div>

          {/* Subsystem Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Nephron Health" value={active.nephronHealth} unit="%" icon={Brain} status={scoreStatus(active.nephronHealth, 75, 50)} delta={calcDelta(baseline.nephronHealth, active.nephronHealth)} />
            <MetricCard label="Mineral-Bone" value={active.mineralBoneScore} unit="%" icon={Bone} status={scoreStatus(active.mineralBoneScore, 75, 50)} delta={calcDelta(baseline.mineralBoneScore, active.mineralBoneScore)} />
            <MetricCard label="Anemia Score" value={active.anemiaScore} unit="%" icon={Droplets} status={scoreStatus(active.anemiaScore, 75, 50)} delta={calcDelta(baseline.anemiaScore, active.anemiaScore)} />
            <MetricCard label="Inflammation" value={active.inflammationScore} unit="%" icon={Flame} status={scoreStatus(active.inflammationScore, 75, 50)} delta={calcDelta(baseline.inflammationScore, active.inflammationScore)} />
          </div>

          {/* GFR Category banner */}
          <div className={`rounded-xl p-4 border flex items-center gap-3 ${
            active.gfr >= 90 ? "bg-medical-green-light border-medical-green/20" :
            active.gfr >= 60 ? "bg-medical-amber-light border-medical-amber/20" :
            "bg-medical-red-light border-medical-red/20"
          }`}>
            <Gauge className={`w-5 h-5 ${active.gfr >= 90 ? "text-medical-green" : active.gfr >= 60 ? "text-medical-amber" : "text-medical-red"}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold">{active.gfrCategory} • {active.albuminuriaCategory}</p>
              <p className="text-xs opacity-70">CKD Stage {active.ckdStage} • Proteinuria: {Math.round(active.proteinuriaLevel)} mg/day</p>
            </div>
          </div>

          {/* Risk Heatmap */}
          <RiskHeatmap
            data={active.riskHeatmap}
            comparisonData={showDelta ? baseline.riskHeatmap : undefined}
          />

          {/* Drug interaction alerts */}
          {drugInteractions.length > 0 && (
            <DrugInteractionAlert interactions={drugInteractions} />
          )}

          {/* Charts */}
          <Tabs defaultValue="prediction">
            <TabsList className="w-full">
              <TabsTrigger value="prediction" className="flex-1"><TrendingUp className="w-4 h-4 mr-1.5" />Time Progression</TabsTrigger>
              {simulated && <TabsTrigger value="comparison" className="flex-1"><BarChart3 className="w-4 h-4 mr-1.5" />Before/After</TabsTrigger>}
              <TabsTrigger value="radar" className="flex-1"><Brain className="w-4 h-4 mr-1.5" />Subsystem Radar</TabsTrigger>
            </TabsList>
            <TabsContent value="prediction">
              <div className="medical-card" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 88%)" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(210, 12%, 50%)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(210, 12%, 50%)" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(200, 20%, 88%)", fontSize: 12 }} />
                    <Line type="monotone" dataKey="gfr" stroke="hsl(174, 62%, 38%)" strokeWidth={2} name="GFR" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="efficiency" stroke="hsl(210, 80%, 52%)" strokeWidth={2} name="Efficiency" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="stress" stroke="hsl(0, 72%, 55%)" strokeWidth={2} name="Stress" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="ckdRisk" stroke="hsl(38, 92%, 50%)" strokeWidth={2} name="CKD Risk" dot={{ r: 3 }} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="cvRisk" stroke="hsl(262, 60%, 55%)" strokeWidth={2} name="CV Risk" dot={{ r: 3 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            {simulated && (
              <TabsContent value="comparison">
                <div className="medical-card" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 88%)" />
                      <XAxis dataKey="metric" tick={{ fontSize: 11 }} stroke="hsl(210, 12%, 50%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(210, 12%, 50%)" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(200, 20%, 88%)", fontSize: 12 }} />
                      <Bar dataKey="baseline" fill="hsl(210, 12%, 75%)" name="Baseline" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="simulated" fill="hsl(174, 62%, 38%)" name="Simulated" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            )}
            <TabsContent value="radar">
              <div className="medical-card" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(200, 20%, 88%)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="hsl(210, 12%, 50%)" />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="hsl(210, 12%, 50%)" />
                    <Radar name="Health" dataKey="value" stroke="hsl(174, 62%, 38%)" fill="hsl(174, 62%, 38%)" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Treatment Simulator + Rankings */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Treatment Simulator</h2>
            <TreatmentSimulator
              treatments={treatments}
              adjustments={adjustments}
              baselineHydration={patient.hydrationLevel}
              baselineProtein={patient.proteinIntake}
              baselineSalt={patient.saltIntake}
              baselineWater={patient.waterIntake}
              baselineExercise={patient.exerciseLevel}
              onTreatmentsChange={setTreatments}
              onAdjustmentsChange={setAdjustments}
              onSimulate={runSimulation}
            />
            {/* AI Treatment Rankings */}
            <TreatmentRankingPanel rankings={treatmentRankings} />
          </div>
        </div>
      </div>
    </div>
  );
}

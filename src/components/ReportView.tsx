import { useRef, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { PatientData, KidneyMetrics, Treatment, DrugInteraction, TreatmentRanking, predictFutureMetrics } from "@/lib/kidney-simulation";
import KidneyVisualization from "./KidneyVisualization";
import { ArrowLeft, Download, Printer, TrendingUp, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportViewProps {
  patient: PatientData;
  baseline: KidneyMetrics;
  simulated: KidneyMetrics | null;
  treatments: Treatment[];
  adjustments: { hydration: number; proteinIntake: number; saltIntake: number; waterIntake: number; exerciseLevel: number };
  drugInteractions: DrugInteraction[];
  treatmentRankings: TreatmentRanking[];
  onBack: () => void;
}

function MetricRow({ label, value, unit, reference, status, baseline }: {
  label: string; value: string | number; unit?: string; reference?: string; status?: "normal" | "warning" | "danger"; baseline?: string | number;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2 text-sm font-medium text-foreground">{label}</td>
      <td className="py-2 text-sm font-mono text-right">
        {status && (
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
            status === "normal" ? "bg-medical-green" : status === "warning" ? "bg-medical-amber" : "bg-medical-red"
          }`} />
        )}
        {value} {unit}
      </td>
      {baseline !== undefined && (
        <td className="py-2 text-xs text-muted-foreground text-right font-mono">{baseline} {unit}</td>
      )}
      <td className="py-2 text-xs text-muted-foreground text-right">{reference}</td>
    </tr>
  );
}

function HeatmapCell({ label, value }: { label: string; value: number }) {
  const v = Math.round(value);
  const color = v >= 80 ? "bg-medical-green-light text-medical-green" : v >= 60 ? "bg-medical-amber-light text-medical-amber" : "bg-medical-red-light text-medical-red";
  return (
    <div className={`rounded-lg p-2 text-center ${color}`}>
      <p className="text-[9px] font-medium">{label}</p>
      <p className="text-base font-bold font-mono">{v}%</p>
    </div>
  );
}

export default function ReportView({ patient, baseline, simulated, treatments, adjustments, drugInteractions, treatmentRankings, onBack }: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const active = simulated || baseline;
  const reportDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const reportTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const qrData = JSON.stringify({
    patient: patient.name,
    date: reportDate,
    gfr: active.gfr,
    healthScore: active.overallHealthScore,
    ckdStage: active.ckdStage,
  });

  // Prediction trend data
  const predictionData = useMemo(() => {
    const source = simulated || baseline;
    return [
      { period: "Now", gfr: source.gfr, efficiency: source.efficiency, stress: source.stressIndex },
      ...[7, 30, 90, 180, 365].map((d) => {
        const p = predictFutureMetrics(source, d);
        return { period: d <= 90 ? `${d}d` : d === 180 ? "6m" : "1y", gfr: p.gfr, efficiency: p.efficiency, stress: p.stressIndex };
      }),
    ];
  }, [simulated, baseline]);

  // Before/after comparison for report
  const comparisonData = simulated
    ? [
        { metric: "GFR", before: baseline.gfr, after: simulated.gfr },
        { metric: "Efficiency", before: baseline.efficiency, after: simulated.efficiency },
        { metric: "Stress", before: baseline.stressIndex, after: simulated.stressIndex },
        { metric: "CKD Risk", before: baseline.ckdProgressionRisk, after: simulated.ckdProgressionRisk },
        { metric: "CV Risk", before: baseline.cardiovascularRisk, after: simulated.cardiovascularRisk },
        { metric: "Health Score", before: baseline.overallHealthScore, after: simulated.overallHealthScore },
      ]
    : [];

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    
    // If content is too tall for one page, split across pages
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (pdfH <= pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    } else {
      let y = 0;
      while (y < pdfH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -y, pdfW, pdfH);
        y += pageHeight;
      }
    }
    pdf.save(`kidney-report-${patient.name.replace(/\s/g, "-")}-${reportDate}.pdf`);
  };

  const getStatus = (v: number, lo: number, hi: number): "normal" | "warning" | "danger" => {
    if (v >= lo && v <= hi) return "normal";
    const d = v < lo ? (lo - v) / lo : (v - hi) / hi;
    return d > 0.3 ? "danger" : "warning";
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Simulation
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={downloadPDF} className="gradient-hero border-0">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="bg-card rounded-xl border border-border overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div className="gradient-hero p-6 text-primary-foreground">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Digital Kidney Twin Report</h1>
              <p className="text-sm opacity-80 mt-1">Advanced Personalized Kidney Health Analysis</p>
            </div>
            <div className="text-right text-sm opacity-80">
              <p>Date: {reportDate}</p>
              <p>Time: {reportTime}</p>
              <p className="mt-1 font-semibold">CKD Stage {active.ckdStage}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-lg bg-secondary">
            <div><p className="text-[10px] text-muted-foreground">Name</p><p className="text-sm font-semibold">{patient.name}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Age / Gender</p><p className="text-sm font-semibold">{patient.age}y / {patient.gender}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Weight / Height</p><p className="text-sm font-semibold">{patient.weight}kg / {patient.height}cm</p></div>
            <div><p className="text-[10px] text-muted-foreground">BP</p><p className="text-sm font-semibold">{patient.systolicBP}/{patient.diastolicBP}</p></div>
            <div><p className="text-[10px] text-muted-foreground">HbA1c / Glucose</p><p className="text-sm font-semibold">{patient.hba1c}% / {patient.glucose}</p></div>
          </div>

          {/* Snapshot: Overall Health Score + Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-5 rounded-xl text-center ${active.overallHealthScore >= 75 ? "bg-medical-green-light" : active.overallHealthScore >= 50 ? "bg-medical-amber-light" : "bg-medical-red-light"}`}>
              <p className="text-xs text-muted-foreground">Overall Health Score</p>
              <p className="text-4xl font-bold font-mono mt-1">{active.overallHealthScore}</p>
              <p className="text-xs mt-1">/100</p>
            </div>
            <div className={`p-5 rounded-xl text-center ${active.gfr >= 60 ? "bg-medical-green-light" : "bg-medical-red-light"}`}>
              <p className="text-xs text-muted-foreground">GFR</p>
              <p className="text-3xl font-bold font-mono mt-1">{active.gfr}</p>
              <p className="text-[10px] mt-1">{active.gfrCategory}</p>
            </div>
            <div className={`p-5 rounded-xl text-center ${active.efficiency >= 75 ? "bg-medical-green-light" : "bg-medical-amber-light"}`}>
              <p className="text-xs text-muted-foreground">Efficiency</p>
              <p className="text-3xl font-bold font-mono mt-1">{active.efficiency}%</p>
            </div>
            <div className={`p-5 rounded-xl text-center ${active.stressIndex < 40 ? "bg-medical-green-light" : "bg-medical-amber-light"}`}>
              <p className="text-xs text-muted-foreground">Stress Index</p>
              <p className="text-3xl font-bold font-mono mt-1">{active.stressIndex}%</p>
            </div>
          </div>

          {/* Risk Scores */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Risk Assessment</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: "Stone Risk", value: active.stoneRisk },
                { label: "CKD Progress", value: active.ckdProgressionRisk },
                { label: "CV Risk", value: active.cardiovascularRisk },
                { label: "AKI Risk", value: active.akirisk },
                { label: "Infection", value: active.infectionRisk },
                { label: "Stress", value: active.stressIndex },
              ].map(({ label, value }) => (
                <div key={label} className={`p-3 rounded-lg text-center ${value < 25 ? "bg-medical-green-light" : value < 50 ? "bg-medical-amber-light" : "bg-medical-red-light"}`}>
                  <p className="text-[9px] text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold font-mono">{value}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Region Health Heatmap */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Kidney Region Health Map</h2>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              <HeatmapCell label="Glomerular" value={active.riskHeatmap.glomerular} />
              <HeatmapCell label="Tubular" value={active.riskHeatmap.tubular} />
              <HeatmapCell label="Vascular" value={active.riskHeatmap.vascular} />
              <HeatmapCell label="Interstitial" value={active.riskHeatmap.interstitial} />
              <HeatmapCell label="Collecting" value={active.riskHeatmap.collecting} />
              <HeatmapCell label="Cortex" value={active.riskHeatmap.cortex} />
              <HeatmapCell label="Medulla" value={active.riskHeatmap.medulla} />
            </div>
          </div>

          {/* Before/After Comparison Chart */}
          {simulated && comparisonData.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Before / After Treatment Comparison</h2>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 88%)" />
                    <XAxis dataKey="metric" tick={{ fontSize: 10 }} stroke="hsl(210, 12%, 50%)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(210, 12%, 50%)" />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                    <Bar dataKey="before" fill="hsl(210, 12%, 75%)" name="Before" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="after" fill="hsl(174, 62%, 38%)" name="After" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Progression Forecast Chart */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <TrendingUp className="w-4 h-4 inline mr-1" /> Future Progression Forecast
            </h2>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 20%, 88%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} stroke="hsl(210, 12%, 50%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(210, 12%, 50%)" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                  <Line type="monotone" dataKey="gfr" stroke="hsl(174, 62%, 38%)" strokeWidth={2} name="GFR" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="efficiency" stroke="hsl(210, 80%, 52%)" strokeWidth={2} name="Efficiency" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="stress" stroke="hsl(0, 72%, 55%)" strokeWidth={2} name="Stress" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Metrics Table */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Complete Kidney Function Tests</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground py-2">TEST</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground py-2">{simulated ? "AFTER" : "VALUE"}</th>
                  {simulated && <th className="text-right text-xs font-semibold text-muted-foreground py-2">BEFORE</th>}
                  <th className="text-right text-xs font-semibold text-muted-foreground py-2">REF</th>
                </tr>
              </thead>
              <tbody>
                <MetricRow label="GFR" value={active.gfr} unit="mL/min" reference="> 90" status={active.gfr >= 90 ? "normal" : active.gfr >= 60 ? "warning" : "danger"} baseline={simulated ? baseline.gfr : undefined} />
                <MetricRow label="Serum Creatinine" value={active.creatinine} unit="mg/dL" reference="0.55-1.02" status={getStatus(active.creatinine, 0.55, 1.02)} baseline={simulated ? baseline.creatinine : undefined} />
                <MetricRow label="BUN" value={active.bun} unit="mg/dL" reference="7.9-20" status={getStatus(active.bun, 7.9, 20)} baseline={simulated ? baseline.bun : undefined} />
                <MetricRow label="Uric Acid" value={active.uricAcid} unit="mg/dL" reference="2.6-6.0" status={getStatus(active.uricAcid, 2.6, 6)} baseline={simulated ? baseline.uricAcid : undefined} />
                <MetricRow label="BUN/Cr Ratio" value={active.bunCreatinineRatio} reference="10-20" status={getStatus(active.bunCreatinineRatio, 10, 20)} baseline={simulated ? baseline.bunCreatinineRatio : undefined} />
                <MetricRow label="Efficiency" value={`${active.efficiency}%`} reference="> 75%" status={active.efficiency >= 75 ? "normal" : active.efficiency >= 50 ? "warning" : "danger"} baseline={simulated ? `${baseline.efficiency}%` : undefined} />
                <MetricRow label="Stone Risk" value={`${active.stoneRisk}%`} reference="< 25%" status={active.stoneRisk < 25 ? "normal" : active.stoneRisk < 50 ? "warning" : "danger"} baseline={simulated ? `${baseline.stoneRisk}%` : undefined} />
                <MetricRow label="Kidney Age" value={active.kidneyAge} unit="yrs" reference={`≤ ${patient.age}`} status={active.kidneyAge <= patient.age ? "normal" : "warning"} baseline={simulated ? baseline.kidneyAge : undefined} />
                <MetricRow label="Electrolyte Balance" value={`${active.electrolyteBalance}%`} reference="> 75%" status={active.electrolyteBalance >= 75 ? "normal" : "warning"} baseline={simulated ? `${baseline.electrolyteBalance}%` : undefined} />
                <MetricRow label="Mineral-Bone Score" value={`${active.mineralBoneScore}%`} reference="> 75%" status={active.mineralBoneScore >= 75 ? "normal" : "warning"} baseline={simulated ? `${baseline.mineralBoneScore}%` : undefined} />
                <MetricRow label="Anemia Score" value={`${active.anemiaScore}%`} reference="> 75%" status={active.anemiaScore >= 75 ? "normal" : "warning"} baseline={simulated ? `${baseline.anemiaScore}%` : undefined} />
                <MetricRow label="Inflammation Score" value={`${active.inflammationScore}%`} reference="> 75%" status={active.inflammationScore >= 75 ? "normal" : "warning"} baseline={simulated ? `${baseline.inflammationScore}%` : undefined} />
                <MetricRow label="Perfusion Index" value={`${active.kidneyPerfusionIndex}%`} reference="> 75%" status={active.kidneyPerfusionIndex >= 75 ? "normal" : "warning"} baseline={simulated ? `${baseline.kidneyPerfusionIndex}%` : undefined} />
                <MetricRow label="Proteinuria" value={Math.round(active.proteinuriaLevel)} unit="mg/day" reference="< 150" status={active.proteinuriaLevel < 150 ? "normal" : active.proteinuriaLevel < 500 ? "warning" : "danger"} baseline={simulated ? Math.round(baseline.proteinuriaLevel) : undefined} />
              </tbody>
            </table>
          </div>

          {/* Drug Interactions in Report */}
          {drugInteractions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-medical-red mb-3 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Drug Interaction Warnings
              </h2>
              <div className="space-y-2">
                {drugInteractions.map((interaction, i) => (
                  <div key={i} className={`p-3 rounded-lg border text-sm ${
                    interaction.severity === "severe" ? "bg-medical-red-light border-medical-red/20" :
                    interaction.severity === "moderate" ? "bg-medical-amber-light border-medical-amber/20" :
                    "bg-medical-blue-light border-medical-blue/20"
                  }`}>
                    <p className="font-medium">{interaction.drug1} + {interaction.drug2} ({interaction.severity.toUpperCase()})</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{interaction.effect}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatments */}
          {treatments.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Prescribed Treatment Plan</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground py-2">MEDICINE</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground py-2">CATEGORY</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground py-2">TABLETS/DAY</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground py-2">FREQUENCY</th>
                  </tr>
                </thead>
                <tbody>
                  {treatments.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="py-2 text-sm font-medium">{t.medicine}</td>
                      <td className="py-2 text-xs text-muted-foreground">{t.category || "-"}</td>
                      <td className="py-2 text-sm font-mono text-right">{t.tablets}</td>
                      <td className="py-2 text-sm text-right text-muted-foreground">{t.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI Treatment Ranking in Report */}
          {treatmentRankings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">AI Treatment Ranking Analysis</h2>
              <div className="space-y-2">
                {treatmentRankings.slice(0, 3).map((rank, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${i === 0 ? "bg-medical-green-light border-medical-green/20" : "bg-secondary border-border"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{i + 1} {rank.combination.map(t => t.medicine).join(" + ")}</span>
                      <span className="text-sm font-bold font-mono">{rank.score > 0 ? "+" : ""}{rank.score} pts</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{rank.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer with QR */}
          <div className="flex items-end justify-between pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Digital Kidney Twin Report — Advanced Analysis</p>
              <p>AI-powered simulation for clinical decision support.</p>
              <p>Not a substitute for professional medical diagnosis.</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <QRCodeSVG value={qrData} size={72} level="M" />
              <p className="text-[10px] text-muted-foreground">Scan for data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

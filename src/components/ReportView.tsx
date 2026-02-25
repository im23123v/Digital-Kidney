import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { PatientData, KidneyMetrics, Treatment, predictFutureMetrics } from "@/lib/kidney-simulation";
import KidneyVisualization from "./KidneyVisualization";
import { ArrowLeft, Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReportViewProps {
  patient: PatientData;
  baseline: KidneyMetrics;
  simulated: KidneyMetrics | null;
  treatments: Treatment[];
  adjustments: { hydration: number; proteinIntake: number; saltIntake: number };
  onBack: () => void;
}

function MetricRow({ label, value, unit, reference, status }: {
  label: string; value: string | number; unit?: string; reference?: string; status?: "normal" | "warning" | "danger";
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2.5 text-sm font-medium text-foreground">{label}</td>
      <td className="py-2.5 text-sm font-mono text-right">
        {status && (
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
            status === "normal" ? "bg-medical-green" : status === "warning" ? "bg-medical-amber" : "bg-medical-red"
          }`} />
        )}
        {value} {unit}
      </td>
      <td className="py-2.5 text-xs text-muted-foreground text-right">{reference}</td>
    </tr>
  );
}

export default function ReportView({ patient, baseline, simulated, treatments, adjustments, onBack }: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const active = simulated || baseline;
  const prediction = predictFutureMetrics(active, 6);
  const reportDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const reportTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const qrData = JSON.stringify({
    patient: patient.name,
    date: reportDate,
    gfr: active.gfr,
    creatinine: active.creatinine,
    efficiency: active.efficiency,
    stoneRisk: active.stoneRisk,
  });

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`kidney-report-${patient.name.replace(/\s/g, "-")}-${reportDate}.pdf`);
  };

  const getStatus = (v: number, lo: number, hi: number): "normal" | "warning" | "danger" => {
    if (v >= lo && v <= hi) return "normal";
    const d = v < lo ? (lo - v) / lo : (v - hi) / hi;
    return d > 0.3 ? "danger" : "warning";
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
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
              <h1 className="text-2xl font-bold">Digital Kidney Report</h1>
              <p className="text-sm opacity-80 mt-1">Personalized Kidney Health Analysis</p>
            </div>
            <div className="text-right text-sm opacity-80">
              <p>Date: {reportDate}</p>
              <p>Time: {reportTime}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-secondary">
            <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-semibold">{patient.name}</p></div>
            <div><p className="text-xs text-muted-foreground">Age / Gender</p><p className="text-sm font-semibold">{patient.age} yrs / {patient.gender}</p></div>
            <div><p className="text-xs text-muted-foreground">Weight / Height</p><p className="text-sm font-semibold">{patient.weight} kg / {patient.height} cm</p></div>
            <div><p className="text-xs text-muted-foreground">BP</p><p className="text-sm font-semibold">{patient.systolicBP}/{patient.diastolicBP} mmHg</p></div>
          </div>

          {/* Kidney Snapshot + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center p-4">
              <KidneyVisualization efficiency={active.efficiency} stressIndex={active.stressIndex} animated={false} />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-medical-teal-light text-center">
                <p className="text-xs text-muted-foreground">Efficiency</p>
                <p className="text-3xl font-bold font-mono text-primary">{active.efficiency}%</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${active.gfr >= 60 ? "bg-medical-green-light" : "bg-medical-red-light"}`}>
                <p className="text-xs text-muted-foreground">GFR</p>
                <p className="text-3xl font-bold font-mono">{active.gfr}</p>
                <p className="text-xs mt-1">{active.gfrCategory}</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${active.stoneRisk < 30 ? "bg-medical-green-light" : "bg-medical-amber-light"}`}>
                <p className="text-xs text-muted-foreground">Stone Risk</p>
                <p className="text-3xl font-bold font-mono">{active.stoneRisk}%</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${active.stressIndex < 40 ? "bg-medical-green-light" : "bg-medical-amber-light"}`}>
                <p className="text-xs text-muted-foreground">Stress Index</p>
                <p className="text-3xl font-bold font-mono">{active.stressIndex}%</p>
              </div>
            </div>
          </div>

          {/* Detailed Metrics Table */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Kidney Function Test Results</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground py-2">TEST</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground py-2">VALUE</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground py-2">REFERENCE</th>
                </tr>
              </thead>
              <tbody>
                <MetricRow label="GFR" value={active.gfr} unit="mL/min/1.73m²" reference="> 90" status={active.gfr >= 90 ? "normal" : active.gfr >= 60 ? "warning" : "danger"} />
                <MetricRow label="Serum Creatinine" value={active.creatinine} unit="mg/dL" reference="0.55 - 1.02" status={getStatus(active.creatinine, 0.55, 1.02)} />
                <MetricRow label="BUN" value={active.bun} unit="mg/dL" reference="7.9 - 20" status={getStatus(active.bun, 7.9, 20)} />
                <MetricRow label="Uric Acid" value={active.uricAcid} unit="mg/dL" reference="2.6 - 6.0" status={getStatus(active.uricAcid, 2.6, 6)} />
                <MetricRow label="Kidney Efficiency" value={`${active.efficiency}%`} reference="> 75%" status={active.efficiency >= 75 ? "normal" : active.efficiency >= 50 ? "warning" : "danger"} />
                <MetricRow label="Stone Risk" value={`${active.stoneRisk}%`} reference="< 25%" status={active.stoneRisk < 25 ? "normal" : active.stoneRisk < 50 ? "warning" : "danger"} />
                <MetricRow label="Stress Index" value={`${active.stressIndex}%`} reference="< 30%" status={active.stressIndex < 30 ? "normal" : active.stressIndex < 60 ? "warning" : "danger"} />
                <MetricRow label="Electrolyte Balance" value={`${active.electrolyteBalance}%`} reference="> 75%" status={active.electrolyteBalance >= 75 ? "normal" : "warning"} />
                <MetricRow label="Kidney Age" value={active.kidneyAge} unit="yrs" reference={`≤ ${patient.age}`} status={active.kidneyAge <= patient.age ? "normal" : "warning"} />
              </tbody>
            </table>
          </div>

          {/* 6-Month Prediction */}
          <div className="p-4 rounded-lg bg-medical-blue-light">
            <h3 className="text-sm font-semibold mb-2">6-Month Predicted Outcome</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">GFR</p>
                <p className="text-lg font-bold font-mono">{prediction.gfr}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Efficiency</p>
                <p className="text-lg font-bold font-mono">{prediction.efficiency}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stress</p>
                <p className="text-lg font-bold font-mono">{prediction.stressIndex}%</p>
              </div>
            </div>
          </div>

          {/* Treatments */}
          {treatments.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Prescribed Treatment</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground py-2">MEDICINE</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground py-2">TABLETS/DAY</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground py-2">FREQUENCY</th>
                  </tr>
                </thead>
                <tbody>
                  {treatments.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 text-sm font-medium">{t.medicine}</td>
                      <td className="py-2.5 text-sm font-mono text-right">{t.tablets}</td>
                      <td className="py-2.5 text-sm text-right text-muted-foreground">{t.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer with QR */}
          <div className="flex items-end justify-between pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Digital Kidney Simulation Report</p>
              <p>This is a simulated analysis for educational/clinical decision support.</p>
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

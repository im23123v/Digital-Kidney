import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PatientIntakeForm from "@/components/PatientIntakeForm";
import SimulationDashboard from "@/components/SimulationDashboard";
import ReportView from "@/components/ReportView";
import { PatientData, KidneyMetrics, Treatment } from "@/lib/kidney-simulation";
import { Activity, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = "landing" | "intake" | "simulation" | "report";

interface ReportData {
  patient: PatientData;
  baseline: KidneyMetrics;
  simulated: KidneyMetrics | null;
  treatments: Treatment[];
  adjustments: { hydration: number; proteinIntake: number; saltIntake: number };
}

export default function Index() {
  const [view, setView] = useState<View>("landing");
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handlePatientSubmit = (data: PatientData) => {
    setPatient(data);
    setView("simulation");
  };

  const handleGenerateReport = (data: ReportData) => {
    setReportData(data);
    setView("report");
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Hero */}
            <div className="relative flex-1 flex items-center justify-center px-6 overflow-hidden">
              <div className="gradient-glow absolute inset-0 pointer-events-none" />
              <div className="relative text-center max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6"
                >
                  <Activity className="w-4 h-4" />
                  AI-Powered Kidney Simulation
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
                >
                  Digital Kidney
                  <span className="block text-primary">Twin System</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-muted-foreground mt-5 max-w-lg mx-auto"
                >
                  Create a personalized kidney simulation, test treatments in real-time, and generate comprehensive health reports.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8"
                >
                  <Button
                    size="lg"
                    className="gradient-hero border-0 h-13 px-8 text-base"
                    onClick={() => setView("intake")}
                  >
                    Start Patient Assessment
                  </Button>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap items-center justify-center gap-4 mt-12"
                >
                  {[
                    { icon: Activity, text: "Real-time Metrics" },
                    { icon: Zap, text: "Treatment Simulation" },
                    { icon: Shield, text: "Risk Analysis" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4 text-primary" />
                      {text}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {view === "intake" && (
          <motion.div
            key="intake"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-8 px-6"
          >
            <div className="max-w-2xl mx-auto mb-6">
              <Button variant="ghost" onClick={() => setView("landing")} className="text-muted-foreground">
                ← Back
              </Button>
            </div>
            <PatientIntakeForm onSubmit={handlePatientSubmit} />
          </motion.div>
        )}

        {view === "simulation" && patient && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-6 px-6"
          >
            <SimulationDashboard
              patient={patient}
              onBack={() => setView("intake")}
              onGenerateReport={handleGenerateReport}
            />
          </motion.div>
        )}

        {view === "report" && reportData && (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-6 px-6"
          >
            <ReportView
              patient={reportData.patient}
              baseline={reportData.baseline}
              simulated={reportData.simulated}
              treatments={reportData.treatments}
              adjustments={reportData.adjustments}
              onBack={() => setView("simulation")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

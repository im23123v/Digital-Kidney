// Kidney simulation engine - calculates metrics based on patient data and treatment

export interface PatientData {
  name: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  height: number;
  systolicBP: number;
  diastolicBP: number;
  glucose: number;
  uricAcid: number;
  hydrationLevel: number; // 1-10
  serumCreatinine: number;
  bun: number;
  serumCalcium: number;
  serumPotassium: number;
  serumSodium: number;
  existingConditions: string[];
  currentMedicines: string[];
  proteinIntake: number; // g/day
  saltIntake: number; // g/day
}

export interface KidneyMetrics {
  gfr: number;
  gfrCategory: string;
  creatinine: number;
  uricAcid: number;
  bun: number;
  stoneRisk: number; // 0-100
  stressIndex: number; // 0-100
  efficiency: number; // 0-100
  kidneyAge: number;
  filtrationRate: number;
  tubularReabsorption: number;
  electrolyteBalance: number; // 0-100
  acidBaseBalance: number; // 0-100
}

export interface Treatment {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  tablets: number;
}

export interface SimulationResult {
  baseline: KidneyMetrics;
  simulated: KidneyMetrics;
  treatments: Treatment[];
  adjustments: {
    hydration: number;
    proteinIntake: number;
    saltIntake: number;
  };
  prediction: {
    threeMonths: KidneyMetrics;
    sixMonths: KidneyMetrics;
    oneYear: KidneyMetrics;
  };
}

export function calculateGFR(age: number, gender: string, creatinine: number, weight: number): number {
  // Cockcroft-Gault approximation
  let gfr = ((140 - age) * weight) / (72 * creatinine);
  if (gender === "female") gfr *= 0.85;
  return Math.round(Math.min(Math.max(gfr, 5), 150) * 10) / 10;
}

export function getGFRCategory(gfr: number): string {
  if (gfr >= 90) return "G1 - Normal";
  if (gfr >= 60) return "G2 - Mildly decreased";
  if (gfr >= 45) return "G3a - Mild-moderate";
  if (gfr >= 30) return "G3b - Moderate-severe";
  if (gfr >= 15) return "G4 - Severely decreased";
  return "G5 - Kidney failure";
}

export function calculateBaselineMetrics(patient: PatientData): KidneyMetrics {
  const gfr = calculateGFR(patient.age, patient.gender, patient.serumCreatinine, patient.weight);
  const gfrCategory = getGFRCategory(gfr);

  // Stone risk factors
  let stoneRisk = 10;
  if (patient.uricAcid > 6) stoneRisk += (patient.uricAcid - 6) * 12;
  if (patient.serumCalcium > 10) stoneRisk += (patient.serumCalcium - 10) * 15;
  if (patient.hydrationLevel < 5) stoneRisk += (5 - patient.hydrationLevel) * 8;
  if (patient.existingConditions.includes("kidney_stones")) stoneRisk += 20;
  stoneRisk = Math.min(Math.max(stoneRisk, 0), 100);

  // Stress index
  let stressIndex = 20;
  if (patient.systolicBP > 130) stressIndex += (patient.systolicBP - 130) * 0.5;
  if (patient.glucose > 100) stressIndex += (patient.glucose - 100) * 0.3;
  if (patient.existingConditions.includes("diabetes")) stressIndex += 15;
  if (patient.existingConditions.includes("hypertension")) stressIndex += 12;
  if (patient.saltIntake > 5) stressIndex += (patient.saltIntake - 5) * 4;
  stressIndex = Math.min(Math.max(stressIndex, 0), 100);

  // Efficiency
  let efficiency = Math.min((gfr / 120) * 100, 100);
  efficiency = Math.max(efficiency, 5);

  // Kidney biological age
  const kidneyAge = Math.round(patient.age + (100 - efficiency) * 0.3);

  // Electrolyte balance
  let electrolyteBalance = 85;
  if (patient.serumPotassium < 3.5 || patient.serumPotassium > 5.1) electrolyteBalance -= 20;
  if (patient.serumSodium < 136 || patient.serumSodium > 146) electrolyteBalance -= 15;
  if (patient.serumCalcium < 8.8 || patient.serumCalcium > 10.6) electrolyteBalance -= 15;

  return {
    gfr,
    gfrCategory,
    creatinine: patient.serumCreatinine,
    uricAcid: patient.uricAcid,
    bun: patient.bun,
    stoneRisk: Math.round(stoneRisk),
    stressIndex: Math.round(stressIndex),
    efficiency: Math.round(efficiency),
    kidneyAge,
    filtrationRate: Math.round(gfr * 1.44), // mL/day approximation
    tubularReabsorption: Math.round(99 - stressIndex * 0.05),
    electrolyteBalance: Math.round(Math.max(electrolyteBalance, 0)),
    acidBaseBalance: Math.round(85 - stressIndex * 0.15),
  };
}

export function simulateTreatment(
  baseline: KidneyMetrics,
  patient: PatientData,
  treatments: Treatment[],
  adjustments: { hydration: number; proteinIntake: number; saltIntake: number }
): KidneyMetrics {
  let gfrDelta = 0;
  let creatinineDelta = 0;
  let uricAcidDelta = 0;
  let stressReduction = 0;
  let stoneRiskReduction = 0;

  // Treatment effects (simplified simulation)
  for (const t of treatments) {
    const med = t.medicine.toLowerCase();
    if (med.includes("ace") || med.includes("enalapril") || med.includes("lisinopril") || med.includes("ramipril")) {
      gfrDelta += 5;
      stressReduction += 10;
    }
    if (med.includes("arb") || med.includes("losartan") || med.includes("valsartan") || med.includes("telmisartan")) {
      gfrDelta += 4;
      stressReduction += 8;
    }
    if (med.includes("allopurinol") || med.includes("febuxostat")) {
      uricAcidDelta -= 2;
      stoneRiskReduction += 15;
    }
    if (med.includes("metformin")) {
      stressReduction += 5;
    }
    if (med.includes("amlodipine") || med.includes("nifedipine")) {
      stressReduction += 8;
    }
    if (med.includes("diuretic") || med.includes("furosemide") || med.includes("hydrochlorothiazide")) {
      stressReduction += 6;
      gfrDelta += 2;
    }
    if (med.includes("sodium bicarbonate")) {
      gfrDelta += 3;
    }
  }

  // Lifestyle adjustments
  const hydrationDiff = adjustments.hydration - patient.hydrationLevel;
  if (hydrationDiff > 0) {
    stoneRiskReduction += hydrationDiff * 5;
    gfrDelta += hydrationDiff * 0.5;
  }

  const saltReduction = patient.saltIntake - adjustments.saltIntake;
  if (saltReduction > 0) {
    stressReduction += saltReduction * 3;
    gfrDelta += saltReduction * 0.5;
  }

  const proteinReduction = patient.proteinIntake - adjustments.proteinIntake;
  if (proteinReduction > 0) {
    stressReduction += proteinReduction * 0.1;
    creatinineDelta -= proteinReduction * 0.002;
  }

  const newGfr = Math.min(Math.max(baseline.gfr + gfrDelta, 5), 150);
  const newCreatinine = Math.max(baseline.creatinine + creatinineDelta, 0.3);
  const newUricAcid = Math.max(baseline.uricAcid + uricAcidDelta, 1);
  const newStress = Math.max(baseline.stressIndex - stressReduction, 0);
  const newStoneRisk = Math.max(baseline.stoneRisk - stoneRiskReduction, 0);
  const newEfficiency = Math.min((newGfr / 120) * 100, 100);

  return {
    gfr: Math.round(newGfr * 10) / 10,
    gfrCategory: getGFRCategory(newGfr),
    creatinine: Math.round(newCreatinine * 100) / 100,
    uricAcid: Math.round(newUricAcid * 10) / 10,
    bun: Math.round(baseline.bun * (newCreatinine / baseline.creatinine) * 10) / 10,
    stoneRisk: Math.round(newStoneRisk),
    stressIndex: Math.round(newStress),
    efficiency: Math.round(newEfficiency),
    kidneyAge: Math.round(patient.age + (100 - newEfficiency) * 0.3),
    filtrationRate: Math.round(newGfr * 1.44),
    tubularReabsorption: Math.round(99 - newStress * 0.05),
    electrolyteBalance: Math.min(baseline.electrolyteBalance + Math.round(stressReduction * 0.3), 100),
    acidBaseBalance: Math.min(baseline.acidBaseBalance + Math.round(stressReduction * 0.2), 100),
  };
}

export function predictFutureMetrics(
  simulated: KidneyMetrics,
  monthsAhead: number
): KidneyMetrics {
  // Simple prediction - improvement tapers over time
  const improvementFactor = 1 - Math.exp(-monthsAhead / 6);
  const maxImprovement = (simulated.efficiency - 50) * 0.1;

  return {
    ...simulated,
    gfr: Math.round((simulated.gfr + maxImprovement * improvementFactor * 2) * 10) / 10,
    gfrCategory: getGFRCategory(simulated.gfr + maxImprovement * improvementFactor * 2),
    efficiency: Math.round(Math.min(simulated.efficiency + maxImprovement * improvementFactor, 100)),
    stressIndex: Math.round(Math.max(simulated.stressIndex - improvementFactor * 5, 0)),
    stoneRisk: Math.round(Math.max(simulated.stoneRisk - improvementFactor * 8, 0)),
  };
}

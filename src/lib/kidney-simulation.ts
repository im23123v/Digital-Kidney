// Kidney simulation engine - advanced digital twin with drug interactions, 
// AI treatment ranking, and time-based progression

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
  hydrationLevel: number;
  serumCreatinine: number;
  bun: number;
  serumCalcium: number;
  serumPotassium: number;
  serumSodium: number;
  serumPhosphorus: number;
  serumAlbumin: number;
  hemoglobin: number;
  hba1c: number;
  cholesterol: number;
  triglycerides: number;
  urineProtein: number; // mg/day (proteinuria)
  urineAlbumin: number; // mg/day (albuminuria)
  egfrCysC: number; // Cystatin C based eGFR if available, 0 if not
  parathyroidHormone: number; // pg/mL
  vitaminD: number; // ng/mL
  cReactiveProtein: number; // mg/L (inflammation marker)
  existingConditions: string[];
  currentMedicines: string[];
  proteinIntake: number;
  saltIntake: number;
  waterIntake: number; // L/day
  exerciseLevel: number; // 0-10
  smokingStatus: "never" | "former" | "current";
  alcoholUnitsPerWeek: number;
}

export interface KidneyMetrics {
  // Core
  gfr: number;
  gfrCategory: string;
  ckdStage: number;
  creatinine: number;
  uricAcid: number;
  bun: number;
  bunCreatinineRatio: number;
  
  // Risk scores
  stoneRisk: number;
  stressIndex: number;
  ckdProgressionRisk: number; // 0-100
  cardiovascularRisk: number; // 0-100
  akirisk: number; // acute kidney injury risk 0-100
  infectionRisk: number; // 0-100

  // Function
  efficiency: number;
  kidneyAge: number;
  filtrationRate: number;
  tubularReabsorption: number;
  
  // Balance
  electrolyteBalance: number;
  acidBaseBalance: number;
  mineralBoneScore: number; // 0-100
  anemiaScore: number; // 0-100
  inflammationScore: number; // 0-100
  
  // Advanced
  proteinuriaLevel: number; // mg/day
  albuminuriaCategory: string;
  kidneyPerfusionIndex: number; // 0-100
  nephronHealth: number; // 0-100
  interstitialHealth: number; // 0-100
  vascularHealth: number; // 0-100
  
  // Composite
  overallHealthScore: number; // 0-100
  riskHeatmap: RiskHeatmapData;
}

export interface RiskHeatmapData {
  glomerular: number;
  tubular: number;
  vascular: number;
  interstitial: number;
  collecting: number;
  cortex: number;
  medulla: number;
}

export interface Treatment {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  tablets: number;
  category?: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  effect: string;
}

export interface TreatmentRanking {
  combination: Treatment[];
  score: number;
  gfrImprovement: number;
  riskReduction: number;
  sideEffectRisk: number;
  interactionCount: number;
  reasoning: string;
}

export interface SimulationResult {
  baseline: KidneyMetrics;
  simulated: KidneyMetrics;
  treatments: Treatment[];
  adjustments: {
    hydration: number;
    proteinIntake: number;
    saltIntake: number;
    waterIntake: number;
    exerciseLevel: number;
  };
  drugInteractions: DrugInteraction[];
  treatmentRankings: TreatmentRanking[];
  prediction: {
    sevenDays: KidneyMetrics;
    thirtyDays: KidneyMetrics;
    ninetyDays: KidneyMetrics;
    sixMonths: KidneyMetrics;
    oneYear: KidneyMetrics;
  };
}

// ============ DRUG INTERACTION DATABASE ============

const DRUG_INTERACTIONS: DrugInteraction[] = [
  { drug1: "ace", drug2: "arb", severity: "severe", description: "Dual RAAS blockade", effect: "Hyperkalemia, hypotension, renal failure risk" },
  { drug1: "ace", drug2: "potassium", severity: "severe", description: "ACEi + K+ supplements", effect: "Life-threatening hyperkalemia" },
  { drug1: "ace", drug2: "nsaid", severity: "moderate", description: "ACEi + NSAID", effect: "Reduced antihypertensive effect, acute kidney injury risk" },
  { drug1: "arb", drug2: "potassium", severity: "severe", description: "ARB + K+ supplements", effect: "Life-threatening hyperkalemia" },
  { drug1: "arb", drug2: "nsaid", severity: "moderate", description: "ARB + NSAID", effect: "Reduced renal function, fluid retention" },
  { drug1: "metformin", drug2: "contrast", severity: "severe", description: "Metformin + IV contrast", effect: "Lactic acidosis risk" },
  { drug1: "allopurinol", drug2: "azathioprine", severity: "severe", description: "Xanthine oxidase + thiopurine", effect: "Bone marrow suppression" },
  { drug1: "diuretic", drug2: "ace", severity: "moderate", description: "Diuretic + ACEi first dose", effect: "Excessive hypotension" },
  { drug1: "diuretic", drug2: "lithium", severity: "moderate", description: "Diuretic + Lithium", effect: "Lithium toxicity" },
  { drug1: "diuretic", drug2: "nsaid", severity: "moderate", description: "Diuretic + NSAID", effect: "Reduced diuretic efficacy, renal impairment" },
  { drug1: "ccb", drug2: "beta_blocker", severity: "mild", description: "CCB + Beta blocker", effect: "Excessive bradycardia" },
  { drug1: "statin", drug2: "fibrate", severity: "moderate", description: "Statin + Fibrate", effect: "Rhabdomyolysis risk → acute kidney injury" },
  { drug1: "aminoglycoside", drug2: "diuretic", severity: "severe", description: "Aminoglycoside + Loop diuretic", effect: "Ototoxicity and nephrotoxicity" },
  { drug1: "cyclosporine", drug2: "nsaid", severity: "severe", description: "Cyclosporine + NSAID", effect: "Nephrotoxicity" },
  { drug1: "ace", drug2: "trimethoprim", severity: "moderate", description: "ACEi + Trimethoprim", effect: "Hyperkalemia" },
];

const MEDICINE_CATEGORIES: Record<string, string[]> = {
  ace: ["enalapril", "lisinopril", "ramipril", "captopril", "perindopril", "benazepril", "fosinopril", "quinapril", "trandolapril"],
  arb: ["losartan", "valsartan", "telmisartan", "irbesartan", "candesartan", "olmesartan", "azilsartan"],
  ccb: ["amlodipine", "nifedipine", "felodipine", "diltiazem", "verapamil", "nicardipine"],
  diuretic: ["furosemide", "hydrochlorothiazide", "spironolactone", "bumetanide", "torsemide", "amiloride", "chlorthalidone", "indapamide"],
  beta_blocker: ["metoprolol", "atenolol", "carvedilol", "bisoprolol", "propranolol", "nebivolol"],
  statin: ["atorvastatin", "rosuvastatin", "simvastatin", "pravastatin", "fluvastatin"],
  xanthine_oxidase: ["allopurinol", "febuxostat"],
  sglt2: ["empagliflozin", "dapagliflozin", "canagliflozin"],
  dpp4: ["sitagliptin", "linagliptin", "saxagliptin", "alogliptin"],
  glp1: ["semaglutide", "liraglutide", "dulaglutide", "exenatide"],
  nsaid: ["ibuprofen", "naproxen", "diclofenac", "celecoxib", "indomethacin"],
  anticoagulant: ["warfarin", "apixaban", "rivaroxaban", "dabigatran"],
  phosphate_binder: ["sevelamer", "lanthanum", "calcium acetate", "calcium carbonate"],
  esa: ["epoetin", "darbepoetin"],
  iron: ["ferric carboxymaltose", "iron sucrose", "ferrous sulfate"],
};

function getMedicineCategory(medicine: string): string | null {
  const lower = medicine.toLowerCase();
  for (const [cat, drugs] of Object.entries(MEDICINE_CATEGORIES)) {
    if (drugs.some(d => lower.includes(d))) return cat;
  }
  if (lower.includes("ace") && !lower.includes("acetate")) return "ace";
  if (lower.includes("arb")) return "arb";
  if (lower.includes("diuretic")) return "diuretic";
  if (lower.includes("metformin")) return "sglt2"; // oral antidiabetic bucket
  if (lower.includes("sodium bicarbonate")) return "alkalizer";
  return null;
}

// ============ GFR & STAGING ============

export function calculateGFR(age: number, gender: string, creatinine: number, weight: number): number {
  // CKD-EPI 2021 (race-free)
  const kappa = gender === "female" ? 0.7 : 0.9;
  const alpha = gender === "female" ? -0.241 : -0.302;
  const ratio = creatinine / kappa;
  const minR = Math.min(ratio, 1);
  const maxR = Math.max(ratio, 1);
  let gfr = 142 * Math.pow(minR, alpha) * Math.pow(maxR, -1.2) * Math.pow(0.9938, age);
  if (gender === "female") gfr *= 1.012;
  return Math.round(Math.min(Math.max(gfr, 3), 160) * 10) / 10;
}

export function getGFRCategory(gfr: number): string {
  if (gfr >= 90) return "G1 - Normal or High";
  if (gfr >= 60) return "G2 - Mildly decreased";
  if (gfr >= 45) return "G3a - Mild-moderate decrease";
  if (gfr >= 30) return "G3b - Moderate-severe decrease";
  if (gfr >= 15) return "G4 - Severely decreased";
  return "G5 - Kidney failure";
}

function getCKDStage(gfr: number): number {
  if (gfr >= 90) return 1;
  if (gfr >= 60) return 2;
  if (gfr >= 45) return 3;
  if (gfr >= 30) return 3;
  if (gfr >= 15) return 4;
  return 5;
}

function getAlbuminuriaCategory(albumin: number): string {
  if (albumin < 30) return "A1 - Normal";
  if (albumin < 300) return "A2 - Moderately increased";
  return "A3 - Severely increased";
}

// ============ BASELINE METRICS ============

export function calculateBaselineMetrics(patient: PatientData): KidneyMetrics {
  const gfr = calculateGFR(patient.age, patient.gender, patient.serumCreatinine, patient.weight);
  const gfrCategory = getGFRCategory(gfr);
  const ckdStage = getCKDStage(gfr);

  // BUN/Creatinine ratio
  const bunCreatinineRatio = Math.round((patient.bun / patient.serumCreatinine) * 10) / 10;

  // Stone risk (multi-factor)
  let stoneRisk = 8;
  if (patient.uricAcid > 6) stoneRisk += (patient.uricAcid - 6) * 12;
  if (patient.serumCalcium > 10) stoneRisk += (patient.serumCalcium - 10) * 15;
  if (patient.serumPhosphorus > 4.5) stoneRisk += (patient.serumPhosphorus - 4.5) * 8;
  if (patient.hydrationLevel < 5) stoneRisk += (5 - patient.hydrationLevel) * 8;
  if (patient.waterIntake < 2) stoneRisk += (2 - patient.waterIntake) * 10;
  if (patient.existingConditions.includes("kidney_stones")) stoneRisk += 20;
  if (patient.existingConditions.includes("gout")) stoneRisk += 10;
  if (patient.urineProtein > 150) stoneRisk += 5;
  stoneRisk = clamp(stoneRisk, 0, 100);

  // Stress index (comprehensive)
  let stressIndex = 15;
  if (patient.systolicBP > 130) stressIndex += (patient.systolicBP - 130) * 0.5;
  if (patient.diastolicBP > 85) stressIndex += (patient.diastolicBP - 85) * 0.4;
  if (patient.glucose > 100) stressIndex += (patient.glucose - 100) * 0.3;
  if (patient.hba1c > 6.5) stressIndex += (patient.hba1c - 6.5) * 5;
  if (patient.existingConditions.includes("diabetes")) stressIndex += 15;
  if (patient.existingConditions.includes("hypertension")) stressIndex += 12;
  if (patient.saltIntake > 5) stressIndex += (patient.saltIntake - 5) * 4;
  if (patient.cReactiveProtein > 3) stressIndex += (patient.cReactiveProtein - 3) * 2;
  if (patient.smokingStatus === "current") stressIndex += 10;
  if (patient.smokingStatus === "former") stressIndex += 3;
  if (patient.alcoholUnitsPerWeek > 14) stressIndex += (patient.alcoholUnitsPerWeek - 14) * 0.5;
  if (patient.proteinIntake > 80) stressIndex += (patient.proteinIntake - 80) * 0.2;
  if (patient.cholesterol > 200) stressIndex += (patient.cholesterol - 200) * 0.05;
  stressIndex = clamp(stressIndex, 0, 100);

  // CKD progression risk
  let ckdProgression = 10;
  if (gfr < 60) ckdProgression += (60 - gfr) * 0.8;
  if (patient.urineAlbumin > 30) ckdProgression += Math.log(patient.urineAlbumin / 30) * 10;
  if (patient.urineProtein > 500) ckdProgression += 15;
  if (patient.existingConditions.includes("diabetes")) ckdProgression += 12;
  if (patient.existingConditions.includes("hypertension")) ckdProgression += 8;
  if (patient.existingConditions.includes("ckd")) ckdProgression += 15;
  if (patient.hba1c > 7) ckdProgression += (patient.hba1c - 7) * 4;
  if (patient.systolicBP > 140) ckdProgression += 8;
  ckdProgression = clamp(ckdProgression, 0, 100);

  // CV risk
  let cvRisk = 8;
  if (patient.systolicBP > 140) cvRisk += (patient.systolicBP - 140) * 0.6;
  if (patient.cholesterol > 200) cvRisk += (patient.cholesterol - 200) * 0.1;
  if (patient.triglycerides > 150) cvRisk += (patient.triglycerides - 150) * 0.05;
  if (gfr < 60) cvRisk += (60 - gfr) * 0.5;
  if (patient.existingConditions.includes("heart_disease")) cvRisk += 20;
  if (patient.existingConditions.includes("diabetes")) cvRisk += 10;
  if (patient.smokingStatus === "current") cvRisk += 12;
  if (patient.age > 55) cvRisk += (patient.age - 55) * 0.5;
  cvRisk = clamp(cvRisk, 0, 100);

  // AKI risk
  let akirisk = 5;
  if (gfr < 45) akirisk += 15;
  if (patient.age > 65) akirisk += 8;
  if (patient.existingConditions.includes("diabetes")) akirisk += 8;
  if (patient.existingConditions.includes("heart_disease")) akirisk += 10;
  if (patient.hydrationLevel < 3) akirisk += 15;
  if (patient.serumCreatinine > 1.5) akirisk += (patient.serumCreatinine - 1.5) * 10;
  const hasNSAID = patient.currentMedicines.some(m => MEDICINE_CATEGORIES.nsaid?.some(n => m.toLowerCase().includes(n)));
  if (hasNSAID) akirisk += 12;
  akirisk = clamp(akirisk, 0, 100);

  // Infection risk
  let infectionRisk = 5;
  if (gfr < 30) infectionRisk += 15;
  if (patient.existingConditions.includes("diabetes")) infectionRisk += 10;
  if (patient.existingConditions.includes("uti")) infectionRisk += 15;
  if (patient.age > 70) infectionRisk += 8;
  if (patient.serumAlbumin < 3.5) infectionRisk += (3.5 - patient.serumAlbumin) * 10;
  infectionRisk = clamp(infectionRisk, 0, 100);

  // Efficiency
  let efficiency = Math.min((gfr / 120) * 100, 100);
  efficiency = Math.max(efficiency, 5);

  // Kidney biological age
  const kidneyAge = Math.round(patient.age + (100 - efficiency) * 0.4 + stressIndex * 0.1);

  // Electrolyte balance
  let electrolyteBalance = 90;
  if (patient.serumPotassium < 3.5 || patient.serumPotassium > 5.1) electrolyteBalance -= 25;
  else if (patient.serumPotassium < 3.8 || patient.serumPotassium > 4.8) electrolyteBalance -= 8;
  if (patient.serumSodium < 136 || patient.serumSodium > 146) electrolyteBalance -= 20;
  else if (patient.serumSodium < 138 || patient.serumSodium > 144) electrolyteBalance -= 8;
  if (patient.serumCalcium < 8.8 || patient.serumCalcium > 10.6) electrolyteBalance -= 15;
  if (patient.serumPhosphorus < 2.5 || patient.serumPhosphorus > 4.5) electrolyteBalance -= 12;

  // Mineral bone score
  let mineralBoneScore = 85;
  if (patient.parathyroidHormone > 65) mineralBoneScore -= Math.min((patient.parathyroidHormone - 65) * 0.3, 30);
  if (patient.vitaminD < 30) mineralBoneScore -= (30 - patient.vitaminD) * 0.8;
  if (patient.serumCalcium < 8.5 || patient.serumCalcium > 10.5) mineralBoneScore -= 15;
  if (patient.serumPhosphorus > 4.5) mineralBoneScore -= (patient.serumPhosphorus - 4.5) * 8;
  mineralBoneScore = clamp(mineralBoneScore, 0, 100);

  // Anemia score
  let anemiaScore = 90;
  const hbLow = patient.gender === "female" ? 12 : 13;
  if (patient.hemoglobin < hbLow) anemiaScore -= (hbLow - patient.hemoglobin) * 15;
  if (gfr < 45) anemiaScore -= 10;
  if (patient.serumAlbumin < 3.5) anemiaScore -= 8;
  anemiaScore = clamp(anemiaScore, 0, 100);

  // Inflammation score
  let inflammationScore = 90;
  if (patient.cReactiveProtein > 1) inflammationScore -= Math.min(patient.cReactiveProtein * 5, 40);
  if (patient.serumAlbumin < 3.5) inflammationScore -= 10;
  inflammationScore = clamp(inflammationScore, 0, 100);

  // Kidney perfusion
  let kidneyPerfusionIndex = 85;
  if (patient.systolicBP > 140) kidneyPerfusionIndex -= (patient.systolicBP - 140) * 0.3;
  if (patient.systolicBP < 90) kidneyPerfusionIndex -= (90 - patient.systolicBP) * 0.5;
  if (patient.existingConditions.includes("heart_disease")) kidneyPerfusionIndex -= 12;
  if (gfr < 60) kidneyPerfusionIndex -= (60 - gfr) * 0.3;
  kidneyPerfusionIndex = clamp(kidneyPerfusionIndex, 0, 100);

  // Nephron health
  const nephronHealth = clamp(Math.round(efficiency * 0.7 + (100 - stressIndex) * 0.3), 0, 100);
  
  // Interstitial health
  let interstitialHealth = 85;
  if (patient.urineProtein > 150) interstitialHealth -= Math.min(patient.urineProtein * 0.02, 25);
  if (patient.cReactiveProtein > 3) interstitialHealth -= 10;
  if (patient.existingConditions.includes("uti")) interstitialHealth -= 10;
  interstitialHealth = clamp(interstitialHealth, 0, 100);

  // Vascular health
  let vascularHealth = 85;
  if (patient.systolicBP > 130) vascularHealth -= (patient.systolicBP - 130) * 0.4;
  if (patient.cholesterol > 200) vascularHealth -= (patient.cholesterol - 200) * 0.08;
  if (patient.existingConditions.includes("diabetes")) vascularHealth -= 10;
  if (patient.smokingStatus === "current") vascularHealth -= 12;
  vascularHealth = clamp(vascularHealth, 0, 100);

  // Risk heatmap
  const riskHeatmap: RiskHeatmapData = {
    glomerular: clamp(100 - (100 - efficiency) * 1.2, 0, 100),
    tubular: clamp(100 - stressIndex * 0.8, 0, 100),
    vascular: vascularHealth,
    interstitial: interstitialHealth,
    collecting: clamp(90 - stoneRisk * 0.3, 0, 100),
    cortex: clamp(nephronHealth * 0.9 + kidneyPerfusionIndex * 0.1, 0, 100),
    medulla: clamp(85 - stressIndex * 0.3 - stoneRisk * 0.2, 0, 100),
  };

  // Overall health score (weighted composite)
  const overallHealthScore = Math.round(
    efficiency * 0.25 +
    (100 - stressIndex) * 0.15 +
    (100 - stoneRisk) * 0.05 +
    (100 - ckdProgression) * 0.15 +
    electrolyteBalance * 0.1 +
    nephronHealth * 0.1 +
    vascularHealth * 0.1 +
    mineralBoneScore * 0.05 +
    anemiaScore * 0.05
  );

  return {
    gfr,
    gfrCategory,
    ckdStage,
    creatinine: patient.serumCreatinine,
    uricAcid: patient.uricAcid,
    bun: patient.bun,
    bunCreatinineRatio,
    stoneRisk: Math.round(stoneRisk),
    stressIndex: Math.round(stressIndex),
    ckdProgressionRisk: Math.round(ckdProgression),
    cardiovascularRisk: Math.round(cvRisk),
    akirisk: Math.round(akirisk),
    infectionRisk: Math.round(infectionRisk),
    efficiency: Math.round(efficiency),
    kidneyAge,
    filtrationRate: Math.round(gfr * 1.44),
    tubularReabsorption: Math.round(99 - stressIndex * 0.05),
    electrolyteBalance: Math.round(clamp(electrolyteBalance, 0, 100)),
    acidBaseBalance: Math.round(clamp(85 - stressIndex * 0.15, 0, 100)),
    mineralBoneScore: Math.round(mineralBoneScore),
    anemiaScore: Math.round(anemiaScore),
    inflammationScore: Math.round(inflammationScore),
    proteinuriaLevel: patient.urineProtein,
    albuminuriaCategory: getAlbuminuriaCategory(patient.urineAlbumin),
    kidneyPerfusionIndex: Math.round(kidneyPerfusionIndex),
    nephronHealth,
    interstitialHealth: Math.round(interstitialHealth),
    vascularHealth: Math.round(vascularHealth),
    overallHealthScore: clamp(overallHealthScore, 0, 100),
    riskHeatmap,
  };
}

// ============ DRUG INTERACTION DETECTION ============

export function detectDrugInteractions(treatments: Treatment[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  const categories = treatments.map(t => ({ treatment: t, category: getMedicineCategory(t.medicine) }));
  
  for (let i = 0; i < categories.length; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      const cat1 = categories[i].category;
      const cat2 = categories[j].category;
      if (!cat1 || !cat2) continue;
      
      for (const interaction of DRUG_INTERACTIONS) {
        if ((cat1 === interaction.drug1 && cat2 === interaction.drug2) ||
            (cat1 === interaction.drug2 && cat2 === interaction.drug1)) {
          interactions.push({
            ...interaction,
            drug1: categories[i].treatment.medicine,
            drug2: categories[j].treatment.medicine,
          });
        }
      }
    }
  }
  return interactions;
}

// ============ TREATMENT SIMULATION ============

export function simulateTreatment(
  baseline: KidneyMetrics,
  patient: PatientData,
  treatments: Treatment[],
  adjustments: { hydration: number; proteinIntake: number; saltIntake: number; waterIntake: number; exerciseLevel: number }
): KidneyMetrics {
  let gfrDelta = 0;
  let creatinineDelta = 0;
  let uricAcidDelta = 0;
  let stressReduction = 0;
  let stoneRiskReduction = 0;
  let ckdProgReduction = 0;
  let cvRiskReduction = 0;
  let inflammationReduction = 0;
  let anemiaImprovement = 0;
  let mineralBoneImprovement = 0;

  for (const t of treatments) {
    const cat = getMedicineCategory(t.medicine);
    const doseMultiplier = Math.min(t.tablets, 3); // diminishing returns after 3
    
    switch (cat) {
      case "ace":
        gfrDelta += 5 * doseMultiplier * 0.7;
        stressReduction += 10;
        ckdProgReduction += 8;
        cvRiskReduction += 6;
        break;
      case "arb":
        gfrDelta += 4 * doseMultiplier * 0.7;
        stressReduction += 9;
        ckdProgReduction += 7;
        cvRiskReduction += 5;
        break;
      case "sglt2":
        gfrDelta += 6;
        stressReduction += 8;
        ckdProgReduction += 15; // strong evidence for CKD protection
        cvRiskReduction += 10;
        stoneRiskReduction += 3;
        break;
      case "xanthine_oxidase":
        uricAcidDelta -= 2.5 * doseMultiplier * 0.6;
        stoneRiskReduction += 15;
        ckdProgReduction += 3;
        break;
      case "ccb":
        stressReduction += 8;
        cvRiskReduction += 5;
        break;
      case "diuretic":
        stressReduction += 6;
        gfrDelta += 2;
        stoneRiskReduction += 5;
        break;
      case "beta_blocker":
        stressReduction += 5;
        cvRiskReduction += 8;
        break;
      case "statin":
        cvRiskReduction += 12;
        inflammationReduction += 5;
        break;
      case "phosphate_binder":
        mineralBoneImprovement += 12;
        break;
      case "esa":
        anemiaImprovement += 20;
        break;
      case "iron":
        anemiaImprovement += 10;
        break;
      case "glp1":
        stressReduction += 5;
        ckdProgReduction += 8;
        cvRiskReduction += 8;
        break;
      default:
        if (t.medicine.toLowerCase().includes("sodium bicarbonate")) {
          gfrDelta += 3;
          ckdProgReduction += 4;
        }
        if (t.medicine.toLowerCase().includes("metformin")) {
          stressReduction += 5;
        }
    }
  }

  // Lifestyle adjustments
  const hydrationDiff = adjustments.hydration - patient.hydrationLevel;
  if (hydrationDiff > 0) {
    stoneRiskReduction += hydrationDiff * 5;
    gfrDelta += hydrationDiff * 0.5;
  }

  const waterDiff = adjustments.waterIntake - patient.waterIntake;
  if (waterDiff > 0) {
    stoneRiskReduction += waterDiff * 4;
  }

  const saltReduction = patient.saltIntake - adjustments.saltIntake;
  if (saltReduction > 0) {
    stressReduction += saltReduction * 3;
    gfrDelta += saltReduction * 0.5;
    cvRiskReduction += saltReduction * 1.5;
  }

  const proteinReduction = patient.proteinIntake - adjustments.proteinIntake;
  if (proteinReduction > 0) {
    stressReduction += proteinReduction * 0.1;
    creatinineDelta -= proteinReduction * 0.002;
    ckdProgReduction += proteinReduction * 0.15;
  }

  const exerciseDiff = adjustments.exerciseLevel - patient.exerciseLevel;
  if (exerciseDiff > 0) {
    stressReduction += exerciseDiff * 1.5;
    cvRiskReduction += exerciseDiff * 2;
    inflammationReduction += exerciseDiff * 1;
  }

  // Drug interaction penalties
  const interactions = detectDrugInteractions(treatments);
  for (const interaction of interactions) {
    if (interaction.severity === "severe") {
      gfrDelta -= 3;
      stressReduction -= 5;
    } else if (interaction.severity === "moderate") {
      gfrDelta -= 1;
      stressReduction -= 2;
    }
  }

  const newGfr = clamp(baseline.gfr + gfrDelta, 5, 150);
  const newCreatinine = Math.max(baseline.creatinine + creatinineDelta, 0.3);
  const newUricAcid = Math.max(baseline.uricAcid + uricAcidDelta, 1);
  const newStress = Math.max(baseline.stressIndex - stressReduction, 0);
  const newStoneRisk = Math.max(baseline.stoneRisk - stoneRiskReduction, 0);
  const newEfficiency = clamp((newGfr / 120) * 100, 5, 100);
  const newCkdProg = Math.max(baseline.ckdProgressionRisk - ckdProgReduction, 0);
  const newCvRisk = Math.max(baseline.cardiovascularRisk - cvRiskReduction, 0);

  const r = baseline; // shorthand
  return {
    gfr: round1(newGfr),
    gfrCategory: getGFRCategory(newGfr),
    ckdStage: getCKDStage(newGfr),
    creatinine: round2(newCreatinine),
    uricAcid: round1(newUricAcid),
    bun: round1(r.bun * (newCreatinine / r.creatinine)),
    bunCreatinineRatio: round1((r.bun * (newCreatinine / r.creatinine)) / newCreatinine),
    stoneRisk: Math.round(newStoneRisk),
    stressIndex: Math.round(newStress),
    ckdProgressionRisk: Math.round(newCkdProg),
    cardiovascularRisk: Math.round(newCvRisk),
    akirisk: Math.round(Math.max(r.akirisk - stressReduction * 0.3, 0)),
    infectionRisk: Math.round(Math.max(r.infectionRisk - stressReduction * 0.1, 0)),
    efficiency: Math.round(newEfficiency),
    kidneyAge: Math.round(patient.age + (100 - newEfficiency) * 0.4 + newStress * 0.1),
    filtrationRate: Math.round(newGfr * 1.44),
    tubularReabsorption: Math.round(99 - newStress * 0.05),
    electrolyteBalance: clamp(r.electrolyteBalance + Math.round(stressReduction * 0.3), 0, 100),
    acidBaseBalance: clamp(r.acidBaseBalance + Math.round(stressReduction * 0.2), 0, 100),
    mineralBoneScore: clamp(r.mineralBoneScore + Math.round(mineralBoneImprovement), 0, 100),
    anemiaScore: clamp(r.anemiaScore + Math.round(anemiaImprovement), 0, 100),
    inflammationScore: clamp(r.inflammationScore + Math.round(inflammationReduction), 0, 100),
    proteinuriaLevel: Math.max(r.proteinuriaLevel * (1 - ckdProgReduction * 0.01), 0),
    albuminuriaCategory: r.albuminuriaCategory,
    kidneyPerfusionIndex: clamp(r.kidneyPerfusionIndex + Math.round(stressReduction * 0.2), 0, 100),
    nephronHealth: clamp(Math.round(newEfficiency * 0.7 + (100 - newStress) * 0.3), 0, 100),
    interstitialHealth: clamp(r.interstitialHealth + Math.round(stressReduction * 0.2), 0, 100),
    vascularHealth: clamp(r.vascularHealth + Math.round(cvRiskReduction * 0.3), 0, 100),
    overallHealthScore: clamp(Math.round(
      newEfficiency * 0.25 +
      (100 - newStress) * 0.15 +
      (100 - newStoneRisk) * 0.05 +
      (100 - newCkdProg) * 0.15 +
      clamp(r.electrolyteBalance + stressReduction * 0.3, 0, 100) * 0.1 +
      clamp(newEfficiency * 0.7 + (100 - newStress) * 0.3, 0, 100) * 0.1 +
      clamp(r.vascularHealth + cvRiskReduction * 0.3, 0, 100) * 0.1 +
      clamp(r.mineralBoneScore + mineralBoneImprovement, 0, 100) * 0.05 +
      clamp(r.anemiaScore + anemiaImprovement, 0, 100) * 0.05
    ), 0, 100),
    riskHeatmap: {
      glomerular: clamp(100 - (100 - newEfficiency) * 1.2, 0, 100),
      tubular: clamp(100 - newStress * 0.8, 0, 100),
      vascular: clamp(r.vascularHealth + cvRiskReduction * 0.3, 0, 100),
      interstitial: clamp(r.interstitialHealth + stressReduction * 0.2, 0, 100),
      collecting: clamp(90 - newStoneRisk * 0.3, 0, 100),
      cortex: clamp((newEfficiency * 0.7 + (100 - newStress) * 0.3) * 0.9 + clamp(r.kidneyPerfusionIndex + stressReduction * 0.2, 0, 100) * 0.1, 0, 100),
      medulla: clamp(85 - newStress * 0.3 - newStoneRisk * 0.2, 0, 100),
    },
  };
}

// ============ TIME-BASED PREDICTION ============

export function predictFutureMetrics(simulated: KidneyMetrics, daysAhead: number): KidneyMetrics {
  const months = daysAhead / 30;
  const improvementFactor = 1 - Math.exp(-months / 6);
  const maxGfrImprovement = (simulated.efficiency - 40) * 0.08;
  const stressDampening = improvementFactor * 5;
  const riskDampening = improvementFactor * 8;

  const newGfr = simulated.gfr + maxGfrImprovement * improvementFactor * 2;
  const newEfficiency = clamp(simulated.efficiency + maxGfrImprovement * improvementFactor, 5, 100);
  const newStress = Math.max(simulated.stressIndex - stressDampening, 0);
  const newStoneRisk = Math.max(simulated.stoneRisk - riskDampening, 0);
  const newCkdProg = Math.max(simulated.ckdProgressionRisk - riskDampening * 0.6, 0);
  const newCvRisk = Math.max(simulated.cardiovascularRisk - riskDampening * 0.4, 0);

  return {
    ...simulated,
    gfr: round1(newGfr),
    gfrCategory: getGFRCategory(newGfr),
    ckdStage: getCKDStage(newGfr),
    efficiency: Math.round(newEfficiency),
    stressIndex: Math.round(newStress),
    stoneRisk: Math.round(newStoneRisk),
    ckdProgressionRisk: Math.round(newCkdProg),
    cardiovascularRisk: Math.round(newCvRisk),
    overallHealthScore: clamp(Math.round(simulated.overallHealthScore + improvementFactor * 5), 0, 100),
    riskHeatmap: {
      ...simulated.riskHeatmap,
      glomerular: clamp(simulated.riskHeatmap.glomerular + improvementFactor * 3, 0, 100),
      tubular: clamp(simulated.riskHeatmap.tubular + improvementFactor * 3, 0, 100),
      vascular: clamp(simulated.riskHeatmap.vascular + improvementFactor * 2, 0, 100),
    },
  };
}

// ============ AI TREATMENT RANKING ============

export function rankTreatmentCombinations(
  baseline: KidneyMetrics,
  patient: PatientData,
  availableTreatments: Treatment[]
): TreatmentRanking[] {
  if (availableTreatments.length === 0) return [];

  // Generate subsets (up to 4 treatments per combo)
  const combos: Treatment[][] = [];
  const maxSize = Math.min(availableTreatments.length, 4);
  
  // Individual treatments
  for (const t of availableTreatments) {
    combos.push([t]);
  }
  
  // Pairs
  if (availableTreatments.length >= 2) {
    for (let i = 0; i < availableTreatments.length; i++) {
      for (let j = i + 1; j < availableTreatments.length; j++) {
        combos.push([availableTreatments[i], availableTreatments[j]]);
      }
    }
  }
  
  // Triples
  if (availableTreatments.length >= 3) {
    for (let i = 0; i < availableTreatments.length; i++) {
      for (let j = i + 1; j < availableTreatments.length; j++) {
        for (let k = j + 1; k < availableTreatments.length; k++) {
          combos.push([availableTreatments[i], availableTreatments[j], availableTreatments[k]]);
        }
      }
    }
  }

  const defaultAdj = {
    hydration: patient.hydrationLevel,
    proteinIntake: patient.proteinIntake,
    saltIntake: patient.saltIntake,
    waterIntake: patient.waterIntake,
    exerciseLevel: patient.exerciseLevel,
  };

  const rankings: TreatmentRanking[] = combos.map(combo => {
    const result = simulateTreatment(baseline, patient, combo, defaultAdj);
    const interactions = detectDrugInteractions(combo);
    const severeCount = interactions.filter(i => i.severity === "severe").length;
    const modCount = interactions.filter(i => i.severity === "moderate").length;
    
    const gfrImprovement = result.gfr - baseline.gfr;
    const riskReduction = (baseline.ckdProgressionRisk - result.ckdProgressionRisk) +
      (baseline.cardiovascularRisk - result.cardiovascularRisk) * 0.5 +
      (baseline.stoneRisk - result.stoneRisk) * 0.3;
    const sideEffectRisk = severeCount * 30 + modCount * 10;
    
    const score = Math.round(
      gfrImprovement * 3 +
      riskReduction * 1.5 +
      (result.overallHealthScore - baseline.overallHealthScore) * 2 -
      sideEffectRisk * 2
    );

    const reasoning = generateReasoning(combo, interactions, gfrImprovement, riskReduction);

    return {
      combination: combo,
      score,
      gfrImprovement: round1(gfrImprovement),
      riskReduction: Math.round(riskReduction),
      sideEffectRisk: Math.round(sideEffectRisk),
      interactionCount: interactions.length,
      reasoning,
    };
  });

  return rankings.sort((a, b) => b.score - a.score).slice(0, 10);
}

function generateReasoning(combo: Treatment[], interactions: DrugInteraction[], gfrImp: number, riskRed: number): string {
  const parts: string[] = [];
  if (gfrImp > 5) parts.push(`Strong GFR improvement (+${round1(gfrImp)})`);
  else if (gfrImp > 0) parts.push(`Moderate GFR benefit (+${round1(gfrImp)})`);
  if (riskRed > 15) parts.push("significant risk reduction");
  if (interactions.length === 0) parts.push("no drug interactions");
  else {
    const severe = interactions.filter(i => i.severity === "severe").length;
    if (severe > 0) parts.push(`⚠️ ${severe} severe interaction(s)`);
    else parts.push(`${interactions.length} mild/moderate interaction(s)`);
  }
  if (combo.length === 1) parts.push("monotherapy");
  else parts.push(`${combo.length}-drug regimen`);
  return parts.join(" • ");
}

// ============ HELPERS ============

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}
function round1(v: number): number { return Math.round(v * 10) / 10; }
function round2(v: number): number { return Math.round(v * 100) / 100; }

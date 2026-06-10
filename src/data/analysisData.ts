import type { FrameAngles } from "@/data/poseData";

export interface MetricResult {
  name: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "danger";
  referenceRange: [number, number];
  description: string;
}

export interface PhaseAnalysis {
  phase: string;
  phaseLabel: string;
  kneeAngle: number;
  hipAngle: number;
  ankleAngle: number;
  pelvicTilt: number;
  trunkLean: number;
}

export interface AnalysisResult {
  metrics: MetricResult[];
  phases: PhaseAnalysis[];
  cadence: number;
  strideLength: number;
  overallScore: number;
}

export type SymmetryGrade = "symmetric" | "mild_asymmetry" | "obvious_asymmetry";

export const SYMMETRY_GRADE_COLORS: Record<SymmetryGrade, string> = {
  symmetric: "#00ff88",
  mild_asymmetry: "#ffaa00",
  obvious_asymmetry: "#ff3366",
};

export interface SymmetryResult {
  pairKey: string;
  label: string;
  leftJoint: string;
  rightJoint: string;
  leftAngleKey: string;
  rightAngleKey: string;
  leftValue: number;
  rightValue: number;
  diff: number;
  grade: SymmetryGrade;
  gradeLabel: string;
}

export const SYMMETRY_THRESHOLDS = {
  symmetric: 3,
  mild_asymmetry: 6,
} as const;

export const SYMMETRY_GRADE_LABELS: Record<SymmetryGrade, string> = {
  symmetric: "对称",
  mild_asymmetry: "轻度不对称",
  obvious_asymmetry: "明显不对称",
};

export const SYMMETRY_PAIRS = [
  {
    pairKey: "knee_valgus",
    label: "膝内扣",
    leftJoint: "leftKnee",
    rightJoint: "rightKnee",
    leftAngleKey: "leftKneeValgus",
    rightAngleKey: "rightKneeValgus",
  },
  {
    pairKey: "hip_flexion",
    label: "髋屈曲",
    leftJoint: "leftHip",
    rightJoint: "rightHip",
    leftAngleKey: "leftHipFlexion",
    rightAngleKey: "rightHipFlexion",
  },
  {
    pairKey: "ankle_dorsiflexion",
    label: "踝背屈",
    leftJoint: "leftAnkle",
    rightJoint: "rightAnkle",
    leftAngleKey: "leftAnkleDorsiflexion",
    rightAngleKey: "rightAnkleDorsiflexion",
  },
] as const;

export type SymmetryPairKey = (typeof SYMMETRY_PAIRS)[number]["pairKey"];

export const CONTRALATERAL_MAP: Record<string, string> = {
  leftKnee: "rightKnee",
  rightKnee: "leftKnee",
  leftHip: "rightHip",
  rightHip: "leftHip",
  leftAnkle: "rightAnkle",
  rightAnkle: "leftAnkle",
  leftShoulder: "rightShoulder",
  rightShoulder: "leftShoulder",
  leftElbow: "rightElbow",
  rightElbow: "leftElbow",
  leftWrist: "rightWrist",
  rightWrist: "leftWrist",
  leftFoot: "rightFoot",
  rightFoot: "leftFoot",
};

export function getSymmetryGrade(diff: number): SymmetryGrade {
  const absDiff = Math.abs(diff);
  if (absDiff <= SYMMETRY_THRESHOLDS.symmetric) return "symmetric";
  if (absDiff <= SYMMETRY_THRESHOLDS.mild_asymmetry) return "mild_asymmetry";
  return "obvious_asymmetry";
}

export function computeSymmetry(angles: FrameAngles): SymmetryResult[] {
  return SYMMETRY_PAIRS.map((pair) => {
    const leftValue = angles[pair.leftAngleKey] ?? 0;
    const rightValue = angles[pair.rightAngleKey] ?? 0;
    const diff = Math.abs(leftValue - rightValue);
    const grade = getSymmetryGrade(diff);
    return {
      pairKey: pair.pairKey,
      label: pair.label,
      leftJoint: pair.leftJoint,
      rightJoint: pair.rightJoint,
      leftAngleKey: pair.leftAngleKey,
      rightAngleKey: pair.rightAngleKey,
      leftValue,
      rightValue,
      diff,
      grade,
      gradeLabel: SYMMETRY_GRADE_LABELS[grade],
    };
  });
}

export function generateAnalysisData(): AnalysisResult {
  return {
    metrics: [
      {
        name: "膝盖内扣角度",
        value: 12.5,
        unit: "°",
        status: "danger",
        referenceRange: [0, 8],
        description: "着地时膝盖内扣角度过大，易导致髌骨疼痛综合征和前交叉韧带损伤",
      },
      {
        name: "骨盆摇摆幅度",
        value: 6.8,
        unit: "°",
        status: "warning",
        referenceRange: [0, 5],
        description: "骨盆左右摇摆幅度偏大，核心稳定性不足，可能引起腰部不适",
      },
      {
        name: "身体前倾角度",
        value: 11.2,
        unit: "°",
        status: "normal",
        referenceRange: [8, 15],
        description: "身体前倾角度在合理范围内，有利于利用重力提高跑步效率",
      },
      {
        name: "步频步幅协调性",
        value: 72,
        unit: "分",
        status: "warning",
        referenceRange: [80, 100],
        description: "步频偏低、步幅偏大，容易造成着地冲击力过大，增加损伤风险",
      },
    ],
    phases: [
      {
        phase: "initial_contact",
        phaseLabel: "着地瞬间",
        kneeAngle: 168,
        hipAngle: 145,
        ankleAngle: 95,
        pelvicTilt: 4.2,
        trunkLean: 11.5,
      },
      {
        phase: "mid_stance",
        phaseLabel: "支撑中期",
        kneeAngle: 155,
        hipAngle: 160,
        ankleAngle: 85,
        pelvicTilt: 6.8,
        trunkLean: 10.8,
      },
      {
        phase: "push_off",
        phaseLabel: "蹬伸阶段",
        kneeAngle: 172,
        hipAngle: 175,
        ankleAngle: 120,
        pelvicTilt: 3.5,
        trunkLean: 12.1,
      },
    ],
    cadence: 162,
    strideLength: 1.42,
    overallScore: 68,
  };
}

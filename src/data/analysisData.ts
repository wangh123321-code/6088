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

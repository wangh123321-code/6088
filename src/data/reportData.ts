export interface Issue {
  id: string;
  title: string;
  severity: "normal" | "warning" | "danger";
  joint: string;
  description: string;
  angleDeviation: number;
}

export interface TrainingAction {
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  targetIssue: string;
  steps: string[];
}

export interface AngleTimelinePoint {
  time: number;
  kneeAngle: number;
  pelvicTilt: number;
  trunkLean: number;
}

export interface ReportData {
  issues: Issue[];
  trainingActions: TrainingAction[];
  angleTimeline: AngleTimelinePoint[];
  summary: string;
  overallScore: number;
}

export function generateReportData(): ReportData {
  const angleTimeline: AngleTimelinePoint[] = [];
  for (let i = 0; i < 60; i++) {
    const t = i / 60;
    angleTimeline.push({
      time: parseFloat((t * 0.8).toFixed(2)),
      kneeAngle: 168 + Math.sin(t * Math.PI * 2) * 18 + Math.sin(t * Math.PI * 4) * 3,
      pelvicTilt: 4 + Math.sin(t * Math.PI * 2) * 3.5 + Math.cos(t * Math.PI * 4) * 1.5,
      trunkLean: 11 + Math.sin(t * Math.PI * 2) * 2 + Math.cos(t * Math.PI * 6) * 0.5,
    });
  }

  return {
    issues: [
      {
        id: "knee_valgus",
        title: "膝盖内扣（膝外翻）",
        severity: "danger",
        joint: "leftKnee",
        description: "着地时左膝内扣角度达12.5°，远超8°安全阈值。这会导致髌骨运动轨迹偏移，长期可引发髌骨疼痛综合征、IT带综合征和半月板损伤。",
        angleDeviation: 4.5,
      },
      {
        id: "pelvic_sway",
        title: "骨盆左右摇摆",
        severity: "warning",
        joint: "pelvis",
        description: "支撑中期骨盆摇摆幅度达6.8°，超出5°正常范围。核心肌群力量不足导致骨盆控制力差，可引发腰痛和髋关节不适。",
        angleDeviation: 1.8,
      },
      {
        id: "stride_cadence",
        title: "步频偏低步幅偏大",
        severity: "warning",
        joint: "leftAnkle",
        description: "当前步频162步/分，低于180步/分推荐值；步幅1.42m偏大。过大的步幅导致着地时脚落在重心前方过远处，增加制动力和关节冲击。",
        angleDeviation: 18,
      },
    ],
    trainingActions: [
      {
        name: "蚌式开合",
        description: "强化臀中肌，改善膝盖内扣",
        difficulty: "beginner",
        targetIssue: "knee_valgus",
        steps: [
          "侧卧，双膝弯曲约45°，双脚并拢",
          "保持脚跟不分开，缓慢抬起上方膝盖",
          "在最高点保持2秒，缓慢放下",
          "每组15次，做3组，两侧交替",
        ],
      },
      {
        name: "弹力带侧步行走",
        description: "激活臀中肌和臀小肌，稳定骨盆",
        difficulty: "beginner",
        targetIssue: "knee_valgus",
        steps: [
          "将弹力带套在双腿膝盖上方",
          "微微屈膝，保持半蹲姿势",
          "向侧方迈步，保持弹力带张力",
          "左右各走10步为1组，做3组",
        ],
      },
      {
        name: "单腿站立平衡",
        description: "提升核心稳定性和本体感觉",
        difficulty: "beginner",
        targetIssue: "pelvic_sway",
        steps: [
          "单脚站立，另一脚离地约10cm",
          "保持骨盆水平，身体不晃动",
          "坚持30秒后换脚",
          "进阶：闭眼进行，或站在不稳定平面上",
        ],
      },
      {
        name: "平板支撑变体",
        description: "增强核心力量，控制骨盆稳定性",
        difficulty: "intermediate",
        targetIssue: "pelvic_sway",
        steps: [
          "标准平板支撑姿势，肘在肩正下方",
          "交替抬起左右手触碰对侧肩膀",
          "保持躯干稳定，骨盆不旋转",
          "每侧10次为1组，做3组",
        ],
      },
      {
        name: "节拍器跑步训练",
        description: "提高步频至180步/分",
        difficulty: "intermediate",
        targetIssue: "stride_cadence",
        steps: [
          "使用跑步App设置节拍器为180bpm",
          "先从5%增幅开始（约170步/分）",
          "保持步频节奏，缩小步幅适应",
          "每周提升5步/分，循序渐进至目标",
        ],
      },
      {
        name: "快步频原地跑",
        description: "建立高步频肌肉记忆",
        difficulty: "beginner",
        targetIssue: "stride_cadence",
        steps: [
          "原地快速小步跑，脚掌着地",
          "目标步频180步/分，每次30秒",
          "注意保持身体微微前倾",
          "休息15秒，重复6-8次",
        ],
      },
    ],
    angleTimeline,
    summary: "您的跑步姿势存在2个需要关注的问题：膝盖内扣（严重）和骨盆摇摆（中等）。身体前倾角度正常。建议优先通过臀中肌训练改善膝盖内扣，同时加强核心稳定性减少骨盆摇摆，并逐步提高步频至180步/分。",
    overallScore: 68,
  };
}

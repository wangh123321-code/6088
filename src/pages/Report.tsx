import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";
import { ArrowLeft, AlertTriangle, AlertCircle, CheckCircle2, Dumbbell, Target, TrendingUp, Footprints } from "lucide-react";
import type { Issue, TrainingAction } from "@/data/reportData";

const SEVERITY_CONFIG = {
  danger: { color: "#ff3366", bg: "rgba(255,51,102,0.1)", border: "rgba(255,51,102,0.3)", icon: AlertCircle, label: "严重" },
  warning: { color: "#ffaa00", bg: "rgba(255,170,0,0.1)", border: "rgba(255,170,0,0.3)", icon: AlertTriangle, label: "注意" },
  normal: { color: "#00ff88", bg: "rgba(0,255,136,0.1)", border: "rgba(255,255,255,0.05)", icon: CheckCircle2, label: "正常" },
};

const DIFFICULTY_CONFIG = {
  beginner: { color: "#00ff88", label: "初级" },
  intermediate: { color: "#ffaa00", label: "中级" },
  advanced: { color: "#ff3366", label: "高级" },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);
  const color = score >= 80 ? "#00ff88" : score >= 60 ? "#ffaa00" : "#ff3366";

  return (
    <div className="relative">
      <svg width="140" height="140" className="transform -rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display" style={{ color }}>{score}</span>
        <span className="text-[10px] text-gray-500 font-body">综合评分</span>
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const config = SEVERITY_CONFIG[issue.severity];
  const Icon = config.icon;

  return (
    <div
      className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.01]"
      style={{ backgroundColor: config.bg, borderColor: config.border, borderWidth: 1 }}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: config.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-200 font-display text-sm tracking-wider">{issue.title}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-display tracking-wider"
              style={{ color: config.color, backgroundColor: `${config.color}15` }}
            >
              {config.label}
            </span>
          </div>
          <p className="text-gray-400 text-xs font-body leading-relaxed">{issue.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-body">偏差值</span>
            <span className="text-xs font-mono" style={{ color: config.color }}>
              +{issue.angleDeviation}°
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainingCard({ action }: { action: TrainingAction }) {
  const diffConfig = DIFFICULTY_CONFIG[action.difficulty];

  return (
    <div className="rounded-xl bg-dark-700/40 border border-electric/10 p-4 hover:border-electric/25 transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        <Dumbbell className="w-4 h-4 text-electric" />
        <span className="text-gray-200 font-display text-sm tracking-wider">{action.name}</span>
        <span
          className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-display"
          style={{ color: diffConfig.color, backgroundColor: `${diffConfig.color}15` }}
        >
          {diffConfig.label}
        </span>
      </div>
      <p className="text-gray-400 text-xs font-body mb-3">{action.description}</p>
      <div className="space-y-1.5">
        {action.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-electric/10 text-electric text-[10px] font-display flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-gray-400 text-xs font-body">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarChartSection() {
  const analysisData = useStore((s) => s.analysisData);

  const radarData = analysisData.metrics.map((m) => {
    let normalized: number;
    if (m.status === "normal") {
      normalized = 75 + (m.value / m.referenceRange[1]) * 20;
    } else if (m.status === "warning") {
      const overRatio = (m.value - m.referenceRange[1]) / m.referenceRange[1];
      normalized = 45 - overRatio * 15;
    } else {
      const overRatio = (m.value - m.referenceRange[1]) / m.referenceRange[1];
      normalized = 25 - overRatio * 10;
    }
    normalized = Math.max(0, Math.min(100, normalized));
    return {
      metric: m.name.replace(/角度|幅度|协调性/, ""),
      score: Math.round(normalized),
      fullMark: 100,
    };
  });

  return (
    <div className="rounded-xl bg-dark-700/40 border border-electric/10 p-4">
      <h3 className="text-electric font-display text-sm tracking-wider mb-4 flex items-center gap-2">
        <Target className="w-4 h-4" />
        姿势评估雷达图
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(0,212,255,0.15)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#888", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#555", fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="当前"
            dataKey="score"
            stroke="#00d4ff"
            fill="#00d4ff"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name="理想"
            dataKey="fullMark"
            stroke="#00ff8830"
            fill="none"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-electric rounded" />
          <span className="text-[10px] text-gray-500">当前水平</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-neon-green/30 rounded" style={{ borderTop: "1px dashed #00ff8850" }} />
          <span className="text-[10px] text-gray-500">理想水平</span>
        </div>
      </div>
    </div>
  );
}

function PhaseComparisonChart() {
  const analysisData = useStore((s) => s.analysisData);

  const barData = analysisData.phases.map((p) => ({
    phase: p.phaseLabel,
    knee: p.kneeAngle,
    hip: p.hipAngle,
    ankle: p.ankleAngle,
    pelvic: p.pelvicTilt,
    trunk: p.trunkLean,
  }));

  return (
    <div className="rounded-xl bg-dark-700/40 border border-electric/10 p-4">
      <h3 className="text-electric font-display text-sm tracking-wider mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        各阶段关节角度对比
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="phase" tick={{ fill: "#888", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
          <YAxis tick={{ fill: "#888", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f1424", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "8px", fontSize: "11px" }}
            labelStyle={{ color: "#00d4ff" }}
          />
          <Bar dataKey="knee" fill="#ff3366" radius={[2, 2, 0, 0]} name="膝关节" />
          <Bar dataKey="hip" fill="#00d4ff" radius={[2, 2, 0, 0]} name="髋关节" />
          <Bar dataKey="ankle" fill="#00ff88" radius={[2, 2, 0, 0]} name="踝关节" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-neon-red" />
          <span className="text-[10px] text-gray-500">膝关节</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-electric" />
          <span className="text-[10px] text-gray-500">髋关节</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-neon-green" />
          <span className="text-[10px] text-gray-500">踝关节</span>
        </div>
      </div>
    </div>
  );
}

function AngleChart({ data }: { data: ReturnType<typeof useStore.getState>["reportData"]["angleTimeline"] }) {
  return (
    <div className="rounded-xl bg-dark-700/40 border border-electric/10 p-4">
      <h3 className="text-electric font-display text-sm tracking-wider mb-4">关节角度变化曲线</h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="kneeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3366" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ff3366" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pelvicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffaa00" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ffaa00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: "#666", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
          <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0f1424", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "8px", fontSize: "11px" }}
            labelStyle={{ color: "#00d4ff" }}
          />
          <ReferenceLine y={160} stroke="#ff336640" strokeDasharray="5 5" label={{ value: "膝角阈值", fill: "#ff336680", fontSize: 9 }} />
          <ReferenceLine y={5} stroke="#ffaa0040" strokeDasharray="5 5" label={{ value: "骨盆阈值", fill: "#ffaa0080", fontSize: 9 }} />
          <Area type="monotone" dataKey="kneeAngle" stroke="none" fill="url(#kneeGrad)" />
          <Line type="monotone" dataKey="kneeAngle" stroke="#ff3366" strokeWidth={2} dot={false} name="膝关节角度(°)" />
          <Area type="monotone" dataKey="pelvicTilt" stroke="none" fill="url(#pelvicGrad)" />
          <Line type="monotone" dataKey="pelvicTilt" stroke="#ffaa00" strokeWidth={2} dot={false} name="骨盆倾斜(°)" />
          <Line type="monotone" dataKey="trunkLean" stroke="#00d4ff" strokeWidth={1.5} dot={false} name="躯干前倾(°)" strokeDasharray="4 4" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-neon-red rounded" />
          <span className="text-[10px] text-gray-500 font-body">膝关节角度</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-neon-orange rounded" />
          <span className="text-[10px] text-gray-500 font-body">骨盆倾斜</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-electric rounded" style={{ borderTop: "1px dashed #00d4ff" }} />
          <span className="text-[10px] text-gray-500 font-body">躯干前倾</span>
        </div>
      </div>
    </div>
  );
}

function PhaseDetailTable() {
  const analysisData = useStore((s) => s.analysisData);

  return (
    <div className="rounded-xl bg-dark-700/40 border border-electric/10 p-4">
      <h3 className="text-electric font-display text-sm tracking-wider mb-3">各阶段详细数据</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-electric/10">
              <th className="text-left text-gray-500 font-body py-2 pr-3">阶段</th>
              <th className="text-right text-gray-500 font-body py-2 px-2">膝关节</th>
              <th className="text-right text-gray-500 font-body py-2 px-2">髋关节</th>
              <th className="text-right text-gray-500 font-body py-2 px-2">踝关节</th>
              <th className="text-right text-gray-500 font-body py-2 px-2">骨盆倾斜</th>
              <th className="text-right text-gray-500 font-body py-2 pl-2">前倾角度</th>
            </tr>
          </thead>
          <tbody>
            {analysisData.phases.map((p) => {
              const kneeOk = p.kneeAngle >= 160 && p.kneeAngle <= 180;
              const pelvicOk = p.pelvicTilt <= 5;
              const trunkOk = p.trunkLean >= 8 && p.trunkLean <= 15;
              return (
                <tr key={p.phase} className="border-b border-electric/5">
                  <td className="py-2 pr-3 text-gray-300 font-body">{p.phaseLabel}</td>
                  <td className={`py-2 px-2 text-right font-mono ${kneeOk ? "text-neon-green" : "text-neon-red"}`}>
                    {p.kneeAngle}°
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-electric">{p.hipAngle}°</td>
                  <td className="py-2 px-2 text-right font-mono text-electric">{p.ankleAngle}°</td>
                  <td className={`py-2 px-2 text-right font-mono ${pelvicOk ? "text-neon-green" : "text-neon-orange"}`}>
                    {p.pelvicTilt}°
                  </td>
                  <td className={`py-2 pl-2 text-right font-mono ${trunkOk ? "text-neon-green" : "text-neon-orange"}`}>
                    {p.trunkLean}°
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CadenceStrideSection() {
  const analysisData = useStore((s) => s.analysisData);
  const idealCadence = 180;
  const idealStride = 1.2;

  return (
    <div className="rounded-xl bg-dark-700/40 border border-electric/10 p-4">
      <h3 className="text-electric font-display text-sm tracking-wider mb-4 flex items-center gap-2">
        <Footprints className="w-4 h-4" />
        步频步幅分析
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-gray-500 text-[10px] font-body mb-2">步频 (步/分)</div>
          <div className="relative mx-auto" style={{ width: 120, height: 120 }}>
            <svg width="120" height="120" className="transform -rotate-90">
              <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              <circle
                cx="60" cy="60" r="48" fill="none"
                stroke={analysisData.cadence >= idealCadence ? "#00ff88" : analysisData.cadence >= 170 ? "#ffaa00" : "#ff3366"}
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - analysisData.cadence / 200)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-display" style={{
                color: analysisData.cadence >= idealCadence ? "#00ff88" : analysisData.cadence >= 170 ? "#ffaa00" : "#ff3366"
              }}>
                {analysisData.cadence}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[10px] text-gray-600 font-body">理想</span>
            <span className="text-[10px] font-mono text-neon-green">{idealCadence}</span>
          </div>
          <div className="w-full h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((analysisData.cadence / 200) * 100, 100)}%`,
                backgroundColor: analysisData.cadence >= idealCadence ? "#00ff88" : analysisData.cadence >= 170 ? "#ffaa00" : "#ff3366",
              }}
            />
            <div className="absolute" style={{ left: `${(idealCadence / 200) * 100}%`, top: 0 }}>
              <div className="w-0.5 h-1.5 bg-neon-green/60" />
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-[10px] font-body mb-2">步幅 (m)</div>
          <div className="relative mx-auto" style={{ width: 120, height: 120 }}>
            <svg width="120" height="120" className="transform -rotate-90">
              <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              <circle
                cx="60" cy="60" r="48" fill="none"
                stroke={analysisData.strideLength <= idealStride ? "#00ff88" : analysisData.strideLength <= 1.4 ? "#ffaa00" : "#ff3366"}
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - analysisData.strideLength / 2)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-display" style={{
                color: analysisData.strideLength <= idealStride ? "#00ff88" : analysisData.strideLength <= 1.4 ? "#ffaa00" : "#ff3366"
              }}>
                {analysisData.strideLength}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[10px] text-gray-600 font-body">理想</span>
            <span className="text-[10px] font-mono text-neon-green">{idealStride}</span>
          </div>
          <div className="w-full h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((analysisData.strideLength / 2) * 100, 100)}%`,
                backgroundColor: analysisData.strideLength <= idealStride ? "#00ff88" : analysisData.strideLength <= 1.4 ? "#ffaa00" : "#ff3366",
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 rounded-lg bg-dark-700/30 border border-electric/5">
        <p className="text-gray-400 text-xs font-body leading-relaxed">
          {analysisData.cadence < idealCadence
            ? `当前步频${analysisData.cadence}步/分，低于推荐值${idealCadence}步/分。步频偏低意味着每步着地时间更长，地面冲击力更大。建议通过节拍器训练逐步提升步频。`
            : `当前步频${analysisData.cadence}步/分，在合理范围内。`}
          {analysisData.strideLength > idealStride + 0.1
            ? ` 步幅${analysisData.strideLength}m偏大，过大的步幅会导致脚落在重心前方过远处，增加制动力和关节冲击。`
            : ` 步幅${analysisData.strideLength}m在合理范围内。`}
        </p>
      </div>
    </div>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const reportData = useStore((s) => s.reportData);
  const analysisData = useStore((s) => s.analysisData);

  const sortedIssues = [...reportData.issues].sort((a, b) => {
    const order = { danger: 0, warning: 1, normal: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="min-h-screen bg-dark-900 font-body text-gray-200 overflow-y-auto">
      <header className="border-b border-electric/10 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-electric transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body">返回分析</span>
          </button>
          <div className="h-4 w-px bg-electric/20" />
          <h1 className="font-display text-electric tracking-wider text-lg">跑步姿势分析报告</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-4">
            <div className="rounded-xl bg-dark-800/60 border border-electric/10 p-6 flex flex-col items-center">
              <ScoreRing score={reportData.overallScore} />
              <p className="text-gray-400 text-xs font-body mt-3 text-center leading-relaxed">{reportData.summary}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-electric font-display text-sm tracking-wider uppercase">检测问题</h3>
              {sortedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>

          <div className="col-span-6 space-y-4">
            <AngleChart data={reportData.angleTimeline} />
            <CadenceStrideSection />
            <PhaseComparisonChart />
            <PhaseDetailTable />

            <div className="rounded-xl bg-dark-700/40 border border-electric/10 p-4">
              <h3 className="text-electric font-display text-sm tracking-wider mb-3">关键指标一览</h3>
              <div className="grid grid-cols-2 gap-3">
                {analysisData.metrics.map((metric) => {
                  const config = SEVERITY_CONFIG[metric.status];
                  return (
                    <div key={metric.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-dark-700/30">
                      <span className="text-gray-400 text-xs font-body">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display" style={{ color: config.color }}>{metric.value}{metric.unit}</span>
                        <span className="text-[10px] text-gray-500 font-body">({metric.referenceRange[0]}–{metric.referenceRange[1]})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-3 space-y-4">
            <RadarChartSection />
            <div>
              <h3 className="text-electric font-display text-sm tracking-wider uppercase mb-3">改进训练</h3>
              <div className="space-y-3">
                {reportData.trainingActions.map((action, i) => (
                  <TrainingCard key={i} action={action} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

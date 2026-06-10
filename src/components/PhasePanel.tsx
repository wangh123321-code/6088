import { useStore } from "@/store/useStore";
import { PhaseType } from "@/data/poseData";

const PHASE_TABS: { key: PhaseType; label: string; icon: string; color: string }[] = [
  { key: "initial_contact", label: "着地瞬间", icon: "🦶", color: "#ff3366" },
  { key: "mid_stance", label: "支撑中期", icon: "🦵", color: "#ffaa00" },
  { key: "push_off", label: "蹬伸阶段", icon: "💨", color: "#00d4ff" },
];

export default function PhasePanel() {
  const selectedPhase = useStore((s) => s.selectedPhase);
  const setFrameByPhase = useStore((s) => s.setFrameByPhase);
  const setSelectedPhase = useStore((s) => s.setSelectedPhase);
  const analysisData = useStore((s) => s.analysisData);

  const handlePhaseClick = (phase: PhaseType) => {
    setSelectedPhase(phase);
    setFrameByPhase(phase);
  };

  const activePhaseData = analysisData.phases.find((p) => p.phase === selectedPhase);

  return (
    <div className="space-y-3">
      <h3 className="text-electric font-display text-sm tracking-wider uppercase">阶段分析</h3>

      <div className="flex gap-1.5">
        {PHASE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handlePhaseClick(tab.key)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-display tracking-wider transition-all duration-200
              ${
                selectedPhase === tab.key
                  ? "border"
                  : "bg-dark-700/50 text-gray-400 border border-transparent hover:bg-dark-700 hover:text-gray-200"
              }`}
            style={
              selectedPhase === tab.key
                ? { color: tab.color, borderColor: `${tab.color}40`, backgroundColor: `${tab.color}10` }
                : undefined
            }
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activePhaseData && (
        <div className="space-y-2">
          <AngleRow label="膝关节角度" value={activePhaseData.kneeAngle} unit="°" normal={[160, 180]} />
          <AngleRow label="髋关节角度" value={activePhaseData.hipAngle} unit="°" normal={[140, 180]} />
          <AngleRow label="踝关节角度" value={activePhaseData.ankleAngle} unit="°" normal={[80, 130]} />
          <AngleRow label="骨盆倾斜" value={activePhaseData.pelvicTilt} unit="°" normal={[0, 5]} />
          <AngleRow label="躯干前倾" value={activePhaseData.trunkLean} unit="°" normal={[8, 15]} />
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-electric/10">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500 font-body">步频</span>
          <div className="flex items-center gap-1">
            <span className="text-electric font-display">{analysisData.cadence}</span>
            <span className="text-gray-500 font-body">步/分</span>
            {analysisData.cadence < 170 && (
              <span className="text-[9px] text-neon-orange font-body ml-1">偏低</span>
            )}
          </div>
        </div>
        <div className="w-full h-1.5 bg-dark-700 rounded-full mt-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min((analysisData.cadence / 200) * 100, 100)}%`,
              backgroundColor: analysisData.cadence >= 180 ? "#00ff88" : analysisData.cadence >= 170 ? "#ffaa00" : "#ff3366",
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-600 font-body mt-0.5">
          <span>0</span>
          <span style={{ color: analysisData.cadence >= 180 ? "#00ff8880" : "#ffaa0080" }}>180 理想</span>
          <span>200</span>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className="text-gray-500 font-body">步幅</span>
          <div className="flex items-center gap-1">
            <span className="text-electric font-display">{analysisData.strideLength}</span>
            <span className="text-gray-500 font-body">m</span>
            {analysisData.strideLength > 1.3 && (
              <span className="text-[9px] text-neon-orange font-body ml-1">偏大</span>
            )}
          </div>
        </div>
        <div className="w-full h-1.5 bg-dark-700 rounded-full mt-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min((analysisData.strideLength / 2) * 100, 100)}%`,
              backgroundColor: analysisData.strideLength <= 1.2 ? "#00ff88" : analysisData.strideLength <= 1.4 ? "#ffaa00" : "#ff3366",
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-600 font-body mt-0.5">
          <span>0</span>
          <span style={{ color: "#00ff8880" }}>1.2 理想</span>
          <span>2.0</span>
        </div>
      </div>
    </div>
  );
}

function AngleRow({ label, value, unit, normal }: { label: string; value: number; unit: string; normal: [number, number] }) {
  const inRange = value >= normal[0] && value <= normal[1];
  const color = inRange ? "#00ff88" : value > normal[1] ? "#ffaa00" : "#ff3366";

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-dark-700/30">
      <span className="text-gray-400 text-xs font-body">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((value / 200) * 100, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span className="text-xs font-mono w-12 text-right" style={{ color }}>
          {value}{unit}
        </span>
      </div>
    </div>
  );
}

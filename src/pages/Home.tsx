import { useNavigate } from "react-router-dom";
import { Activity, Eye, EyeOff, Footprints, Ghost, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import Scene3D from "@/components/Scene3D/Scene3D";
import VideoUpload from "@/components/VideoUpload";
import PlaybackControls from "@/components/PlaybackControls";
import MetricGauge from "@/components/MetricGauge";
import PhasePanel from "@/components/PhasePanel";
import { useStore, type CameraPreset } from "@/store/useStore";
import { SYMMETRY_GRADE_LABELS, type SymmetryGrade } from "@/data/analysisData";

const CAMERA_BUTTONS: { key: CameraPreset; label: string; icon: string }[] = [
  { key: "free", label: "自由", icon: "🔄" },
  { key: "front", label: "正面", icon: "👁" },
  { key: "side", label: "侧面", icon: "➡️" },
  { key: "top", label: "俯视", icon: "🔽" },
];

const SYMMETRY_GRADE_COLORS: Record<SymmetryGrade, string> = {
  symmetric: "#00ff88",
  mild_asymmetry: "#ffaa00",
  obvious_asymmetry: "#ff3366",
};

export default function Home() {
  const navigate = useNavigate();
  const isDataLoaded = useStore((s) => s.isDataLoaded);
  const showUpload = useStore((s) => s.showUpload);
  const analysisData = useStore((s) => s.analysisData);
  const cameraPreset = useStore((s) => s.cameraPreset);
  const setCameraPreset = useStore((s) => s.setCameraPreset);
  const showAngles = useStore((s) => s.showAngles);
  const setShowAngles = useStore((s) => s.setShowAngles);
  const showBodyMesh = useStore((s) => s.showBodyMesh);
  const setShowBodyMesh = useStore((s) => s.setShowBodyMesh);
  const showTrail = useStore((s) => s.showTrail);
  const setShowTrail = useStore((s) => s.setShowTrail);
  const showGhost = useStore((s) => s.showGhost);
  const setShowGhost = useStore((s) => s.setShowGhost);
  const showForceArrows = useStore((s) => s.showForceArrows);
  const setShowForceArrows = useStore((s) => s.setShowForceArrows);
  const selectedJoint = useStore((s) => s.selectedJoint);
  const getSymmetryResults = useStore((s) => s.getSymmetryResults);
  const getSymmetryForJoint = useStore((s) => s.getSymmetryForJoint);
  const symmetryResults = isDataLoaded ? getSymmetryResults() : [];
  const selectedSymmetry = selectedJoint && isDataLoaded ? getSymmetryForJoint(selectedJoint) : undefined;

  const overallScore = analysisData.overallScore;
  const scoreColor = overallScore >= 80 ? "#00ff88" : overallScore >= 60 ? "#ffaa00" : "#ff3366";

  return (
    <div className="h-screen flex flex-col bg-dark-900 font-body text-gray-200 overflow-hidden">
      <header className="flex-shrink-0 border-b border-electric/10 bg-dark-900/80 backdrop-blur-sm z-20">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-electric" />
            <h1 className="font-display text-electric tracking-wider text-xl uppercase">RunPose 3D</h1>
            <span className="text-gray-500 text-xs font-body ml-2">跑步姿势智能分析</span>
          </div>
          {isDataLoaded && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-body">综合评分</span>
                <span className="font-display text-lg" style={{ color: scoreColor }}>
                  {overallScore}
                </span>
              </div>
              <button
                onClick={() => navigate("/report")}
                className="px-4 py-1.5 bg-electric/15 border border-electric/30 rounded-lg text-electric font-display text-xs tracking-wider
                           hover:bg-electric/25 hover:border-electric/50 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all duration-300
                           flex items-center gap-2"
              >
                <Activity className="w-3.5 h-3.5" />
                查看完整报告
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {showUpload ? (
            <div className="absolute inset-0 bg-dark-900/95 flex items-center justify-center z-10">
              <VideoUpload />
            </div>
          ) : (
            <Scene3D />
          )}

          {isDataLoaded && !showUpload && (
            <>
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl border border-electric/10 px-4 py-2.5">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-body">
                    <span className="w-2 h-2 rounded-full bg-neon-green" /> 正常
                    <span className="w-2 h-2 rounded-full bg-neon-orange ml-2" /> 注意
                    <span className="w-2 h-2 rounded-full bg-neon-red ml-2" /> 严重
                    {showGhost && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-neon-green/30 ml-2 border border-neon-green/50" /> 理想
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">点击关节查看详情 · 拖拽旋转 · 滚轮缩放</p>
                </div>
              </div>

              <div className="absolute top-4 right-[332px] z-10">
                <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl border border-electric/10 px-3 py-2 space-y-2">
                  <div className="text-[10px] text-gray-500 font-body tracking-wider">视角</div>
                  <div className="flex gap-1">
                    {CAMERA_BUTTONS.map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => setCameraPreset(btn.key)}
                        className={`px-2 py-1 rounded text-[10px] font-display tracking-wider transition-all
                          ${cameraPreset === btn.key
                            ? "bg-electric/20 text-electric border border-electric/40"
                            : "text-gray-500 hover:text-gray-300 border border-transparent hover:bg-dark-700"
                          }`}
                      >
                        {btn.icon} {btn.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-electric/10 pt-1.5 space-y-1">
                    <button
                      onClick={() => setShowAngles(!showAngles)}
                      className={`flex items-center gap-1.5 w-full px-1 py-0.5 rounded text-[10px] font-body transition-all
                        ${showAngles ? "text-electric" : "text-gray-500"}`}
                    >
                      {showAngles ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      角度标注
                    </button>
                    <button
                      onClick={() => setShowBodyMesh(!showBodyMesh)}
                      className={`flex items-center gap-1.5 w-full px-1 py-0.5 rounded text-[10px] font-body transition-all
                        ${showBodyMesh ? "text-electric" : "text-gray-500"}`}
                    >
                      {showBodyMesh ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      身体网格
                    </button>
                    <button
                      onClick={() => setShowTrail(!showTrail)}
                      className={`flex items-center gap-1.5 w-full px-1 py-0.5 rounded text-[10px] font-body transition-all
                        ${showTrail ? "text-electric" : "text-gray-500"}`}
                    >
                      {showTrail ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <Footprints className="w-3 h-3" />
                      脚印轨迹
                    </button>
                    <button
                      onClick={() => setShowGhost(!showGhost)}
                      className={`flex items-center gap-1.5 w-full px-1 py-0.5 rounded text-[10px] font-body transition-all
                        ${showGhost ? "text-electric" : "text-gray-500"}`}
                    >
                      <Ghost className="w-3 h-3" />
                      理想姿势
                    </button>
                    <button
                      onClick={() => setShowForceArrows(!showForceArrows)}
                      className={`flex items-center gap-1.5 w-full px-1 py-0.5 rounded text-[10px] font-body transition-all
                        ${showForceArrows ? "text-electric" : "text-gray-500"}`}
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      地面反力
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {isDataLoaded && (
          <div className="w-[320px] flex-shrink-0 border-l border-electric/10 bg-dark-800/60 overflow-y-auto">
            <div className="p-4 space-y-4">
              <h2 className="text-electric font-display text-sm tracking-wider uppercase flex items-center gap-2">
                <Activity className="w-4 h-4" />
                关键指标
              </h2>
              <div className="space-y-2.5">
                {analysisData.metrics.map((metric) => (
                  <MetricGauge key={metric.name} metric={metric} />
                ))}
              </div>

              <div className="border-t border-electric/10 pt-4">
                <PhasePanel />
              </div>

              <div className="border-t border-electric/10 pt-4">
                <h2 className="text-purple-400 font-display text-sm tracking-wider uppercase flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4" />
                  左右对称性
                </h2>
                <div className="space-y-2.5 mt-3">
                  {selectedSymmetry ? (
                    <div
                      className="rounded-xl p-3 transition-all duration-300"
                      style={{
                        backgroundColor: `${SYMMETRY_GRADE_COLORS[selectedSymmetry.grade]}08`,
                        borderColor: `${SYMMETRY_GRADE_COLORS[selectedSymmetry.grade]}25`,
                        borderWidth: 1,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-200 text-xs font-body">{selectedSymmetry.label}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-display tracking-wider"
                          style={{
                            color: SYMMETRY_GRADE_COLORS[selectedSymmetry.grade],
                            backgroundColor: `${SYMMETRY_GRADE_COLORS[selectedSymmetry.grade]}15`,
                          }}
                        >
                          {selectedSymmetry.gradeLabel}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-300">左侧</span>
                          <span className="text-blue-300 font-mono">{selectedSymmetry.leftValue.toFixed(1)}°</span>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden relative">
                          <div
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(Math.abs(selectedSymmetry.leftValue) / 50 * 100, 100)}%`,
                              backgroundColor: "#93c5fd",
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-purple-300">右侧</span>
                          <span className="text-purple-300 font-mono">{selectedSymmetry.rightValue.toFixed(1)}°</span>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden relative">
                          <div
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(Math.abs(selectedSymmetry.rightValue) / 50 * 100, 100)}%`,
                              backgroundColor: "#c4b5fd",
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-gray-500">差值</span>
                          <span
                            className="font-mono"
                            style={{ color: SYMMETRY_GRADE_COLORS[selectedSymmetry.grade] }}
                          >
                            {selectedSymmetry.diff.toFixed(1)}°
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {symmetryResults.map((sr) => (
                        <div
                          key={sr.pairKey}
                          className="rounded-lg p-2.5 transition-all duration-200"
                          style={{
                            backgroundColor: `${SYMMETRY_GRADE_COLORS[sr.grade]}05`,
                            borderColor: `${SYMMETRY_GRADE_COLORS[sr.grade]}15`,
                            borderWidth: 1,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-xs font-body">{sr.label}</span>
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-display tracking-wider"
                              style={{
                                color: SYMMETRY_GRADE_COLORS[sr.grade],
                                backgroundColor: `${SYMMETRY_GRADE_COLORS[sr.grade]}15`,
                              }}
                            >
                              {sr.gradeLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span>左 {sr.leftValue.toFixed(1)}°</span>
                            <span className="text-gray-600">vs</span>
                            <span>右 {sr.rightValue.toFixed(1)}°</span>
                            <span className="ml-auto font-mono" style={{ color: SYMMETRY_GRADE_COLORS[sr.grade] }}>
                              Δ{sr.diff.toFixed(1)}°
                            </span>
                          </div>
                        </div>
                      ))}
                      <p className="text-[10px] text-gray-600 text-center">点击关节查看详细对比</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isDataLoaded && <PlaybackControls />}
    </div>
  );
}

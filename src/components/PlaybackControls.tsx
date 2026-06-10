import { useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Gauge, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { PhaseType } from "@/data/poseData";

const PHASE_LABELS: Record<PhaseType, { label: string; color: string; icon: string }> = {
  initial_contact: { label: "着地", color: "#ff3366", icon: "🦶" },
  mid_stance: { label: "支撑", color: "#ffaa00", icon: "🦵" },
  push_off: { label: "蹬伸", color: "#00d4ff", icon: "💨" },
  swing: { label: "摆动", color: "#00ff88", icon: "🔄" },
};

const SPEED_OPTIONS = [0.25, 0.5, 1];

export default function PlaybackControls() {
  const currentFrame = useStore((s) => s.currentFrame);
  const isPlaying = useStore((s) => s.isPlaying);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const poseData = useStore((s) => s.poseData);
  const setCurrentFrame = useStore((s) => s.setCurrentFrame);
  const setIsPlaying = useStore((s) => s.setIsPlaying);
  const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);

  const totalFrames = poseData.totalFrames;
  const currentFrameData = poseData.frames[currentFrame % totalFrames];
  const currentPhase = currentFrameData?.phase;

  const phaseMarkers = poseData.frames.reduce<Array<{ frame: number; phase: PhaseType }>>((acc, frame, idx) => {
    if (idx === 0 || frame.phase !== poseData.frames[idx - 1].phase) {
      acc.push({ frame: idx, phase: frame.phase as PhaseType });
    }
    return acc;
  }, []);

  const handlePrevFrame = useCallback(() => {
    setCurrentFrame(Math.max(0, currentFrame - 1));
  }, [currentFrame, setCurrentFrame]);

  const handleNextFrame = useCallback(() => {
    setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1));
  }, [currentFrame, totalFrames, setCurrentFrame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    switch (e.key) {
      case " ":
        e.preventDefault();
        setIsPlaying(!useStore.getState().isPlaying);
        break;
      case "ArrowLeft":
        e.preventDefault();
        useStore.getState().setCurrentFrame(Math.max(0, useStore.getState().currentFrame - 1));
        useStore.getState().setIsPlaying(false);
        break;
      case "ArrowRight":
        e.preventDefault();
        useStore.getState().setCurrentFrame(Math.min(totalFrames - 1, useStore.getState().currentFrame + 1));
        useStore.getState().setIsPlaying(false);
        break;
      case "Home":
        e.preventDefault();
        useStore.getState().setCurrentFrame(0);
        break;
      case "End":
        e.preventDefault();
        useStore.getState().setCurrentFrame(totalFrames - 1);
        break;
    }
  }, [totalFrames, setIsPlaying]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="bg-dark-800/90 border-t border-electric/10 px-6 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentFrame(0)}
            className="p-1.5 text-gray-400 hover:text-electric transition-colors"
            title="回到起点 (Home)"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrevFrame}
            className="p-1 text-gray-400 hover:text-electric transition-colors"
            title="上一帧 (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-electric/10 border border-electric/30 rounded-full text-electric
                       hover:bg-electric/20 hover:shadow-[0_0_12px_rgba(0,212,255,0.3)] transition-all"
            title="播放/暂停 (空格)"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleNextFrame}
            className="p-1 text-gray-400 hover:text-electric transition-colors"
            title="下一帧 (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentFrame(totalFrames - 1)}
            className="p-1.5 text-gray-400 hover:text-electric transition-colors"
            title="跳到结尾 (End)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 relative">
          <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden relative cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setCurrentFrame(Math.floor(ratio * totalFrames));
            }}
          >
            {phaseMarkers.map((marker, i) => {
              const nextMarker = phaseMarkers[i + 1];
              const endFrame = nextMarker ? nextMarker.frame : totalFrames;
              const left = (marker.frame / totalFrames) * 100;
              const width = ((endFrame - marker.frame) / totalFrames) * 100;
              return (
                <div
                  key={i}
                  className="absolute top-0 h-full opacity-20"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: PHASE_LABELS[marker.phase]?.color || "#00d4ff",
                  }}
                />
              );
            })}
            <div
              className="absolute top-0 h-full bg-electric rounded-full transition-all duration-75"
              style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
            />
            {phaseMarkers.map((marker, i) => (
              <div
                key={`m-${i}`}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{
                  left: `${(marker.frame / totalFrames) * 100}%`,
                  backgroundColor: PHASE_LABELS[marker.phase]?.color || "#00d4ff",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-gray-500" />
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-0.5 rounded text-xs font-display tracking-wider transition-all
                ${
                  playbackSpeed === speed
                    ? "bg-electric/20 text-electric border border-electric/40"
                    : "text-gray-500 hover:text-gray-300 border border-transparent"
                }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {currentPhase && PHASE_LABELS[currentPhase] && (
          <div
            className="px-3 py-1 rounded-full text-xs font-display tracking-wider border"
            style={{
              color: PHASE_LABELS[currentPhase].color,
              borderColor: `${PHASE_LABELS[currentPhase].color}40`,
              backgroundColor: `${PHASE_LABELS[currentPhase].color}10`,
            }}
          >
            {PHASE_LABELS[currentPhase].icon} {PHASE_LABELS[currentPhase].label}
          </div>
        )}

        <span className="text-gray-500 text-xs font-mono w-16 text-right">
          {currentFrame}/{totalFrames}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-600 font-body">
        <span>空格 播放/暂停</span>
        <span>← → 逐帧</span>
        <span>Home/End 起止</span>
      </div>
    </div>
  );
}

import { create } from "zustand";
import { generatePoseData, type PoseFrame, type PhaseType, type JointName } from "@/data/poseData";
import { generateAnalysisData, type AnalysisResult, type SymmetryResult, computeSymmetry, CONTRALATERAL_MAP } from "@/data/analysisData";
import { generateReportData, type ReportData } from "@/data/reportData";

export type CameraPreset = "free" | "front" | "side" | "top";

interface AppState {
  poseData: ReturnType<typeof generatePoseData>;
  analysisData: AnalysisResult;
  reportData: ReportData;
  currentFrame: number;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedPhase: PhaseType | "all";
  isDataLoaded: boolean;
  showUpload: boolean;
  selectedJoint: JointName | null;
  cameraPreset: CameraPreset;
  showAngles: boolean;
  showBodyMesh: boolean;
  showTrail: boolean;
  showGhost: boolean;
  showForceArrows: boolean;

  setCurrentFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedPhase: (phase: PhaseType | "all") => void;
  loadData: () => void;
  setShowUpload: (show: boolean) => void;
  setSelectedJoint: (joint: JointName | null) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setShowAngles: (show: boolean) => void;
  setShowBodyMesh: (show: boolean) => void;
  setShowTrail: (show: boolean) => void;
  setShowGhost: (show: boolean) => void;
  setShowForceArrows: (show: boolean) => void;
  setFrameByPhase: (phase: PhaseType) => void;
  getCurrentFrameData: () => PoseFrame;
  getSymmetryResults: () => SymmetryResult[];
  getContralateralJoint: (joint: string) => string | undefined;
  getSymmetryForJoint: (joint: string) => SymmetryResult | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  poseData: generatePoseData(),
  analysisData: generateAnalysisData(),
  reportData: generateReportData(),
  currentFrame: 0,
  isPlaying: false,
  playbackSpeed: 1,
  selectedPhase: "all",
  isDataLoaded: false,
  showUpload: true,
  selectedJoint: null,
  cameraPreset: "free",
  showAngles: true,
  showBodyMesh: true,
  showTrail: true,
  showGhost: false,
  showForceArrows: true,

  setCurrentFrame: (frame) => set({ currentFrame: frame }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setSelectedPhase: (phase) => set({ selectedPhase: phase }),
  setShowUpload: (show) => set({ showUpload: show }),
  setSelectedJoint: (joint) => set({ selectedJoint: joint }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setShowAngles: (show) => set({ showAngles: show }),
  setShowBodyMesh: (show) => set({ showBodyMesh: show }),
  setShowTrail: (show) => set({ showTrail: show }),
  setShowGhost: (show) => set({ showGhost: show }),
  setShowForceArrows: (show) => set({ showForceArrows: show }),
  setFrameByPhase: (phase) => {
    const state = get();
    const frameIndex = state.poseData.frames.findIndex((f) => f.phase === phase);
    if (frameIndex >= 0) {
      set({ currentFrame: frameIndex, isPlaying: false, selectedPhase: phase });
    }
  },
  loadData: () => set({ isDataLoaded: true, showUpload: false, isPlaying: true }),
  getCurrentFrameData: () => {
    const state = get();
    return state.poseData.frames[state.currentFrame % state.poseData.totalFrames];
  },
  getSymmetryResults: () => {
    const state = get();
    const frame = state.poseData.frames[state.currentFrame % state.poseData.totalFrames];
    return computeSymmetry(frame.angles as unknown as Record<string, number>);
  },
  getContralateralJoint: (joint: string) => {
    return CONTRALATERAL_MAP[joint];
  },
  getSymmetryForJoint: (joint: string) => {
    const results = get().getSymmetryResults();
    return results.find((r) => r.leftJoint === joint || r.rightJoint === joint);
  },
}));

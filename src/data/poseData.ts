export interface JointPosition {
  x: number;
  y: number;
  z: number;
}

export type PhaseType = "initial_contact" | "mid_stance" | "push_off" | "swing";

export interface PoseFrame {
  timestamp: number;
  joints: Record<string, JointPosition>;
  phase: PhaseType;
  angles: FrameAngles;
}

export interface FrameAngles {
  leftKneeValgus: number;
  rightKneeValgus: number;
  pelvicTilt: number;
  pelvicDrop: number;
  trunkLean: number;
  leftKneeFlexion: number;
  rightKneeFlexion: number;
  leftHipFlexion: number;
  rightHipFlexion: number;
  leftAnkleDorsiflexion: number;
  rightAnkleDorsiflexion: number;
}

export interface PoseData {
  frames: PoseFrame[];
  frameRate: number;
  totalFrames: number;
  jointNames: string[];
}

export const JOINT_NAMES = [
  "head",
  "neck",
  "leftShoulder",
  "rightShoulder",
  "leftElbow",
  "rightElbow",
  "leftWrist",
  "rightWrist",
  "spine",
  "pelvis",
  "leftHip",
  "rightHip",
  "leftKnee",
  "rightKnee",
  "leftAnkle",
  "rightAnkle",
  "leftFoot",
  "rightFoot",
] as const;

export type JointName = (typeof JOINT_NAMES)[number];

export const BONE_CONNECTIONS: [JointName, JointName][] = [
  ["head", "neck"],
  ["neck", "leftShoulder"],
  ["neck", "rightShoulder"],
  ["leftShoulder", "leftElbow"],
  ["leftElbow", "leftWrist"],
  ["rightShoulder", "rightElbow"],
  ["rightElbow", "rightWrist"],
  ["neck", "spine"],
  ["spine", "pelvis"],
  ["pelvis", "leftHip"],
  ["pelvis", "rightHip"],
  ["leftHip", "leftKnee"],
  ["leftKnee", "leftAnkle"],
  ["leftAnkle", "leftFoot"],
  ["rightHip", "rightKnee"],
  ["rightKnee", "rightAnkle"],
  ["rightAnkle", "rightFoot"],
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpJoint(a: JointPosition, b: JointPosition, t: number): JointPosition {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

function lerpAngles(a: FrameAngles, b: FrameAngles, t: number): FrameAngles {
  return {
    leftKneeValgus: lerp(a.leftKneeValgus, b.leftKneeValgus, t),
    rightKneeValgus: lerp(a.rightKneeValgus, b.rightKneeValgus, t),
    pelvicTilt: lerp(a.pelvicTilt, b.pelvicTilt, t),
    pelvicDrop: lerp(a.pelvicDrop, b.pelvicDrop, t),
    trunkLean: lerp(a.trunkLean, b.trunkLean, t),
    leftKneeFlexion: lerp(a.leftKneeFlexion, b.leftKneeFlexion, t),
    rightKneeFlexion: lerp(a.rightKneeFlexion, b.rightKneeFlexion, t),
    leftHipFlexion: lerp(a.leftHipFlexion, b.leftHipFlexion, t),
    rightHipFlexion: lerp(a.rightHipFlexion, b.rightHipFlexion, t),
    leftAnkleDorsiflexion: lerp(a.leftAnkleDorsiflexion, b.leftAnkleDorsiflexion, t),
    rightAnkleDorsiflexion: lerp(a.rightAnkleDorsiflexion, b.rightAnkleDorsiflexion, t),
  };
}

function lerpFrame(a: PoseFrame, b: PoseFrame, t: number): PoseFrame {
  const joints: Record<string, JointPosition> = {};
  for (const name of JOINT_NAMES) {
    joints[name] = lerpJoint(a.joints[name], b.joints[name], t);
  }
  return {
    timestamp: lerp(a.timestamp, b.timestamp, t),
    joints,
    phase: t < 0.5 ? a.phase : b.phase,
    angles: lerpAngles(a.angles, b.angles, t),
  };
}

const KEYFRAMES: PoseFrame[] = [
  {
    timestamp: 0,
    phase: "initial_contact",
    joints: {
      head: { x: 0.02, y: 1.72, z: 0 },
      neck: { x: 0.02, y: 1.6, z: 0.03 },
      leftShoulder: { x: -0.18, y: 1.52, z: 0.02 },
      rightShoulder: { x: 0.22, y: 1.52, z: 0.02 },
      leftElbow: { x: -0.22, y: 1.32, z: -0.12 },
      rightElbow: { x: 0.22, y: 1.32, z: 0.12 },
      leftWrist: { x: -0.18, y: 1.18, z: -0.22 },
      rightWrist: { x: 0.18, y: 1.18, z: 0.22 },
      spine: { x: 0.01, y: 1.3, z: 0.04 },
      pelvis: { x: 0.03, y: 1.0, z: 0.02 },
      leftHip: { x: -0.1, y: 0.95, z: 0.01 },
      rightHip: { x: 0.1, y: 0.95, z: 0.01 },
      leftKnee: { x: -0.06, y: 0.55, z: 0.18 },
      rightKnee: { x: 0.08, y: 0.52, z: 0.05 },
      leftAnkle: { x: -0.08, y: 0.12, z: 0.25 },
      rightAnkle: { x: 0.08, y: 0.08, z: -0.18 },
      leftFoot: { x: -0.08, y: 0.02, z: 0.32 },
      rightFoot: { x: 0.08, y: 0.02, z: -0.25 },
    },
    angles: {
      leftKneeValgus: 13.5,
      rightKneeValgus: 7.2,
      pelvicTilt: 4.8,
      pelvicDrop: 3.2,
      trunkLean: 11.5,
      leftKneeFlexion: 12,
      rightKneeFlexion: 145,
      leftHipFlexion: 25,
      rightHipFlexion: 35,
      leftAnkleDorsiflexion: 15,
      rightAnkleDorsiflexion: 22,
    },
  },
  {
    timestamp: 0.125,
    phase: "mid_stance",
    joints: {
      head: { x: 0.03, y: 1.74, z: 0.1 },
      neck: { x: 0.03, y: 1.62, z: 0.13 },
      leftShoulder: { x: -0.18, y: 1.54, z: 0.12 },
      rightShoulder: { x: 0.22, y: 1.54, z: 0.12 },
      leftElbow: { x: -0.24, y: 1.34, z: 0.02 },
      rightElbow: { x: 0.18, y: 1.34, z: 0.22 },
      leftWrist: { x: -0.22, y: 1.22, z: -0.08 },
      rightWrist: { x: 0.14, y: 1.22, z: 0.3 },
      spine: { x: 0.02, y: 1.32, z: 0.14 },
      pelvis: { x: 0.05, y: 1.02, z: 0.12 },
      leftHip: { x: -0.1, y: 0.97, z: 0.11 },
      rightHip: { x: 0.1, y: 0.97, z: 0.11 },
      leftKnee: { x: -0.04, y: 0.55, z: 0.15 },
      rightKnee: { x: 0.15, y: 0.68, z: -0.08 },
      leftAnkle: { x: -0.06, y: 0.08, z: 0.18 },
      rightAnkle: { x: 0.12, y: 0.45, z: -0.2 },
      leftFoot: { x: -0.06, y: 0.02, z: 0.25 },
      rightFoot: { x: 0.12, y: 0.35, z: -0.28 },
    },
    angles: {
      leftKneeValgus: 12.0,
      rightKneeValgus: 6.5,
      pelvicTilt: 6.8,
      pelvicDrop: 5.1,
      trunkLean: 10.8,
      leftKneeFlexion: 25,
      rightKneeFlexion: 110,
      leftHipFlexion: 15,
      rightHipFlexion: 55,
      leftAnkleDorsiflexion: 20,
      rightAnkleDorsiflexion: 12,
    },
  },
  {
    timestamp: 0.25,
    phase: "push_off",
    joints: {
      head: { x: 0.02, y: 1.73, z: 0.2 },
      neck: { x: 0.02, y: 1.61, z: 0.23 },
      leftShoulder: { x: -0.18, y: 1.53, z: 0.22 },
      rightShoulder: { x: 0.22, y: 1.53, z: 0.22 },
      leftElbow: { x: -0.2, y: 1.35, z: 0.15 },
      rightElbow: { x: 0.22, y: 1.3, z: 0.28 },
      leftWrist: { x: -0.16, y: 1.24, z: 0.05 },
      rightWrist: { x: 0.16, y: 1.2, z: 0.35 },
      spine: { x: 0.01, y: 1.31, z: 0.24 },
      pelvis: { x: 0.04, y: 1.01, z: 0.22 },
      leftHip: { x: -0.1, y: 0.96, z: 0.21 },
      rightHip: { x: 0.1, y: 0.96, z: 0.21 },
      leftKnee: { x: -0.04, y: 0.58, z: 0.08 },
      rightKnee: { x: 0.18, y: 0.72, z: -0.05 },
      leftAnkle: { x: -0.05, y: 0.12, z: 0.1 },
      rightAnkle: { x: 0.15, y: 0.5, z: 0.05 },
      leftFoot: { x: -0.05, y: 0.02, z: 0.18 },
      rightFoot: { x: 0.15, y: 0.42, z: -0.02 },
    },
    angles: {
      leftKneeValgus: 10.5,
      rightKneeValgus: 5.8,
      pelvicTilt: 3.5,
      pelvicDrop: 2.0,
      trunkLean: 12.1,
      leftKneeFlexion: 8,
      rightKneeFlexion: 85,
      leftHipFlexion: -10,
      rightHipFlexion: 45,
      leftAnkleDorsiflexion: 25,
      rightAnkleDorsiflexion: 8,
    },
  },
  {
    timestamp: 0.375,
    phase: "swing",
    joints: {
      head: { x: 0.02, y: 1.74, z: 0.3 },
      neck: { x: 0.02, y: 1.62, z: 0.33 },
      leftShoulder: { x: -0.18, y: 1.54, z: 0.32 },
      rightShoulder: { x: 0.22, y: 1.54, z: 0.32 },
      leftElbow: { x: -0.18, y: 1.36, z: 0.25 },
      rightElbow: { x: 0.24, y: 1.28, z: 0.2 },
      leftWrist: { x: -0.14, y: 1.26, z: 0.18 },
      rightWrist: { x: 0.2, y: 1.15, z: 0.12 },
      spine: { x: 0.01, y: 1.32, z: 0.34 },
      pelvis: { x: 0.03, y: 1.02, z: 0.32 },
      leftHip: { x: -0.1, y: 0.97, z: 0.31 },
      rightHip: { x: 0.1, y: 0.97, z: 0.31 },
      leftKnee: { x: -0.15, y: 0.65, z: 0.1 },
      rightKnee: { x: 0.1, y: 0.48, z: 0.22 },
      leftAnkle: { x: -0.15, y: 0.38, z: -0.08 },
      rightAnkle: { x: 0.1, y: 0.25, z: 0.3 },
      leftFoot: { x: -0.15, y: 0.3, z: -0.15 },
      rightFoot: { x: 0.1, y: 0.15, z: 0.38 },
    },
    angles: {
      leftKneeValgus: 8.0,
      rightKneeValgus: 4.5,
      pelvicTilt: 2.5,
      pelvicDrop: 1.5,
      trunkLean: 11.0,
      leftKneeFlexion: 110,
      rightKneeFlexion: 35,
      leftHipFlexion: 45,
      rightHipFlexion: -5,
      leftAnkleDorsiflexion: 10,
      rightAnkleDorsiflexion: 18,
    },
  },
  {
    timestamp: 0.5,
    phase: "initial_contact",
    joints: {
      head: { x: -0.02, y: 1.72, z: 0.4 },
      neck: { x: -0.02, y: 1.6, z: 0.43 },
      leftShoulder: { x: -0.22, y: 1.52, z: 0.42 },
      rightShoulder: { x: 0.18, y: 1.52, z: 0.42 },
      leftElbow: { x: -0.22, y: 1.32, z: 0.3 },
      rightElbow: { x: 0.22, y: 1.32, z: 0.28 },
      leftWrist: { x: -0.18, y: 1.18, z: 0.2 },
      rightWrist: { x: 0.18, y: 1.18, z: 0.18 },
      spine: { x: -0.01, y: 1.3, z: 0.44 },
      pelvis: { x: -0.03, y: 1.0, z: 0.42 },
      leftHip: { x: -0.1, y: 0.95, z: 0.41 },
      rightHip: { x: 0.1, y: 0.95, z: 0.41 },
      leftKnee: { x: -0.12, y: 0.52, z: 0.35 },
      rightKnee: { x: 0.06, y: 0.55, z: 0.22 },
      leftAnkle: { x: -0.12, y: 0.08, z: 0.42 },
      rightAnkle: { x: 0.06, y: 0.12, z: 0.15 },
      leftFoot: { x: -0.12, y: 0.02, z: 0.48 },
      rightFoot: { x: 0.06, y: 0.02, z: 0.08 },
    },
    angles: {
      leftKneeValgus: 7.0,
      rightKneeValgus: 12.8,
      pelvicTilt: 4.5,
      pelvicDrop: 3.5,
      trunkLean: 11.2,
      leftKneeFlexion: 145,
      rightKneeFlexion: 10,
      leftHipFlexion: 35,
      rightHipFlexion: 22,
      leftAnkleDorsiflexion: 22,
      rightAnkleDorsiflexion: 14,
    },
  },
  {
    timestamp: 0.625,
    phase: "mid_stance",
    joints: {
      head: { x: -0.02, y: 1.74, z: 0.5 },
      neck: { x: -0.02, y: 1.62, z: 0.53 },
      leftShoulder: { x: -0.22, y: 1.54, z: 0.52 },
      rightShoulder: { x: 0.18, y: 1.54, z: 0.52 },
      leftElbow: { x: -0.18, y: 1.34, z: 0.62 },
      rightElbow: { x: -0.24, y: 1.34, z: 0.42 },
      leftWrist: { x: -0.14, y: 1.22, z: 0.7 },
      rightWrist: { x: -0.22, y: 1.22, z: 0.32 },
      spine: { x: -0.02, y: 1.32, z: 0.54 },
      pelvis: { x: -0.04, y: 1.02, z: 0.52 },
      leftHip: { x: -0.1, y: 0.97, z: 0.51 },
      rightHip: { x: 0.1, y: 0.97, z: 0.51 },
      leftKnee: { x: -0.15, y: 0.68, z: 0.45 },
      rightKnee: { x: 0.04, y: 0.55, z: 0.55 },
      leftAnkle: { x: -0.12, y: 0.45, z: 0.42 },
      rightAnkle: { x: 0.06, y: 0.08, z: 0.58 },
      leftFoot: { x: -0.12, y: 0.35, z: 0.35 },
      rightFoot: { x: 0.06, y: 0.02, z: 0.65 },
    },
    angles: {
      leftKneeValgus: 6.5,
      rightKneeValgus: 11.5,
      pelvicTilt: 6.2,
      pelvicDrop: 4.8,
      trunkLean: 10.5,
      leftKneeFlexion: 108,
      rightKneeFlexion: 22,
      leftHipFlexion: 55,
      rightHipFlexion: 12,
      leftAnkleDorsiflexion: 12,
      rightAnkleDorsiflexion: 20,
    },
  },
  {
    timestamp: 0.75,
    phase: "push_off",
    joints: {
      head: { x: -0.01, y: 1.73, z: 0.6 },
      neck: { x: -0.01, y: 1.61, z: 0.63 },
      leftShoulder: { x: -0.22, y: 1.53, z: 0.62 },
      rightShoulder: { x: 0.18, y: 1.53, z: 0.62 },
      leftElbow: { x: -0.22, y: 1.3, z: 0.68 },
      rightElbow: { x: -0.2, y: 1.35, z: 0.55 },
      leftWrist: { x: -0.16, y: 1.2, z: 0.75 },
      rightWrist: { x: -0.16, y: 1.24, z: 0.45 },
      spine: { x: -0.01, y: 1.31, z: 0.64 },
      pelvis: { x: -0.03, y: 1.01, z: 0.62 },
      leftHip: { x: -0.1, y: 0.96, z: 0.61 },
      rightHip: { x: 0.1, y: 0.96, z: 0.61 },
      leftKnee: { x: -0.18, y: 0.72, z: 0.55 },
      rightKnee: { x: 0.04, y: 0.58, z: 0.48 },
      leftAnkle: { x: -0.15, y: 0.5, z: 0.45 },
      rightAnkle: { x: 0.05, y: 0.12, z: 0.5 },
      leftFoot: { x: -0.15, y: 0.42, z: 0.38 },
      rightFoot: { x: 0.05, y: 0.02, z: 0.58 },
    },
    angles: {
      leftKneeValgus: 5.8,
      rightKneeValgus: 10.2,
      pelvicTilt: 3.2,
      pelvicDrop: 1.8,
      trunkLean: 12.0,
      leftKneeFlexion: 82,
      rightKneeFlexion: 6,
      leftHipFlexion: 45,
      rightHipFlexion: -12,
      leftAnkleDorsiflexion: 8,
      rightAnkleDorsiflexion: 26,
    },
  },
  {
    timestamp: 0.875,
    phase: "swing",
    joints: {
      head: { x: 0.0, y: 1.74, z: 0.7 },
      neck: { x: 0.0, y: 1.62, z: 0.73 },
      leftShoulder: { x: -0.2, y: 1.54, z: 0.72 },
      rightShoulder: { x: 0.2, y: 1.54, z: 0.72 },
      leftElbow: { x: -0.24, y: 1.28, z: 0.6 },
      rightElbow: { x: -0.18, y: 1.36, z: 0.65 },
      leftWrist: { x: -0.2, y: 1.15, z: 0.52 },
      rightWrist: { x: -0.14, y: 1.26, z: 0.58 },
      spine: { x: 0.0, y: 1.32, z: 0.74 },
      pelvis: { x: 0.0, y: 1.02, z: 0.72 },
      leftHip: { x: -0.1, y: 0.97, z: 0.71 },
      rightHip: { x: 0.1, y: 0.97, z: 0.71 },
      leftKnee: { x: -0.1, y: 0.48, z: 0.62 },
      rightKnee: { x: -0.15, y: 0.65, z: 0.5 },
      leftAnkle: { x: -0.1, y: 0.25, z: 0.7 },
      rightAnkle: { x: -0.15, y: 0.38, z: 0.32 },
      leftFoot: { x: -0.1, y: 0.15, z: 0.78 },
      rightFoot: { x: -0.15, y: 0.3, z: 0.25 },
    },
    angles: {
      leftKneeValgus: 4.5,
      rightKneeValgus: 7.5,
      pelvicTilt: 2.2,
      pelvicDrop: 1.2,
      trunkLean: 11.0,
      leftKneeFlexion: 32,
      rightKneeFlexion: 115,
      leftHipFlexion: -8,
      rightHipFlexion: 48,
      leftAnkleDorsiflexion: 18,
      rightAnkleDorsiflexion: 10,
    },
  },
];

export function generatePoseData(): PoseData {
  const frameRate = 30;
  const framesPerCycle = 60;
  const frames: PoseFrame[] = [];

  for (let i = 0; i < framesPerCycle; i++) {
    const t = i / framesPerCycle;
    const keyframeIndex = t * KEYFRAMES.length;
    const kf0 = Math.floor(keyframeIndex) % KEYFRAMES.length;
    const kf1 = (kf0 + 1) % KEYFRAMES.length;
    const localT = keyframeIndex - Math.floor(keyframeIndex);

    const frame = lerpFrame(KEYFRAMES[kf0], KEYFRAMES[kf1], localT);
    frame.timestamp = t;
    frames.push(frame);
  }

  return {
    frames,
    frameRate,
    totalFrames: framesPerCycle,
    jointNames: [...JOINT_NAMES],
  };
}

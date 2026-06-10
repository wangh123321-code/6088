import { useRef, useMemo, useCallback, createContext, useContext } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BONE_CONNECTIONS, type JointName, type JointPosition, type FrameAngles, type PhaseType } from "@/data/poseData";
import { CONTRALATERAL_MAP, type SymmetryResult, computeSymmetry, SYMMETRY_GRADE_LABELS } from "@/data/analysisData";
import { useStore } from "@/store/useStore";

const PROBLEM_JOINTS: Record<string, "danger" | "warning"> = {
  leftKnee: "danger",
  rightKnee: "warning",
  pelvis: "warning",
  leftAnkle: "warning",
};

const STATUS_COLORS: Record<string, string> = {
  normal: "#00ff88",
  warning: "#ffaa00",
  danger: "#ff3366",
};

const BODY_SEGMENTS: [JointName, JointName, number][] = [
  ["neck", "spine", 0.08],
  ["spine", "pelvis", 0.09],
  ["pelvis", "leftHip", 0.1],
  ["pelvis", "rightHip", 0.1],
  ["leftShoulder", "leftElbow", 0.05],
  ["rightShoulder", "rightElbow", 0.05],
  ["leftElbow", "leftWrist", 0.04],
  ["rightElbow", "rightWrist", 0.04],
  ["leftHip", "leftKnee", 0.065],
  ["rightHip", "rightKnee", 0.065],
  ["leftKnee", "leftAnkle", 0.045],
  ["rightKnee", "rightAnkle", 0.045],
];

const TORSO_FACES: [JointName, JointName, JointName][] = [
  ["leftShoulder", "rightShoulder", "spine"],
  ["spine", "rightShoulder", "rightHip"],
  ["spine", "rightHip", "pelvis"],
  ["spine", "pelvis", "leftHip"],
  ["spine", "leftHip", "leftShoulder"],
];

const JOINT_LABELS: Record<string, string> = {
  head: "头部",
  neck: "颈部",
  leftShoulder: "左肩",
  rightShoulder: "右肩",
  leftElbow: "左肘",
  rightElbow: "右肘",
  leftWrist: "左腕",
  rightWrist: "右腕",
  spine: "脊柱",
  pelvis: "骨盆",
  leftHip: "左髋",
  rightHip: "右髋",
  leftKnee: "左膝",
  rightKnee: "右膝",
  leftAnkle: "左踝",
  rightAnkle: "右踝",
  leftFoot: "左脚",
  rightFoot: "右脚",
};

const PHASE_COLORS: Record<PhaseType, string> = {
  initial_contact: "#ff3366",
  mid_stance: "#ffaa00",
  push_off: "#00d4ff",
  swing: "#00ff88",
};

type AngleInfoMap = Record<string, Array<{ label: string; value: string; color: string }>>;

const AngleInfoContext = createContext<AngleInfoMap>({});

const SymmetryDataContext = createContext<SymmetryResult[]>([]);

const SYMMETRY_GRADE_COLORS: Record<string, string> = {
  symmetric: "#00ff88",
  mild_asymmetry: "#ffaa00",
  obvious_asymmetry: "#ff3366",
};

function useJointAngleInfo(angles: FrameAngles | undefined): AngleInfoMap {
  return useMemo(() => {
    if (!angles) return {};
    return {
      leftKnee: [
        { label: "内扣角度", value: `${angles.leftKneeValgus.toFixed(1)}°`, color: angles.leftKneeValgus > 8 ? "#ff3366" : "#00ff88" },
        { label: "屈曲角度", value: `${angles.leftKneeFlexion.toFixed(0)}°`, color: "#00d4ff" },
      ],
      rightKnee: [
        { label: "内扣角度", value: `${angles.rightKneeValgus.toFixed(1)}°`, color: angles.rightKneeValgus > 8 ? "#ff3366" : "#00ff88" },
        { label: "屈曲角度", value: `${angles.rightKneeFlexion.toFixed(0)}°`, color: "#00d4ff" },
      ],
      pelvis: [
        { label: "左右摇摆", value: `${angles.pelvicTilt.toFixed(1)}°`, color: angles.pelvicTilt > 5 ? "#ffaa00" : "#00ff88" },
        { label: "骨盆下降", value: `${angles.pelvicDrop.toFixed(1)}°`, color: angles.pelvicDrop > 4 ? "#ffaa00" : "#00ff88" },
      ],
      leftAnkle: [
        { label: "背屈角度", value: `${angles.leftAnkleDorsiflexion.toFixed(0)}°`, color: "#00d4ff" },
      ],
      rightAnkle: [
        { label: "背屈角度", value: `${angles.rightAnkleDorsiflexion.toFixed(0)}°`, color: "#00d4ff" },
      ],
      leftHip: [
        { label: "屈曲角度", value: `${angles.leftHipFlexion.toFixed(0)}°`, color: "#00d4ff" },
      ],
      rightHip: [
        { label: "屈曲角度", value: `${angles.rightHipFlexion.toFixed(0)}°`, color: "#00d4ff" },
      ],
      spine: [
        { label: "前倾角度", value: `${angles.trunkLean.toFixed(1)}°`, color: angles.trunkLean >= 8 && angles.trunkLean <= 15 ? "#00ff88" : "#ffaa00" },
      ],
    };
  }, [angles]);
}

function getJointColor(name: string): string {
  const status = PROBLEM_JOINTS[name];
  return status ? STATUS_COLORS[status] : STATUS_COLORS.normal;
}

function getBoneColor(from: string, to: string): string {
  const fromStatus = PROBLEM_JOINTS[from];
  const toStatus = PROBLEM_JOINTS[to];
  if (fromStatus === "danger" || toStatus === "danger") return "#ff3366";
  if (fromStatus === "warning" || toStatus === "warning") return "#ffaa00";
  return "#00d4ff";
}

function JointSphere({ position, name, scale = 1 }: { position: JointPosition; name: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getJointColor(name);
  const isProblem = PROBLEM_JOINTS[name] !== undefined;
  const baseScale = name === "head" ? 0.08 : name === "pelvis" ? 0.055 : 0.045;
  const finalScale = baseScale * scale;
  const selectedJoint = useStore((s) => s.selectedJoint);
  const setSelectedJoint = useStore((s) => s.setSelectedJoint);
  const isSelected = selectedJoint === name;
  const isContralateral = selectedJoint !== null && CONTRALATERAL_MAP[selectedJoint] === name;
  const angleInfo = useContext(AngleInfoContext);
  const jointInfo = angleInfo[name];
  const symmetryData = useContext(SymmetryDataContext);
  const symmetryForSelected = useMemo(() => {
    if (!selectedJoint) return undefined;
    return symmetryData.find((r) => r.leftJoint === selectedJoint || r.rightJoint === selectedJoint);
  }, [selectedJoint, symmetryData]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setSelectedJoint(selectedJoint === name ? null : (name as JointName));
  }, [name, selectedJoint, setSelectedJoint]);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = isProblem ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15 : 1;
      const selectScale = isSelected ? 1.4 : isContralateral ? 1.2 : 1;
      meshRef.current.scale.setScalar(finalScale * pulse * selectScale);
    }
  });

  const emissiveIntensity = isProblem ? 1.2 : isSelected ? 1.0 : isContralateral ? 0.9 : 0.4;
  const displayColor = isContralateral ? "#c084fc" : color;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        scale={finalScale}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.95}
        />
      </mesh>
      {isSelected && (
        <Html position={[position.x, position.y + 0.08, position.z]} center distanceFactor={4}>
          <div className="bg-dark-800/90 border border-electric/30 rounded-lg px-3 py-2 text-xs whitespace-nowrap backdrop-blur-sm pointer-events-none"
               style={{ boxShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
            <div className="text-electric font-display tracking-wider mb-1">{JOINT_LABELS[name] || name}</div>
            {jointInfo && (
              <div className="text-gray-300 font-body space-y-0.5">
                {jointInfo.map((info, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <span className="text-gray-500">{info.label}</span>
                    <span style={{ color: info.color }}>{info.value}</span>
                  </div>
                ))}
              </div>
            )}
            {symmetryForSelected && (
              <div className="mt-1.5 pt-1.5 border-t border-electric/20">
                <div className="text-purple-400 font-display tracking-wider mb-0.5">
                  对称性对比 · {symmetryForSelected.label}
                </div>
                <div className="text-gray-300 font-body space-y-0.5">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">左侧</span>
                    <span className="text-blue-300">{symmetryForSelected.leftValue.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">右侧</span>
                    <span className="text-purple-300">{symmetryForSelected.rightValue.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">差值</span>
                    <span style={{ color: SYMMETRY_GRADE_COLORS[symmetryForSelected.grade] }}>
                      {symmetryForSelected.diff.toFixed(1)}°
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">等级</span>
                    <span style={{ color: SYMMETRY_GRADE_COLORS[symmetryForSelected.grade] }}>
                      {symmetryForSelected.gradeLabel}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
      {isContralateral && !isSelected && (
        <Html position={[position.x, position.y + 0.07, position.z]} center distanceFactor={4}>
          <div className="px-2 py-0.5 rounded-full text-[10px] font-display tracking-wider pointer-events-none whitespace-nowrap"
               style={{
                 color: "#c084fc",
                 backgroundColor: "rgba(192,132,252,0.1)",
                 border: "1px solid rgba(192,132,252,0.3)",
                 textShadow: "0 0 6px rgba(192,132,252,0.6)",
               }}>
            对侧 · {JOINT_LABELS[name]}
          </div>
        </Html>
      )}
      {isContralateral && !isSelected && (
        <mesh position={[position.x, position.y, position.z]} scale={finalScale * 2.2}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      )}
      {isProblem && !isSelected && !isContralateral && (
        <mesh position={[position.x, position.y, position.z]} scale={finalScale * 2}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function BoneCylinder({ from, to, fromName, toName }: { from: JointPosition; to: JointPosition; fromName: string; toName: string }) {
  const color = getBoneColor(fromName, toName);
  const isProblem = PROBLEM_JOINTS[fromName] || PROBLEM_JOINTS[toName];

  const { position, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(from.x, from.y, from.z);
    const end = new THREE.Vector3(to.x, to.y, to.z);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dir = end.clone().sub(start);
    const len = dir.length();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: mid, quaternion: quat, length: len };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[isProblem ? 0.018 : 0.012, isProblem ? 0.018 : 0.012, length, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isProblem ? 0.8 : 0.3}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function BodyMesh({ joints }: { joints: Record<string, JointPosition> }) {
  const torsoMesh = useMemo(() => {
    const positions: number[] = [];
    for (const [a, b, c] of TORSO_FACES) {
      const ja = joints[a];
      const jb = joints[b];
      const jc = joints[c];
      if (!ja || !jb || !jc) continue;
      positions.push(ja.x, ja.y, ja.z);
      positions.push(jb.x, jb.y, jb.z);
      positions.push(jc.x, jc.y, jc.z);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    return geom;
  }, [joints]);

  return (
    <mesh geometry={torsoMesh}>
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#00d4ff"
        emissiveIntensity={0.15}
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function BodySegmentMesh({ from, to, radius }: { from: JointPosition; to: JointPosition; radius: number }) {
  const { position, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(from.x, from.y, from.z);
    const end = new THREE.Vector3(to.x, to.y, to.z);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dir = end.clone().sub(start);
    const len = dir.length();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: mid, quaternion: quat, length: len };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius * 0.85, length, 8]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#00d4ff"
        emissiveIntensity={0.1}
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function HeadMesh({ joints }: { joints: Record<string, JointPosition> }) {
  const head = joints.head;
  if (!head) return null;
  return (
    <mesh position={[head.x, head.y + 0.06, head.z]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial
        color="#00d4ff"
        emissive="#00d4ff"
        emissiveIntensity={0.1}
        transparent
        opacity={0.06}
        depthWrite={false}
      />
    </mesh>
  );
}

function AngleArc({ center, from, to, color, radius = 0.12, label }: {
  center: JointPosition;
  from: JointPosition;
  to: JointPosition;
  color: string;
  radius?: number;
  label?: string;
}) {
  const points = useMemo(() => {
    const c = new THREE.Vector3(center.x, center.y, center.z);
    const f = new THREE.Vector3(from.x, from.y, from.z);
    const t = new THREE.Vector3(to.x, to.y, to.z);
    const dirFrom = f.clone().sub(c).normalize();
    const dirTo = t.clone().sub(c).normalize();
    const arcPoints: THREE.Vector3[] = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const frac = i / segments;
      const dir = new THREE.Vector3().lerpVectors(dirFrom, dirTo, frac).normalize();
      arcPoints.push(c.clone().add(dir.multiplyScalar(radius)));
    }
    return arcPoints;
  }, [center.x, center.y, center.z, from.x, from.y, from.z, to.x, to.y, to.z, radius]);

  const lineGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const lineObj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
    return new THREE.Line(lineGeom, mat);
  }, [lineGeom, color]);

  return (
    <group>
      <primitive object={lineObj} />
      {label && (
        <Html position={[center.x, center.y + radius + 0.03, center.z]} center distanceFactor={5}>
          <div className="text-[10px] font-mono whitespace-nowrap pointer-events-none"
               style={{ color, textShadow: `0 0 6px ${color}` }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function AngleVisualizations({ joints, angles }: { joints: Record<string, JointPosition>; angles: FrameAngles | undefined }) {
  if (!angles) return null;

  return (
    <group>
      {joints.leftKnee && joints.leftHip && joints.leftAnkle && angles.leftKneeValgus > 5 && (
        <AngleArc
          center={joints.leftKnee}
          from={joints.leftHip}
          to={joints.leftAnkle}
          color="#ff3366"
          radius={0.1}
          label={`${angles.leftKneeValgus.toFixed(1)}°`}
        />
      )}
      {joints.rightKnee && joints.rightHip && joints.rightAnkle && angles.rightKneeValgus > 5 && (
        <AngleArc
          center={joints.rightKnee}
          from={joints.rightHip}
          to={joints.rightAnkle}
          color="#ffaa00"
          radius={0.1}
          label={`${angles.rightKneeValgus.toFixed(1)}°`}
        />
      )}
      {joints.pelvis && joints.spine && angles.pelvicTilt > 3 && (
        <AngleArc
          center={joints.pelvis}
          from={joints.spine}
          to={joints.leftHip}
          color="#ffaa00"
          radius={0.12}
          label={`摇摆 ${angles.pelvicTilt.toFixed(1)}°`}
        />
      )}
      {joints.spine && joints.neck && joints.pelvis && angles.trunkLean > 5 && (
        <AngleArc
          center={joints.spine}
          from={joints.neck}
          to={joints.pelvis}
          color="#00d4ff"
          radius={0.1}
          label={`前倾 ${angles.trunkLean.toFixed(1)}°`}
        />
      )}
    </group>
  );
}

function ForceArrow({ origin, direction, magnitude, color }: {
  origin: [number, number, number];
  direction: [number, number, number];
  magnitude: number;
  color: string;
}) {
  const arrowRef = useRef<THREE.ArrowHelper>(null);

  useMemo(() => {
    if (arrowRef.current) {
      arrowRef.current.setDirection(new THREE.Vector3(...direction).normalize());
      arrowRef.current.setLength(magnitude, magnitude * 0.2, magnitude * 0.1);
    }
  }, [direction, magnitude]);

  return (
    <arrowHelper
      ref={arrowRef}
      args={[new THREE.Vector3(...direction).normalize(), new THREE.Vector3(...origin), magnitude, color, magnitude * 0.2, magnitude * 0.1]}
    />
  );
}

function GroundReactionForces({ joints, phase }: { joints: Record<string, JointPosition>; phase: PhaseType }) {
  const showForceArrows = useStore((s) => s.showForceArrows);
  if (!showForceArrows) return null;

  const arrows: React.ReactNode[] = [];

  if (phase === "initial_contact") {
    const leftFoot = joints.leftFoot;
    const rightFoot = joints.rightFoot;
    if (leftFoot && leftFoot.y < 0.05) {
      arrows.push(
        <ForceArrow
          key="left-contact"
          origin={[leftFoot.x, 0.01, leftFoot.z]}
          direction={[0.15, 1, 0]}
          magnitude={0.4}
          color="#ff3366"
        />
      );
    }
    if (rightFoot && rightFoot.y < 0.05) {
      arrows.push(
        <ForceArrow
          key="right-contact"
          origin={[rightFoot.x, 0.01, rightFoot.z]}
          direction={[-0.15, 1, 0]}
          magnitude={0.4}
          color="#ff3366"
        />
      );
    }
  }

  if (phase === "mid_stance") {
    const leftFoot = joints.leftFoot;
    const rightFoot = joints.rightFoot;
    if (leftFoot && leftFoot.y < 0.05) {
      arrows.push(
        <ForceArrow
          key="left-stance"
          origin={[leftFoot.x, 0.01, leftFoot.z]}
          direction={[0, 1, 0]}
          magnitude={0.5}
          color="#ffaa00"
        />
      );
    }
    if (rightFoot && rightFoot.y < 0.05) {
      arrows.push(
        <ForceArrow
          key="right-stance"
          origin={[rightFoot.x, 0.01, rightFoot.z]}
          direction={[0, 1, 0]}
          magnitude={0.5}
          color="#ffaa00"
        />
      );
    }
  }

  if (phase === "push_off") {
    const leftFoot = joints.leftFoot;
    const rightFoot = joints.rightFoot;
    if (leftFoot && leftFoot.y < 0.05) {
      arrows.push(
        <ForceArrow
          key="left-push"
          origin={[leftFoot.x, 0.01, leftFoot.z]}
          direction={[-0.1, 0.8, -0.3]}
          magnitude={0.45}
          color="#00d4ff"
        />
      );
    }
    if (rightFoot && rightFoot.y < 0.05) {
      arrows.push(
        <ForceArrow
          key="right-push"
          origin={[rightFoot.x, 0.01, rightFoot.z]}
          direction={[0.1, 0.8, -0.3]}
          magnitude={0.45}
          color="#00d4ff"
        />
      );
    }
  }

  return <group>{arrows}</group>;
}

function GhostBones({ joints }: { joints: Record<string, JointPosition> }) {
  const ghostBone = useCallback(
    (from: JointPosition, to: JointPosition) => {
      const start = new THREE.Vector3(from.x, from.y, from.z);
      const end = new THREE.Vector3(to.x, to.y, to.z);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const dir = end.clone().sub(start);
      const len = dir.length();
      const quat = new THREE.Quaternion();
      quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      return { position: mid, quaternion: quat, length: len };
    },
    []
  );

  return (
    <group>
      {BONE_CONNECTIONS.map(([from, to]) => {
        const fromJ = joints[from];
        const toJ = joints[to];
        if (!fromJ || !toJ) return null;
        const { position, quaternion, length } = ghostBone(fromJ, toJ);
        return (
          <mesh key={`ghost-${from}-${to}`} position={position} quaternion={quaternion}>
            <cylinderGeometry args={[0.006, 0.006, length, 6]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.3}
              transparent
              opacity={0.2}
            />
          </mesh>
        );
      })}
      {(Object.keys(joints) as JointName[]).map((name) => {
        const j = joints[name];
        const s = name === "head" ? 0.05 : 0.02;
        return (
          <mesh key={`ghost-j-${name}`} position={[j.x, j.y, j.z]} scale={s}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.3}
              transparent
              opacity={0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function IdealPoseGenerator() {
  const currentFrame = useStore((s) => s.currentFrame);
  const poseData = useStore((s) => s.poseData);
  const frameData = poseData.frames[currentFrame % poseData.totalFrames];

  const idealJoints = useMemo(() => {
    const joints = { ...frameData.joints };
    if (joints.leftKnee) {
      joints.leftKnee = { ...joints.leftKnee, x: joints.leftKnee.x * 0.6 };
    }
    if (joints.rightKnee) {
      joints.rightKnee = { ...joints.rightKnee, x: joints.rightKnee.x * 0.6 };
    }
    if (joints.pelvis) {
      joints.pelvis = { ...joints.pelvis, x: 0 };
    }
    return joints;
  }, [frameData.joints]);

  return <GhostBones joints={idealJoints} />;
}

function PhaseIndicator({ joints, phase }: { joints: Record<string, JointPosition>; phase: PhaseType }) {
  const color = PHASE_COLORS[phase];
  const pelvis = joints.pelvis;
  if (!pelvis) return null;

  const phaseLabels: Record<PhaseType, string> = {
    initial_contact: "着地",
    mid_stance: "支撑",
    push_off: "蹬伸",
    swing: "摆动",
  };

  return (
    <Html position={[pelvis.x, pelvis.y + 0.35, pelvis.z]} center distanceFactor={5}>
      <div
        className="px-2 py-0.5 rounded-full text-[10px] font-display tracking-wider pointer-events-none whitespace-nowrap"
        style={{
          color,
          backgroundColor: `${color}15`,
          border: `1px solid ${color}40`,
          textShadow: `0 0 6px ${color}60`,
        }}
      >
        {phaseLabels[phase]}
      </div>
    </Html>
  );
}

export default function SkeletonModel() {
  const currentFrame = useStore((s) => s.currentFrame);
  const poseData = useStore((s) => s.poseData);
  const showAngles = useStore((s) => s.showAngles);
  const showBodyMesh = useStore((s) => s.showBodyMesh);
  const showGhost = useStore((s) => s.showGhost);
  const frameData = poseData.frames[currentFrame % poseData.totalFrames];
  const angleInfo = useJointAngleInfo(frameData.angles);
  const symmetryData = useMemo(
    () => computeSymmetry(frameData.angles as unknown as Record<string, number>),
    [frameData.angles]
  );

  return (
    <AngleInfoContext.Provider value={angleInfo}>
      <SymmetryDataContext.Provider value={symmetryData}>
        <group>
          {BONE_CONNECTIONS.map(([from, to]) => (
            <BoneCylinder
              key={`${from}-${to}`}
              from={frameData.joints[from]}
              to={frameData.joints[to]}
              fromName={from}
              toName={to}
            />
          ))}
          {(Object.keys(frameData.joints) as JointName[]).map((name) => (
            <JointSphere key={name} position={frameData.joints[name]} name={name} />
          ))}
          {showBodyMesh && (
            <group>
              <BodyMesh joints={frameData.joints} />
              <HeadMesh joints={frameData.joints} />
              {BODY_SEGMENTS.map(([from, to, radius]) => (
                <BodySegmentMesh
                  key={`mesh-${from}-${to}`}
                  from={frameData.joints[from]}
                  to={frameData.joints[to]}
                  radius={radius}
                />
              ))}
            </group>
          )}
          {showAngles && (
            <AngleVisualizations joints={frameData.joints} angles={frameData.angles} />
          )}
          {showGhost && <IdealPoseGenerator />}
          <GroundReactionForces joints={frameData.joints} phase={frameData.phase} />
          <PhaseIndicator joints={frameData.joints} phase={frameData.phase} />
        </group>
      </SymmetryDataContext.Provider>
    </AngleInfoContext.Provider>
  );
}

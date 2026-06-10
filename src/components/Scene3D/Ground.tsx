import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

function RunningTrack() {
  const lineRef = useRef<THREE.Group>(null);

  const trackLines = useMemo(() => {
    const lines: { points: THREE.Vector3[]; color: string }[] = [];

    for (let lane = -1; lane <= 1; lane++) {
      const z = lane * 0.6;
      lines.push({
        points: [new THREE.Vector3(-2, 0.005, z), new THREE.Vector3(4, 0.005, z)],
        color: lane === 0 ? "#00d4ff" : "#1a3a5c",
      });
    }

    for (let x = -1; x <= 3; x += 1) {
      lines.push({
        points: [new THREE.Vector3(x, 0.005, -0.6), new THREE.Vector3(x, 0.005, 0.6)],
        color: x % 2 === 0 ? "#00d4ff30" : "#1a3a5c30",
      });
    }

    return lines;
  }, []);

  const lineObjects = useMemo(() => {
    return trackLines.map((line) => {
      const geom = new THREE.BufferGeometry().setFromPoints(line.points);
      const mat = new THREE.LineBasicMaterial({ color: line.color, transparent: true, opacity: 0.4 });
      return new THREE.Line(geom, mat);
    });
  }, [trackLines]);

  return (
    <group ref={lineRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

function FootprintTrail() {
  const currentFrame = useStore((s) => s.currentFrame);
  const poseData = useStore((s) => s.poseData);
  const showTrail = useStore((s) => s.showTrail);

  const footprints = useMemo(() => {
    const prints: Array<{ x: number; z: number; side: "left" | "right"; frame: number }> = [];
    const step = 5;

    for (let i = 0; i < currentFrame; i += step) {
      const frame = poseData.frames[i % poseData.totalFrames];
      const leftFoot = frame.joints.leftFoot;
      const rightFoot = frame.joints.rightFoot;

      if (leftFoot.y < 0.05) {
        prints.push({ x: leftFoot.x, z: leftFoot.z, side: "left", frame: i });
      }
      if (rightFoot.y < 0.05) {
        prints.push({ x: rightFoot.x, z: rightFoot.z, side: "right", frame: i });
      }
    }

    return prints;
  }, [currentFrame, poseData]);

  if (!showTrail) return null;

  return (
    <group>
      {footprints.map((fp, i) => (
        <mesh key={i} position={[fp.x, 0.003, fp.z]} rotation={[-Math.PI / 2, 0, fp.side === "left" ? 0.1 : -0.1]}>
          <planeGeometry args={[0.06, 0.15]} />
          <meshBasicMaterial
            color={fp.side === "left" ? "#ff3366" : "#00d4ff"}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function MeasurementGrid() {
  const gridRef = useRef<THREE.Group>(null);

  const markers = useMemo(() => {
    const m: Array<{ pos: THREE.Vector3; label: string }> = [];
    for (let x = 0; x <= 3; x += 0.5) {
      m.push({ pos: new THREE.Vector3(x, 0.01, -0.75), label: `${(x * 100).toFixed(0)}cm` });
    }
    return m;
  }, []);

  return (
    <group ref={gridRef}>
      {markers.map((m, i) => (
        <mesh key={i} position={m.pos}>
          <planeGeometry args={[0.01, 0.05]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export default function Ground() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.Material;
      mat.opacity = 0.15;
    }
  });

  return (
    <group>
      <gridHelper
        ref={gridRef}
        args={[20, 40, "#00d4ff", "#00d4ff"]}
        position={[0, 0, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#060a14" transparent opacity={0.95} />
      </mesh>
      <RunningTrack />
      <FootprintTrail />
      <MeasurementGrid />
    </group>
  );
}

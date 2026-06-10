import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import SkeletonModel from "./SkeletonModel";
import Ground from "./Ground";
import { useStore, type CameraPreset } from "@/store/useStore";
import { useRef, useEffect } from "react";
import * as THREE from "three";

const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  free: { position: [2, 1.2, 2.5], target: [0, 0.9, 0.3] },
  front: { position: [0, 1.0, 3], target: [0, 0.9, 0.3] },
  side: { position: [3, 1.0, 0.3], target: [0, 0.9, 0.3] },
  top: { position: [0, 3.5, 0.3], target: [0, 0.9, 0.3] },
};

function AnimationController() {
  const isPlaying = useStore((s) => s.isPlaying);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const setCurrentFrame = useStore((s) => s.setCurrentFrame);
  const poseData = useStore((s) => s.poseData);
  const frameRef = useRef(0);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta * playbackSpeed;
    const framesPerSecond = poseData.frameRate;
    frameRef.current = Math.floor(timeRef.current * framesPerSecond) % poseData.totalFrames;
    if (timeRef.current * framesPerSecond >= poseData.totalFrames) {
      timeRef.current = 0;
      frameRef.current = 0;
    }
    setCurrentFrame(frameRef.current);
  });

  return null;
}

function CameraController() {
  const cameraPreset = useStore((s) => s.cameraPreset);
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...CAMERA_PRESETS.free.position));
  const targetLookAt = useRef(new THREE.Vector3(...CAMERA_PRESETS.free.target));
  const currentLookAt = useRef(new THREE.Vector3(...CAMERA_PRESETS.free.target));

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset];
    targetPos.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);
  }, [cameraPreset]);

  useFrame(() => {
    if (cameraPreset === "free") return;
    camera.position.lerp(targetPos.current, 0.05);
    currentLookAt.current.lerp(targetLookAt.current, 0.05);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

function SceneContent() {
  const cameraPreset = useStore((s) => s.cameraPreset);

  return (
    <>
      <PerspectiveCamera makeDefault position={CAMERA_PRESETS.free.position} fov={50} />
      <OrbitControls
        target={CAMERA_PRESETS.free.target}
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.85}
        enabled={cameraPreset === "free"}
      />
      <ambientLight intensity={0.15} color="#1a3a5c" />
      <directionalLight position={[5, 8, 3]} intensity={0.6} color="#c0d8f0" />
      <directionalLight position={[-3, 5, -2]} intensity={0.2} color="#0088aa" />
      <pointLight position={[0, 2, 0]} intensity={0.15} color="#00d4ff" distance={5} />
      <fog attach="fog" args={["#0a0e1a", 5, 15]} />
      <SkeletonModel />
      <Ground />
      <AnimationController />
      <CameraController />
    </>
  );
}

export default function Scene3D() {
  const isDataLoaded = useStore((s) => s.isDataLoaded);

  if (!isDataLoaded) return null;

  return (
    <div className="w-full h-full">
      <Canvas
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: "#0a0e1a" }}
        onPointerMissed={() => useStore.getState().setSelectedJoint(null)}
      >
        <SceneContent />
        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { decayRose, motion } from "@/lib/motion";
import { getPetalGeometry, getStemGeometry } from "@/lib/petal";

type Layer = {
  count: number;
  y: number;
  radius: number;
  tilt: number;
  scale: number;
  spin: number;
  color: string;
  glow: number;
};

const LAYERS: Layer[] = [
  { count: 4, y: 0.22, radius: 0.02, tilt: 1.2, scale: 0.34, spin: 0.4, color: "#ffe4e8", glow: 0.42 },
  { count: 5, y: 0.15, radius: 0.05, tilt: 1.02, scale: 0.48, spin: 0.15, color: "#ffd0d6", glow: 0.32 },
  { count: 6, y: 0.08, radius: 0.09, tilt: 0.84, scale: 0.64, spin: 0.5, color: "#f3b8c2", glow: 0.24 },
  { count: 7, y: 0.01, radius: 0.13, tilt: 0.66, scale: 0.82, spin: 0.1, color: "#e7a0ac", glow: 0.18 },
  { count: 8, y: -0.07, radius: 0.17, tilt: 0.48, scale: 1.02, spin: 0.36, color: "#c46a78", glow: 0.12 },
  { count: 7, y: -0.15, radius: 0.2, tilt: 0.34, scale: 1.16, spin: 0.02, color: "#8d3140", glow: 0.08 },
];

const PALETTE: [string, string, string] = ["#4A0A16", "#C8102E", "#FFD0D6"];

function seeded(index: number) {
  const value = Math.sin(index * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

function PetalLayer({
  layer,
  geometry,
}: {
  layer: Layer;
  geometry: THREE.BufferGeometry;
}) {
  const material = useMemo(() => {
    const next = new THREE.MeshPhysicalMaterial({
      color: layer.color,
      vertexColors: true,
      roughness: 0.4,
      metalness: 0.03,
      sheen: 1,
      sheenColor: new THREE.Color("#FF8A98"),
      sheenRoughness: 0.45,
      clearcoat: 0.16,
      clearcoatRoughness: 0.48,
      emissive: new THREE.Color("#C8102E"),
      emissiveIntensity: layer.glow,
      side: THREE.DoubleSide,
    });
    next.userData.base = layer.glow;
    return next;
  }, [layer]);

  useEffect(() => () => material.dispose(), [material]);

  return (
    <group>
      {Array.from({ length: layer.count }, (_, index) => {
        const angle = (index / layer.count) * Math.PI * 2 + layer.spin;
        const sway = (seeded(index + layer.count * 3) - 0.5) * 0.28;
        const stretch = 0.94 + seeded(index + 9) * 0.14;
        return (
          <group key={`${layer.y}-${index}`} rotation={[0, angle, 0]}>
            <mesh
              geometry={geometry}
              material={material}
              position={[0, layer.y, layer.radius]}
              rotation={[layer.tilt, 0, sway]}
              scale={[layer.scale, layer.scale * stretch, layer.scale]}
            />
          </group>
        );
      })}
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.55 + Math.random() * 1.15;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = (Math.random() - 0.35) * 1.25;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.07;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#E8C39E"
        size={0.028}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function RoseModel({
  lite,
  depthRef,
}: {
  lite: boolean;
  depthRef: RefObject<number>;
}) {
  const tiltRef = useRef<THREE.Group>(null);
  const bloomRef = useRef<THREE.Group>(null);
  const layers = lite ? LAYERS.slice(0, 4) : LAYERS;
  const geometry = useMemo(() => getPetalGeometry(lite ? 8 : 12, PALETTE), [lite]);
  const leafGeometry = useMemo(
    () => getPetalGeometry(lite ? 6 : 8, ["#10140f", "#243326", "#4d6248"]),
    [lite],
  );
  const stemGeometry = useMemo(() => getStemGeometry(), []);
  const leafMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: "#d7e4d4",
      vertexColors: true,
      roughness: 0.72,
      side: THREE.DoubleSide,
    });
    material.userData.base = 0;
    return material;
  }, []);
  const stemMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({ color: "#2A1216", roughness: 0.74 });
    material.userData.base = 0;
    return material;
  }, []);

  useEffect(() => () => {
    leafMaterial.dispose();
    stemMaterial.dispose();
  }, [leafMaterial, stemMaterial]);

  useFrame((state, delta) => {
    decayRose(delta);
    const depth = depthRef.current ?? 0;
    const tilt = 1 - depth;
    if (tiltRef.current) {
      tiltRef.current.rotation.x = THREE.MathUtils.damp(tiltRef.current.rotation.x, motion.tiltX * tilt, 2.6, delta);
      tiltRef.current.rotation.z = THREE.MathUtils.damp(tiltRef.current.rotation.z, -motion.tiltY * tilt, 2.6, delta);
    }
    if (bloomRef.current) {
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.85) * 0.018 + motion.roseBoost * 0.05;
      bloomRef.current.scale.setScalar(breathe);
      bloomRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
    tiltRef.current?.traverse((object) => {
      const mesh = object as THREE.Mesh;
      const material = mesh.material;
      if (!material || Array.isArray(material) || !("emissiveIntensity" in material)) return;
      const physical = material as THREE.MeshStandardMaterial;
      const base = typeof physical.userData.base === "number" ? physical.userData.base : 0;
      if (base === 0) return;
      physical.emissiveIntensity = base + motion.roseBoost * 0.7;
    });
  });

  const leaves = [
    { y: -0.82, rot: 0.5, scale: 0.52 },
    { y: -1.55, rot: 2.2, scale: 0.4 },
    { y: -2.25, rot: 4.1, scale: 0.32 },
  ];

  return (
    <group ref={tiltRef}>
      <mesh geometry={stemGeometry} material={stemMaterial} />
      {leaves.map((leaf) => (
        <mesh
          key={leaf.y}
          geometry={leafGeometry}
          material={leafMaterial}
          position={[0.09, leaf.y, 0]}
          rotation={[0.55, leaf.rot, 1.15]}
          scale={leaf.scale}
        />
      ))}
      <group ref={bloomRef}>
        {layers.map((layer) => (
          <PetalLayer key={layer.y} layer={layer} geometry={geometry} />
        ))}
        <pointLight position={[0, 0.2, 0.25]} intensity={1.4} color="#FF3B55" distance={2.4} />
        <Dust count={lite ? 28 : 70} />
      </group>
    </group>
  );
}

function Rig({ depthRef }: { depthRef: RefObject<number> }) {
  useFrame((state) => {
    const depth = depthRef.current ?? 0;
    const y = THREE.MathUtils.lerp(0.42, -2.05, depth);
    const z = THREE.MathUtils.lerp(3.45, 2.25, depth);
    state.camera.position.set(0, y, z);
    state.camera.lookAt(0, y - 0.22, 0);
  });
  return null;
}

function ClearColor() {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
  }, [gl]);
  return null;
}

export default function RoseScene({
  bloom,
  dpr,
  lite,
  asleep,
  depthRef,
  onReady,
}: {
  bloom: boolean;
  dpr: number;
  lite: boolean;
  asleep: boolean;
  depthRef: RefObject<number>;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={asleep ? "never" : "always"}
      performance={{ min: 0.6 }}
      camera={{ position: [0, 0.42, 3.45], fov: 32, near: 0.1, far: 24 }}
      gl={{
        alpha: true,
        antialias: !bloom,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={() => onReady()}
      style={{ touchAction: "pan-y" }}
    >
      <ClearColor />
      <ambientLight intensity={0.22} />
      <directionalLight position={[1.6, 2.2, 2.4]} intensity={2.4} color="#F3ECE6" />
      <directionalLight position={[-1.8, 0.6, -2.2]} intensity={1.5} color="#E8C39E" />
      <RoseModel lite={lite} depthRef={depthRef} />
      <Rig depthRef={depthRef} />
      {bloom ? (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom luminanceThreshold={0.32} mipmapBlur intensity={0.72} luminanceSmoothing={0.18} />
        </EffectComposer>
      ) : null}
    </Canvas>
  );
}

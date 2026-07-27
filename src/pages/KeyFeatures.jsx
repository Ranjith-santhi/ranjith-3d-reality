import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows, Lightformer, useGLTF } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';

// Vibrant plastic colors
const PLASTIC_COLORS = [
  '#FF4D6D', // hot pink
  '#FF6B35', // vivid orange
  '#FFD700', // bright yellow
  '#06D6A0', // mint green
  '#4CC9F0', // sky blue
  '#7B2FBE', // vivid purple
  '#FF4D6D', // pink repeat
  '#06D6A0', // green repeat
  '#FFD700', // yellow repeat
  '#4CC9F0', // blue repeat
  '#FF6B35', // orange repeat
  '#7B2FBE', // purple repeat
  '#FF4D6D',
  '#06D6A0',
  '#FFD700',
  '#4CC9F0',
  '#FF6B35',
];

// Plastic material props — glossy, zero metalness, full clearcoat
const plasticMat = (color) => ({
  color,
  roughness: 0.15,
  metalness: 0.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  envMapIntensity: 1.2,
  reflectivity: 1,
});

// ----------------------------------------------------
// The Grid Platform — white plastic tiles
// ----------------------------------------------------
const GridPlatform = () => {
  const meshRef = useRef();
  const countX = 14;
  const countZ = 40;

  useEffect(() => {
    if (!meshRef.current) return;
    let i = 0;
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();

    for (let z = 0; z < countZ; z++) {
      for (let x = 0; x < countX; x++) {
        const dx = x - countX / 2 + 0.5;
        const dz = z - countZ / 2 + 0.5;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 3.5) {
          tempMatrix.makeTranslation(0, -1000, 0);
        } else {
          tempPosition.set(dx * 1.05, 0, dz * 1.05);
          tempMatrix.makeTranslation(tempPosition.x, tempPosition.y, tempPosition.z);
        }

        meshRef.current.setMatrixAt(i, tempMatrix);
        i++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[null, null, countX * countZ]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.1}
        metalness={0.0}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        envMapIntensity={1.2}
        reflectivity={1}
      />
    </instancedMesh>
  );
};

// ----------------------------------------------------
// Floating Plastic Cubes — vivid colors
// ----------------------------------------------------
const FloatingCubes = () => {
  const groupRef = useRef();
  const cubes = useMemo(() => {
    const items = [];
    const positions = [
      [0, 1.5, 0], [1.1, 1.2, 0], [-1.1, 1.3, 0], [0, 1.1, 1.1], [0, 1.4, -1.1],
      [1.1, 0.8, 1.1], [-1.1, 0.9, -1.1], [1.1, 1.5, -1.1], [-1.1, 0.7, 1.1],
      [2.2, 0.5, 0], [-2.2, 0.6, 0], [0, 0.5, 2.2], [0, 0.8, -2.2],
      [0.5, 2.5, 0.5], [-0.5, 2.2, -0.5], [1.5, 2.0, 0], [-1.5, 1.8, 0],
    ];
    positions.forEach((pos, idx) => {
      items.push({
        position: pos,
        color: PLASTIC_COLORS[idx % PLASTIC_COLORS.length],
        rotation: [Math.random() * 0.4, Math.random() * 0.4, Math.random() * 0.2],
        speed: 0.5 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2,
      });
    });
    return items;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y = cubes[i].position[1] + Math.sin(time * cubes[i].speed + cubes[i].offset) * 0.15;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {cubes.map((cube, i) => (
        <mesh key={i} position={cube.position} rotation={cube.rotation} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial {...plasticMat(cube.color)} />
        </mesh>
      ))}
    </group>
  );
};

// ----------------------------------------------------
// Plastic Arrow — vivid sky-blue
// ----------------------------------------------------
const Arrow = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -2);
    s.lineTo(1.5, 0);
    s.lineTo(0.6, 0);
    s.lineTo(0.6, 3);
    s.lineTo(-0.6, 3);
    s.lineTo(-0.6, 0);
    s.lineTo(-1.5, 0);
    s.lineTo(0, -2);
    return s;
  }, []);

  const extrudeSettings = {
    depth: 0.6,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08,
  };

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} position={[0, 5, 0]} rotation={[-Math.PI / 4, 0, 0]}>
      <mesh castShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial
          color="#4CC9F0"
          roughness={0.1}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
          reflectivity={1}
        />
      </mesh>
    </Float>
  );
};

// ----------------------------------------------------
// White Studio Environment using Lightformers
// ----------------------------------------------------
const WhiteStudioEnv = () => (
  <Environment resolution={512}>
    {/* Top fill — bright white */}
    <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} color="#ffffff" />
    {/* Left wall */}
    <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 10, 1]} color="#f0f8ff" />
    {/* Right wall */}
    <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[5, 1, -1]} scale={[20, 10, 1]} color="#f0f8ff" />
    {/* Back wall */}
    <Lightformer intensity={3} position={[0, 1, -5]} scale={[10, 10, 1]} color="#ffffff" />
    {/* Front bounce */}
    <Lightformer intensity={1.5} rotation-y={Math.PI} position={[0, 2, 5]} scale={[10, 5, 1]} color="#ffffff" />
    {/* Overhead soft dome */}
    <Lightformer intensity={2} rotation-x={-Math.PI / 2} position={[0, 10, 0]} scale={[20, 20, 1]} color="#ffffff" />
  </Environment>
);

// ----------------------------------------------------
// Bottle and Cap Model
// ----------------------------------------------------
const BottleModel = ({ isOpen, toggleOpen }) => {
  const { scene: bottle } = useGLTF('/Bottel/Bottel.glb');
  const { scene: cap } = useGLTF('/Bottel/Bottel cap.glb');
  
  useEffect(() => {
    const applyBlackMaterial = (scene) => {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Clone material to avoid affecting other instances if any
          child.material = child.material.clone();
          // Use a dark charcoal instead of pure black so it catches light
          child.material.color.set('#151515');
          // Make it glossy like premium plastic/glass
          child.material.roughness = 0.05;
          child.material.metalness = 0.3;
          child.material.envMapIntensity = 2; // Boost reflections
        }
      });
    };
    
    if (bottle) applyBlackMaterial(bottle);
    if (cap) applyBlackMaterial(cap);
  }, [bottle, cap]);

  // Spring animation for the cap and core glow
  const { capY, capRot, coreY, glowIntensity } = useSpring({
    capY: isOpen ? 0.08 : 0, // Lift cap higher
    capRot: isOpen ? Math.PI : 0, // Half turn
    coreY: isOpen ? 0.04 : 0, // Lift the glowing core slightly
    glowIntensity: isOpen ? 1 : 0, // Fade glow from 0 to 1
    config: { mass: 1, tension: 170, friction: 26 }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} position={[0, 0.5, 0]}>
      <group onPointerDown={toggleOpen} scale={15}>
        <primitive object={bottle} />
        
        {/* Glowing inner core that fades in when opened */}
        <a.group position-y={coreY}>
          <mesh position={[0, 0.08, 0]}>
            <sphereGeometry args={[0.015, 32, 32]} />
            <a.meshStandardMaterial 
              color="#4CC9F0" 
              emissive="#4CC9F0" 
              emissiveIntensity={glowIntensity.to(i => i * 4)} 
              transparent={true}
              opacity={glowIntensity}
              toneMapped={false}
            />
          </mesh>
          <a.pointLight position={[0, 0.08, 0]} color="#4CC9F0" intensity={glowIntensity.to(i => i * 3)} distance={1} />
        </a.group>

        <a.group position-y={capY} rotation-y={capRot}>
          <primitive object={cap} />
        </a.group>
      </group>
    </Float>
  );
};

// ----------------------------------------------------
// Main Scene
// ----------------------------------------------------
const KeyFeatures = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(prev => !prev);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#e2e6e9', overflow: 'hidden', position: 'relative' }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [15, 12, 15], fov: 35 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        {/* Soft premium gray background */}
        <color attach="background" args={['#e2e6e9']} />

        {/* Studio Lighting Setup */}
        <directionalLight position={[5, 15, 8]} intensity={2} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
        <directionalLight position={[-8, 8, -5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-8, 8, 5]} intensity={1} color="#e8f4ff" />
        <ambientLight intensity={1} color="#ffffff" />

        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />

        <group position={[0, -2, 0]}>
          <BottleModel isOpen={isOpen} toggleOpen={toggleOpen} />
          {/* Subtle contact shadow */}
          <ContactShadows position={[0, 0.01, 0]} scale={25} blur={2.5} far={12} color="#8a949c" opacity={0.7} />
        </group>

        {/* Preset environment for realistic glossy reflections on the black bottle */}
        <Environment preset="studio" />

        <EffectComposer multisampling={8}>
          <SMAA />
          <Bloom luminanceThreshold={0.85} mipmapBlur intensity={0.2} radius={0.3} />
          <Vignette eskil={false} offset={0.2} darkness={0.25} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default KeyFeatures;

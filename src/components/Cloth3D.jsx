import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

extend({ RoundedBoxGeometry });

const DEFAULT_THEME = {
  primary: '#8b5cf6',
  accent: '#ffffff',
  bg: '#ffffff'
};

// Vivid plastic colors for shapes
const SHAPE_COLORS = [
  '#FF4D6D', '#FF6B35', '#FFD700', '#06D6A0',
  '#4CC9F0', '#7B2FBE', '#FF4D6D', '#06D6A0',
];

// Plastic material — zero metalness, full clearcoat, glossy
const PlasticMaterial = ({ color }) => (
  <meshPhysicalMaterial
    color={color}
    roughness={0.12}
    metalness={0.0}
    clearcoat={1.0}
    clearcoatRoughness={0.05}
    envMapIntensity={1.5}
    reflectivity={1}
  />
);

const ShapeGroup = ({ ballRef, theme }) => {
  const shapesRef = useRef();

  const shapes = useMemo(() => {
    const temp = [];
    const count = 60;
    const spacing = 0.8;

    for (let i = 0; i < count; i++) {
      const type = Math.floor(Math.random() * 5);
      temp.push({
        baseX: (i - count / 2) * spacing,
        baseY: 0,
        baseZ: (Math.random() - 0.5) * 2,
        type,
        scale: 0.5 + Math.random() * 0.5,
        rotationSpeed: [
          Math.random() * 0.02,
          Math.random() * 0.02,
          Math.random() * 0.02
        ],
        offset: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (shapesRef.current && ballRef.current) {
      const ballX = ballRef.current.position.x;
      const ballY = ballRef.current.position.y;
      const time = state.clock.getElapsedTime();

      shapesRef.current.children.forEach((child, i) => {
        const s = shapes[i];
        const dist = Math.sqrt(Math.pow(s.baseX - ballX, 2) + Math.pow(s.baseY - ballY, 2));
        const influenceRadius = 8;

        if (dist < influenceRadius) {
          const power = Math.pow(1 - dist / influenceRadius, 2);
          const targetY = (i % 2 === 0 ? 5 : -5) * power;
          const targetZ = Math.sin(time * 2 + s.offset) * 2 * power;

          child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 0.1);
          child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, 0.1);

          const targetScale = s.scale * (1 + power * 1.5);
          child.scale.setScalar(THREE.MathUtils.lerp(child.scale.x, targetScale, 0.1));

          child.rotation.x += s.rotationSpeed[0] * 5;
          child.rotation.y += s.rotationSpeed[1] * 5;
          child.rotation.z += s.rotationSpeed[2] * 5;
        } else {
          child.position.y = THREE.MathUtils.lerp(child.position.y, 0, 0.05);
          child.position.z = THREE.MathUtils.lerp(child.position.z, s.baseZ, 0.05);
          child.scale.setScalar(THREE.MathUtils.lerp(child.scale.x, s.scale, 0.05));
        }
      });
    }
  });

  return (
    <group ref={shapesRef}>
      {shapes.map((s, i) => (
        <mesh key={i} position={[s.baseX, 0, s.baseZ]} scale={s.scale} castShadow receiveShadow>
          {s.type === 0 && <boxGeometry args={[0.9, 0.9, 0.9]} />}
          {s.type === 1 && <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />}
          {s.type === 2 && <sphereGeometry args={[0.55, 32, 32]} />}
          {s.type === 3 && <coneGeometry args={[0.6, 1.2, 4]} />}
          {s.type === 4 && <torusGeometry args={[0.6, 0.2, 16, 32, Math.PI]} />}

          {/* Three premium materials based on index */}
          {i % 3 === 0 && (
            <meshPhysicalMaterial
              color={theme.primary}
              roughness={0.15}
              metalness={0.85}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
              envMapIntensity={2.0}
            />
          )}
          {i % 3 === 1 && (
            <meshPhysicalMaterial
              color="#dfba73"
              roughness={0.2}
              metalness={0.9}
              clearcoat={0.8}
              clearcoatRoughness={0.15}
              envMapIntensity={2.0}
            />
          )}
          {i % 3 === 2 && (
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.4}
              metalness={0.0}
              clearcoat={0.4}
              clearcoatRoughness={0.2}
              envMapIntensity={1.0}
            />
          )}
        </mesh>
      ))}
    </group>
  );
};

const FloorCubes = ({ ballRef, theme }) => {
  const meshRef = useRef();

  const GRID_SIZE_X = 40;
  const GRID_SIZE_Z = 16;
  const SPACING = 0.7;

  const { positions, totalCubes } = useMemo(() => {
    const pos = [];
    for (let x = 0; x < GRID_SIZE_X; x++) {
      for (let z = 0; z < GRID_SIZE_Z; z++) {
        pos.push([
          (x - GRID_SIZE_X / 2) * SPACING,
          -6,
          (z - GRID_SIZE_Z / 2) * SPACING - 2
        ]);
      }
    }
    return { positions: pos, totalCubes: pos.length };
  }, []);

  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || !ballRef.current) return;

    const ballX = ballRef.current.position.x;
    const ballY = ballRef.current.position.y;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < totalCubes; i++) {
      const [bx, by, bz] = positions[i];

      const dx = bx - ballX;
      const dy = by - ballY;
      const dz = bz - 0;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const idleY = by + Math.sin(time * 1.5 + bx * 0.5 + bz * 0.5) * 0.2;

      let targetY = idleY;
      let rotX = 0, rotY = 0, rotZ = 0;

      const influenceRadius = 8;
      if (dist < influenceRadius) {
        const power = Math.pow(1 - dist / influenceRadius, 2);
        targetY = idleY + power * 5;
        rotX = power * Math.PI;
        rotY = power * Math.PI * 0.5;
        rotZ = power * Math.PI * 0.25;
      }

      tempObject.position.set(bx, targetY, bz);
      tempObject.rotation.set(rotX, rotY, rotZ);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, totalCubes]} receiveShadow>
      <roundedBoxGeometry args={[1, 0.1, 1, 4, 0.15]} />
      {/* Primary color plastic tiles */}
      <meshPhysicalMaterial
        color={theme.primary}
        roughness={0.45}
        metalness={0.05}
        clearcoat={0.6}
        clearcoatRoughness={0.15}
        envMapIntensity={1.5}
      />
    </instancedMesh>
  );
};

const InteractiveScene = ({ theme }) => {
  const ballRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    const { mouse } = state;
    if (ballRef.current) {
      const targetX = (mouse.x * viewport.width) / 1.1;
      const targetY = (mouse.y * viewport.height) / 1.1;
      ballRef.current.position.x = THREE.MathUtils.lerp(ballRef.current.position.x, targetX, 0.1);
      ballRef.current.position.y = THREE.MathUtils.lerp(ballRef.current.position.y, targetY, 0.1);
      ballRef.current.position.z = 0;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />

      {/* Bright studio lighting with soft shadows */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[5, 12, 8]} 
        intensity={1.5} 
        color="#ffffff" 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001} 
      />
      <directionalLight position={[-5, 8, 5]} intensity={0.8} color="#e8f4ff" />
      <pointLight position={[0, 0, 15]} intensity={1.5} color="#ffffff" />

      {/* Center interactive ball — vivid accent color */}
      <mesh ref={ballRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={theme.primary}
          roughness={0.45}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
          envMapIntensity={1.5}
        />
        <pointLight intensity={15} distance={12} color={theme.primary} />
      </mesh>

      {/* Floor cubes animation placed below shapes */}
      <FloorCubes ballRef={ballRef} theme={theme} />
      {/* Shapes animation */}
      <ShapeGroup ballRef={ballRef} theme={theme} />

      <Environment preset="studio" />

      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.8} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.2} />
      </EffectComposer>
    </>
  );
};

const BreakingBoundaries = ({ theme = DEFAULT_THEME, onSceneClick }) => {
  return (
    <div
      style={{ width: '100%', height: '100vh', background: 'transparent' }}
      onClick={onSceneClick}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <InteractiveScene theme={theme} />
      </Canvas>
    </div>
  );
};

export default BreakingBoundaries;

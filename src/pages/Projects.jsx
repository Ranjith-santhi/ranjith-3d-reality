import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Low-Poly Crystal Wall Component
const CrystalWall = () => {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(16, 12, 10, 10);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      // Do not displace the outer boundary vertices to keep it neat
      const isEdge = Math.abs(x) > 7.5 || Math.abs(y) > 5.5;
      if (!isEdge) {
        // Create jagged peaks using randomized Z offsets and sine waves
        const zDisplacement = (Math.random() - 0.5) * 2.8 + Math.sin(x * 0.4) * 1.8;
        pos.setZ(i, zDisplacement);
      }
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geom} position={[-4.8, 1.6, -4.8]} castShadow receiveShadow>
      <meshPhysicalMaterial 
        color="#4b1d96" 
        roughness={0.7} 
        metalness={0.2}
        flatShading={true}
        clearcoat={0.1}
      />
    </mesh>
  );
};

// Cube Stack Platform on the right
const CubeStack = () => {
  // Array of coordinates for stacked blocks on the right
  const cubes = useMemo(() => [
    { pos: [2.2, -1.0, -1.5], scale: [0.95, 0.4, 0.95], rot: 0.08 },
    { pos: [2.3, -0.6, -1.5], scale: [0.85, 0.4, 0.85], rot: -0.12 },
    { pos: [2.25, -0.2, -1.5], scale: [0.75, 0.4, 0.75], rot: 0.22 },
    { pos: [2.32, 0.2, -1.5], scale: [0.65, 0.4, 0.65], rot: -0.06 },
    { pos: [2.28, 0.6, -1.5], scale: [0.55, 0.4, 0.55], rot: 0.15 },
    { pos: [2.3, 1.0, -1.5], scale: [0.45, 0.4, 0.45], rot: -0.08 }
  ], []);

  return (
    <group>
      {cubes.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={[0, c.rot, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial 
            color="#5e29b3" 
            roughness={0.65} 
            metalness={0.1} 
            clearcoat={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

// Tripod Glass Orb Component
const GlassOrb = () => {
  return (
    <group position={[-2.4, -0.7, 0.3]}>
      {/* The Glass Sphere with high-quality transmission */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial 
          color="#ffc7ff"
          transmission={0.9}
          opacity={1.0}
          transparent={true}
          roughness={0.05}
          metalness={0.0}
          ior={1.5}
          thickness={0.8}
          clearcoat={1.0}
          envMapIntensity={2.0}
        />
      </mesh>
      
      {/* Tripod Legs */}
      <mesh position={[-0.2, -0.5, 0.1]} rotation={[0, 0, 0.32]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
        <meshPhysicalMaterial color="#300a5c" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, -0.5, -0.18]} rotation={[0.18, 0, -0.28]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
        <meshPhysicalMaterial color="#300a5c" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, -0.5, 0.18]} rotation={[-0.18, 0, -0.28]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
        <meshPhysicalMaterial color="#300a5c" roughness={0.6} />
      </mesh>
    </group>
  );
};

// Main 3D Scene Component
const PurpleArtScene = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.8, 9.5]} fov={38} />
      
      {/* Monochromatic purple/pink studio lighting */}
      <ambientLight intensity={0.4} color="#6020c0" />
      
      {/* Bright Key light from upper right */}
      <directionalLight 
        position={[10, 15, 8]} 
        intensity={2.8} 
        color="#e5b3ff" 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001}
      />
      
      {/* Secondary Fill light from the left */}
      <directionalLight 
        position={[-8, 6, -3]} 
        intensity={0.8} 
        color="#4c118f" 
      />
      
      {/* Soft Glow point light near steps */}
      <pointLight 
        position={[-2, -0.5, 2]} 
        intensity={1.2} 
        color="#c580ff" 
        distance={8} 
      />

      {/* Structural Elements */}
      
      {/* Step 1: Bottom Stair */}
      <mesh position={[0, -2.1, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 0.35, 3.8]} />
        <meshPhysicalMaterial color="#6524c4" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Step 2: Middle Stair */}
      <mesh position={[-0.8, -1.75, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[9.5, 0.35, 3.2]} />
        <meshPhysicalMaterial color="#6524c4" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Step 3: Top Stair */}
      <mesh position={[-1.4, -1.4, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[7.8, 0.35, 2.6]} />
        <meshPhysicalMaterial color="#6524c4" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Circular backdrop disc */}
      <mesh position={[-1.0, 0.6, -2.4]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.15, 64]} />
        <meshPhysicalMaterial color="#541b99" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Right Column / Cylinder platform */}
      <mesh position={[3.5, -1.1, -0.5]} castShadow receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 1.6, 64]} />
        <meshPhysicalMaterial color="#6524c4" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Background low-poly crystal mountains */}
      <CrystalWall />

      {/* Cube Stack on the right */}
      <CubeStack />

      {/* Tripod Glass Orb */}
      <GlassOrb />

      {/* Small Solid Spheres on the steps */}
      <mesh position={[-1.3, -1.05, -0.1]} castShadow receiveShadow>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshPhysicalMaterial color="#551c9d" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[-0.75, -1.15, 0.2]} castShadow receiveShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshPhysicalMaterial color="#551c9d" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Studded faceted sphere on the right column ledge */}
      <mesh position={[1.8, -0.5, -1.0]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.42, 3]} />
        <meshPhysicalMaterial 
          color="#aa7aff" 
          roughness={0.35} 
          metalness={0.1}
          flatShading={true}
        />
      </mesh>

      <Environment preset="studio" />
    </>
  );
};

const Projects = () => {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1,
      background: 'radial-gradient(circle at 50% 50%, #3e1273 0%, #130128 100%)',
      overflow: 'hidden'
    }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMappingExposure: 1.1 }}>
        <PurpleArtScene />
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          maxPolarAngle={Math.PI / 2.05} 
          minPolarAngle={0.1}
        />
      </Canvas>
    </div>
  );
};

export default Projects;

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    PerspectiveCamera, 
    OrbitControls,
    Environment,
    ContactShadows,
    Float
} from '@react-three/drei';
import * as THREE from 'three';

const GRID_SIZE = 35;
const SPACING = 0.45;
const BALL_RADIUS = 2.4;

const CylinderGrid = ({ ballPos }) => {
    const meshRef = useRef();
    
    const { positions, totalCylinders } = useMemo(() => {
        const pos = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                pos.push([
                    (x - GRID_SIZE / 2) * SPACING,
                    0,
                    (z - GRID_SIZE / 2) * SPACING
                ]);
            }
        }
        return { positions: pos, totalCylinders: pos.length };
    }, []);

    const tempObject = new THREE.Object3D();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        
        for (let i = 0; i < totalCylinders; i++) {
            const [x, y, z] = positions[i];
            
            const dx = x - ballPos.current.x;
            const dz = z - ballPos.current.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            // Higher amplitude wave for architectural feel
            let height = 3 + Math.sin(x * 0.25 + z * 0.25 + time * 0.8) * 2;
            
            // Boolean extraction pit
            if (dist < BALL_RADIUS) {
                const depth = Math.pow(1 - dist / BALL_RADIUS, 1.8);
                height = Math.max(0.1, height - (depth * 7));
            }

            tempObject.position.set(x, height / 2 - 4, z);
            tempObject.scale.set(1, height, 1);
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, totalCylinders]} castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.18, 1, 32]} />
            <meshStandardMaterial color="#f48fb1" roughness={0.3} metalness={0.1} />
        </instancedMesh>
    );
};

const DualMaterialBall = ({ position }) => {
    const groupRef = useRef();
    const { viewport } = useThree();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            // Manual movement: Map mouse pointer to scene coordinates
            const x = (state.pointer.x * viewport.width) / 1.5;
            const z = (-state.pointer.y * viewport.height) / 1.5;
            
            // Calculate delta for rotation
            const dx = x - position.current.x;
            const dz = z - position.current.z;

            // Smooth interpolation for position
            position.current.x = THREE.MathUtils.lerp(position.current.x, x, 0.1);
            position.current.z = THREE.MathUtils.lerp(position.current.z, z, 0.1);
            
            groupRef.current.position.set(position.current.x, -1, position.current.z);
            
            // Rotation logic: Apply rotation proportional to movement delta
            // Rotating on X based on Z movement, and Z based on X movement for rolling feel
            groupRef.current.rotation.x += dz * 0.5;
            groupRef.current.rotation.z -= dx * 0.5;
            
            // Add a constant idle rotation for visual interest
            groupRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Top half - Solid White */}
            <mesh>
                <sphereGeometry args={[1.5, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Bottom half - Glass */}
            <mesh rotation={[Math.PI, 0, 0]}>
                <sphereGeometry args={[1.5, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshPhysicalMaterial 
                    color="#ffffff"
                    transmission={1}
                    thickness={0.5}
                    ior={1.45}
                    roughness={0}
                    metalness={0}
                    clearcoat={1}
                    transparent
                />
            </mesh>
        </group>
    );
};

const KineticScene = () => {
    const ballPos = useRef(new THREE.Vector3(0, 0, 0));

    return (
        <div style={{ width: '100%', height: '100vh', background: '#ffebee' }}>
            <Canvas shadows gl={{ antialias: true, stencil: false, depth: true }} dpr={[1, 2]}>
                <color attach="background" args={['#fce4ec']} />
                <PerspectiveCamera makeDefault position={[0, 20, 20]} fov={35} />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
                
                <fog attach="fog" args={['#fce4ec', 40, 80]} />
                
                {/* Foundations Page Lighting Setup */}
                <ambientLight intensity={0.7} />
                <pointLight position={[50, 50, 50]} intensity={2} castShadow />
                <spotLight 
                    position={[-50, 100, 50]} 
                    angle={0.3} 
                    penumbra={1} 
                    intensity={2.5} 
                    castShadow 
                    shadow-mapSize={[1024, 1024]}
                />
                
                <CylinderGrid ballPos={ballPos} />
                <DualMaterialBall position={ballPos} />

                <ContactShadows 
                    position={[0, -4.1, 0]} 
                    opacity={0.3} 
                    scale={50} 
                    blur={2} 
                    far={10} 
                    resolution={512} 
                    color="#f48fb1" 
                />

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.11, 0]} receiveShadow>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#fce4ec" roughness={1} />
                </mesh>

                <Environment preset="studio" />
            </Canvas>
        </div>
    );
};

export default KineticScene;

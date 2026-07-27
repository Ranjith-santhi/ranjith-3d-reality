import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

const SlicedCubeStack = () => {
    const slabCount = 16;
    const slabThickness = 0.25; 
    const relativeOffset = 1.45; 
    const slabGap = slabThickness * relativeOffset;
    const groupRef = useRef();

    // Animation removed as requested
    // useFrame((state) => {
    //     if (groupRef.current) {
    //         groupRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
    //     }
    // });

    return (
        <group ref={groupRef} rotation={[0.4, -0.6, 0.2]}>
            {Array.from({ length: slabCount }).map((_, i) => (
                <mesh
                    key={i}
                    position={[(i - (slabCount - 1) / 2) * slabGap, 0, 0]}
                >
                    <boxGeometry args={[slabThickness, 50, 50]} />
                    <meshPhysicalMaterial
                        color="#0008e7"
                        metalness={1}
                        roughness={0.05}
                        clearcoat={1}
                    />
                </mesh>
            ))}
        </group>
    );
};

const Fish = () => {
    const group = useRef();
    const { scene, animations } = useGLTF('/3d Animation/Blue fishe.glb');
    const { actions } = useAnimations(animations, group);

    React.useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            Object.values(actions).forEach(action => action.play());
        }
    }, [actions]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            // Large sweeping motion
            group.current.position.x = Math.sin(t * 0.4) * 40;
            group.current.position.y = Math.cos(t * 0.3) * 15;
            group.current.position.z = Math.sin(t * 0.2) * 20;
            
            // Rotation based on movement
            group.current.rotation.y = Math.cos(t * 0.4) * 0.5 + Math.PI / 2;
            group.current.rotation.z = Math.sin(t * 0.3) * 0.2;
        }
    });

    return (
        <group ref={group}>
            <primitive 
                object={scene} 
                scale={30} 
                rotation={[0, 0, 0]} 
            />
        </group>
    );
};

const CubeSection = () => {
    return (
        <section style={{ 
            width: '100vw', 
            height: '100vh', 
            background: 'linear-gradient(to bottom, #000000, #001a33)', // Matches Sea Banner start
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <h2 style={{
                color: 'white',
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                marginBottom: '2rem',
                zIndex: 10,
                textAlign: 'center'
            }}>
                Structural Sweep
            </h2>
            
            <div style={{ width: '100%', height: '70%', position: 'relative' }}>
                <Canvas camera={{ position: [0, 0, 150], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[50, 50, 50]} intensity={2} color="#00d4ff" />
                    <pointLight position={[-50, -50, -50]} intensity={2} color="#ff00d4" />
                    <SlicedCubeStack />
                    <Fish />
                    <Environment preset="city" />
                    <OrbitControls enableZoom={false} enablePan={false} makeDefault />
                </Canvas>
            </div>
            
            <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1.2rem',
                maxWidth: '600px',
                textAlign: 'center',
                lineHeight: '1.6',
                padding: '0 2rem',
                zIndex: 10
            }}>
                A refined digital core, representing the structural integrity and precision of automotive design.
            </p>
        </section>
    );
};

export default CubeSection;

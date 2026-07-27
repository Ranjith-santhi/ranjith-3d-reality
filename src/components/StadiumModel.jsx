import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Optimized Physics Chain using Interactive Glass Rings
const PhysicsChain = () => {
    const { mouse, viewport } = useThree();
    const count = 12;
    const linkRefs = useMemo(() => Array(count).fill(0).map(() => React.createRef()), []);

    useFrame((state) => {
        // Convert screen mouse coordinates to 3D world coordinates
        const mousePos = new THREE.Vector3(
            mouse.x * (viewport.width / 2), 
            mouse.y * (viewport.height / 2), 
            0
        );
        
        linkRefs.forEach((ref, i) => {
            if (!ref.current) return;
            
            // Each link follows the one before it, or the mouse if it's the first one
            const target = i === 0 ? mousePos : linkRefs[i-1].current.position.clone();
            
            if (i > 0) {
                target.y -= 2.2; // Vertical offset for chain link logic
            }

            // Smooth interpolation for physics feel
            const currentPos = ref.current.position;
            const strength = 0.15;
            ref.current.position.lerp(target, strength);
            
            // Dynamic rotation based on movement delta
            const tiltX = (target.y - currentPos.y) * 0.15;
            const tiltZ = (currentPos.x - target.x) * 0.15;
            
            ref.current.rotation.x = tiltX;
            ref.current.rotation.z = tiltZ;
            
            // Continuous spin for added visual interest
            const baseRot = state.clock.elapsedTime * 0.4;
            if (i % 2 === 1) {
                ref.current.rotation.y = Math.PI / 2 + baseRot;
            } else {
                ref.current.rotation.y = baseRot;
            }
        });
    });

    return (
        <group>
            {linkRefs.map((ref, i) => (
                <mesh key={i} ref={ref} castShadow receiveShadow>
                    <torusGeometry args={[1.6, 0.45, 32, 64]} />
                    <MeshTransmissionMaterial
                        backside
                        thickness={0.6}
                        roughness={0.02}
                        transmission={1}
                        ior={1.5}
                        chromaticAberration={0.08}
                        anisotropy={0.2}
                        clearcoat={1}
                        clearcoatRoughness={0.01}
                        color="#ffffff"
                    />
                </mesh>
            ))}
        </group>
    );
};

const StadiumHeroModel = () => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={35} />
                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={1} />
                <directionalLight position={[0, 5, 5]} intensity={0.5} />
                
                <PhysicsChain />
                
                <ContactShadows position={[0, -8, 0]} opacity={0.4} scale={30} blur={2.5} far={15} />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default StadiumHeroModel;



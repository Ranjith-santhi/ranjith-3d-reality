import React, { Suspense, useRef, useMemo, useState } from 'react';
import { useGLTF, Environment, ContactShadows, OrbitControls, Stars, Float } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, DepthOfField, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const SingleObject = ({ i, radius, angle, scene, gridPos, hoveredIndex, setHoveredIndex, isInteractive }) => {
    const meshRef = useRef();
    
    useFrame((state, delta) => {
        if (meshRef.current) {
            let offset = 0;
            let colorMix = 0;
            
            // Hover/Ripple Interaction logic
            if (hoveredIndex !== null) {
                const dist = isInteractive 
                    ? Math.min(Math.abs(i - hoveredIndex), 24 - Math.abs(i - hoveredIndex))
                    : Math.abs(i - hoveredIndex); // Linear ripple for grid mode
                
                if (dist === 0) { offset = 1.5; colorMix = 1.0; }
                else if (dist === 1) { offset = 0.8; colorMix = 0.8; }
                else if (dist === 2) { offset = 0.4; colorMix = 0.4; }
            }
            
            // Define targeted transform values
            const targetPos = isInteractive 
                ? [Math.cos(angle) * radius, Math.sin(angle) * radius, -i * 0.05] 
                : [gridPos.x * 12.0 - 5.0, gridPos.y * 10.0 - 10.0, 0]; // Precise Offset
            
            const targetRot = isInteractive 
                ? [0.2, 0, angle + Math.PI / 4] 
                : [0, 0, 0];
            
            const targetScale = isInteractive 
                ? (15.0 + offset)
                : (40.0 + Math.sin(state.clock.elapsedTime * 2 + gridPos.x * 0.8 + gridPos.y * 0.8) * 12.0);

            // Smooth Interpolation
            meshRef.current.position.set(
                THREE.MathUtils.lerp(meshRef.current.position.x, targetPos[0], 0.1),
                THREE.MathUtils.lerp(meshRef.current.position.y, targetPos[1], 0.1),
                THREE.MathUtils.lerp(meshRef.current.position.z, targetPos[2], 0.1)
            );
            
            meshRef.current.rotation.set(
                THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRot[0], 0.1),
                THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRot[1], 0.1),
                THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRot[2], 0.1)
            );
            
            meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));

            // Handle Color and Material (Ripple only when interactive)
            scene.traverse((child) => {
                if (child.isMesh && child.material) {
                    const mat = child.material;
                    const baseColor = new THREE.Color('#050505');
                    const popColor = new THREE.Color('#ffffff');
                    const targetC = new THREE.Color().lerpColors(baseColor, popColor, colorMix);
                    
                    const mTarget = 1.0; 
                    const rTarget = 0.05 - (0.04 * colorMix);
                    
                    mat.color.lerp(targetC, 0.1);
                    mat.metalness = THREE.MathUtils.lerp(mat.metalness, mTarget, 0.1);
                    mat.roughness = THREE.MathUtils.lerp(mat.roughness, rTarget, 0.1);
                    mat.clearcoat = 0.5 + (0.5 * colorMix);
                    mat.clearcoatRoughness = 0.05 - (0.04 * colorMix);
                }
            });
        }
    });

    return (
        <group 
            onPointerOver={(e) => { e.stopPropagation(); isInteractive && setHoveredIndex(i); }}
            onPointerOut={() => setHoveredIndex(null)}
        >
            <primitive 
                ref={meshRef}
                object={scene} 
                scale={10.0} 
            />
        </group>
    );
};

const CustomStarField = () => {
    const pointsRef = useRef();
    const [points] = useState(() => {
        const p = new Float32Array(3000);
        for (let i = 0; i < 3000; i += 3) {
            p[i] = (Math.random() - 0.5) * 150;     // X
            p[i+1] = (Math.random() - 0.5) * 150;   // Y
            p[i+2] = -Math.random() * 100 - 40;     // Z: Force points behind the interaction zone (-40 to -140)
        }
        return p;
    });

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.0002;
            pointsRef.current.rotation.x += 0.0001;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length / 3}
                    array={points}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#7777ff"
                transparent
                opacity={0.4}
                sizeAttenuation
                depthWrite={false} // Prevent stars from clipping each other if they are just background
            />
        </points>
    );
};

const Model = ({ isInteractive }) => {
    const { scene } = useGLTF('/Animation/Single Animation Shape.glb');
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const groupRef = useRef();
    
    const objects = useMemo(() => {
        return Array.from({ length: 24 }, (_, i) => {
            const radius = 2.4; 
            const angle = (i / 24) * Math.PI * 2;
            const clonedScene = scene.clone();
            
            const col = i % 6;
            const row = Math.floor(i / 6);
            const gridPos = {
                x: (col - 2.5),
                y: (row - 1.5) 
            };
            
            clonedScene.traverse((child) => {
                if (child.isMesh) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 128;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, 128, 128);
                    ctx.fillStyle = '#d0d0d0';
                    for (let j = 0; j < 60; j++) {
                        ctx.beginPath();
                        ctx.arc(Math.random() * 128, Math.random() * 128, 0.8, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    const texture = new THREE.CanvasTexture(canvas);
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(6, 6);

                    child.material = new THREE.MeshPhysicalMaterial({
                        color: '#050505',
                        roughness: 0.1,
                        metalness: 1.0,
                        map: texture,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.05
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            return {
                id: i,
                radius,
                angle,
                gridPos,
                scene: clonedScene
            };
        });
    }, [scene]);

    useFrame((state, delta) => {
        if (groupRef.current && isInteractive) {
            groupRef.current.rotation.z += delta * 0.1;
        } else if (groupRef.current) {
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.05);
        }
    });

    return (
        <group ref={groupRef} scale={0.2} rotation={[0, 0, 0]}>
            {objects.map((obj) => (
                <SingleObject 
                    key={obj.id} 
                    i={obj.id} 
                    radius={obj.radius} 
                    angle={obj.angle} 
                    gridPos={obj.gridPos}
                    scene={obj.scene} 
                    hoveredIndex={hoveredIndex}
                    setHoveredIndex={setHoveredIndex}
                    isInteractive={isInteractive}
                />
            ))}
        </group>
    );
};

const FadeFloor = ({ isInteractive }) => {
    const shadowRef = useRef();
    
    useFrame((state, delta) => {
        if (shadowRef.current) {
            const targetOpacity = isInteractive ? 0.6 : 0;
            shadowRef.current.opacity = THREE.MathUtils.lerp(shadowRef.current.opacity, targetOpacity, 0.05);
        }
    });

    return (
        <ContactShadows 
            ref={shadowRef}
            resolution={1024} 
            scale={25} 
            blur={2.0} 
            opacity={0} 
            far={10} 
            color="#000000" 
            position={[0, -3.5, 0]} 
        />
    );
};

const PostProcessing = ({ isInteractive }) => {
    const focusRef = useRef(new THREE.Vector3(0, 0, 0));
    
    useFrame((state) => {
        // Project mouse position to focus target
        const targetX = state.mouse.x * 5;
        const targetY = state.mouse.y * 5;
        
        focusRef.current.x = THREE.MathUtils.lerp(focusRef.current.x, targetX, 0.1);
        focusRef.current.y = THREE.MathUtils.lerp(focusRef.current.y, targetY, 0.1);
        focusRef.current.z = 0;
    });

    return (
        <EffectComposer multisampling={0} disableNormalPass>
            <DepthOfField 
                target={focusRef.current} 
                focalLength={2.0} 
                bokehScale={8} 
                height={700} 
            />
            <Bloom 
                luminanceThreshold={0.85} 
                luminanceSmoothing={0.9} 
                height={300} 
                intensity={0.7} 
            />
            <Vignette eskil={false} offset={0.1} darkness={0.4} />
        </EffectComposer>
    );
};

const AnimationShape = () => {
    const [isInteractive, setIsInteractive] = useState(true);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
                width: '100%', 
                height: '100%', 
                background: 'radial-gradient(circle at 50% 50%, #0c0c18 0%, #000000 100%)' 
            }}>
                <Canvas camera={{ position: [0, 0, 11], fov: 45 }} shadows gl={{ alpha: true }}>
                    <color attach="background" args={['#000000']} />
                    <ambientLight intensity={0.5} />
                    
                    {/* Soft AirPods-style Lighting */}
                    <rectAreaLight width={30} height={10} intensity={5} position={[0, 15, 5]} rotation={[-Math.PI / 2.5, 0, 0]} color="#ffffff" />
                    <rectAreaLight width={20} height={20} intensity={2} position={[-20, 10, 10]} rotation={[0, Math.PI / 4, 0]} color="#ffffff" />
                    <pointLight position={[-15, 5, 10]} intensity={15} color="#ffffff" />
                    <pointLight position={[15, 5, 10]} intensity={10} color="#ffffff" />
                    
                    <Suspense fallback={null}>
                        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        <CustomStarField />
                        <Model isInteractive={isInteractive} />
                        <Environment preset="studio" />
                        <FadeFloor isInteractive={isInteractive} />
                        <PostProcessing isInteractive={isInteractive} />
                    </Suspense>
                    
                    <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} />
                </Canvas>
            </div>

            <button
                onClick={() => setIsInteractive(!isInteractive)}
                style={{
                    position: 'absolute',
                    bottom: '60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isInteractive ? 'rgba(0, 8, 231, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    padding: '15px 40px',
                    borderRadius: '50px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                    zIndex: 100,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateX(-50%) scale(1.05)';
                    e.target.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateX(-50%) scale(1)';
                    e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                }}
            >
                {isInteractive ? 'TRANSFORM TO GRID' : 'ACTIVATE TRANSMIT MODEL'}
            </button>
        </div>
    );
};

export default AnimationShape;

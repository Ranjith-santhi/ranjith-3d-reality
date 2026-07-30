import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const InteractivePlus = ({ position, rotation, scale, delay, rotSpeed, mouseTarget, allRefs, index, colorStep }) => {
    const { scene } = useGLTF('/Animation/Plus_Shape.glb');
    const groupRef = useRef();

    // Physics states
    const currentPos = useMemo(() => new THREE.Vector3(...position), [position]);
    const velocity = useMemo(() => new THREE.Vector3(), []);

    const clonedScene = useMemo(() => {
        const clone = scene.clone();
        return clone;
    }, [scene]);

    useMemo(() => {
        const isGroupA = index % 2 === 0;
        let currentColor = '#ffffff';
        if (colorStep === 0) currentColor = isGroupA ? '#d10000' : '#ffffff';
        if (colorStep === 1) currentColor = isGroupA ? '#ffffff' : '#14c814';
        if (colorStep === 2) currentColor = isGroupA ? '#0d4eaf' : '#ffffff';
        if (colorStep === 3) currentColor = isGroupA ? '#ffffff' : '#0d4eaf';

        clonedScene.traverse((node) => {
            if (node.isMesh) {
                node.material = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(currentColor),
                    roughness: 0.45,       // Matte base
                    metalness: 0.05,       // Plastic, not metallic
                    clearcoat: 0.6,        // Sharp reflections on top
                    clearcoatRoughness: 0.15, // Smooth reflections
                });
            }
        });
    }, [clonedScene, colorStep, index]);

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime() + delay;
        if (!groupRef.current) return;

        // Register this ref for other objects to see
        allRefs.current[index] = groupRef.current;

        // 1. STRONG CENTRAL ATTRACTION (Always on to bring them back)
        const center = new THREE.Vector3(0, 0, 0);
        const homeForce = new THREE.Vector3().subVectors(center, currentPos).multiplyScalar(0.004);
        velocity.add(homeForce);

        // 2. MOUSE COLLISION REPULSION (Acts as a physical collider)
        const distToMouse = currentPos.distanceTo(mouseTarget.current);
        const collisionRadius = 20;
        if (distToMouse < collisionRadius) {
            const overlap = collisionRadius - distToMouse;
            const mouseRepulse = new THREE.Vector3().subVectors(currentPos, mouseTarget.current);
            // Add Z variance so they burst dynamically into 3D volume
            mouseRepulse.z += (Math.random() - 0.5) * 20;
            // Extreme throw based on how deep the mouse intersected
            mouseRepulse.normalize().multiplyScalar(overlap * 0.3);
            velocity.add(mouseRepulse);
        }

        // 3. Simple Repulsion (Collision Feel)
        allRefs.current.forEach((other, i) => {
            if (i === index || !other) return;
            const dist = currentPos.distanceTo(other.position);
            const minDistance = 8;
            if (dist < minDistance && dist > 0.1) {
                const overlap = minDistance - dist;
                const repulseStrength = overlap * 0.008; // Proportional to how squished they are
                const repulse = new THREE.Vector3().subVectors(currentPos, other.position).normalize().multiplyScalar(repulseStrength);
                velocity.add(repulse);
            }
        });

        // Apply friction (optimized damping for a normal, smooth return speed)
        velocity.multiplyScalar(0.90);
        currentPos.add(velocity);

        groupRef.current.position.copy(currentPos);

        // Chaotic tumbling: Objects spin wildly when moving fast, matching their innate direction
        const speed = Math.min(velocity.length(), 20); // Cap extreme speeds
        const tumbleX = Math.sign(rotSpeed.x) * speed * 0.03;
        const tumbleY = Math.sign(rotSpeed.y) * speed * 0.03;
        const tumbleZ = Math.sign(rotSpeed.z) * speed * 0.03;

        groupRef.current.rotation.x += rotSpeed.x + tumbleX;
        groupRef.current.rotation.y += rotSpeed.y + tumbleY;
        groupRef.current.rotation.z += rotSpeed.z + tumbleZ;
    });

    return (
        <primitive
            object={clonedScene}
            scale={scale}
            rotation={rotation}
            ref={groupRef}
        />
    );
};

const MagneticField = ({ items, mouseTarget, allRefs, colorStep }) => {
    useFrame((state) => {
        // Map mouse from 2D screen into 3D world space
        // We divide by a factor to match the orthographic/perspective space of the cluster
        mouseTarget.current.set(
            (state.pointer.x * state.viewport.width) / 2,
            (state.pointer.y * state.viewport.height) / 2,
            0
        );
    });

    return (
        <group>
            {items.map((item, i) => (
                <InteractivePlus
                    key={item.id}
                    {...item}
                    index={i}
                    mouseTarget={mouseTarget}
                    allRefs={allRefs}
                    colorStep={colorStep}
                />
            ))}
        </group>
    );
};

const PlusBanner = () => {
    const mouseTarget = useRef(new THREE.Vector3(0, 0, 0));
    const allRefs = useRef([]);
    const [colorStep, setColorStep] = useState(0);

    const handlePointerDown = () => {
        // Cycle colors on click
        setColorStep((prev) => (prev + 1) % 4);
    };

    // Set the total amount of Plus shapes here!
    const TOTAL_SHAPES = 80;

    const items = useMemo(() => {
        return Array.from({ length: TOTAL_SHAPES }).map((_, i) => ({
            id: i,
            position: [
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            ],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            rotSpeed: {
                x: (Math.random() - 0.5) * 0.015,
                y: (Math.random() - 0.5) * 0.015,
                z: (Math.random() - 0.5) * 0.015
            },
            scale: 1.5 + Math.random() * 2,
            delay: Math.random() * 10
        }));
    }, []);

    return (
        <section style={{ width: '100vw', height: '100vh', background: '#ffffff', position: 'relative' }}>
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '8%',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <h1 style={{
                    fontSize: 'clamp(4rem, 12vw, 10rem)',
                    fontWeight: 900,
                    color: '#000',
                    margin: 0,
                    letterSpacing: '-0.04em'
                }}>
                    PLUS<br />FIELD
                </h1>
                <p style={{
                    fontSize: '1rem',
                    color: '#444',
                    letterSpacing: '0.5em',
                    textTransform: 'uppercase',
                    marginTop: '1rem'
                }}>
                    Magnetic Interaction System
                </p>
            </div>

            <Canvas
                camera={{ position: [0, 0, 60], fov: 45 }}
                onPointerDown={handlePointerDown}
                style={{ cursor: 'default' }}
            >
                <ambientLight intensity={0.7} />
                <pointLight position={[50, 50, 50]} intensity={2} />
                <spotLight position={[-50, 100, 50]} angle={0.3} penumbra={1} intensity={2.5} />

                <Suspense fallback={null}>
                    <Environment preset="studio" />
                    <MagneticField
                        items={items}
                        mouseTarget={mouseTarget}
                        allRefs={allRefs}
                        colorStep={colorStep}
                    />
                </Suspense>
            </Canvas>

            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '8%',
                zIndex: 10,
                textAlign: 'right',
                pointerEvents: 'none'
            }}>
                <p style={{ color: '#000', fontSize: '0.8rem', opacity: 0.5 }}>
                    MOVE MOUSE TO ATTRACT PLUS SHAPES<br />
                    CLICK ANYWHERE TO CHANGE COLOR THEME
                </p>
            </div>
        </section>
    );
};

export default PlusBanner;

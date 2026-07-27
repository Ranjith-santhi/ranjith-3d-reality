import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Bubbles({ isSlowMode }) {
    const count = 150;
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Create random initial positions and velocities for bubbles
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 30; // wide spread across x
            const y = (Math.random() - 0.5) * 20; // spread across y
            const z = (Math.random() - 0.5) * 20 - 5; // spread mostly behind or around
            const size = Math.random() * 0.15 + 0.02; // tiny bubbles
            const speed = Math.random() * 2 + 1.5; // base upward speed
            const wobbleSpeed = Math.random() * 2 + 1; // individual wobble frequency
            const wobbleWidth = Math.random() * 0.5 + 0.2; // how far it sways horizontally

            temp.push({ x, y, z, size, speed, wobbleSpeed, wobbleWidth, initialX: x });
        }
        return temp;
    }, [count]);

    // Use a spring-like or lerping speed factor so it transitions smoothly instead of an instant snap
    const currentSpeedRef = useRef(1);

    useFrame((state, delta) => {
        if (!mesh.current) return;

        // Smoothly transition the speed multiplier
        // If clicked (isSlowMode), slow down to 1/3 (0.33)
        // If released, go back to 1.0 (normal)
        const targetSpeed = isSlowMode ? 0.33 : 1;
        currentSpeedRef.current = THREE.MathUtils.lerp(currentSpeedRef.current, targetSpeed, 0.1);

        particles.forEach((particle, i) => {
            // Move up
            particle.y += particle.speed * delta * currentSpeedRef.current * 1.5;

            // Wobble
            particle.x = particle.initialX + Math.sin(state.clock.elapsedTime * particle.wobbleSpeed * currentSpeedRef.current) * particle.wobbleWidth;

            // Reset if it goes too high gracefully
            if (particle.y > 15) {
                particle.y = -15;
                particle.initialX = (Math.random() - 0.5) * 30;
                particle.x = particle.initialX;
                particle.z = (Math.random() - 0.5) * 20 - 5;
            }

            dummy.position.set(particle.x, particle.y, particle.z);
            dummy.scale.setScalar(particle.size);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.15}
                roughness={0}
                metalness={1}
                envMapIntensity={2}
            />
        </instancedMesh>
    );
}
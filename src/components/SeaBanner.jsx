import { Environment, useGLTF, useAnimations } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import * as THREE from 'three';

const AnemoneMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uFreq: { value: 0.8 },
        uAmp: { value: 0.6 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uFish: { value: new THREE.Vector3(0, 0, 0) },
        uColorA: { value: new THREE.Color('#8000ff') }, 
        uColorB: { value: new THREE.Color('#ff2db1') }, 
        uOpacity: { value: 0.8 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying float vY;
        uniform float uTime;
        uniform float uFreq;
        uniform float uAmp;
        uniform vec3 uMouse;
        uniform vec3 uFish;
        
        void main() {
            vUv = uv;
            vY = position.y;
            
            vec3 pos = position;
            vec4 worldPos = modelMatrix * vec4(pos, 1.0);
            
            float waveStrength = (pos.y + 2.0) / 4.0; 
            
            // Idle Sway
            float wave = sin(uTime * uFreq + pos.y * 0.9) * uAmp * waveStrength;
            float waveZ = cos(uTime * (uFreq * 0.8) + pos.y * 0.7) * (uAmp * 0.6) * waveStrength;
            
            // Mouse Interaction
            float distMouse = distance(worldPos.xz, uMouse.xz);
            float mouseStrength = smoothstep(10.0, 0.0, distMouse) * 1.2 * waveStrength;
            vec2 dirMouse = normalize(worldPos.xz - uMouse.xz);
            
            // Fish Interaction
            float distFish = distance(worldPos.xz, uFish.xz);
            float fishStrength = smoothstep(8.0, 0.0, distFish) * 2.5 * waveStrength;
            vec2 dirFish = normalize(worldPos.xz - uFish.xz);
            
            pos.x += wave + dirMouse.x * mouseStrength + dirFish.x * fishStrength;
            pos.z += waveZ + dirMouse.y * mouseStrength + dirFish.y * fishStrength;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        varying float vY;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uOpacity;
        
        void main() {
            float mixFactor = (vY + 2.0) / 4.0;
            vec3 finalColor = mix(uColorA, uColorB, mixFactor);
            float alpha = uOpacity * (0.6 + mixFactor * 0.4);
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

const BubbleMaterialProps = {
    uniforms: {
        uColor: { value: new THREE.Color('#ffffff') },
        uRimColor: { value: new THREE.Color('#dddddd') },
        uOpacity: { value: 0.2 }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        
        void main() {
            vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
            vNormal = normalize(mat3(instanceMatrix) * normal);
            vViewDir = normalize(cameraPosition - worldPosition.xyz);
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        uniform vec3 uColor;
        uniform vec3 uRimColor;
        uniform float uOpacity;
        
        void main() {
            float fresnel = pow(1.0 - max(dot(vViewDir, vNormal), 0.0), 3.0);
            vec3 finalColor = mix(uColor, uRimColor, fresnel);
            float alpha = uOpacity + fresnel * 0.5;
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
};

const AnemoneStalk = ({ position, delay, freq, amp, colorA, colorB, mouseRef, fishPosRef, height = 4 }) => {
    const meshRef = useRef();
    const tipRef = useRef();
    const halfH = height / 2;

    const material = useMemo(() => {
        const mat = new THREE.ShaderMaterial({
            ...AnemoneMaterial,
            uniforms: THREE.UniformsUtils.clone(AnemoneMaterial.uniforms),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        mat.uniforms.uFreq.value = freq;
        mat.uniforms.uAmp.value = amp;
        mat.uniforms.uColorA.value = new THREE.Color(colorA);
        mat.uniforms.uColorB.value = new THREE.Color(colorB);
        return mat;
    }, [freq, amp, colorA, colorB]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime() + delay;
        if (material) {
            material.uniforms.uTime.value = time;
            material.uniforms.uMouse.value.copy(mouseRef.current);
            if (fishPosRef?.current) {
                material.uniforms.uFish.value.copy(fishPosRef.current);
            }
        }
        
        if (tipRef.current) {
            const worldX = position[0];
            const worldZ = position[2];
            
            // Mouse Interaction on Tip
            const distM = Math.sqrt(Math.pow(worldX - mouseRef.current.x, 2) + Math.pow(worldZ - mouseRef.current.z, 2));
            const mouseStrength = Math.max(0, (10 - distM) / 10) * 1.2;
            const dxM = worldX - mouseRef.current.x;
            const dzM = worldZ - mouseRef.current.z;
            const magM = Math.sqrt(dxM*dxM + dzM*dzM) || 1;

            // Fish Interaction on Tip
            let fishStrength = 0;
            let pushX = (dxM/magM) * mouseStrength;
            let pushZ = (dzM/magM) * mouseStrength;

            if (fishPosRef?.current) {
                const distF = Math.sqrt(Math.pow(worldX - fishPosRef.current.x, 2) + Math.pow(worldZ - fishPosRef.current.z, 2));
                fishStrength = Math.max(0, (8 - distF) / 8) * 2.5;
                const dxF = worldX - fishPosRef.current.x;
                const dzF = worldZ - fishPosRef.current.z;
                const magF = Math.sqrt(dxF*dxF + dzF*dzF) || 1;
                pushX += (dxF/magF) * fishStrength;
                pushZ += (dzF/magF) * fishStrength;
            }
            
            const wave = Math.sin(time * freq + halfH * 0.9) * amp + pushX;
            const waveZ = Math.cos(time * (freq * 0.8) + halfH * 0.7) * (amp * 0.6) + pushZ;
            tipRef.current.position.set(wave, halfH, waveZ);
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef} material={material}>
                <cylinderGeometry args={[0.08, 0.12, height, 8, 24]} />
            </mesh>
            <mesh ref={tipRef} position={[0, halfH, 0]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color="#ffcceb" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, -halfH, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshBasicMaterial color={colorA} transparent opacity={0.4} />
            </mesh>
        </group>
    );
};

const InstancedBubbles = () => {
    const count = 500;
    const meshRef = useRef();
    const tempObject = useMemo(() => new THREE.Object3D(), []);
    
    const material = useMemo(() => new THREE.ShaderMaterial({
        ...BubbleMaterialProps,
        transparent: true,
        depthWrite: false,
    }), []);

    const bubbles = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            x: (Math.random() - 0.5) * 85,
            y: (Math.random() - 0.5) * 60,
            z: (Math.random() - 0.5) * 40,
            speed: 1.5 + Math.random() * 4,
            sway: 0.5 + Math.random() * 2,
            size: 0.05 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2
        }));
    }, []);

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime();
        bubbles.forEach((b, i) => {
            b.y += b.speed * delta;
            if (b.y > 35) b.y = -35;
            
            const swayX = Math.sin(t * b.sway + b.phase) * 0.3;
            const swayZ = Math.cos(t * b.sway * 0.8 + b.phase) * 0.3;
            
            tempObject.position.set(b.x + swayX, b.y, b.z + swayZ);
            tempObject.scale.setScalar(b.size);
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]} material={material}>
            <sphereGeometry args={[1, 12, 12]} />
        </instancedMesh>
    );
};

const SeaFloor = () => {
    return (
        <mesh position={[0, -11, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[150, 100, 32, 32]} />
            <meshStandardMaterial 
                color="#01040a" 
                roughness={1} 
                metalness={0.1}
                flatShading={true}
            />
        </mesh>
    );
};

const SeaAnemoneField = ({ mouseRef, fishPosRef }) => {
    const stalks = useMemo(() => {
        const count = 950; 
        return Array.from({ length: count }).map((_, i) => {
            const h = 3 + Math.random() * 5; 
            return {
                id: i,
                height: h,
                position: [
                    (Math.random() - 0.5) * 70, 
                    -11 + Math.random() * 2, 
                    (Math.random() - 0.5) * 40
                ],
                delay: Math.random() * 30,
                freq: 0.3 + Math.random() * 0.5,
                amp: 0.15 + Math.random() * 0.4,
                colorA: i % 3 === 0 ? '#8000ff' : i % 3 === 1 ? '#5a00ff' : '#4e00ff',
                colorB: i % 2 === 0 ? '#ff2db1' : '#ff66cc'
            };
        });
    }, []);

    return (
        <group>
            {stalks.map(s => (
                <AnemoneStalk key={s.id} {...s} mouseRef={mouseRef} fishPosRef={fishPosRef} />
            ))}
            <SeaFloor />
        </group>
    );
};

const LightRays = () => {
    return (
        <group position={[0, 25, -25]} rotation={[0.4, 0, 0]}>
            {Array.from({ length: 15 }).map((_, i) => (
                <mesh key={i} position={[i * 10 - 75, 0, 0]} rotation={[0, 0, (i - 7) * 0.04]}>
                    <planeGeometry args={[8, 120]} />
                    <meshBasicMaterial 
                        color="#4ed9ff" 
                        transparent 
                        opacity={0.03} 
                        blending={THREE.AdditiveBlending} 
                        side={THREE.DoubleSide} 
                    />
                </mesh>
            ))}
        </group>
    );
};

const ClownFish = ({ fishPosRef, mouseRef }) => {
    const group = useRef();
    const { scene, animations } = useGLTF('/3d Animation/clown_fish.glb');
    const { actions } = useAnimations(animations, group);
    const targetPos = useMemo(() => new THREE.Vector3(), []);
    const lastPos = useMemo(() => new THREE.Vector3(), []);

    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            Object.values(actions).forEach(action => action.play());
        }
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.roughness = 0.5;
                child.material.metalness = 0.5;
                child.material.envMapIntensity = 1.0;
                child.material.needsUpdate = true;
            }
        });
    }, [actions, scene]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            // Idle bobbing
            const idleX = Math.sin(t * 0.3) * 2;
            const idleY = Math.cos(t * 1.2) * 0.3;
            const idleZ = Math.sin(t * 0.5) * 1.5;

            // Follow mouse with clamped range
            const targetX = THREE.MathUtils.clamp(mouseRef.current.x + idleX, -35, 35);
            const targetY = THREE.MathUtils.clamp(mouseRef.current.y + idleY + 2.5, -9.5, -5); 
            const targetZ = THREE.MathUtils.clamp(mouseRef.current.z + idleZ, -20, 35);
            
            targetPos.set(targetX, targetY, targetZ);
            
            // Smoothly move towards target
            group.current.position.lerp(targetPos, 0.03);

            // Rotate towards movement direction
            const direction = new THREE.Vector3().subVectors(group.current.position, lastPos);
            if (direction.length() > 0.01) {
                const targetRotation = new THREE.Quaternion().setFromUnitVectors(
                    new THREE.Vector3(0, 0, 1), 
                    direction.normalize()
                );
                group.current.quaternion.slerp(targetRotation, 0.1);
            }
            lastPos.copy(group.current.position);

            if (fishPosRef?.current) {
                fishPosRef.current.copy(group.current.position);
            }
        }
    });

    return (
        <group ref={group}>
            <primitive 
                object={scene} 
                scale={0.1} 
                rotation={[0, 0, 0]} 
            />
        </group>
    );
};


const AnimatedSpotlight = () => {
    const lightRef = useRef();
    const targetRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (targetRef.current) {
            // Sweep the target in a large circle across the forest
            targetRef.current.position.x = Math.sin(t * 0.4) * 30;
            targetRef.current.position.z = Math.cos(t * 0.3) * 15;
        }
    });

    return (
        <group>
            <spotLight
                ref={lightRef}
                position={[0, 60, 0]}
                intensity={400}
                angle={0.4}
                penumbra={0.8}
                color="#ffffff"
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            {/* Invisible target for the spotlight to follow */}
            <mesh ref={targetRef} position={[0, -10, 0]} visible={false}>
                <sphereGeometry args={[1]} />
            </mesh>
            {/* Direct the light at the target */}
            {lightRef.current && (lightRef.current.target = targetRef.current)}
        </group>
    );
};

const MouseTracker = ({ smoothMouseRef }) => {
    const { raycaster, mouse, camera, scene } = useThree();
    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 10), []);
    const intersection = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, intersection);
        if (intersection) {
            smoothMouseRef.current.lerp(intersection, 0.1);
        }
    });

    return null;
};

const SeaBanner = () => {
    const smoothMouseRef = useRef(new THREE.Vector3(0, -10, 0));
    const fishPosRef = useRef(new THREE.Vector3(0, -10, 0));

    return (
        <section 
            style={{ 
                width: '100vw', 
                height: '100vh', 
                background: 'linear-gradient(to bottom, #001a33, #00040a)', // Deep Abyss Gradient
                position: 'relative', 
                overflow: 'hidden' 
            }}
        >
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '40%',
                background: 'linear-gradient(to bottom, rgba(78, 217, 255, 0.15), transparent)', // Sky blue surface glow
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            <Canvas camera={{ position: [0, -2, 42], fov: 45 }} gl={{ alpha: true }}>
                <ambientLight intensity={1.2} />
                <directionalLight 
                    position={[10, 50, 10]} 
                    intensity={2.5} 
                    color="#ffffff" 
                    castShadow 
                    shadow-mapSize={[2048, 2048]}
                />
                <pointLight position={[0, 25, 20]} intensity={20} color="#00ffff" />
                
                <Suspense fallback={null}>
                    <LightRays />
                    <AnimatedSpotlight />
                    <InstancedBubbles />
                    <ClownFish fishPosRef={fishPosRef} mouseRef={smoothMouseRef} />
                    <MouseTracker smoothMouseRef={smoothMouseRef} />
                    <SeaAnemoneField mouseRef={smoothMouseRef} fishPosRef={fishPosRef} />
                    <Environment preset="night" />
                </Suspense>

                <fog attach="fog" args={['#00040a', 15, 95]} />
            </Canvas>

            <div style={{
                position: 'absolute',
                bottom: '10%',
                width: '100%',
                zIndex: 10,
                textAlign: 'center',
                pointerEvents: 'none'
            }}>
                <div style={{
                    width: '1px',
                    height: '100px',
                    background: 'linear-gradient(to top, #ff2db1, transparent)',
                    margin: '0 auto 2rem',
                    opacity: 0.2
                }} />
            </div>
        </section>
    );
};

export default SeaBanner;

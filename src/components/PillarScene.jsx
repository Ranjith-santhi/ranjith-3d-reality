import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    PerspectiveCamera, 
    Environment, 
    Text, 
    Center, 
    Float,
    MeshReflectorMaterial,
    useGLTF
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

const COLORS = {
    violet: '#7c3aed',
    blue: '#2563eb',
    deep: '#010003',
    accent: '#ffffff'
};

const FloatingShape = () => {
    // Handling the space in the filename
    const { scene } = useGLTF('/Animation/Shape%20.glb');
    const cylinderRef = useRef();

    // Apply custom material and setup meshes
    useMemo(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                // Identity and Material
                child.material = new THREE.MeshPhysicalMaterial({
                    color: '#a855f7', 
                    metalness: 1,
                    roughness: 0.1,
                    transmission: 0.5,
                    thickness: 2,
                    transparent: true,
                    opacity: 1,
                    clearcoat: 1,
                    clearcoatRoughness: 0.1,
                    reflectivity: 1,
                    envMapIntensity: 5 
                });

                // Individually handle meshes
                if (child.name === 'Cylinder') {
                    cylinderRef.current = child;
                    child.visible = true;
                } else {
                    // Hide other objects (Cube, Sphere) as requested
                    child.visible = false;
                }
            }
        });
    }, [scene]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        
        // Rotate ONLY the cylinder shape individually
        if (cylinderRef.current) {
            cylinderRef.current.rotation.y = time * 0.6;
            cylinderRef.current.rotation.z = Math.sin(time * 0.3) * 0.1;
        }

        // All group-level rotation and movement stopped as per request
    });

    return (
        <group scale={4} position={[0, -1, 5]}>
            <primitive object={scene} />
        </group>
    );
};

const Pillars = () => {
    const groupRef = useRef();
    const pillarCount = 20;
    const spacing = 1.6; // Increased spacing

    const pillars = useMemo(() => {
        const temp = [];
        for (let i = 0; i < pillarCount; i++) {
            temp.push({
                x: (i - (pillarCount - 1) / 2) * spacing,
                offset: i * 0.15,
                height: 12 + Math.random() * 8,
                rotationOffset: Math.random() * Math.PI
            });
        }
        return temp;
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                const p = pillars[i];
                child.position.y = Math.sin(time * 0.4 + p.offset) * 0.5;
                child.rotation.y = Math.sin(time * 0.2 + p.rotationOffset) * 0.1;
            });
        }
    });

    return (
        <group ref={groupRef} rotation={[0, -0.4, 0]}>
            {pillars.map((p, i) => (
                <mesh key={i} position={[p.x, 0, -5]}>
                    <boxGeometry args={[0.8, p.height, 0.4]} />
                    <meshPhysicalMaterial 
                        color={i % 2 === 0 ? COLORS.violet : COLORS.blue}
                        metalness={1}
                        roughness={0.05}
                        transmission={0.8}
                        thickness={2}
                        transparent
                        opacity={0.7}
                        clearcoat={1}
                    />
                </mesh>
            ))}
        </group>
    );
};

// Custom Radial Gradient Material for the Blur Effect
const RadialGradientMaterial = ({ color, mousePos }) => {
    const materialRef = useRef();
    
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.u_mouse.value.lerp(mousePos.current, 0.05);
            materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime();
        }
    });

    const shaderArgs = useMemo(() => ({
        uniforms: {
            u_time: { value: 0 },
            u_mouse: { value: new THREE.Vector2(0, 0) },
            u_color: { value: new THREE.Color(color) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform vec3 u_color;
            varying vec2 vUv;
            void main() {
                // Calculate distance from UV to mouse position (centered)
                vec2 center = u_mouse * 0.5 + 0.5;
                float dist = distance(vUv, center);
                
                // Extremely soft falloff for the "blur" effect
                float glow = 1.0 - smoothstep(0.0, 0.8, dist);
                glow = pow(glow, 2.5); // Tighten the core but keep edges soft
                
                vec3 finalColor = u_color * glow;
                gl_FragColor = vec4(finalColor, glow * 0.4);
            }
        `
    }), [color]);

    return (
        <shaderMaterial 
            ref={materialRef} 
            args={[shaderArgs]} 
            transparent 
            depthWrite={false} 
            blending={THREE.AdditiveBlending}
        />
    );
};

const BackgroundAura = () => {
    const mousePos = useRef(new THREE.Vector2(0, 0));
    const { viewport } = useThree();

    useFrame((state) => {
        mousePos.current.set(state.mouse.x, state.mouse.y);
    });

    return (
        <group position={[0, 0, -15]}>
            {/* The Animated Blur Layer */}
            <mesh scale={[viewport.width * 3, viewport.height * 3, 1]}>
                <planeGeometry />
                <RadialGradientMaterial color={COLORS.blue} mousePos={mousePos} />
            </mesh>
            
            {/* Fixed Ambient Glows */}
            <mesh position={[-15, 0, -5]} scale={[30, 30, 1]}>
                <planeGeometry />
                <meshBasicMaterial color={COLORS.violet} transparent opacity={0.05} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    );
};

const PillarScene = () => {
    return (
        <div style={{ width: '100%', height: '100vh', background: COLORS.deep }}>
            <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
                <color attach="background" args={[COLORS.deep]} />
                <PerspectiveCamera makeDefault position={[0, 0, 22]} fov={35} />
                
                <ambientLight intensity={0.5} />
                <BackgroundAura />

                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <FloatingShape />
                </Float>

                <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.1}>
                    <Pillars />
                </Float>

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <MeshReflectorMaterial
                        blur={[400, 100]}
                        resolution={1024}
                        mixBlur={1}
                        mixStrength={70}
                        roughness={1}
                        depthScale={1.2}
                        minDepthThreshold={0.4}
                        maxDepthThreshold={1.4}
                        color="#010003"
                        metalness={0.9}
                    />
                </mesh>

                <Center position={[0, 6, 2]}>
                    <Text
                        fontSize={0.8}
                        color={COLORS.accent}
                        letterSpacing={0.1}
                    >
                        Learn More ↗
                    </Text>
                </Center>

                <EffectComposer>
                    <Bloom intensity={3} luminanceThreshold={0.05} mipmapBlur />
                    <Vignette eskil={false} offset={0.1} darkness={1.2} />
                </EffectComposer>

                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default PillarScene;

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
    OrbitControls, 
    PerspectiveCamera, 
    Environment, 
    ContactShadows,
    SpotLight,
    Grid,
    useTexture
} from '@react-three/drei';
import * as THREE from 'three';

class WavyCurve extends THREE.Curve {
    constructor() {
        super();
    }
    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const x = (t - 0.5) * 100; 
        const y = Math.sin(x * (Math.PI / 5)) * 1.5;
        const z = 0;
        return optionalTarget.set(x, y, z);
    }
}

const TrackAndSphere = () => {
    const trackRef = useRef();
    const sphereGroupRef = useRef();
    const sphereRef = useRef();
    const ringRef = useRef();
    const gridRef = useRef();
    
    const texture = useTexture('/sphere_texture.png');
    const curve = useMemo(() => new WavyCurve(), []);
    
    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        const speed = 4;
        const freq = Math.PI / 5;
        const amp = 1.5;
        const period = 10;
        
        // Negative dx so the track moves left, giving the illusion of moving forward
        const dx = -(time * speed) % period;
        
        if (trackRef.current) trackRef.current.position.x = dx;
        if (gridRef.current) gridRef.current.position.x = dx;
        
        if (sphereGroupRef.current) {
            // Sphere bobs up and down following the track's height at x=0
            const sphereY = Math.sin(-dx * freq) * amp + 1.25; // 1.2 radius + 0.05 tube radius
            sphereGroupRef.current.position.y = sphereY;
            
            // Tilt the sphere group to match the slope of the track
            const slope = amp * freq * Math.cos(-dx * freq);
            const angle = Math.atan(slope);
            sphereGroupRef.current.rotation.z = angle;
        }
        
        if (sphereRef.current) {
            // Rolling animation
            sphereRef.current.rotation.z -= (speed / 1.2) * delta;
        }
        
        if (ringRef.current) {
            // Give the ring a dynamic spinning effect
            ringRef.current.rotation.x = Math.PI / 4;
            ringRef.current.rotation.y = Math.PI / 4;
            ringRef.current.rotation.z += delta * 1.5;
        }
    });

    return (
        <group>
            {/* The Track */}
            <mesh ref={trackRef} castShadow receiveShadow>
                <tubeGeometry args={[curve, 250, 0.05, 16, false]} />
                <meshStandardMaterial color="#00aaff" emissive="#0044ff" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* The Floor Grid */}
            <Grid
                ref={gridRef}
                position={[0, -2.5, 0]}
                args={[100, 100]}
                cellSize={1}
                cellThickness={1}
                cellColor="#0044ff"
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor="#002288"
                fadeDistance={40}
                fadeStrength={2}
            />

            {/* The Sphere and Ring */}
            <group ref={sphereGroupRef}>
                <mesh ref={sphereRef} castShadow receiveShadow>
                    <sphereGeometry args={[1.2, 64, 64]} />
                    <meshPhysicalMaterial 
                        map={texture}
                        color="#ffffff" 
                        roughness={0.1} 
                        metalness={0.3}
                        clearcoat={1}
                    />
                </mesh>
                <mesh ref={ringRef} castShadow receiveShadow>
                    <torusGeometry args={[1.5, 0.04, 32, 100]} />
                    <meshPhysicalMaterial 
                        color="#ffffff" 
                        roughness={0.0} 
                        metalness={1.0}
                        clearcoat={1}
                    />
                </mesh>
            </group>
        </group>
    );
};

const Scene = () => {
    return (
        <>
            {/* Narrow FOV simulates a telephoto lens for high compression */}
            <PerspectiveCamera makeDefault position={[0, 5, 50]} fov={10.3} />
            <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                maxPolarAngle={Math.PI / 2.2} 
                minPolarAngle={Math.PI / 4}
            />

            <color attach="background" args={['#0047ff']} />
            <fog attach="fog" args={['#001a4d', 20, 60]} />
            
            <ambientLight intensity={0.5} />
            
            {/* Volumetric spotlight for the hero effect requested */}
            <SpotLight
                position={[0, 15, 0]}
                angle={0.3}
                penumbra={0.8}
                intensity={8}
                distance={40}
                anglePower={4}
                attenuation={5}
                color="#ffffff"
                castShadow
            />
            
            {/* Standard spotlight for sharp shadows */}
            <spotLight 
                position={[15, 20, 15]} 
                angle={0.4} 
                penumbra={1} 
                intensity={2} 
                castShadow 
                shadow-mapSize={[1024, 1024]} 
            />
            
            <pointLight position={[-10, 5, -5]} intensity={1.5} color="#0066ff" />

            <TrackAndSphere />

            <ContactShadows 
                position={[0, -2.4, 0]} 
                opacity={0.6} 
                scale={25} 
                blur={2} 
                far={10} 
                color="#000033"
            />

            <Environment preset="city" />
        </>
    );
};

const WhiteEnvironment = () => {
    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            zIndex: 1, 
            background: 'linear-gradient(135deg, #0066ff 0%, #001a4d 100%)' 
        }}>
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
                <Scene />
            </Canvas>
            
            {/* HTML Overlay with typography matching the image */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: '4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                pointerEvents: 'none',
                zIndex: 2
            }}>
                <div style={{ maxWidth: '800px' }}>
                    <span style={{ 
                        color: 'white', 
                        fontSize: '1.2rem', 
                        fontWeight: 600, 
                        letterSpacing: '0.05em',
                        marginBottom: '1rem',
                        display: 'block'
                    }}>
                        Announcement
                    </span>
                    <h1 style={{ 
                        color: 'white', 
                        fontSize: 'clamp(3rem, 10vw, 8rem)', 
                        lineHeight: 0.9,
                        fontWeight: 900, 
                        textTransform: 'uppercase',
                        margin: 0,
                        letterSpacing: '-0.03em'
                    }}>
                        BEST<br/>3D WEB<br/>DESIGNS
                    </h1>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                top: '4rem',
                right: '4rem',
                textAlign: 'right',
                zIndex: 2,
                pointerEvents: 'none',
                color: 'white',
                opacity: 0.8
            }}>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span>Dora</span>
                    <span>Minh</span>
                    <span style={{ padding: '0.2rem 0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem' }}>2023</span>
                </div>
            </div>
            
            <div style={{
                position: 'absolute',
                bottom: '4rem',
                right: '4rem',
                maxWidth: '250px',
                textAlign: 'right',
                zIndex: 2,
                pointerEvents: 'none',
                color: 'white',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                opacity: 0.7
            }}>
                Revealing the results of the Dora 3D web design challenge which happened last October
            </div>
        </div>
    );
};

export default WhiteEnvironment;

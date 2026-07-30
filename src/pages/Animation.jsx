import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useFBX, useAnimations, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Sparkles } from 'lucide-react';
import BannerScrollNav from '../components/BannerScrollNav';

// 5 Sketchfab-style Camera Waypoints with scaled positions and targets
const WAYPOINTS = [
    {
        id: 1,
        title: "Overview",
        subtitle: "Complete AirPods Pro & Charging Case Showcase",
        description: "Studio overview position highlighting the iconic design of AirPods Pro with open charging case.",
        position: [0, 0.8, 2.4],
        target: [0, 0, 0]
    },
    {
        id: 2,
        title: "Case Detail",
        subtitle: "MagSafe Charging Case & Lid Mechanism",
        description: "Macro focus on the glossy white finish, precision hinge, and front LED charging indicator.",
        position: [0, 0.35, 1.1],
        target: [0, -0.05, 0]
    },
    {
        id: 3,
        title: "Left Earbud",
        subtitle: "Acoustic Vent & Speaker Mesh",
        description: "Close-up detail of the left earbud's black acoustic mesh vent designed for Active Noise Cancellation.",
        position: [-0.5, 0.4, 0.8],
        target: [-0.15, 0.05, 0]
    },
    {
        id: 4,
        title: "Right Earbud",
        subtitle: "Silicone Tip & In-Ear Geometry",
        description: "High precision view showing the ergonomic in-ear contour and custom silicone ear tip fit.",
        position: [0.5, 0.45, 0.8],
        target: [0.15, 0.05, 0]
    },
    {
        id: 5,
        title: "Stem & Sensor",
        subtitle: "Force Sensor & Charging Contacts",
        description: "Extreme close-up on the capacitive force sensor stem and bottom metallic charging contacts.",
        position: [0.25, -0.2, 0.95],
        target: [0.06, -0.1, 0]
    }
];

const AirpodsModel = ({ onModelLoaded }) => {
    const fbx = useFBX('/models/airpods/Airpods_ForSketchfab.fbx');
    const modelGroup = useRef();
    const { actions, names } = useAnimations(fbx?.animations || [], modelGroup);

    // Play any built-in skeletal FBX animations if present
    useEffect(() => {
        if (actions && names && names.length > 0) {
            names.forEach((name) => {
                actions[name]?.reset().fadeIn(0.5).play();
            });
        }
    }, [actions, names]);

    // Smooth floating animation
    useFrame((state) => {
        if (modelGroup.current) {
            modelGroup.current.position.y = -0.02 + Math.sin(state.clock.getElapsedTime() * 1.8) * 0.012;
        }
    });

    useEffect(() => {
        if (!fbx) return;

        // Auto-center model bounding box
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        
        fbx.position.x = -center.x;
        fbx.position.y = -center.y;
        fbx.position.z = -center.z;

        // Apply realistic glossy plastic and metallic PBR materials
        fbx.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                    const mat = child.material;
                    mat.roughness = 0.12;
                    mat.metalness = 0.08;
                    mat.envMapIntensity = 1.5;

                    // If it's chrome trim or black grill mesh
                    if (child.name.toLowerCase().includes('metal') || child.name.toLowerCase().includes('silver') || child.name.toLowerCase().includes('chrome')) {
                        mat.metalness = 0.95;
                        mat.roughness = 0.05;
                    } else if (child.name.toLowerCase().includes('grill') || child.name.toLowerCase().includes('black') || child.name.toLowerCase().includes('mesh')) {
                        mat.color = new THREE.Color('#111111');
                        mat.roughness = 0.4;
                    }
                }
            }
        });

        if (onModelLoaded) onModelLoaded();
    }, [fbx, onModelLoaded]);

    return (
        <group ref={modelGroup} scale={0.004} position={[0, -0.02, 0]}>
            <primitive object={fbx} />
        </group>
    );
};

const Animation = () => {
    const controlsRef = useRef();
    const [activeWaypoint, setActiveWaypoint] = useState(1);
    const [isAutoRotate, setIsAutoRotate] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        document.title = "Animation | Antigravity";
    }, []);

    // Fly camera smoothly to selected waypoint using GSAP
    const flyToWaypoint = (wp) => {
        if (!controlsRef.current || !controlsRef.current.object) return;

        setActiveWaypoint(wp.id);
        setIsAnimating(true);

        const camera = controlsRef.current.object;
        const target = controlsRef.current.target;

        // Animate camera position
        gsap.to(camera.position, {
            x: wp.position[0],
            y: wp.position[1],
            z: wp.position[2],
            duration: 1.4,
            ease: "power3.inOut"
        });

        // Animate orbit controls target
        gsap.to(target, {
            x: wp.target[0],
            y: wp.target[1],
            z: wp.target[2],
            duration: 1.4,
            ease: "power3.inOut",
            onUpdate: () => {
                if (controlsRef.current) controlsRef.current.update();
            },
            onComplete: () => {
                setIsAnimating(false);
            }
        });
    };

    const currentWp = WAYPOINTS.find(w => w.id === activeWaypoint) || WAYPOINTS[0];

    return (
        <div style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#07070a',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header Badge */}
            <div style={{
                position: 'absolute',
                top: '90px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                textAlign: 'center',
                pointerEvents: 'none'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        borderRadius: '30px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        marginBottom: '8px'
                    }}
                >
                    <Sparkles size={14} color="#0ea5e9" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: '#0ea5e9', textTransform: 'uppercase' }}>
                        Sketchfab 3D Inspection Mode
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 900,
                        color: '#ffffff',
                        margin: 0,
                        letterSpacing: '-0.03em',
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)'
                    }}
                >
                    AirPods Pro <span style={{ color: '#ff3b30', fontSize: '1.2rem', fontWeight: 900, verticalAlign: 'middle', marginLeft: '10px', textTransform: 'lowercase', letterSpacing: '0.05em' }}>(wip)</span>
                </motion.h1>
            </div>

            {/* Main 3D Canvas */}
            <Canvas
                camera={{ position: [0, 0.8, 2.4], fov: 45 }}
                style={{ width: '100%', height: '100%', cursor: 'grab' }}
            >
                <ambientLight intensity={0.9} />
                <directionalLight position={[10, 15, 10]} intensity={1.8} color="#ffffff" castShadow />
                <directionalLight position={[-10, -5, -10]} intensity={0.8} color="#38bdf8" />
                <pointLight position={[0, 5, 5]} intensity={1.2} color="#ffffff" />

                <Suspense fallback={null}>
                    <Environment preset="studio" />
                    <AirpodsModel />
                    <ContactShadows position={[0, -0.22, 0]} opacity={0.5} scale={1.8} blur={1.5} far={1.5} />
                </Suspense>

                <OrbitControls
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.05}
                    autoRotate={isAutoRotate}
                    autoRotateSpeed={1.5}
                    maxDistance={6}
                    minDistance={0.3}
                />
            </Canvas>

            {/* Waypoint Info Card (Bottom Left) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentWp.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: 'absolute',
                        bottom: '95px',
                        left: '40px',
                        zIndex: 100,
                        maxWidth: '360px',
                        padding: '18px 22px',
                        backgroundColor: 'rgba(15, 15, 22, 0.82)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        borderRadius: '20px',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#0ea5e9',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 800
                        }}>
                            {currentWp.id}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {currentWp.subtitle}
                        </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0' }}>
                        {currentWp.title}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, margin: 0 }}>
                        {currentWp.description}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Floating Glossy Sketchfab Camera Waypoint Bar (Bottom Center 1, 2, 3, 4, 5) */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'rgba(12, 14, 22, 0.85)',
                backdropFilter: 'blur(30px) saturate(200%)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '100px',
                boxShadow: '0 16px 45px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
                pointerEvents: 'auto'
            }}>
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.5)',
                    paddingRight: '6px',
                    borderRight: '1px solid rgba(255,255,255,0.15)',
                    letterSpacing: '0.05em'
                }}>
                    VIEWS
                </span>

                {WAYPOINTS.map((wp) => {
                    const isActive = activeWaypoint === wp.id;
                    return (
                        <button
                            key={wp.id}
                            onClick={() => flyToWaypoint(wp)}
                            title={`${wp.id}. ${wp.title} - ${wp.subtitle}`}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                border: isActive ? '1.5px solid rgba(255, 255, 255, 0.7)' : '1px solid rgba(255, 255, 255, 0.15)',
                                backgroundColor: isActive ? '#0ea5e9' : 'rgba(255, 255, 255, 0.08)',
                                color: '#ffffff',
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: isActive ? '0 0 20px rgba(14, 165, 233, 0.7)' : 'none',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                            }}
                        >
                            {wp.id}
                        </button>
                    );
                })}

                {/* Auto Rotate Toggle Button */}
                <button
                    onClick={() => setIsAutoRotate(!isAutoRotate)}
                    title={isAutoRotate ? "Disable Auto Orbit" : "Enable Auto Orbit"}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        marginLeft: '6px',
                        border: isAutoRotate ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                        backgroundColor: isAutoRotate ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        color: isAutoRotate ? '#38bdf8' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <RotateCw size={18} style={{ animation: isAutoRotate ? 'spin 6s linear infinite' : 'none' }} />
                </button>
            </div>

            {/* Banner Scroll Page Navigation */}
            <BannerScrollNav
                prevPageRoute="/creator"
                prevLabel="GO TO CREATOR PAGE"
                nextPageRoute="/symmetry"
                label="GO TO SYMMETRY PAGE"
            />
            
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Animation;

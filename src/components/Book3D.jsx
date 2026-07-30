import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

const PAGE_WIDTH = 3;
const PAGE_HEIGHT = 4.2;
const PAGE_THICKNESS = 0.01;
const BOOK_COVER_THICKNESS = 0.01;

const mildColors = [
    '#fae8e0', '#b6e2d3', '#d8e2dc', '#ffe5d9', '#ffcad4', 
    '#fce1e4', '#d9b8c4', '#95b8d1', '#e8dff5', '#fcf4dd'
];

const VideoMaterial = ({ url, attach, fallbackColor, isPlaying }) => {
    const [texture, setTexture] = React.useState(null);

    React.useEffect(() => {
        if (!url) return;
        const vid = document.createElement('video');
        vid.src = url;
        vid.crossOrigin = 'Anonymous';
        vid.loop = true;
        vid.muted = true;
        vid.playsInline = true;
        vid.preload = 'auto'; // Force browser to buffer the video invisibly

        const tex = new THREE.VideoTexture(vid);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setTexture(tex);

        vid.addEventListener('loadedmetadata', () => {
            const vidRatio = vid.videoWidth / vid.videoHeight;
            const planeRatio = PAGE_WIDTH / PAGE_HEIGHT;
            
            if (vidRatio > planeRatio) {
                const scale = planeRatio / vidRatio;
                tex.repeat.set(scale, 1);
                tex.offset.set((1 - scale) / 2, 0);
            } else {
                const scale = vidRatio / planeRatio;
                tex.repeat.set(1, scale);
                tex.offset.set(0, (1 - scale) / 2);
            }
        });

        return () => {
            vid.pause();
            vid.removeAttribute('src');
            vid.load();
            tex.dispose();
        };
    }, [url]);

    // Handle playback strictly based on page active state
    React.useEffect(() => {
        if (texture && texture.image) {
            const vid = texture.image;
            if (isPlaying) {
                try {
                    vid.currentTime = 0; 
                } catch(e) {
                    console.warn("Could not reset time yet:", e);
                }
                vid.play().catch(e => console.warn('Video auto-play failed', e));
            } else {
                vid.pause();
            }
        }
    }, [isPlaying, texture]);

    if (!texture) {
        return <meshStandardMaterial attach={attach} color={fallbackColor || "#111"} />;
    }

    return <meshStandardMaterial attach={attach} map={texture} color="#fff" roughness={0.4} />;
};

const Page = ({ index, activeTab, prevTab, totalLeaves, frontContent, backContent, isCover, videoFront, videoBack }) => {
    // Determine whether this tab acts as a full "book close"
    const effActiveTab = activeTab;
    const effPrevTab = prevTab;

    // When activeTab > index, this leaf is flipped to the left.
    const isFlipped = effActiveTab > index;

    // Calculate staggered delays for grand cascading flip effect
    let delay = 0;
    const STAGGER = 150;
    if (effActiveTab > effPrevTab) {
        // Flipping forward: Right to Left
        if (index >= effPrevTab && index < effActiveTab) delay = (index - effPrevTab) * STAGGER;
    } else if (effActiveTab < effPrevTab) {
        // Flipping backward: Left to Right
        if (index >= effActiveTab && index < effPrevTab) delay = (effPrevTab - 1 - index) * STAGGER;
    }

    const zRight = (totalLeaves - index) * 0.01; // Base thickness stacked on right
    const zLeft = index * 0.01; // Stacked on left

    // Unified spring for smooth kinematics
    const { rotationY, positionZ } = useSpring({
        rotationY: isFlipped ? -Math.PI : 0,
        positionZ: isFlipped ? zLeft : zRight,
        delay: delay,
        config: { mass: 1.5, tension: 120, friction: 35 } // Slower more majestic float
    });

    const pageColor = mildColors[index % mildColors.length];
    const thickness = isCover ? BOOK_COVER_THICKNESS : PAGE_THICKNESS;
    const colorFront = isCover ? '#111' : pageColor;
    const colorBack = isCover ? '#111' : pageColor;

    // Culling buried HTML content blocks z-fighting glops over transparent DOM.
    // It guarantees only the absolute top faces get text.
    const isFrontVisible = index === effActiveTab;
    const isBackVisible = index === effActiveTab - 1;

    const groupRef = useRef();
    const meshRef = useRef();
    const originalPositions = useRef();

    useFrame(() => {
        if (!meshRef.current || !groupRef.current) return;
        const geometry = meshRef.current.geometry;
        
        if (!originalPositions.current) {
            const positions = geometry.attributes.position;
            const orig = new Float32Array(positions.count * 3);
            for (let i = 0; i < positions.count; i++) {
                orig[i * 3] = positions.getX(i);
                orig[i * 3 + 1] = positions.getY(i);
                orig[i * 3 + 2] = positions.getZ(i);
            }
            originalPositions.current = orig;
        }

        // Current rotation from the group
        const targetRotation = groupRef.current.rotation.y; 
        
        // Normalize rotation to 0-1
        const progress = Math.abs(targetRotation / Math.PI);
        // Apply sine wave to determine bend amount at current point in turn
        const turnBend = Math.sin(progress * Math.PI);

        // Maximum dynamic bend offset during turn (pages only bend while moving)
        const maxBend = 0.4;
        
        const positions = geometry.attributes.position;
        const orig = originalPositions.current;

        for (let i = 0; i < positions.count; i++) {
            const origX = orig[i * 3];
            const origZ = orig[i * 3 + 2]; 
            
            // X coordinates natively range from -PAGE_WIDTH/2 to PAGE_WIDTH/2
            const percentX = (origX + PAGE_WIDTH / 2) / PAGE_WIDTH;
            
            // The dynamic turning cylinder fold.
            const turnBendAmt = Math.sin(percentX * Math.PI) * turnBend * maxBend;
            
            // Total Z displacement (no resting bend to keep HTML layers perfectly aligned)
            const bendZ = turnBendAmt;
            
            // X-shortening (cosine-like adjustment to simulate paper arch length conservation)
            const bendX = -Math.sin(percentX * Math.PI) * (turnBend * maxBend) * 0.3;

            positions.setX(i, origX + bendX);
            positions.setZ(i, origZ + bendZ);
        }
        
        geometry.computeVertexNormals();
        positions.needsUpdate = true;
    });

    return (
        <a.group position-z={positionZ} rotation-y={rotationY} ref={groupRef}>
            {/* Hinge at left edge (x=0). We move the box center to x = PAGE_WIDTH/2 */}
            <group position={[PAGE_WIDTH / 2, 0, 0]}>
                <mesh castShadow receiveShadow ref={meshRef}>
                    {/* Add 32 width segments specifically to act as loop cuts for smooth bending */}
                    <boxGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, thickness, 32, 1, 1]} />
                    <meshStandardMaterial attach="material-0" color={isCover ? '#111' : '#eee'} />
                    <meshStandardMaterial attach="material-1" color={isCover ? '#111' : '#eee'} />
                    <meshStandardMaterial attach="material-2" color={isCover ? '#111' : '#eee'} />
                    <meshStandardMaterial attach="material-3" color={isCover ? '#111' : '#eee'} />
                    {videoFront ? <VideoMaterial attach="material-4" url={videoFront} fallbackColor={colorFront} isPlaying={isFrontVisible} /> : <meshStandardMaterial attach="material-4" color={colorFront} />}
                    {videoBack ? <VideoMaterial attach="material-5" url={videoBack} fallbackColor={colorBack} isPlaying={isBackVisible} /> : <meshStandardMaterial attach="material-5" color={colorBack} />}
                </mesh>

                {/* Content Front (Faces +z) */}
                <group position={[0, 0, thickness / 2 + 0.005]}>
                    {isFrontVisible && frontContent}
                </group>

                {/* Content Back (Faces -z) */}
                <group position={[0, 0, -thickness / 2 - 0.005]} rotation-y={Math.PI}>
                    {isBackVisible && backContent}
                </group>
            </group>
        </a.group>
    );
};

export default function Book3D({ activeTab, textSizeScale = 2.1, fontFamily = 'Inter, sans-serif' }) {
    const prevTabRef = useRef(activeTab);

    React.useEffect(() => {
        prevTabRef.current = activeTab;
    }, [activeTab]);

    const pagesConfig = [
        // Leaf 0 (Cover & Nardil)
        {
            isCover: true,
            videoBack: '/Animation/Car_aniamtion.mp4',
            front: {
                title: "Ranjith S",
                subtitle: "Senior 3D Artist",
                description: "I'm Ranjith Sethuraman, a passionate and technically skilled Senior 3D Artist with over 7 years of experience in creating high-quality 3D assets, environments, and animations for gaming, product visualization, and educational content. I specialize in the complete 3D pipeline from modeling and texturing to lighting and compositing."
            },
            back: {
                title: "Nardil Enterprise",
                subtitle: "Senior 3D Artist  |  2025 - PRESENT",
                bullets: [
                    "Created and optimized 3D assets for product visualization and commercial applications.",
                    "Designed large-scale environments and animations for marketing and branding.",
                    "Developed custom Blender plugins using Python and ChatGPT AI to streamline workflows.",
                    "Collaborated across departments to deliver visually rich digital content."
                ],
                pageNum: "Page 1"
            }
        },
        // Leaf 1 (Swipewire & Skill-Lync)
        {
            front: {
                title: "Swipewire Technology",
                subtitle: "Senior 3D Artist  |  Jun 2023 - Jan 2025",
                bullets: [
                    "Developed game assets for casino-style games including roulette, dice, chips, and characters.",
                    "Created animations and visual effects for real-time gameplay."
                ],
                pageNum: "Page 2"
            },
            back: {
                title: "Skill-Lync",
                subtitle: "3D Artist  |  Aug 2022 - May 2023",
                bullets: [
                    "Handled the full 3D pipeline: modeling, texturing, animation, lighting, rendering, and compositing.",
                    "Delivered high-end simulation videos for clients like Microsoft, Tata Technologies, and Havells."
                ],
                pageNum: "Page 3"
            }
        },
        // Leaf 2 (Spacejoy & Sciencotonic)
        {
            front: {
                title: "Spacejoy",
                subtitle: "3D Artist  |  Apr 2021 - Aug 2022",
                bullets: [
                    "Handled the full 3D pipeline: modeling, texturing, animation, lighting, rendering, and compositing.",
                    "Delivered high-end simulation videos for clients like Microsoft, Tata Technologies, and Havells."
                ],
                pageNum: "Page 4"
            },
            back: {
                title: "Sciencotonic",
                subtitle: "3D Designer  |  Aug 2018 - Feb 2021",
                bullets: [
                    "Transformed 2D designs into detailed 3D content for children’s learning platforms.",
                    "Designed educational animations and comic books tailored for young audiences.",
                    "Focused on quality, creativity, and clear communication of concepts."
                ],
                pageNum: "Page 5"
            }
        },
        // Leaf 3 (Tools & Expertise)
        {
            front: {
                title: "Tools & Software",
                subtitle: "Production Ecosystem",
                tags: [
                    "Blender", "Unreal Engine", "Maya", "Substance Painter", "Photoshop",
                    "Illustrator", "Premiere Pro", "After Effects", "Audition",
                    "Marvelous Designer", "Cloth 3D", "Figma", "Python"
                ],
                pageNum: "Page 6"
            },
            back: {
                title: "Core Expertise",
                subtitle: "Artistic & Technical Skills",
                tags: [
                    "Blender", "3D Animation", "Python Scripting", "Premiere Pro",
                    "After Effects", "Photoshop", "Illustrator", "Audition",
                    "Marvelous Designer", "Unreal Engine", "Project Management"
                ],
                pageNum: "Page 7"
            }
        },
        // Leaf 4 (Education/Contact & End Cover)
        {
            isCover: true,
            front: {
                title: "Education & Contact",
                subtitle: "Background & Links",
                bullets: [
                    "Apollo Computer Education (2018): Master in Multimedia Visualizer",
                    "Wardiere High School (2015 - 2017): Diploma in Instrumentation and Control Engineering",
                    "Phone: +91 9698998897",
                    "Email: ranjithsethu1996@gmail.com",
                    "Portfolio: behance.net/ranjithsethuraman"
                ],
                pageNum: "Page 8"
            },
            back: {
                title: "THE END",
                subtitle: "Thank You",
                description: "Ranjith S. Portfolio Experience"
            }
        }
    ];

    const generateContent = (pageData, isCover, isFront) => {
        if (!pageData) return null;
        
        return (
            <Html transform occlude wrap className="book-html-content" style={{
                width: `${PAGE_WIDTH * 200}px`, 
                height: `${PAGE_HEIGHT * 200}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: isCover ? '40px 30px' : '30px 25px',
                backgroundColor: 'transparent',
                color: isCover ? '#fff' : '#111',
                border: 'none',
                boxSizing: 'border-box',
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
                boxShadow: 'none',
                backfaceVisibility: 'hidden',
                userSelect: 'none'
            }} distanceFactor={1.5}>
                
                {isCover ? (
                    // Cover layout
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                        textAlign: 'center',
                        color: '#fff',
                        fontFamily: fontFamily
                    }}>
                        <div style={{ marginBottom: '15px', width: '50px', height: '5px', backgroundColor: '#ff3b30' }}></div>
                        <h1 style={{ fontSize: `${28 * textSizeScale}px`, fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '1px', lineHeight: 1.1 }}>
                            {pageData.title}
                        </h1>
                        <h2 style={{ fontSize: `${13 * textSizeScale}px`, fontWeight: 800, color: '#fff', margin: '0 0 20px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            {pageData.subtitle}
                        </h2>
                        <p style={{ fontSize: `${10 * textSizeScale}px`, color: '#ddd', fontWeight: 700, margin: 'auto 0 0 0', letterSpacing: '0.5px', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                            {pageData.description}
                        </p>
                    </div>
                ) : (
                    // Content Page layout
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        width: '100%',
                        fontFamily: fontFamily,
                        color: '#1a1a1a'
                    }}>
                        {/* Header */}
                        <div style={{ marginBottom: '12px' }}>
                            <h3 style={{ fontSize: `${14 * textSizeScale}px`, fontWeight: 800, margin: '0 0 4px 0', color: '#111', lineHeight: 1.2 }}>
                                {pageData.title}
                            </h3>
                            {pageData.subtitle && (
                                <div style={{ fontSize: `${10 * textSizeScale}px`, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {pageData.subtitle}
                                </div>
                            )}
                            <div style={{ width: '100%', height: '1.5px', backgroundColor: 'rgba(0,0,0,0.06)', marginTop: '8px' }}></div>
                        </div>

                        {/* Bullets, Tags, or Description */}
                        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {pageData.bullets ? (
                                <ul style={{ margin: 0, paddingLeft: '15px', listStyleType: 'square' }}>
                                    {pageData.bullets.map((bullet, bIdx) => (
                                        <li key={bIdx} style={{ fontSize: `${11 * textSizeScale}px`, color: '#333', lineHeight: '1.4', marginBottom: '8px' }}>
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            ) : pageData.tags ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '3px' }}>
                                    {pageData.tags.map((tag, tIdx) => (
                                        <span key={tIdx} style={{
                                            padding: '4px 8px',
                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            borderRadius: '15px',
                                            fontSize: `${9 * textSizeScale}px`,
                                            fontWeight: 650,
                                            color: '#444'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: `${11.5 * textSizeScale}px`, color: '#333', lineHeight: '1.45', margin: 0 }}>
                                    {pageData.description}
                                </p>
                            )}
                        </div>

                        {/* Footer Page Number */}
                        {pageData.pageNum && (
                            <div style={{
                                textAlign: isFront ? 'right' : 'left',
                                fontSize: `${9 * textSizeScale}px`,
                                color: '#999',
                                fontWeight: 700,
                                marginTop: '6px',
                                width: '100%',
                                borderTop: '1px solid rgba(0,0,0,0.04)',
                                paddingTop: '6px'
                            }}>
                                {pageData.pageNum}
                            </div>
                        )}
                    </div>
                )}
            </Html>
        );
    };

    let offsetX = 0;
    if (activeTab === 0) {
        offsetX = -PAGE_WIDTH / 2; // Center the closed front cover
    } else if (activeTab === pagesConfig.length - 1) {
        offsetX = PAGE_WIDTH / 2; // Center the closed back cover
    } else {
        offsetX = 0; // Spine locked firmly in center while reading inner pages
    }

    const { groupPositionX } = useSpring({
        groupPositionX: offsetX,
        config: { mass: 2, tension: 150, friction: 30 }
    });

    return (
        <a.group position-x={groupPositionX} rotation-x={-Math.PI / 6} position-y={0.5}>
            {pagesConfig.map((config, index) => (
                <Page
                    key={index}
                    index={index}
                    activeTab={activeTab}
                    prevTab={prevTabRef.current}
                    totalLeaves={pagesConfig.length}
                    frontContent={generateContent(config.front, config.isCover, true)}
                    backContent={generateContent(config.back, config.isCover, false)}
                    videoFront={config.videoFront}
                    videoBack={config.videoBack}
                    isCover={config.isCover}
                />
            ))}
        </a.group>
    );
}

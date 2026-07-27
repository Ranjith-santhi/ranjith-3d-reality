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
                // If the video hasn't loaded its metadata yet, setting currentTime will crash the thread!
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
    const effActiveTab = activeTab === totalLeaves - 1 ? totalLeaves : activeTab;
    const effPrevTab = prevTab === totalLeaves - 1 ? totalLeaves : prevTab;

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
    // This entirely solves mirrored text and "text appearing mid-flip" for intermediate pages!
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

export default function Book3D({ activeTab, textSizeScale = 1.0, fontFamily = 'Inter, sans-serif' }) {
    const prevTabRef = useRef(activeTab);

    // Track the historical frame right after a new render triggers
    React.useEffect(() => {
        prevTabRef.current = activeTab;
    }, [activeTab]);

    const pagesConfig = [
        { front: "ANTIGRAVITY", back: "Inside Cover", isCover: true, videoBack: '/Animation/Car_aniamtion.mp4' },
        { front: "PAGE 1\nFundamentals", back: "Blank" },
        { front: "PAGE 2\nDesign System", back: "Blank" },
        { front: "PAGE 3\nTypography", back: "Blank" },
        { front: "PAGE 4\nColors", back: "Blank" },
        { front: "PAGE 5\nComponents", back: "Blank" },
        { front: "PAGE 6\nInteractions", back: "Blank" },
        { front: "PAGE 7\nAnimations", back: "Blank" },
        { front: "PAGE 8\nAccessibility", back: "Blank" },
        { front: "PAGE 9\nDeployment", back: "Blank" },
        { front: "Summary / Notes", back: "THE END", isCover: true }, // Leaf 10
    ];

    const generateContent = (text, isCover, isFront) => {
        if (!text || text === "Blank") return null;
        
        return (
            <Html transform occlude wrap className="book-html-content" style={{
                width: `${PAGE_WIDTH * 200}px`, 
                height: `${PAGE_HEIGHT * 200}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                backgroundColor: 'transparent',
                color: isCover ? '#fff' : '#000',
                border: 'none',
                boxSizing: 'border-box',
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
                boxShadow: 'none',
                backfaceVisibility: 'hidden'
            }} distanceFactor={1.5}>
                {isCover && <div style={{ marginBottom: '20px', width: '60px', height: '6px', backgroundColor: 'var(--accent-color)' }}></div>}
                
                {/* Wrapped in an event-stopping container so highlighting/clicking text doesn't trigger 3D camera rotation */}
                <div 
                    onPointerDown={(e) => e.stopPropagation()} 
                    style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', fontFamily: fontFamily }}
                >
                    <h2 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        spellCheck={false}
                        style={{ 
                            fontSize: `${(isCover ? 3.5 : 2.5) * textSizeScale}rem`, 
                            margin: 0, 
                            fontWeight: 900,
                            letterSpacing: isCover ? '2px' : '0px',
                            color: isCover ? '#fff' : '#111',
                            lineHeight: '1.2',
                            whiteSpace: 'pre-wrap',
                            outline: 'none',
                            cursor: 'text'
                        }}
                    >
                        {text}
                    </h2>
                    {!isCover && <p 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        spellCheck={false}
                        style={{ marginTop: '20px', fontSize: `${1 * textSizeScale}rem`, color: '#666', maxWidth: '80%', outline: 'none', cursor: 'text' }}
                    >
                        This is an interactive 3D representation. Use the bottom navigation to flip pages.
                    </p>}
                    {isCover && isFront && <p 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        spellCheck={false}
                        style={{ marginTop: 'auto', fontSize: `${0.9 * textSizeScale}rem`, color: '#888', letterSpacing: '1px', outline: 'none', cursor: 'text' }}
                    >
                        ANTIGRAVITY MEDIA
                    </p>}
                </div>
{!isCover && (
  <p style={{
    position: 'absolute',
    bottom: '10px',
    left: isFront ? 'auto' : '10px',
    right: isFront ? '10px' : 'auto',
    fontSize: '0.8rem',
    color: isCover ? '#fff' : '#000',
    cursor: 'pointer'
  }}>
    Click here
  </p>
)}
</Html>
        );
    };

    // The user requested the spine to remain perfectly anchored in the center while reading,
    // BUT the book must be properly centered on the screen when it is closed (tabs 0 or 'Close').
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

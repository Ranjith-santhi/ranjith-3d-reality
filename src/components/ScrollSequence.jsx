import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import Cloth3D from './Cloth3D';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const textToType = "Hi, I'm Ranjith. I turn wild ideas, storyboards, 2D sketches, structural plans, and pure imagination into fully realized 3D realities. You bring the vision, and I build the mesh. Whether it's visualizing heavy structural data or making motion graphics pop, I make sure the final render looks incredible and gets done without the headache. No fluff, just good design.";
const words = textToType.split(" ");

const ScrollSequence = ({ externalThemeIndex, onExternalThemeChange, externalThemes }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const sceneOverlayRef = useRef(null);
    const textRef1 = useRef(null);
    const textRef2 = useRef(null);
    const textRef3 = useRef(null);
    const scrollIconRef = useRef(null);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [internalThemeIndex, setInternalThemeIndex] = useState(0);

    const DEFAULT_THEMES = [
        { primary: '#8b5cf6', accent: '#ffffff', bg: '#050010', textSub: '#c4b5fd', shadowRgb: '139, 92, 246' }, // 0: Purple
        { primary: '#06b6d4', accent: '#ffffff', bg: '#000814', textSub: '#a5f3fc', shadowRgb: '6, 182, 212' },   // 1: Cyan
        { primary: '#ef4444', accent: '#ffffff', bg: '#100000', textSub: '#fca5a5', shadowRgb: '239, 68, 68' },   // 2: Red
        { primary: '#10b981', accent: '#ffffff', bg: '#001005', textSub: '#6ee7b7', shadowRgb: '16, 185, 129' },  // 3: Emerald
        { primary: '#f59e0b', accent: '#ffffff', bg: '#1a0f00', textSub: '#fde68a', shadowRgb: '245, 158, 11' },  // 4: Amber
    ];

    const themes = externalThemes || DEFAULT_THEMES;
    const themeIndex = externalThemeIndex !== undefined ? externalThemeIndex : internalThemeIndex;
    const currentTheme = themes[themeIndex];

    const handleThemeChange = () => {
        if (onExternalThemeChange) {
            onExternalThemeChange();
        } else {
            setInternalThemeIndex((prev) => (prev + 1) % themes.length);
        }
    };

    const frameCount = 260;

    // Load images
    useEffect(() => {
        let loadedCount = 0;
        const imgArray = [];

        const preloadImages = () => {
            if (frameCount === 0) {
                setIsLoading(false);
                return;
            }

            for (let i = 1; i <= frameCount; i++) {
                const img = new Image();
                const filename = 'Image ' + i.toString().padStart(4, '0') + '.jpg';
                img.src = '/New%20intro/' + encodeURIComponent(filename);

                const onLoadOrError = () => {
                    loadedCount++;
                    setLoadProgress(Math.round((loadedCount / frameCount) * 100));
                    if (loadedCount === frameCount) {
                        setIsLoading(false);
                        ScrollTrigger.refresh();
                    }
                };

                img.onload = onLoadOrError;
                img.onerror = () => {
                    onLoadOrError(); 
                };
                imgArray.push(img);
            }
            setImages(imgArray);
        };

        preloadImages();
    }, []);

    const renderFrame = (index, imgList) => {
        const canvas = canvasRef.current;
        if (!canvas || imgList.length === 0) return;

        const ctx = canvas.getContext('2d');
        const safeIndex = Math.min(Math.max(Math.round(index), 0), frameCount - 1);
        const img = imgList[safeIndex];

        if (img && img.complete && img.naturalHeight !== 0) {
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            
            // Shift the image down slightly (+80px) to prevent top cropping, while keeping boundaries safe
            const maxScrollY = canvas.height - img.height * scale;
            const centerY = (canvas.height - img.height * scale) / 2;
            const y = Math.min(0, Math.max(maxScrollY, centerY + 80));

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    };

    // GSAP Timeline and Parallax
    useEffect(() => {
        if (isLoading || images.length === 0) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (images[0]) {
            if (images[0].complete) {
                renderFrame(0, images);
            } else {
                images[0].onload = () => renderFrame(0, images);
            }
        }

        const context = gsap.context(() => {
            const playhead = { frame: 0 };

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: "top top",
                    end: "+=12000",
                    scrub: 1, // Smooth playback
                    pin: true,
                    anticipatePin: 1
                }
            });

            // 1. Image Sequence: Time 0 to 8
            tl.to(playhead, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                duration: 8,
                onUpdate: () => {
                    renderFrame(playhead.frame, images);
                }
            }, 0);

            // 2. First Text Popup: Fade in and stay slightly lower
            tl.fromTo(textRef1.current, {
                opacity: 0,
                y: 50,
                scale: 0.95
            }, {
                opacity: 1,
                y: 20,
                scale: 1,
                duration: 2,
                ease: "power2.out"
            }, 8);

            // 3. Second Text Popup: Fade in below
            tl.fromTo(textRef2.current, {
                opacity: 0,
                y: 30,
                scale: 0.95
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 2,
                ease: "power2.out"
            }, 10);

            // 3.5 Fade in 3D Scene
            tl.to(sceneOverlayRef.current, {
                opacity: 1,
                duration: 2,
                ease: "power2.inOut"
            }, 8);

            // 4. Move First Text Up
            tl.to(textRef1.current, {
                y: -5,
                duration: 2,
                ease: "power2.out"
            }, 10);

            // 5. Move entire block up to make room for paragraph
            tl.to(contentRef.current, {
                y: -40, 
                duration: 2,
                ease: "power2.out"
            }, 12);

            // 6. Third text: Fade in and type
            gsap.set(textRef3.current, { opacity: 0, text: "" });
            
            tl.to(textRef3.current, {
                opacity: 1,
                duration: 2,
                ease: "power2.out"
            }, 12);

            tl.to(textRef3.current, {
                text: textToType,
                duration: 6,
                ease: "none"
            }, 12);

            // 8. Scroll Down Icon Fade In & Popup Scale
            gsap.set(scrollIconRef.current, { opacity: 0, scale: 0.5 });
            tl.to(scrollIconRef.current, {
                opacity: 1,
                scale: 1,
                duration: 2,
                ease: "back.out(1.7)"
            }, 18);

            // Continuous bounce independent of scroll timeline
            gsap.to(scrollIconRef.current, {
                y: 10,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
                duration: 1
            });

            // 7. Mouse Parallax Effect
            const handleMouseMove = (e) => {
                const { clientX, clientY } = e;
                const xPos = (clientX / window.innerWidth) - 0.5;
                const yPos = (clientY / window.innerHeight) - 0.5;

                gsap.to(canvas, {
                    x: xPos * 30, // Shift in opposite direction (since xPos is -0.5 to 0.5)
                    y: yPos * 30,
                    duration: 0.6,
                    ease: "power2.out"
                });
            };

            window.addEventListener('mousemove', handleMouseMove);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };

        }, container);

        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                ScrollTrigger.refresh();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            context.revert();
        };
    }, [isLoading, images]);

    return (
        <div ref={containerRef} style={{ height: '100vh', width: '100%', position: 'relative', background: '#0a0a0a', overflow: 'hidden' }}>
            {/* Canvas is inside the pinned container */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    zIndex: 1,
                    transform: 'scale(1.05)' // Ensure edges are not visible during parallax
                }}
            />

            {/* 3D Scene Overlay */}
            <div 
                ref={sceneOverlayRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    pointerEvents: 'auto',
                    zIndex: 2,
                    cursor: 'pointer'
                }}
            >
                <Cloth3D 
                    theme={currentTheme} 
                    onSceneClick={handleThemeChange} 
                />
            </div>

            {/* Popup Message Container */}
            <div 
                ref={contentRef}
                style={{
                    position: 'absolute',
                    top: '30%', // Moved up into the empty dark space above the 3D shapes
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '95%',
                    maxWidth: '1400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            >
                <div 
                    ref={textRef1}
                    style={{
                        width: '100%',
                        textAlign: 'center',
                        opacity: 0,
                    }}
                >
                    <h2 style={{ 
                        fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', 
                        margin: 0, 
                        fontWeight: 900, 
                        letterSpacing: '-0.02em',
                        color: '#000000',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.5s ease'
                    }}>
                        Lemme keep it simple
                    </h2>
                </div>
                <div 
                    ref={textRef2}
                    style={{
                        width: '100%',
                        textAlign: 'center',
                        opacity: 0,
                        marginTop: '0.2rem'
                    }}
                >
                    <h2 style={{ 
                        fontSize: 'clamp(1.2rem, 2vw, 1.5rem)', 
                        margin: 0, 
                        fontWeight: 800, 
                        letterSpacing: '-0.01em',
                        color: '#000000',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.5s ease'
                    }}>
                        I Build Cool 3D Stuff.
                    </h2>
                </div>
 
                {/* Third text positioned absolutely relative to this centered block so it hangs below */}
                <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '1rem' }}>
                    <p 
                        ref={textRef3}
                        style={{ 
                            fontSize: 'clamp(1.1rem, 1.5vw, 1.35rem)', 
                            lineHeight: 1.6, 
                            color: '#333333',
                            margin: 0,
                            opacity: 0,
                            textAlign: 'center',
                            fontWeight: 400,
                            transition: 'color 0.5s ease'
                        }}
                    >
                    </p>
                </div>
            </div>
 
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: '#0a0a0a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2rem',
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                }}>
                    {/* Animated logo mark */}
                    <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                            <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
                            <circle cx="32" cy="32" r="28"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - loadProgress / 100)}`}
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.3s ease' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em'
                        }}>
                            {loadProgress}%
                        </div>
                    </div>

                    {/* Name + title */}
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>RANJITH S.</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Senior 3D Artist</p>
                    </div>

                    {/* Progress bar */}
                    <div style={{ width: '240px', position: 'relative' }}>
                        <div style={{ height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${loadProgress}%`,
                                background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
                                borderRadius: '99px',
                                transition: 'width 0.3s ease',
                                boxShadow: '0 0 8px rgba(255,255,255,0.6)'
                            }}/>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>LOADING ASSETS</span>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{loadProgress} / 100</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScrollSequence;

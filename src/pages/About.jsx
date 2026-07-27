import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import HorizontalGallery from '../components/HorizontalGallery';

const About = () => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [videoDuration, setVideoDuration] = useState(0);


    // Smooth progress for visual elements
    const smoothProgress = useSpring(progress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setVideoDuration(video.duration);
            // Seek to start
            video.currentTime = 0;
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }, []);

    const [isPlaying, setIsPlaying] = useState(false);

    // Sync video state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.play().catch(e => console.log("Play interrupted or failed:", e));
        } else {
            video.pause();
        }
    }, [isPlaying]);

    // Update progress during playback
    useEffect(() => {
        let frameId;
        const updateProgress = () => {
            if (isPlaying && videoRef.current && videoDuration) {
                const currentProgress = videoRef.current.currentTime / videoDuration;
                setProgress(currentProgress);
                if (currentProgress >= 0.99) {
                    setIsPlaying(false);
                    setProgress(0); // Reset to start point (right side)
                    if (videoRef.current) videoRef.current.currentTime = 0;
                }
            }
            frameId = requestAnimationFrame(updateProgress);
        };
        frameId = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(frameId);
    }, [isPlaying, videoDuration]);

    const scrubberRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || isPlaying || !scrubberRef.current) return;

        const scrubberRect = scrubberRef.current.getBoundingClientRect();
        const centerX = scrubberRect.left + scrubberRect.width / 2;
        const centerY = scrubberRect.top + scrubberRect.height / 2;

        const x = e.clientX - centerX;
        const y = e.clientY - centerY;

        let angle = Math.atan2(y, x) * (180 / Math.PI);

        // Map angle to the top half (-180 to 0 degrees)
        // -180 is Left, -90 is Top, 0 is Right
        if (angle > 0) {
            angle = (x < 0) ? -180 : 0;
        }

        // Invert for Right-to-Left: Progress 0 at 0 (right), 1 at -180 (left)
        const newProgress = Math.abs(angle) / 180;

        // Trigger logic: 5% manual, 6%+ auto-play
        if (newProgress >= 0.06) {
            setIsPlaying(true);
            setIsDragging(false);
        } else {
            const cappedProgress = Math.min(newProgress, 0.059);
            setProgress(cappedProgress);
            if (videoRef.current && videoDuration) {
                videoRef.current.currentTime = cappedProgress * videoDuration;
            }
        }
    }, [isDragging, isPlaying, videoDuration]);

    const handleMouseDown = () => {
        if (!isPlaying) setIsDragging(true);
    };

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove]);

    useEffect(() => {
        const handleDragStart = (e) => e.preventDefault();
        window.addEventListener('dragstart', handleDragStart);
        return () => window.removeEventListener('dragstart', handleDragStart);
    }, []);


    // Mouse Parallax for the Background Video
    useEffect(() => {
        const videoContainer = videoRef.current ? videoRef.current.parentElement : null;
        if (!videoContainer) return;

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const xPos = (clientX / window.innerWidth) - 0.5;
            const yPos = (clientY / window.innerHeight) - 0.5;

            // Shift in opposite direction
            gsap.to(videoContainer, {
                x: xPos * 40,
                y: yPos * 40,
                duration: 0.8,
                ease: "power2.out"
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="about-page"
            onContextMenu={(e) => e.preventDefault()}
            style={{
                backgroundColor: '#050505',
                position: 'relative',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                userSelect: 'none',
                WebkitUserSelect: 'none',
                msUserSelect: 'none',
                MozUserSelect: 'none'
            }}
        >
            {/* Sticky Hero Section */}
            <div style={{ height: '100vh', position: 'sticky', top: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '100%' }}>
                    {/* Background Video (The Car) */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0,
                        transform: 'scale(1.05)' // Ensure no edges are visible during parallax
                    }}>
                        <video
                            ref={videoRef}
                            muted
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        >
                            <source src="/Animation/Car_aniamtion.mp4" type="video/mp4" />
                        </video>

                        {/* Bottom Gradient Fade to hide the edge */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '20vh',
                            background: 'linear-gradient(to top, #050505 0%, transparent 100%)',
                            zIndex: 1,
                            pointerEvents: 'none'
                        }} />
                    </div>

                    {/* Content Overlay */}
                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '8rem 4rem 4rem 4rem', // Increased top padding from 4rem to 8rem
                        pointerEvents: 'none'
                    }}>
                        {/* Header Text */}
                        <div style={{ maxWidth: '40%', marginTop: '2rem' }}>
                            <motion.h1
                                initial={{ opacity: 0, y: -20 }}
                                animate={{
                                    opacity: isPlaying ? 0 : 1,
                                    y: isPlaying ? -20 : 0
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={{
                                    fontSize: '3.5rem',
                                    lineHeight: 0.9,
                                    fontWeight: 900,
                                    margin: 0,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.05em'
                                }}
                            >
                                REDISCOVER<br />
                                <span style={{ color: '#fff' }}>THE</span> CLASSICS
                            </motion.h1>
                        </div>

                        {/* Bottom Specifications Bar */}
                        <motion.div
                            animate={{ opacity: isPlaying ? 0 : 1 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '4rem',
                                marginTop: '2rem',
                                paddingTop: '2rem'
                            }}
                        >
                            {[
                                { label: 'ENGINE', value: 'V12 TWIN-TURBO' },
                                { label: 'CHASSIS', value: 'CARBON COMPOSITE' },
                                { label: 'YEAR', value: '1992 - REBORN' }
                            ].map((spec, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <span style={{
                                        display: 'block',
                                        fontSize: '0.6rem',
                                        letterSpacing: '0.3em',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {spec.label}
                                    </span>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.1em'
                                    }}>
                                        {spec.value}
                                    </span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Footer Text */}
                        <motion.div
                            animate={{ opacity: isPlaying ? 0 : 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ alignSelf: 'flex-end', maxWidth: '350px', textAlign: 'right' }}
                        >
                            <p style={{
                                fontSize: '0.7rem',
                                lineHeight: 1.6,
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Every curve, every line, meticulously reconstructed for the digital frontier.
                            </p>
                        </motion.div>
                    </div>

                    {/* Extra Large Centered Semi-Circle Scrubber UI */}
                    <motion.div
                        ref={scrubberRef}
                        className="scrubber-container"
                        animate={{
                            opacity: isPlaying ? 0 : 1,
                            pointerEvents: isPlaying ? 'none' : 'auto'
                        }}
                        transition={{ duration: 0.5 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 'min(120vh, 1000px)',
                            height: 'min(120vh, 1000px)',
                            zIndex: 20,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {/* SVG Semi-Circle Path (Top Half, Right to Left) */}
                        <svg width="100%" height="100%" viewBox="0 0 400 400">
                            <path
                                d="M 390,200 A 190,190 0 0 0 10,200"
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="1"
                            />
                            <motion.path
                                d="M 390,200 A 190,190 0 0 0 10,200"
                                fill="none"
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth="2"
                                strokeDasharray="596.9"
                                style={{ pathLength: smoothProgress }}
                            />
                        </svg>

                        {/* Scrubber Handle */}
                        {!isPlaying && (
                            <div
                                onMouseDown={handleMouseDown}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    // Orbit: 180 (Left) to 0 (Right) across Top Arc
                                    // Radius is 190/400 = 47.5% of container width
                                    transform: `translate(-50%, -50%) rotate(${-progress * 180}deg) translateX(calc(min(120vh, 1000px) * 0.475))`,
                                    backgroundColor: isDragging ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    transition: isDragging ? 'none' : 'background-color 0.3s ease, transform 0.1s ease',
                                    pointerEvents: 'auto',
                                    zIndex: 30
                                }}
                            >
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 20px rgba(255,255,255,0.6)'
                                }} />

                                {/* Instructions Text */}
                                <div style={{
                                    position: 'absolute',
                                    top: '120%',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.3em',
                                    textTransform: 'uppercase',
                                    pointerEvents: 'none',
                                    textAlign: 'center'
                                }}>
                                    {progress < 0.05 ? 'SWIPE TO REVEAL' : 'ENGAGING'}
                                </div>
                            </div>
                        )}

                        {/* The handle and button are now part of the fading container above */}
                        {/* Manual Replay Button (Optional now since it auto-resets) */}
                        {progress > 0.95 && !isPlaying && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => {
                                    setProgress(0);
                                    if (videoRef.current) videoRef.current.currentTime = 0;
                                }}
                                style={{
                                    position: 'absolute',
                                    background: 'none',
                                    border: '1px solid white',
                                    color: 'white',
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '2rem',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2em',
                                    pointerEvents: 'auto',
                                    zIndex: 35
                                }}
                            >
                                Replay
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Center Play Indicator */}
                    <AnimatePresence>
                        {isPlaying && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.1 }}
                                exit={{ scale: 1.1, opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: 'clamp(5rem, 15vw, 12rem)',
                                    fontWeight: 900,
                                    pointerEvents: 'none',
                                    zIndex: 5,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.05em'
                                }}
                            >
                                DRIFTING
                            </motion.div>
                        )}
                    </AnimatePresence>


                </div>
            </div>

            {/* Featured Horizontal scrolling Gallery */}
            <div style={{ backgroundColor: '#050505', color: '#fff', position: 'relative', zIndex: 35 }}>
                <HorizontalGallery />
            </div>

            {/* Next Section: Heritage & Design */}
            <div style={{
                position: 'relative',
                zIndex: 40,
                backgroundColor: '#050505',
                padding: '10rem 4rem',
                minHeight: '100vh',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <h2 style={{
                            fontSize: 'clamp(3rem, 8vw, 6rem)',
                            fontWeight: 900,
                            lineHeight: 0.9,
                            marginBottom: '4rem',
                            letterSpacing: '-0.03em'
                        }}>
                            THE ARCHITECTURE<br />
                            <span>OF PERSISTENCE</span>
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '4rem'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.3em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Legacy</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                    Founded on the principle that true design never ages, Antigravity seeks to bridge the gap between
                                    historical excellence and future-proof technology. Our process is a dialogue with the past.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.3em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Philosophy</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                    We don't just restore; we reimagine. By integrating carbon-composite architectures and next-generation
                                    aerodynamics, we ensure that every classic is not just preserved, but evolved.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.3em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Future</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                    The road ahead is silent and electric, but it doesn't have to be clinical. We infuse digital soul
                                    into every analog heartbeat, creating an unmatched sensory experience.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default About;

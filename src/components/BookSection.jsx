import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Book3D from './Book3D';
import BannerScrollNav from './BannerScrollNav';

const tabs = [
  'Cover', 'Nardil', 'Skill-Lync', 'Sciencotonic', 'Expertise', 'Contact', 'Close'
];

const BookSection = ({ prevSectionRef }) => {
    const [activeTab, setActiveTab] = useState(0);
    const containerRef = useRef(null);
    const activeTabRef = useRef(activeTab);
    const lastTimeRef = useRef(0);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    // Handle scroll wheel event to turn pages when the section is centered
    useEffect(() => {
        const handleWheel = (e) => {
            const container = containerRef.current;
            if (!container) return;

            // Only turn pages if the section is mostly visible in the viewport
            const rect = container.getBoundingClientRect();
            const isMostlyVisible = rect.top > -window.innerHeight * 0.45 && rect.top < window.innerHeight * 0.45;
            if (!isMostlyVisible) return;

            // Prevent wheel action if interacting with interactive UI elements
            if (e.target && e.target.closest && e.target.closest('.ui-container')) return;

            const currentTab = activeTabRef.current;
            const delta = e.deltaY;
            const absDelta = Math.abs(delta);
            if (!delta || absDelta < 15) return; // Ignore accidental micro-scrolls

            const isFlippingForward = delta > 0 && currentTab < tabs.length - 1;
            const isFlippingBackward = delta < 0 && currentTab > 0;

            // If we are actively flipping pages, prevent normal page scroll
            if (isFlippingForward || isFlippingBackward) {
                e.stopPropagation();
                if (e.cancelable !== false) {
                    e.preventDefault();
                }

                // Auto-center the container if it's slightly off to prevent drift
                if (Math.abs(rect.top) > 10) {
                    container.scrollIntoView({ behavior: 'smooth' });
                }

                const now = Date.now();
                const cooldown = 400; // Cooldown for page flip animation sync

                if (now - lastTimeRef.current >= cooldown) {
                    if (isFlippingForward) {
                        setActiveTab(prev => Math.min(prev + 1, tabs.length - 1));
                    } else {
                        setActiveTab(prev => Math.max(prev - 1, 0));
                    }
                    lastTimeRef.current = now;
                }
            }
        };

        const element = containerRef.current;
        if (element) {
            // Must be non-passive to allow e.preventDefault() to override scrolling
            element.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (element) {
                element.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    const handleScreenClick = (e) => {
        // Ignore clicks on UI controls or the HTML elements inside the book
        if (
            e.target.tagName.toLowerCase() === 'button' || 
            e.target.tagName.toLowerCase() === 'input' || 
            e.target.tagName.toLowerCase() === 'select' ||
            e.target.closest('.ui-container') ||
            e.target.closest('.book-html-content')
        ) {
            return;
        }

        const clickX = e.clientX;
        const screenWidth = window.innerWidth;
        
        if (clickX > screenWidth / 2) {
            setActiveTab(prev => Math.min(prev + 1, tabs.length - 1));
        } else {
            setActiveTab(prev => Math.max(prev - 1, 0));
        }
    };

    return (
        <section 
            ref={containerRef} 
            onClick={handleScreenClick} 
            style={{ 
                position: 'relative', 
                width: '100vw', 
                height: '100vh', 
                background: 'linear-gradient(to bottom, #ffffff, #fcfcfc)', 
                overflow: 'hidden' 
            }}
        >
            {/* Title Block matching the PLUS FIELD styling */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '8%',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <h1 style={{
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    fontWeight: 900,
                    color: '#000000',
                    margin: 0,
                    letterSpacing: '-0.04em',
                    lineHeight: '0.9'
                }}>
                    Ranjith S
                </h1>
                <p style={{
                    fontSize: '0.85rem',
                    color: '#666666',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    marginTop: '1rem',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    Work Page Experience
                </p>
            </div>

            {/* 3D Canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <Canvas camera={{ position: [0, 2.2, 8.5], fov: 45 }} style={{ background: 'transparent' }}>
                    <ambientLight intensity={0.9} color="#ffffff" />
                    <directionalLight 
                        position={[5, 12, 8]} 
                        intensity={1.5} 
                        color="#ffffff" 
                        castShadow 
                        shadow-mapSize={[1024, 1024]} 
                        shadow-bias={-0.0001} 
                    />
                    
                    <Book3D activeTab={activeTab} fontFamily="Inter, sans-serif" />
                    
                    <OrbitControls 
                        enablePan={false}
                        enableZoom={false}
                        minDistance={3}
                        maxDistance={15}
                        maxPolarAngle={Math.PI / 2 + 0.1}
                    />
                    
                    <Environment preset="studio" />
                </Canvas>
            </div>

            {/* Instruction tooltip */}
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '8%',
                zIndex: 10,
                textAlign: 'right',
                pointerEvents: 'none'
            }}>
                <p style={{ color: '#000000', fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    Scroll to flip pages<br />
                    Click canvas or tabs to navigate
                </p>
            </div>

            {/* Tab Selection Bar */}
            <div className="ui-container" style={{ 
                position: 'absolute', 
                bottom: '40px', 
                left: 0, 
                width: '100%', 
                zIndex: 10, 
                display: 'flex', 
                justifyContent: 'center',
                padding: '0 20px'
            }}>
                <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px',
                    borderRadius: '50px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    gap: '5px',
                    overflowX: 'auto',
                    maxWidth: '90%',
                    scrollbarWidth: 'none'
                }}>
                    {tabs.map((tab, idx) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(idx)}
                            style={{
                                padding: '8px 18px',
                                border: 'none',
                                borderRadius: '30px',
                                backgroundColor: activeTab === idx ? '#111111' : 'transparent',
                                color: activeTab === idx ? '#ffffff' : '#555555',
                                fontWeight: activeTab === idx ? '700' : '550',
                                fontSize: '0.85rem',
                                fontFamily: 'Inter, sans-serif',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation Overlay */}
            <BannerScrollNav 
                targetRef={containerRef}
                prevTargetRef={prevSectionRef}
                prevLabel="PREVIOUS SECTION"
                nextPageRoute="/creator"
                label="GO TO CREATOR PAGE"
            />
        </section>
    );
};

export default BookSection;

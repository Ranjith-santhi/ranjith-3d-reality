import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Book3D from '../components/Book3D';
import BannerScrollNav from '../components/BannerScrollNav';

const tabs = [
  'Cover', 'Nardil', 'Skill-Lync', 'Sciencotonic', 'Expertise', 'Contact', 'Close'
];

const Wireframe = ({ externalBgColor, onBookComplete, initialTab }) => {
    const [activeTab, setActiveTab] = useState(() => {
        const startPage = sessionStorage.getItem('book_start_page');
        if (startPage === 'end') {
            sessionStorage.removeItem('book_start_page');
            return tabs.length - 1; // End page when returning from Creator
        }
        return initialTab !== undefined ? initialTab : 0; // Front page (Intro) by default
    });
    const [textSizeScale, setTextSizeScale] = useState(2.1);
    const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
    const [bgColor, setBgColor] = useState('#ffffff');
    const containerRef = useRef(null);
    const activeTabRef = useRef(activeTab);

    useEffect(() => {
        const startPage = sessionStorage.getItem('book_start_page');
        if (startPage === 'end') {
            sessionStorage.removeItem('book_start_page');
            setActiveTab(tabs.length - 1);
        }
    }, []);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        if (externalBgColor) {
            setBgColor(externalBgColor);
        }
    }, [externalBgColor]);

    // Scroll & Wheel event listener for 3D Book page flipping
    useEffect(() => {
        let lastTime = 0;

        const handleWheel = (e) => {
            const container = containerRef.current;
            if (!container) return;

            // ONLY start turning pages after the 3D book section is fully visible / centered on screen
            const rect = container.getBoundingClientRect();
            const isFullyVisible = Math.abs(rect.top) <= 80;
            if (!isFullyVisible) return;

            // Ignore if mouse is interacting with UI dropdowns/inputs
            if (e.target && e.target.closest && e.target.closest('.ui-container')) return;

            const currentTab = activeTabRef.current;
            const delta = e.deltaY;
            const absDelta = Math.abs(delta);
            if (!delta || absDelta < 25) return; // Require intentional scroll force

            const now = Date.now();
            // Smooth, controlled cooldown (380ms) for elegant one-by-one page turns
            const cooldown = 380;

            if (delta > 0 && currentTab < tabs.length - 1) {
                if (now - lastTime >= cooldown) {
                    setActiveTab(prev => Math.min(prev + 1, tabs.length - 1));
                    lastTime = now;
                }
            } else if (delta < 0 && currentTab > 0) {
                if (now - lastTime >= cooldown) {
                    setActiveTab(prev => Math.max(prev - 1, 0));
                    lastTime = now;
                }
            }
        };

        const element = containerRef.current;
        if (element) {
            element.addEventListener('wheel', handleWheel, { passive: true });
        }
        return () => {
            if (element) {
                element.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    const handleScreenClick = (e) => {
        // Ignore if clicking on interactive UI elements
        if (e.target.tagName.toLowerCase() === 'button' || 
            e.target.tagName.toLowerCase() === 'input' || 
            e.target.tagName.toLowerCase() === 'select' ||
            e.target.closest('.ui-container') ||
            e.target.closest('.book-html-content')) {
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
        <div ref={containerRef} onClick={handleScreenClick} style={{ position: 'relative', width: '100vw', height: '100vh', background: '#ffffff', overflow: 'hidden' }}>
            
            {/* Header Overlay */}
            <div style={{ position: 'absolute', top: '40px', left: 0, width: '100%', zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>
                <p style={{ color: '#111', margin: 0, fontFamily: fontFamily, fontSize: '1.2rem', fontWeight: 600 }}>Interactive 3D Book Slider</p>
            </div>

            {/* Customization Menu */}
            <div className="ui-container wireframe-ui-container" style={{ 
                position: 'absolute', 
                top: '140px', 
                right: '20px', 
                background: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(10px)', 
                padding: '20px', 
                borderRadius: '15px', 
                zIndex: 20, 
                color: '#111111',
                fontFamily: 'Inter, sans-serif',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
            }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#111111' }}>Text Scale</label>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.1" 
                        value={textSizeScale}
                        onChange={(e) => setTextSizeScale(parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#111111' }}>Typography</label>
                    <select 
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(240, 240, 240, 0.9)',
                            color: '#111111',
                            border: '1px solid rgba(0, 0, 0, 0.15)',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="Inter, sans-serif" style={{ color: '#000' }}>Inter (Modern)</option>
                        <option value="serif" style={{ color: '#000' }}>Serif (Classic)</option>
                        <option value="'Courier New', Courier, monospace" style={{ color: '#000' }}>Typewriter</option>
                        <option value="'Comic Sans MS', cursive, sans-serif" style={{ color: '#000' }}>Comic Sans</option>
                        <option value="Impact, fantasy" style={{ color: '#000' }}>Impact</option>
                    </select>
                </div>
            </div>

            {/* 3D Canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <Canvas camera={{ position: [0, 2, 8], fov: 45 }} style={{ background: '#ffffff' }}>
                    <color attach="background" args={['#ffffff']} />
                    <ambientLight intensity={0.9} color="#ffffff" />
                    <directionalLight 
                        position={[5, 12, 8]} 
                        intensity={1.5} 
                        color="#ffffff" 
                        castShadow 
                        shadow-mapSize={[2048, 2048]} 
                        shadow-bias={-0.0001} 
                    />

                    
                    <Book3D activeTab={activeTab} textSizeScale={textSizeScale} fontFamily={fontFamily} />
                    
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

            {/* Bottom Navigation */}
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
                    padding: '10px',
                    borderRadius: '50px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    gap: '5px',
                    overflowX: 'auto',
                    maxWidth: '100%'
                }}>
                    {tabs.map((tab, idx) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(idx)}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '30px',
                                backgroundColor: activeTab === idx ? '#111111' : 'transparent',
                                color: activeTab === idx ? '#ffffff' : '#666666',
                                fontWeight: activeTab === idx ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            
            <BannerScrollNav 
                prevPageRoute="/creator" 
                prevLabel="GO TO CREATOR PAGE" 
                nextPageRoute="/foundations" 
                label="GO TO FOUNDATIONS PAGE" 
            />
        </div>
    );
};

export default Wireframe;

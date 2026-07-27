import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import Book3D from '../components/Book3D';

const tabs = [
  'Intro', 'Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5', 'Page 6', 'Page 7', 'Page 8', 'Page 9', 'Close'
];

const Wireframe = ({ externalBgColor }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [textSizeScale, setTextSizeScale] = useState(1.0);
    const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
    const [bgColor, setBgColor] = useState('#4a457c');

    React.useEffect(() => {
        if (externalBgColor) {
            setBgColor(externalBgColor);
        }
    }, [externalBgColor]);

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
        <div onClick={handleScreenClick} style={{ position: 'relative', width: '100vw', height: '100vh', background: '#ffffff', overflow: 'hidden' }}>
            
            {/* Header Overlay */}
            <div style={{ position: 'absolute', top: '40px', left: 0, width: '100%', zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>
                <p style={{ color: '#111', margin: 0, fontFamily: fontFamily, fontSize: '1.2rem', fontWeight: 600 }}>Interactive 3D Book Slider</p>
            </div>

            {/* Customization Menu */}
            <div className="ui-container" style={{ 
                position: 'absolute', 
                top: '140px', 
                right: '20px', 
                background: 'rgba(0, 0, 0, 0.85)', 
                backdropFilter: 'blur(10px)', 
                padding: '20px', 
                borderRadius: '15px', 
                zIndex: 20, 
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 10px 30px rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>Text Scale</label>
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
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>Typography</label>
                    <select 
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            color: '#ffffff',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
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
                        <option value="Inter, sans-serif">Inter (Modern)</option>
                        <option value="serif">Serif (Classic)</option>
                        <option value="'Courier New', Courier, monospace">Typewriter</option>
                        <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans</option>
                        <option value="Impact, fantasy">Impact</option>
                    </select>
                </div>
            </div>

            {/* 3D Canvas */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <Canvas camera={{ position: [0, 2, 8], fov: 45 }} style={{ background: '#000000' }}>
                    <color attach="background" args={['#000000']} />
                    <ambientLight intensity={0.8} color="#ffffff" />
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
                    
                    <ContactShadows 
                        position={[0, -0.5, 0]} 
                        opacity={0.4} 
                        scale={20} 
                        blur={2} 
                        far={5} 
                    />
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
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '10px',
                    borderRadius: '50px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
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
                                backgroundColor: activeTab === idx ? '#111' : 'transparent',
                                color: activeTab === idx ? '#fff' : '#444',
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
            
        </div>
    );
};

export default Wireframe;

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import PlusBanner from '../components/PlusBanner';
import BannerScrollNav from '../components/BannerScrollNav';
import BookSection from '../components/BookSection';

const THEMES = [
    { primary: '#8b5cf6', accent: '#ffffff', bg: '#050010', textSub: '#c4b5fd', shadowRgb: '139, 92, 246', bottomBg: '#2a1a4a' }, // 0: Purple
    { primary: '#06b6d4', accent: '#ffffff', bg: '#000814', textSub: '#a5f3fc', shadowRgb: '6, 182, 212', bottomBg: '#1e4052' },   // 1: Cyan
    { primary: '#ef4444', accent: '#ffffff', bg: '#100000', textSub: '#fca5a5', shadowRgb: '239, 68, 68', bottomBg: '#4a1e1e' },   // 2: Red
    { primary: '#10b981', accent: '#ffffff', bg: '#001005', textSub: '#6ee7b7', shadowRgb: '16, 185, 129', bottomBg: '#18382c' },  // 3: Emerald
    { primary: '#f59e0b', accent: '#ffffff', bg: '#1a0f00', textSub: '#fde68a', shadowRgb: '245, 158, 11', bottomBg: '#4a381e' },  // 4: Amber
];

const Home = () => {
    const [themeIndex, setThemeIndex] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const location = useLocation();
    const [isFadingIn, setIsFadingIn] = useState(() => {
        return sessionStorage.getItem('from_creator') === 'true' || location.state?.fromCreator || false;
    });
    const navigate = useNavigate();

    const heroRef = useRef(null);
    const plusRef = useRef(null);
    const bookRef = useRef(null);

    useEffect(() => {
        if (isFadingIn) {
            const timer = setTimeout(() => {
                setIsFadingIn(false);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isFadingIn]);

    useEffect(() => {
        document.body.style.backgroundColor = '#000000';
        if (!location.hash) {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: true });
            }
        }
    }, [location]);

    const handleThemeChange = () => {
        setThemeIndex((prev) => (prev + 1) % THEMES.length);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Fullscreen Smooth Fade Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#000000',
                zIndex: 99999,
                pointerEvents: (isFadingOut || isFadingIn) ? 'auto' : 'none',
                opacity: (isFadingOut || isFadingIn) ? 1 : 0,
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />

            {/* Hero Section */}
            <div ref={heroRef} style={{ position: 'relative' }}>
                <Hero themeIndex={themeIndex} onThemeChange={handleThemeChange} THEMES={THEMES} />
                <BannerScrollNav targetRef={heroRef} nextTargetRef={plusRef} label="NEXT SECTION" hidePrev={true} />
            </div>

            {/* Plus Banner Section */}
            <div ref={plusRef} style={{ position: 'relative' }}>
                <PlusBanner />
                <BannerScrollNav 
                    targetRef={plusRef} 
                    prevTargetRef={heroRef} 
                    prevLabel="PREVIOUS SECTION" 
                    nextTargetRef={bookRef} 
                    label="NEXT SECTION" 
                />
            </div>

            {/* 3D Book Section */}
            <div ref={bookRef} style={{ position: 'relative' }}>
                <BookSection prevSectionRef={plusRef} />
            </div>
        </div>
    );
};

export default Home;

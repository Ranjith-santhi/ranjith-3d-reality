import React from 'react';
import Hero from '../components/Hero';
import Wireframe from './Wireframe';

const THEMES = [
    { primary: '#8b5cf6', accent: '#ffffff', bg: '#050010', textSub: '#c4b5fd', shadowRgb: '139, 92, 246', bottomBg: '#2a1a4a' }, // 0: Purple
    { primary: '#06b6d4', accent: '#ffffff', bg: '#000814', textSub: '#a5f3fc', shadowRgb: '6, 182, 212', bottomBg: '#1e4052' },   // 1: Cyan
    { primary: '#ef4444', accent: '#ffffff', bg: '#100000', textSub: '#fca5a5', shadowRgb: '239, 68, 68', bottomBg: '#4a1e1e' },   // 2: Red
    { primary: '#10b981', accent: '#ffffff', bg: '#001005', textSub: '#6ee7b7', shadowRgb: '16, 185, 129', bottomBg: '#18382c' },  // 3: Emerald
    { primary: '#f59e0b', accent: '#ffffff', bg: '#1a0f00', textSub: '#fde68a', shadowRgb: '245, 158, 11', bottomBg: '#4a381e' },  // 4: Amber
];

const Home = () => {
    const [themeIndex, setThemeIndex] = React.useState(0);

    React.useEffect(() => {
        document.body.style.backgroundColor = '#000000';
    }, []);

    const handleThemeChange = () => {
        setThemeIndex((prev) => (prev + 1) % THEMES.length);
    };

    return (
        <div>
            <Hero themeIndex={themeIndex} onThemeChange={handleThemeChange} THEMES={THEMES} />
            <Wireframe externalBgColor={THEMES[themeIndex].bottomBg} />
        </div>
    );
};

export default Home;

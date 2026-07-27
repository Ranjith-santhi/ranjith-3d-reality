import React from 'react';
import ScrollSequence from './ScrollSequence';

const Hero = ({ themeIndex, onThemeChange, THEMES }) => {
    return (
        <section className="hero-section" style={{ padding: 0, backgroundColor: '#ffffff', color: '#000000' }}>
            <ScrollSequence 
                externalThemeIndex={themeIndex} 
                onExternalThemeChange={onThemeChange} 
                externalThemes={THEMES} 
            />
        </section>
    );
};

export default Hero;

import React from 'react';
import AnimationShape from '../components/AnimationShape';
import CubeSection from '../components/CubeSection';
import SeaBanner from '../components/SeaBanner';

const Contact = () => {
    return (
        <div style={{ position: 'relative', width: '100vw', backgroundColor: '#050505', minHeight: '300vh' }}>
            {/* Hero Section */}
            <section style={{ height: '100vh', position: 'relative' }}>
                <AnimationShape />
            </section>

            {/* Cube Section */}
            <div>
                <CubeSection />
            </div>
            {/* Sea Banner (Benthic Core) */}
            <SeaBanner />
        </div>
    );
};

export default Contact;

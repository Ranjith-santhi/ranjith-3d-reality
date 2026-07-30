import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import CubeSection from '../components/CubeSection';
import HorizontalGallery from '../components/HorizontalGallery';
import BannerScrollNav from '../components/BannerScrollNav';

const StructuralSweep = () => {
    const cubeRef = useRef(null);
    const galleryRef = useRef(null);
    const archRef = useRef(null);

    return (
        <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
            {/* 3D Structural Sweep Cube Section */}
            <div ref={cubeRef} style={{ position: 'relative' }}>
                <CubeSection />
                <BannerScrollNav 
                    targetRef={cubeRef} 
                    prevPageRoute="/symmetry" 
                    prevLabel="GO TO SYMMETRY PAGE" 
                    nextTargetRef={galleryRef} 
                    label="NEXT SECTION" 
                />
            </div>

            {/* Featured Horizontal scrolling Gallery */}
            <div ref={galleryRef} style={{ backgroundColor: '#050505', color: '#fff', position: 'relative', zIndex: 35 }}>
                <HorizontalGallery />
                <BannerScrollNav 
                    targetRef={galleryRef} 
                    prevTargetRef={cubeRef} 
                    prevLabel="PREVIOUS SECTION" 
                    nextTargetRef={archRef} 
                    label="NEXT SECTION" 
                />
            </div>

            {/* Architecture of Persistence Section */}
            <div ref={archRef} style={{
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
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
                                    Founded on the principle that true design never ages, Antigravity seeks to bridge the gap between
                                    historical excellence and future-proof technology. Our process is a dialogue with the past.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.3em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Philosophy</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
                                    We don't just restore; we reimagine. By integrating carbon-composite architectures and next-generation
                                    aerodynamics, we ensure that every classic is not just preserved, but evolved.
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.3em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Future</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
                                    The road ahead is silent and electric, but it doesn't have to be clinical. We infuse digital soul
                                    into every analog heartbeat, creating an unmatched sensory experience.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <BannerScrollNav 
                    targetRef={archRef} 
                    prevTargetRef={galleryRef} 
                    prevLabel="PREVIOUS SECTION" 
                    hideNext={true} 
                />
            </div>
        </div>
    );
};

export default StructuralSweep;

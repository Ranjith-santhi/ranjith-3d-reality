import React, { useEffect } from 'react';
import StadiumHeroModel from '../components/StadiumModel';
import { motion } from 'framer-motion';

const Animation = () => {
    useEffect(() => {
        document.title = "Animation | Antigravity";
    }, []);

    return (
        <div className="animation-page">
            <section className="animation-hero">
                <div className="hero-content">
                    <motion.h1 
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Kinetic <span className="accent">Links</span>
                    </motion.h1>
                    <motion.p 
                        className="hero-description"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Experience the fluid dynamics of our interactive link system. 
                        A physics-driven study on weight, gravity, and the reactive boundaries of digital structures.
                    </motion.p>
                </div>
                
                <div className="canvas-container">
                    <StadiumHeroModel />
                </div>

                <div className="hero-scroll-indicator">
                    <motion.div 
                        className="mouse"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="wheel"></div>
                    </motion.div>
                    <span>Scroll to Explore</span>
                </div>
            </section>

            <section className="animation-details container">
                <div className="details-grid">
                    <motion.div 
                        className="detail-item"
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: -50 }}
                        viewport={{ once: true }}
                    >
                        <span className="detail-num">01</span>
                        <h3 className="detail-heading">Linked Physics</h3>
                        <p>Every element in our ecosystem is bound by interactive constraints, ensuring that movement in one part resonates through the entire structure.</p>
                    </motion.div>
                    <motion.div 
                        className="detail-item"
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: 50 }}
                        viewport={{ once: true }}
                    >
                        <span className="detail-num">02</span>
                        <h3 className="detail-heading">Sequential Flow</h3>
                        <p>Logic follows a linear yet flexible path, allowing for complex interactions that maintain structural clarity and performance.</p>
                    </motion.div>
                </div>
            </section>

            <style>{`
                .animation-page {
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    min-height: 200vh;
                }

                .animation-hero {
                    height: 100vh;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    padding-bottom: 5vh;
                }

                .hero-content {
                    position: relative;
                    z-index: 10;
                    text-align: center;
                    max-width: 800px;
                    pointer-events: none;
                }

                .hero-title {
                    font-size: clamp(3rem, 10vw, 7rem);
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.03em;
                    line-height: 1;
                    text-transform: uppercase;
                }

                .hero-title .accent {
                    color: var(--accent-color);
                    background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-description {
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    max-width: 500px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                .canvas-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }

                .hero-scroll-indicator {
                    position: absolute;
                    bottom: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    z-index: 10;
                }

                .mouse {
                    width: 24px;
                    height: 40px;
                    border: 2px solid var(--text-muted);
                    border-radius: 12px;
                    position: relative;
                }

                .wheel {
                    width: 3px;
                    height: 8px;
                    background-color: var(--accent-color);
                    border-radius: 2px;
                    position: absolute;
                    top: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .animation-details {
                    padding: 15vh 0;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                }

                .detail-item {
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    padding-left: 2rem;
                }

                .detail-num {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--accent-color);
                    margin-bottom: 1rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                }

                .detail-heading {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }

                .detail-item p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                    line-height: 1.7;
                }

                @media (max-width: 768px) {
                    .details-grid {
                        grid-template-columns: 1fr;
                    }
                    .hero-title {
                        font-size: 4rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Animation;

import React, { useEffect } from 'react';
import Cloth3D from '../components/Cloth3D';
import { motion } from 'framer-motion';

const Fabric = () => {
    useEffect(() => {
        document.title = "Boundaries | Antigravity";
    }, []);

    return (
        <div className="fabric-page">
            <Cloth3D />
            
            <section className="info-overlay">
                <motion.div 
                    className="info-card"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    <h3>Limitless</h3>
                    <p>A geometric study on breaking structural constraints through chaotic yet ordered modular arrays.</p>
                </motion.div>
                
                <motion.div 
                    className="info-card"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 1 }}
                >
                    <h3>Violet Phase</h3>
                    <p>Exploring chromatic shifts and floating primitives arranged in an elliptical orbital formation.</p>
                </motion.div>
            </section>

            <style>{`
                .fabric-page {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                    background: #000;
                }
                
                .info-overlay {
                    position: absolute;
                    bottom: 10%;
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    padding: 0 10%;
                    pointer-events: none;
                }
                
                .info-card {
                    max-width: 300px;
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    padding: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1px;
                }
                
                .info-card h3 {
                    color: #8b5cf6;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    margin-bottom: 1rem;
                }
                
                .info-card p {
                    color: #999;
                    font-size: 0.9rem;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .info-overlay {
                        flex-direction: column;
                        gap: 1rem;
                        bottom: 5%;
                        align-items: center;
                    }
                    .info-card {
                        max-width: 80%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Fabric;

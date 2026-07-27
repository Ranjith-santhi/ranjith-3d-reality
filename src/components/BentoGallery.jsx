import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const projects = [
    { id: 1, title: "CYBER DYNAMICS", category: "Motion Design", src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "NEO TOKYO", category: "Architecture", src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "CHROME HEART", category: "Automotive", src: "https://images.unsplash.com/photo-1593642532744-937713517478?auto=format&fit=crop&q=80&w=800" },
    { id: 4, title: "DIGITAL SOUL", category: "Visuals", src: "https://images.unsplash.com/photo-1531297461736-2b4f899d4f48?auto=format&fit=crop&q=80&w=800" },
    { id: 5, title: "VOID RUNNER", category: "Web Design", src: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800" },
    { id: 6, title: "SILICON VALLEY", category: "Development", src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800" },
    { id: 7, title: "META STRUCTURE", category: "3D Art", src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800" },
    { id: 8, title: "URBAN PULSE", category: "Photography", src: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&q=80&w=800" },
    { id: 9, title: "GLITCH CORE", category: "Art Direction", src: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800" },
];

const BentoGallery = ({ showTitle = true }) => {
    const containerRef = useRef(null);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const columns = container.querySelectorAll('.bento-column');

        // Initial setup
        columns.forEach((col, i) => {
            if (i % 2 !== 0) {
                gsap.set(col, { y: 100 });
            }
        });

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                }
            });

            columns.forEach((col, i) => {
                const direction = i % 2 === 0 ? -1 : 1;
                tl.to(col, {
                    y: direction * 400,
                    ease: "none"
                }, 0);
            });
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} style={{
            minHeight: '100vh',
            padding: '4rem 2rem',
            backgroundColor: '#050505',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10
        }}>
            {showTitle && (
                <h2 style={{
                    textAlign: 'center',
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    marginBottom: '4rem',
                    color: 'white',
                    fontWeight: '900',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase'
                }}>
                    Projects Gallery
                </h2>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
                maxWidth: '1200px',
                margin: '0 auto',
                height: '80vh',
                overflow: 'hidden'
            }}>
                {[0, 1, 2].map((colIndex) => (
                    <div key={colIndex} className="bento-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {projects.slice(colIndex * 3, (colIndex + 1) * 3).map((project) => (
                            <motion.div
                                key={project.id}
                                layoutId={`card-${project.id}`}
                                onClick={() => setSelectedProject(project)}
                                className="bento-card"
                                style={{
                                    width: '100%',
                                    height: '350px',
                                    borderRadius: '0',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer'
                                }}
                                whileHover={{ y: -10 }}
                            >
                                <motion.img
                                    layoutId={`img-${project.id}`}
                                    src={project.src}
                                    alt={project.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div className="card-overlay" style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    padding: '2rem',
                                    opacity: 1,
                                    zIndex: 2
                                }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                                        {project.category}
                                    </span>
                                    <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
                                        {project.title}
                                    </h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 3000,
                            padding: '2rem'
                        }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProject(null)}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(5, 5, 5, 0.95)',
                                backdropFilter: 'blur(20px)',
                                zIndex: -1
                            }}
                        />

                        <motion.div
                            layoutId={`card-${selectedProject.id}`}
                            style={{
                                width: 'min(90vw, 800px)',
                                height: 'min(80vh, 600px)',
                                backgroundColor: '#111',
                                borderRadius: '0',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ position: 'relative', height: '60%' }}>
                                <motion.img
                                    layoutId={`img-${selectedProject.id}`}
                                    src={selectedProject.src}
                                    alt={selectedProject.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProject(null);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '1.5rem',
                                        width: '3rem',
                                        height: '3rem',
                                        borderRadius: '50%',
                                        border: 'none',
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 10
                                    }}
                                >
                                    ×
                                </motion.button>
                            </div>

                            <div style={{ padding: '3rem', flex: 1, backgroundColor: '#111' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                                        {selectedProject.category}
                                    </span>
                                    <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', margin: '1rem 0', letterSpacing: '-0.03em' }}>
                                        {selectedProject.title}
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '500px' }}>
                                        A deep dive into the architecture of performance and digital craftsmanship.
                                        Exploring the boundaries of modern design and automotive aesthetics.
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default BentoGallery;

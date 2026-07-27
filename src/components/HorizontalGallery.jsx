import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HorizontalGallery = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const trigger = triggerRef.current;

        const ctx = gsap.context(() => {
            gsap.to(section, {
                x: "-300vw", // Total width minus 1 view width (400vw - 100vw)
                ease: "none",
                scrollTrigger: {
                    trigger: trigger,
                    start: "top top",
                    end: "2000 top", // How long the horizontal scroll lasts
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1
                }
            });
        }, trigger);

        return () => ctx.revert();
    }, []);

    const items = [
        {
            id: 1,
            title: "VISION",
            subtitle: "THE ARCHITECTURE",
            img: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200"
        },
        {
            id: 2,
            title: "ENGINE",
            subtitle: "RAW PERFORMANCE",
            img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200"
        },
        {
            id: 3,
            title: "AERO",
            subtitle: "FLUID DYNAMICS",
            img: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&q=80&w=1200"
        },
        {
            id: 4,
            title: "SOUL",
            subtitle: "DIGITAL FRONTIER",
            img: "https://images.unsplash.com/photo-1511306764632-6705f1f0a28f?auto=format&fit=crop&q=80&w=1200"
        },
    ];

    return (
        <div ref={triggerRef} style={{ overflow: 'hidden', backgroundColor: '#050505' }}>
            <div ref={sectionRef} style={{
                height: '100vh',
                width: '400vw',
                display: 'flex',
                flexDirection: 'row',
                position: 'relative'
            }}>
                {items.map((item) => (
                    <div key={item.id} style={{
                        width: '100vw',
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        padding: '4rem'
                    }}>
                        <div style={{
                            width: '80%',
                            height: '70vh',
                            position: 'relative',
                            borderRadius: '1rem',
                            overflow: 'hidden',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
                        }}>
                            <img
                                src={item.img}
                                alt={item.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: '2rem',
                                left: '2rem',
                                zIndex: 2,
                                color: 'white'
                            }}>
                                <p style={{
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.4em',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                    opacity: 0.8
                                }}>
                                    {item.subtitle}
                                </p>
                                <h2 style={{
                                    fontSize: 'clamp(2rem, 6vw, 5rem)',
                                    fontWeight: 900,
                                    margin: 0,
                                    lineHeight: 1
                                }}>
                                    {item.title}
                                </h2>
                            </div>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                                zIndex: 1
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalGallery;

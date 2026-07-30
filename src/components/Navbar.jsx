import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
    { path: '/origin', label: 'Origin' },
    { path: '/creator', label: 'The Creator' },
    { path: '/animation', label: 'Animation' },
    { path: '/symmetry', label: 'Symmetry' }
];

const Navbar = () => {
    const location = useLocation();
    const [hoveredPath, setHoveredPath] = useState(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const activePath = NAV_ITEMS.some(item => item.path === location.pathname) 
        ? location.pathname 
        : (location.pathname === '/' ? '/origin' : location.pathname);

    return (
        <>
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 10000,
                    pointerEvents: 'none',
                    padding: '30px 60px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    mixBlendMode: 'difference' // Inverts text color automatically based on background brightness
                }}
            >
                {/* Left side: Logo */}
                <Link
                    to="/origin"
                    style={{
                        pointerEvents: 'auto',
                        textDecoration: 'none',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: "'Inter', sans-serif"
                    }}
                >
                    Ranjith S.
                </Link>

                {/* Right side: Nav links (Desktop) */}
                <nav style={{ pointerEvents: 'auto' }}>
                    <ul
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '35px',
                            listStyle: 'none',
                            margin: 0,
                            padding: 0
                        }}
                        className="nav-links-desktop"
                    >
                        {NAV_ITEMS.map((item) => {
                            const isActive = activePath === item.path;
                            const isHovered = hoveredPath === item.path;
                            const isWip = item.label === 'Animation' || item.label === 'Symmetry';

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onMouseEnter={() => setHoveredPath(item.path)}
                                        onMouseLeave={() => setHoveredPath(null)}
                                        style={{
                                            textDecoration: 'none',
                                            fontSize: '0.8rem',
                                            fontWeight: isActive ? 800 : 500,
                                            letterSpacing: '0.1em',
                                            color: '#ffffff',
                                            textTransform: 'uppercase',
                                            fontFamily: "'Inter', sans-serif",
                                            transition: 'opacity 0.25s ease',
                                            opacity: isActive ? 1 : (isHovered ? 0.9 : 0.6),
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <span>{item.label}</span>
                                        {isWip && (
                                            <span style={{ 
                                                color: '#ff3b30', 
                                                fontSize: '0.6rem', 
                                                fontWeight: 900,
                                                letterSpacing: '0.05em',
                                                textTransform: 'lowercase',
                                                marginLeft: '2px'
                                            }}>
                                                (wip)
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Mobile Toggle Button */}
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            textTransform: 'uppercase',
                            display: 'none'
                        }}
                        className="nav-mobile-toggle"
                    >
                        {isMobileOpen ? 'CLOSE' : 'MENU'}
                    </button>
                </nav>
            </header>

            {/* Mobile Navigation Dropdown Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.98)',
                            backdropFilter: 'blur(20px)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '30px',
                            pointerEvents: 'auto'
                        }}
                    >
                        {NAV_ITEMS.map((item) => {
                            const isActive = activePath === item.path;
                            const isWip = item.label === 'Animation' || item.label === 'Symmetry';
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileOpen(false)}
                                    style={{
                                        textDecoration: 'none',
                                        color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '1.3rem',
                                        fontWeight: isActive ? 800 : 500,
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        fontFamily: "'Inter', sans-serif",
                                        transition: 'all 0.2s ease',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>{item.label}</span>
                                    {isWip && (
                                        <span style={{ 
                                            color: '#ff3b30', 
                                            fontSize: '0.9rem', 
                                            fontWeight: 900,
                                            letterSpacing: '0.05em',
                                            textTransform: 'lowercase',
                                            marginLeft: '4px'
                                        }}>
                                            (wip)
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @media (max-width: 768px) {
                    .nav-links-desktop {
                        display: none !important;
                    }
                    .nav-mobile-toggle {
                        display: block !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Navbar;

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BannerScrollNav = ({ 
    targetRef, 
    nextTargetRef, 
    nextPageRoute, 
    label = "SCROLL DOWN",
    prevTargetRef,
    prevPageRoute,
    prevLabel = "PREVIOUS PAGE",
    hideNext = false,
    hidePrev = false
}) => {
    const navigate = useNavigate();

    const handleNext = () => {
        if (nextTargetRef && nextTargetRef.current) {
            nextTargetRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (nextPageRoute) {
            navigate(nextPageRoute);
        } else {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (prevTargetRef && prevTargetRef.current) {
            prevTargetRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (prevPageRoute) {
            navigate(prevPageRoute);
        } else {
            window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
        }
    };

    const showPrev = !hidePrev && (prevTargetRef || prevPageRoute);
    const showNext = !hideNext && (nextTargetRef || nextPageRoute || (!prevTargetRef && !prevPageRoute));

    return (
        <>
            {/* Top Previous Page / Section Button */}
            {showPrev && (
                <div 
                    className="nav-btn-top"
                    style={{
                        position: 'absolute',
                        top: '90px',
                        left: '30px',
                        zIndex: 999,
                        pointerEvents: 'auto'
                    }}
                >
                    <button
                        onClick={handlePrev}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 26px',
                            backgroundColor: 'rgba(15, 15, 20, 0.75)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '40px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            letterSpacing: '1.5px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            fontFamily: "'Inter', sans-serif"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(30, 30, 45, 0.9)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(15, 15, 20, 0.75)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                        }}
                    >
                        <ChevronUp size={18} style={{ animation: 'bounceUp 1.5s infinite' }} />
                        <span>{prevLabel}</span>
                    </button>
                </div>
            )}

            {/* Bottom Next Page / Section Button */}
            {showNext && (
                <div 
                    className="nav-btn-bottom"
                    style={{
                        position: 'absolute',
                        bottom: '30px',
                        right: '30px',
                        zIndex: 999,
                        pointerEvents: 'auto'
                    }}
                >
                    <button
                        onClick={handleNext}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 26px',
                            backgroundColor: 'rgba(15, 15, 20, 0.75)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '40px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            letterSpacing: '1.5px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            fontFamily: "'Inter', sans-serif"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(30, 30, 45, 0.9)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(15, 15, 20, 0.75)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                        }}
                    >
                        <span>{label}</span>
                        <ChevronDown size={18} style={{ animation: 'bounceDown 1.5s infinite' }} />
                    </button>
                </div>
            )}

            <style>{`
                @keyframes bounceDown {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(5px); }
                    60% { transform: translateY(3px); }
                }
                @keyframes bounceUp {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-5px); }
                    60% { transform: translateY(-3px); }
                }
            `}</style>
        </>
    );
};

export default BannerScrollNav;

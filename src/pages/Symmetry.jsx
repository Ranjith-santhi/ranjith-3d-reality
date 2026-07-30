import React, { useEffect } from 'react';
import KineticScene from '../components/KineticScene';
import BannerScrollNav from '../components/BannerScrollNav';

const Symmetry = () => {
    useEffect(() => {
        document.title = "Symmetry | Kinetic Sculpting";
    }, []);

    return (
        <div className="symmetry-page" style={{ position: 'relative' }}>
            <KineticScene />
            
            <BannerScrollNav 
                prevPageRoute="/animation" 
                prevLabel="GO TO ANIMATION PAGE" 
                hideNext={true} 
            />

            <style>{`
                .symmetry-page {
                    width: 100%;
                    height: 100vh;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default Symmetry;

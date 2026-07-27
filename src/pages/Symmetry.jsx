import React, { useEffect } from 'react';

import KineticScene from '../components/KineticScene';

const Symmetry = () => {
    useEffect(() => {
        document.title = "Symmetry | Kinetic Sculpting";
    }, []);

    return (
        <div className="symmetry-page">
            <KineticScene />
            
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

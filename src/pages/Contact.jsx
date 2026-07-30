import React, { useRef } from 'react';
import AnimationShape from '../components/AnimationShape';
import SeaBanner from '../components/SeaBanner';
import BannerScrollNav from '../components/BannerScrollNav';

const Contact = () => {
    const transmitRef = useRef(null);
    const seaRef = useRef(null);

    return (
        <div style={{ position: 'relative', width: '100vw', backgroundColor: '#000000', overflowX: 'hidden' }}>
            {/* Transmit Core Hero Section */}
            <div ref={transmitRef} style={{ position: 'relative', width: '100%', background: '#000000' }}>
                <AnimationShape />
                <BannerScrollNav 
                    targetRef={transmitRef} 
                    prevPageRoute="/structural-sweep" 
                    prevLabel="GO TO STRUCTURAL PAGE" 
                    nextTargetRef={seaRef} 
                    label="NEXT SECTION" 
                />
            </div>

            {/* Benthic Core (Sea Banner) Section */}
            <div ref={seaRef} style={{ position: 'relative', width: '100%', background: '#000000' }}>
                <SeaBanner />
                <BannerScrollNav 
                    targetRef={seaRef} 
                    prevTargetRef={transmitRef} 
                    prevLabel="PREVIOUS SECTION" 
                    nextPageRoute="/origin" 
                    label="GO TO ORIGIN PAGE" 
                />
            </div>
        </div>
    );
};

export default Contact;

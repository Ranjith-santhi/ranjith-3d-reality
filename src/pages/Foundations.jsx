import React, { useRef } from 'react';
import PlusBanner from '../components/PlusBanner';
import BannerScrollNav from '../components/BannerScrollNav';

const Foundations = () => {
    const plusRef = useRef(null);
    const blockRef = useRef(null);

    const colors = {
        blue: '#0d4eaf',
        green: '#43a028',
        red: '#bc141a'
    };

    const blockData = [
        [ { c: colors.blue, w: '200px' }, { c: colors.green, w: '120px' }, { c: colors.blue, w: '200px' } ],
        [ { c: colors.blue, w: '100px' }, { c: colors.red, w: '140px' },   { c: colors.green, w: '270px' } ],
        [ { c: colors.green, w: '110px' },{ c: colors.blue, w: '280px' },  { c: colors.red, w: '130px' } ],
        [ { c: colors.red, w: '270px' },  { c: colors.green, w: '250px' } ],
        [ { c: colors.green, w: '110px' },{ c: colors.blue, w: '400px' } ]
    ];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100vw',
            minHeight: '200vh',
            backgroundColor: '#ffffff',
            overflowX: 'hidden' 
        }}>
            <div ref={plusRef} style={{ position: 'relative' }}>
                <PlusBanner />
                <BannerScrollNav 
                    targetRef={plusRef} 
                    prevPageRoute="/creator" 
                    prevLabel="GO TO CREATOR PAGE" 
                    nextTargetRef={blockRef} 
                    label="NEXT SECTION" 
                />
            </div>
            
            <div ref={blockRef} style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}>
                <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
                    {blockData.map((row, rIdx) => (
                        <div key={rIdx} style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            marginBottom: '10px'
                        }}>
                            {row.map((item, cIdx) => (
                                <div key={cIdx} style={{
                                    width: item.w,
                                    height: '40px',
                                    margin: '0 5px',
                                    backgroundColor: item.c,
                                    borderRadius: '20px',
                                    boxShadow: 'inset 0 -3px 5px rgba(0,0,0,0.15)'
                                }} />
                            ))}
                        </div>
                    ))}
                </div>
                <BannerScrollNav 
                    targetRef={blockRef} 
                    prevTargetRef={plusRef} 
                    prevLabel="PREVIOUS SECTION" 
                    nextPageRoute="/in-motion" 
                    label="GO TO IN MOTION PAGE" 
                />
            </div>
        </div>
    );
};

export default Foundations;

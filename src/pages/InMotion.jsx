import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const InMotion = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const frameCount = 250;

  useEffect(() => {
    let loadedCount = 0;
    const imgArray = [];

    const preloadImages = () => {
      if (frameCount === 0) {
        setIsLoading(false);
        return;
      }

      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const filename = i.toString().padStart(5, '0') + '.jpg';
        // Correct path for the copied animation images
        img.src = `/Animation/Scroll%20Animation/${filename}`;

        const onLoadOrError = () => {
          loadedCount++;
          if (loadedCount === frameCount) {
            setIsLoading(false);
            ScrollTrigger.refresh();
          }
        };

        img.onload = onLoadOrError;
        img.onerror = onLoadOrError; // Continue even if an image fails
        imgArray.push(img);
      }
      setImages(imgArray);
    };

    preloadImages();
  }, []);

  const renderFrame = (index, imgList) => {
    const canvas = canvasRef.current;
    if (!canvas || imgList.length === 0) return;

    const ctx = canvas.getContext('2d');
    const safeIndex = Math.min(Math.max(Math.round(index), 0), frameCount - 1);
    const img = imgList[safeIndex];

    if (img && img.complete && img.naturalHeight !== 0) {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  };

  useEffect(() => {
    if (isLoading || images.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (images[0]) {
      if (images[0].complete) {
        renderFrame(0, images);
      } else {
        images[0].onload = () => renderFrame(0, images);
      }
    }

    const playhead = { frame: 0 };
    let st;

    const context = gsap.context(() => {
      const tl = gsap.timeline();

      // Main image sequence scrubbing
      tl.to(playhead, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        duration: 10, // A nominal duration, scrub length is actually determined by ScrollTrigger end.
        onUpdate: () => renderFrame(playhead.frame, images)
      }, 0);

      // Scroll indicator text scrubbing upwards
      tl.fromTo(".scroll-indicator", {
        y: 0,
        opacity: 1
      }, {
        y: -1000, 
        opacity: 0,
        duration: 5, // Tracks it moving up halfway through the sequence timescale
        ease: "none"
      }, 0);

      // Mouse Parallax effect for the canvas
      const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth) - 0.5;
        const yPos = (clientY / window.innerHeight) - 0.5;

        // Using opposite direction for parallax depth feel
        gsap.to(canvas, {
          x: xPos * 40, 
          y: yPos * 40,
          duration: 0.8,
          ease: "power2.out"
        });
      };

      window.addEventListener('mousemove', handleMouseMove);

      st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=10000", // Increased length for smoother scrolling
        pin: true,
        scrub: 1.5, // Subtle scrub delay
        animation: tl,
        anticipatePin: 1
      });

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }, container);

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderFrame(playhead.frame, images);
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      context.revert();
    };
  }, [isLoading, images]);

  return (
    <div style={{ backgroundColor: '#050505', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '100px', 
        width: '100%', 
        zIndex: 10, 
        textAlign: 'center', 
        pointerEvents: 'none' 
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          color: 'rgba(255,255,255,0.8)', 
          margin: 0, 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em' 
        }}>
          In Motion
        </h1>
      </div>

      <div ref={containerRef} style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
            zIndex: 1,
            transform: 'scale(1.05)'
          }}
        />

        <div className="scroll-indicator" style={{
            position: 'absolute',
            bottom: '100px', // Adjusted distance from the bottom
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#000000', // Black text
            fontSize: '1.5rem', 
            fontWeight: '800',
            fontFamily: 'sans-serif',
            zIndex: 100, 
            textShadow: '0 0 10px rgba(255,255,255,0.8)', // Ensures the text pops off the image background properly
            pointerEvents: 'none'
        }}>
            Hi all pls Scroll down
        </div>

        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(255,255,255,0.5)',
            zIndex: 20,
            fontSize: '1.5rem',
            fontFamily: 'sans-serif'
          }}>
            Loading Animation...
          </div>
        )}
      </div>
    </div>
  );
};

export default InMotion;

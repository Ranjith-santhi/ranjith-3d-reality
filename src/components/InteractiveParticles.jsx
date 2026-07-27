import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const ParticleMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uRandom: { value: 2.0 },
        uDepth: { value: 4.0 },
        uSize: { value: 1.5 },
        uTexture: { value: null },
        uTextureSize: { value: new THREE.Vector2(0, 0) },
        uTouch: { value: null },
        uColor: { value: new THREE.Color('#ff0033') }
    },
    vertexShader: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        attribute vec3 offset;
        attribute float pindex;
        attribute float angle;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uRandom;
        uniform float uDepth;
        uniform float uSize;
        uniform vec2 uTextureSize;
        uniform sampler2D uTexture;
        uniform sampler2D uTouch;

        varying vec2 vUv;
        varying vec2 vPUv;

        // Simple random function
        float random(float n) { 
            return fract(sin(n) * 43758.5453123);
        }

        void main() {
            vUv = uv;
            
            // Texture UV
            vec2 puv = offset.xy / uTextureSize;
            vPUv = puv;

            // Pixel displacement based on touch texture
            float t = texture2D(uTouch, puv).r;
            
            vec3 displaced = offset;
            
            // Random jitter
            displaced.xy += vec2(random(pindex) - 0.5, random(offset.x + pindex) - 0.5) * uRandom;
            
            // Z-axis movement (sin wave + touch)
            float rndz = (random(pindex) + sin(uTime * 0.5 + pindex * 0.1));
            displaced.z += rndz * (random(pindex) * 2.0 * uDepth);
            
            // Interaction displacement
            displaced.z += t * 30.0 * rndz;
            displaced.x += cos(angle) * t * 30.0 * rndz;
            displaced.y += sin(angle) * t * 30.0 * rndz;

            // Center the image (the offset is in pixel space)
            displaced.x -= uTextureSize.x * 0.5;
            displaced.y -= uTextureSize.y * 0.5;

            // Scale down from pixels to world units
            displaced *= 0.05;

            // Particle size based on brightness and touch
            vec4 colA = texture2D(uTexture, puv);
            float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;
            
            float psize = (sin(uTime * 2.0 + pindex) * 0.5 + 1.5);
            psize *= max(grey, 0.1);
            psize *= uSize;
            psize += t * 2.0;

            vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
            mvPosition.xyz += position * psize;
            
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        varying vec2 vPUv;
        uniform sampler2D uTexture;
        uniform vec3 uColor;

        void main() {
            vec4 col = texture2D(uTexture, vPUv);
            
            // Circle mask
            float dist = distance(vUv, vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = smoothstep(0.5, 0.4, dist);
            
            // Add some color flavor
            vec3 finalColor = mix(col.rgb, uColor, 0.2);
            
            gl_FragColor = vec4(finalColor, alpha * col.a);
        }
    `
};

const InteractiveParticles = ({ imagePath }) => {
    const { camera, mouse, scene } = useThree();
    const meshRef = useRef();
    const touchCanvasRef = useRef(document.createElement('canvas'));
    const touchTextureRef = useRef();
    const imageRef = useRef();
    const [points, setPoints] = useState({ count: 0, offsets: [], indices: [], angles: [], width: 0, height: 0 });

    // Load texture
    const texture = useTexture(imagePath);

    useEffect(() => {
        if (!texture) return;
        const img = texture.image;
        const w = img.width;
        const h = img.height;

        // Downsample for performance if needed (aiming for ~50k particles)
        const sampleRatio = Math.sqrt(40000 / (w * h));
        const canvasW = Math.floor(w * sampleRatio);
        const canvasH = Math.floor(h * sampleRatio);

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, 0, canvasW, -canvasH);

        const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
        const data = imgData.data;

        const indices = [];
        const offsets = [];
        const angles = [];
        let count = 0;

        const threshold = 34; // Discard dark pixels

        for (let i = 0; i < canvasW * canvasH; i++) {
            const r = data[i * 4];
            if (r > threshold) {
                offsets.push(i % canvasW, Math.floor(i / canvasW), 0);
                indices.push(i);
                angles.push(Math.random() * Math.PI * 2);
                count++;
            }
        }

        setPoints({
            count,
            offsets: new Float32Array(offsets),
            indices: new Float32Array(indices),
            angles: new Float32Array(angles),
            width: canvasW,
            height: canvasH
        });

        // Initialize touch canvas
        const tCanvas = touchCanvasRef.current;
        tCanvas.width = 64;
        tCanvas.height = 64;
        const tCtx = tCanvas.getContext('2d');
        tCtx.fillStyle = 'black';
        tCtx.fillRect(0, 0, 64, 64);
        touchTextureRef.current = new THREE.CanvasTexture(tCanvas);
    }, [texture]);

    const trail = useRef([]);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();

        // Update touch texture
        const tCanvas = touchCanvasRef.current;
        const tCtx = tCanvas.getContext('2d');
        tCtx.fillStyle = 'black';
        tCtx.globalAlpha = 0.1; // Fade out trail
        tCtx.fillRect(0, 0, 64, 64);
        tCtx.globalAlpha = 1.0;

        // Draw current touch point
        // Raycast to find position on the plane
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        // We assume a plane at z=0 for interaction
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
            // Map world point to 0-64 touch canvas
            // The world width is about width * 0.05
            const worldW = points.width * 0.05;
            const worldH = points.height * 0.05;
            
            const tx = (intersectPoint.x / worldW + 0.5) * 64;
            const ty = (intersectPoint.y / worldH + 0.5) * 64;

            const grad = tCtx.createRadialGradient(tx, ty, 0, tx, ty, 8);
            grad.addColorStop(0, 'white');
            grad.addColorStop(1, 'black');
            tCtx.fillStyle = grad;
            tCtx.beginPath();
            tCtx.arc(tx, ty, 8, 0, Math.PI * 2);
            tCtx.fill();
        }
        
        touchTextureRef.current.needsUpdate = true;
    });

    const geometry = useMemo(() => {
        if (points.count === 0) return null;
        const geo = new THREE.InstancedBufferGeometry();
        
        // Quad positions
        const positions = new Float32Array([
            -0.5, 0.5, 0,
            0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, -0.5, 0
        ]);
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // UVs
        const uvs = new Float32Array([
            0, 1,
            1, 1,
            0, 0,
            1, 0
        ]);
        geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        
        // Index
        geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

        // Instanced attributes
        geo.setAttribute('offset', new THREE.InstancedBufferAttribute(points.offsets, 3));
        geo.setAttribute('pindex', new THREE.InstancedBufferAttribute(points.indices, 1));
        geo.setAttribute('angle', new THREE.InstancedBufferAttribute(points.angles, 1));

        return geo;
    }, [points]);

    if (!geometry) return null;

    return (
        <mesh ref={meshRef}>
            <primitive object={geometry} attach="geometry" />
            <rawShaderMaterial
                args={[ParticleMaterial]}
                uniforms-uTexture-value={texture}
                uniforms-uTextureSize-value={new THREE.Vector2(points.width, points.height)}
                uniforms-uTouch-value={touchTextureRef.current}
                transparent={true}
                depthTest={false}
            />
        </mesh>
    );
};

export default InteractiveParticles;

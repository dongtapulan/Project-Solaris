import * as THREE from 'three';

export const scene = new THREE.Scene();

// 1. Atmospheric Deep Space Fog
// Gives depth to planetary distances and masks distant clipping seamlessly.
scene.fog = new THREE.FogExp2(0x020208, 0.00005); 

export const camera = new THREE.PerspectiveCamera(
    55, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    25000
);
camera.position.set(0, 250, 600);

export const renderer = new THREE.WebGLRenderer({ 
    antialias: true, // Enabled for clean polygon edges
    alpha: false,
    powerPreference: "high-performance",
    precision: "highp",
    stencil: false,
    depth: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Enhanced Color Management & Cinematic Tone Mapping
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25; 

/**
 * HIGH-FIDELITY LIGHTING SYSTEM
 */

// 1. Central Solar PointLight
// High-intensity light source simulating true inverse-square energy falloff from Sol.
const sunLight = new THREE.PointLight(0xfff5ea, 1200, 10000, 1.8); 
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// 2. Cosmic Ambient (Atmosphere Fill)
// Sky/Ground gradient ensures shadow sides are subtle indigo rather than pitch black.
const ambientLight = new THREE.HemisphereLight(0x1a2238, 0x05050a, 0.65); 
scene.add(ambientLight);

// 3. Dual Galactic Rim Lights
// Adds subtle edge highlights to illuminate planetary silhouettes against the dark void.
const primaryRimLight = new THREE.DirectionalLight(0x7f9cf5, 0.35);
primaryRimLight.position.set(600, 300, 500);
scene.add(primaryRimLight);

const secondaryRimLight = new THREE.DirectionalLight(0x93c5fd, 0.20);
secondaryRimLight.position.set(-600, -200, -500);
scene.add(secondaryRimLight);

/**
 * DYNAMIC STARFIELD GENERATOR
 */
function createStarfield() {
    const starCount = 6000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0x9bb0ff),
        new THREE.Color(0xffcc6f)
    ];

    for (let i = 0; i < starCount; i++) {
        const r = 8000 + Math.random() * 4000;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const starColor = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = starColor.r;
        colors[i * 3 + 1] = starColor.g;
        colors[i * 3 + 2] = starColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
    });

    const starParticles = new THREE.Points(geometry, material);
    scene.add(starParticles);
}

createStarfield();

export function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
import * as THREE from 'three';

export const scene = new THREE.Scene();

// 1. Subtle Space Fog
// Deep space black-blue fog to mask the far-clipping plane.
scene.fog = new THREE.FogExp2(0x000005, 0.00008); 

export const camera = new THREE.PerspectiveCamera(
    60, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    20000 // Far plane high enough for Kuiper/Oort reaches
);
camera.position.set(0, 200, 500);

export const renderer = new THREE.WebGLRenderer({ 
    antialias: false, // DISABLED: Major battery/heat saver for laptops
    alpha: true,
    powerPreference: "high-performance",
    precision: "mediump" // Sufficient for mobile/laptop displays
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Color Management
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0; 

/**
 * LIGHTING ENGINE
 * Optimized for "Dark Side" visibility without overheating.
 */

// 1. Core Sun Light (The Light Maker)
// We remove .castShadow = true because it requires rendering the scene multiple times.
// Instead, we use high intensity and a PointLight for natural falloff.
const sunLight = new THREE.PointLight(0xffffff, 800, 8000, 2); 
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// 2. Global Ambient (The "Fill" Light)
// HemisphereLight is great because it gives different colors to the poles,
// ensuring the "dark side" isn't 100% black so you can still see the silhouette.
const ambientLight = new THREE.HemisphereLight(0x111122, 0x000000, 0.5); 
scene.add(ambientLight);

// 3. Galactic Rim Light (The "Pop" Light)
// Very subtle blue light from a distant angle to catch the edges of the planets.
const galacticLight = new THREE.DirectionalLight(0x5555ff, 0.15);
galacticLight.position.set(500, 200, 500);
scene.add(galacticLight);

export function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
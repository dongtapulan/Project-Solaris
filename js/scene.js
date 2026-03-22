import * as THREE from 'three';

export const scene = new THREE.Scene();

// Subtle Space Fog: Helps with the sense of scale in the outer reaches
scene.fog = new THREE.FogExp2(0x000005, 0.00005); 

export const camera = new THREE.PerspectiveCamera(
    60, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    10000 // Increased far plane for the Kuiper Belt and beyond
);
camera.position.set(0, 200, 500);

export const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance" 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Physical Lighting & Tone Mapping
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; // Slightly boosted for better texture pop

// 1. Better Ambient Logic: HemisphereLight
// This simulates light bouncing off galactic dust. 
// Top is slightly blue-ish (space), bottom is neutral.
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.6); 
scene.add(ambientLight);

// 2. The Sun (Point Light)
// Use Physical Decay (2) for realistic light falloff.
// Intensity is higher because ACESFilmic compresses bright highlights.
const sunLight = new THREE.PointLight(0xffffff, 600, 5000, 2); 
sunLight.position.set(0, 0, 0);
// Enable shadows if your planet meshes are set to receive them
sunLight.castShadow = true; 
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
scene.add(sunLight);

// 3. Optional: Subtle Blue Rim Light
// Simulates distant star-clusters to give planets a "rim" highlight
const galacticLight = new THREE.DirectionalLight(0x4444ff, 0.1);
galacticLight.position.set(100, 100, 100);
scene.add(galacticLight);

export function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
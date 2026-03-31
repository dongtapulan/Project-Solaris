import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONFIG, SYSTEM_DATA } from './data.js';
import { scene, camera, renderer, handleResize } from './scene.js';
import { createStars, createOortCloud, buildSystem, loadingManager } from './entities.js';
import { initUI, updatePanel } from './ui.js';
import { initLoader } from './loader.js';
import { TimeEngine } from './utils/time.js'; 

// 1. Initialize Loading Screen
initLoader(loadingManager);

// 2. Initialize the Master Clock
const timeEngine = new TimeEngine();
// DEFAULT VELOCITY: Starting at 1x (Real-time)
timeEngine.timeScale = 1; 

// Append renderer to the DOM
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Setup OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 8000; 
controls.enablePan = true;

// 3. Initialize System Entities
createStars(scene);
const oortCloud = createOortCloud(scene); 
const objects = buildSystem(scene, SYSTEM_DATA);

let focusedObject = null;
const targetCameraPosition = new THREE.Vector3(0, 400, 800);

let isUserInteracting = false;
controls.addEventListener('start', () => { isUserInteracting = true; });
controls.addEventListener('end', () => { isUserInteracting = false; });

/**
 * Camera focus logic
 */
function focusOn(planetName) {
    const target = objects.find(o => o.data.name === planetName);
    if(!target) return;
    
    focusedObject = target;
    updatePanel(target.data);

    if (target.data.type === 'BELT') {
        // For Belts: Set a static overhead view to prevent the "Black Screen" crash
        const dist = target.data.outerRadius || 500;
        targetCameraPosition.set(0, dist * 1.5, dist * 1.2);
        controls.target.set(0, 0, 0); 
    } else {
        // For Planets: Calculate initial snap position
        const worldPos = new THREE.Vector3();
        target.mesh.getWorldPosition(worldPos);
        const offset = 20 + (target.data.size * (CONFIG.zoomFactor || 5));
        targetCameraPosition.set(worldPos.x + offset, worldPos.y + offset * 0.5, worldPos.z + offset);
        controls.target.copy(worldPos);
    }
}

function resetView() {
    focusedObject = null;
    targetCameraPosition.set(0, 500, 1000); 
    controls.target.set(0, 0, 0);
    updatePanel(SYSTEM_DATA[0]);
}

// Initialize UI with updated callbacks
initUI(SYSTEM_DATA, focusOn, resetView, timeEngine);
updatePanel(SYSTEM_DATA[0]);

window.addEventListener('resize', handleResize);

let lastTime = 0;

/**
 * Main Animation Loop
 */
function animate(currentTime) {
    requestAnimationFrame(animate);

    const deltaTime = (currentTime - lastTime) / 1000 || 0;
    lastTime = currentTime;

    timeEngine.update(deltaTime);

    // 1. Update Celestial Positions & Physics
    objects.forEach(obj => {
        if (obj.type === 'belt') {
            obj.mesh.rotation.y += (obj.data.speed || 0.0005) * (timeEngine.timeScale / 1000) * deltaTime; 
        } else if (obj.data.elements) {
            const centuries = timeEngine.getCenturiesSinceEpoch();
            const days = centuries * 36525.0;
            const { semiMajorAxis, eccentricity, meanLong, inclination } = obj.data.elements;

            const n = 0.9856076686 / Math.sqrt(Math.pow(semiMajorAxis, 3));
            let M = (meanLong + n * days) % 360;
            let radM = M * (Math.PI / 180);

            let E = radM;
            for(let i = 0; i < 3; i++) {
                E = E + (radM - (E - eccentricity * Math.sin(E))) / (1 - eccentricity * Math.cos(E));
            }

            const visualScale = obj.data.distance; 
            const xOrtho = (Math.cos(E) - eccentricity) * visualScale;
            const zOrtho = (Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(E)) * visualScale;

            obj.mesh.position.set(xOrtho, 0, zOrtho);

            if (inclination) {
                obj.group.rotation.x = inclination * (Math.PI / 180);
            }

            // Smooth Axial Rotation
            const rotationBase = (obj.data.rotationSpeed || 0.01);
            obj.mesh.rotation.y += rotationBase * (timeEngine.timeScale / 100) * deltaTime;

            if (obj.moons) {
                obj.moons.forEach(moon => {
                    moon.angle += (moon.data.speed || 0.04) * (timeEngine.timeScale / 1000) * deltaTime;
                    const mr = moon.data.distance;
                    moon.mesh.position.set(Math.cos(moon.angle) * mr, 0, Math.sin(moon.angle) * mr);
                });
            }
        }
    });

    // 2. STABILIZED Camera Tracking
    if (focusedObject && focusedObject.data.type !== 'BELT') {
        const worldPos = new THREE.Vector3();
        focusedObject.mesh.getWorldPosition(worldPos);
        
        controls.target.copy(worldPos); 
        
        if (!isUserInteracting) {
            const zoomDist = 20 + (focusedObject.data.size * (CONFIG.zoomFactor || 5));
            const idealPos = new THREE.Vector3().copy(worldPos);
            idealPos.x += zoomDist;
            idealPos.y += zoomDist * 0.5;
            idealPos.z += zoomDist;

            camera.position.lerp(idealPos, CONFIG.smoothness || 0.05);
        }
    } else if (!isUserInteracting) {
        // Smooth transition for Reset or Belt views
        camera.position.lerp(targetCameraPosition, CONFIG.smoothness || 0.05);
        if (focusedObject && focusedObject.data.type === 'BELT') {
            controls.target.lerp(new THREE.Vector3(0,0,0), 0.05);
        }
    }

    // Constraints
    const PAN_LIMIT = 5000; 
    if (controls.target.length() > PAN_LIMIT) {
        controls.target.setLength(PAN_LIMIT);
    }

    if (oortCloud) oortCloud.rotation.y += 0.00002;

    controls.update();
    renderer.render(scene, camera);
}

animate(performance.now());
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONFIG, SYSTEM_DATA } from './data.js';
import { scene, camera, renderer, handleResize } from './scene.js';
import { createStars, createOortCloud, buildSystem, loadingManager } from './entities.js';
import { initUI, updatePanel } from './ui.js';
import { initLoader } from './loader.js';
import { TimeEngine } from './utils/time.js'; 
import { fetchSolarWeather, fetchNEOs } from './utils/telemetry.js';

// 1. Initialize Loading Screen
initLoader(loadingManager);

// 2. Initialize the Master Clock
const timeEngine = new TimeEngine();
timeEngine.timeScale = 1; 

// Append renderer to the DOM
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Setup OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 15000; // Increased for Kuiper Belt visibility
controls.enablePan = true;

// 3. Initialize System Entities 
createStars(scene);
const oortCloud = createOortCloud(scene); 
const objects = buildSystem(scene, SYSTEM_DATA, camera);

let focusedObject = null;
const targetCameraPosition = new THREE.Vector3(0, 500, 1000);

let isUserInteracting = false;
controls.addEventListener('start', () => { isUserInteracting = true; });
controls.addEventListener('end', () => { isUserInteracting = false; });

/**
 * NASA DONKI & NEO Telemetry Integration
 */
async function updateTelemetry() {
    const solarData = await fetchSolarWeather();
    const cmeElement = document.getElementById('telemetry-cme');
    if (solarData && cmeElement) {
        const isSafe = solarData.note === "No recent CMEs";
        cmeElement.innerText = isSafe ? "NOMINAL" : "ACTIVITY DETECTED";
        cmeElement.style.color = isSafe ? "#4ade80" : "#f87171";
    }

    const neoData = await fetchNEOs();
    const neoElement = document.getElementById('telemetry-neo');
    if (neoElement) {
        if (neoData && neoData.length > 0) {
            neoElement.innerText = `${neoData.length} HAZARDOUS`;
            neoElement.style.color = "#f87171";
        } else {
            neoElement.innerText = "LOCAL SPACE CLEAR";
            neoElement.style.color = "#4ade80";
        }
    }
}

updateTelemetry();
setInterval(updateTelemetry, 300000);

/**
 * Camera Focus Logic - FIXED for Belts
 */
function focusOn(planetName) {
    const target = objects.find(o => o.data.name === planetName);
    if(!target) return;
    
    focusedObject = target;
    updatePanel(target.data);

    if (target.data.type === 'BELT') {
        // FIXED: Use distance fallback to prevent camera from flying into the void
        const orbitDist = target.data.distance || 600; 
        targetCameraPosition.set(0, orbitDist * 1.2, orbitDist * 1.8);
        controls.target.set(0, 0, 0); // Always center on Sun for belts
    } else {
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

initUI(SYSTEM_DATA, focusOn, resetView, timeEngine);
updatePanel(SYSTEM_DATA[0]);

window.addEventListener('resize', handleResize);

let lastTime = 0;

const ROTATION_DATA = {
    "Mercury": 0.017, "Venus": -0.004, "Earth": 1.0, "Mars": 0.97,
    "Jupiter": 2.41, "Saturn": 2.23, "Uranus": -1.39, "Neptune": 1.48, "Sun": 0.04
};

/**
 * Main Animation Loop
 */
function animate(currentTime) {
    requestAnimationFrame(animate);

    const deltaTime = (currentTime - lastTime) / 1000 || 0;
    lastTime = currentTime;

    timeEngine.update(deltaTime);

    const earthObj = objects.find(o => o.data.name === "Earth");
    const earthPos = new THREE.Vector3();
    if(earthObj) earthObj.mesh.getWorldPosition(earthPos);

    objects.forEach(obj => {
        if (obj.type === 'belt') {
            obj.mesh.rotation.y += (obj.data.speed || 0.0005) * (timeEngine.timeScale / 1000) * deltaTime; 
        } else if (obj.data.elements) {
            // ORBITAL PHYSICS
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

            if (inclination) obj.group.rotation.x = inclination * (Math.PI / 180);

            // AXIAL ROTATION
            const VISUAL_SPEED_SCALAR = 0.5; 
            const relRotationSpeed = ROTATION_DATA[obj.data.name] || 1.0;
            const rotationStep = relRotationSpeed * VISUAL_SPEED_SCALAR * timeEngine.timeScale * deltaTime;
            
            if (obj.data.name === "Uranus") obj.mesh.rotation.z += rotationStep;
            else obj.mesh.rotation.y += rotationStep;

            // MOON PHYSICS
            if (obj.moons) {
                obj.moons.forEach(moon => {
                    moon.angle += (moon.data.speed || 0.04) * (timeEngine.timeScale / 1000) * deltaTime;
                    const mr = moon.data.distance;
                    moon.mesh.position.set(Math.cos(moon.angle) * mr, 0, Math.sin(moon.angle) * mr);
                    moon.mesh.rotation.y += (moon.data.speed || 0.04) * (timeEngine.timeScale / 1000) * deltaTime;
                });
            }
        }
    });

    // HUD & TELEMETRY
    const dateEl = document.getElementById('telemetry-date');
    if (dateEl) dateEl.innerText = timeEngine.getFormattedTime();

    if (focusedObject) {
        const worldPos = new THREE.Vector3();
        
        // FIXED: Safe world position gathering
        if (focusedObject.data.type === 'BELT') {
            worldPos.set(0, 0, 0); // Focus Sun center for belts
        } else {
            focusedObject.mesh.getWorldPosition(worldPos);
        }
        
        const delayEl = document.getElementById('telemetry-delay');
        if (delayEl && earthObj) {
            if (focusedObject.data.name === "Earth") {
                delayEl.innerText = "INSTANTANEOUS";
            } else {
                const distanceInAU = earthPos.distanceTo(worldPos) / 90; 
                const lightSeconds = distanceInAU * 499; 
                const mins = Math.floor(lightSeconds / 60);
                const secs = Math.floor(lightSeconds % 60);
                delayEl.innerText = `${mins}m ${secs}s`;
            }
        }

        const coordEl = document.getElementById('target-coords');
        if (coordEl) coordEl.innerText = `X: ${worldPos.x.toFixed(3)} | Z: ${worldPos.z.toFixed(3)} (AU)`;

        // CAMERA LERPING
        if (!isUserInteracting) {
            controls.target.lerp(worldPos, 0.05);
            
            // FIXED: Ensure camera target isn't NaN
            const safeIdeal = new THREE.Vector3().copy(targetCameraPosition);
            if (focusedObject.data.type !== 'BELT') {
                const zoomDist = 20 + (focusedObject.data.size * (CONFIG.zoomFactor || 5));
                safeIdeal.copy(worldPos).add(new THREE.Vector3(zoomDist, zoomDist * 0.5, zoomDist));
            }
            camera.position.lerp(safeIdeal, 0.05);
        }
    } else if (!isUserInteracting) {
        camera.position.lerp(targetCameraPosition, 0.05);
        controls.target.lerp(new THREE.Vector3(0,0,0), 0.05);
    }

    if (oortCloud) oortCloud.rotation.y += 0.00002;
    controls.update();
    renderer.render(scene, camera);
}

animate(performance.now());
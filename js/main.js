import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONFIG, SYSTEM_DATA } from './data.js';
import { scene, camera, renderer, handleResize } from './scene.js';
import { createStars, buildSystem } from './entities.js';
import { initUI, updatePanel } from './ui.js';

// Append renderer to the DOM
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Setup OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 4000; 

// Initialize System
createStars(scene);
const objects = buildSystem(scene, SYSTEM_DATA);

let focusedObject = null;
const targetCameraPosition = new THREE.Vector3();
targetCameraPosition.copy(camera.position);

/**
 * Camera focus logic
 */
function focusOn(planetName) {
    const target = objects.find(o => o.data.name === planetName);
    if(!target) return;
    
    focusedObject = target;
    updatePanel(target.data);

    if (target.data.type === 'BELT') {
        const dist = target.data.outerRadius;
        targetCameraPosition.set(0, dist * 1.3, dist * 0.9);
        controls.target.set(0, 0, 0); 
    } else {
        const worldPos = new THREE.Vector3();
        target.mesh.getWorldPosition(worldPos);
        const offset = 15 + (target.data.size * CONFIG.zoomFactor);
        targetCameraPosition.set(worldPos.x + offset, worldPos.y + offset * 0.6, worldPos.z + offset);
        controls.target.copy(worldPos);
    }
}

function resetView() {
    focusedObject = null;
    targetCameraPosition.set(0, 400, 800); 
    controls.target.set(0, 0, 0);
    updatePanel(SYSTEM_DATA[0]);
}

// Wire up UI
initUI(SYSTEM_DATA, focusOn, resetView);
updatePanel(SYSTEM_DATA[0]);

window.addEventListener('resize', handleResize);

/**
 * Main Animation Loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    // Smooth camera movement
    camera.position.lerp(targetCameraPosition, CONFIG.smoothness);

    objects.forEach(obj => {
        if (obj.type === 'belt') {
            obj.mesh.rotation.y += obj.data.speed * 0.2; // Slower belt drift
        } else {
            // 1. Orbital Movement (Revolution)
            if (obj.data.distance > 0) {
                const a = obj.data.distance;
                const e = obj.data.eccentricity || 0;
                
                // Rotation Speed from data.js adjusted by global CONFIG
                obj.angle += obj.data.speed * CONFIG.rotationSpeed;
                
                const r = (a * (1 - e * e)) / (1 + e * Math.cos(obj.angle));
                
                obj.mesh.position.x = Math.cos(obj.angle) * r;
                obj.mesh.position.z = Math.sin(obj.angle) * r;

                if (obj.data.inclination) {
                    obj.group.rotation.x = obj.data.inclination;
                }
            }

            // 2. Axial Rotation (Spinning)
            // Different planets spin at different rates for realism
            const spinBase = 0.002; 
            if (obj.data.name === "Sun") {
                obj.mesh.rotation.y += 0.001; // Sun spins slowly
            } else if (obj.data.name === "Uranus") {
                obj.mesh.rotation.z += spinBase * 2; // Uranus on its side
            } else if (obj.data.type === "GAS GIANT") {
                obj.mesh.rotation.y += spinBase * 4; // Gas giants spin very fast
            } else {
                obj.mesh.rotation.y += spinBase; // Terrestrial planets
            }

            // Ring Rotation
            obj.mesh.children.forEach(child => {
                if (child instanceof THREE.Mesh && child.geometry.type === "RingGeometry") {
                    child.rotation.z += 0.0015; 
                }
            });

            // 3. Comet Tail
            if (obj.type === 'comet' && obj.tail) {
                const posAttr = obj.tail.geometry.attributes.position;
                for (let i = 0; i < posAttr.count; i++) {
                    let x = posAttr.getX(i);
                    x -= Math.random() * 0.4;
                    if (x < -25) x = 0; 
                    posAttr.setX(i, x);
                    posAttr.setY(i, (Math.random() - 0.5) * 0.2);
                    posAttr.setZ(i, (Math.random() - 0.5) * 0.2);
                }
                posAttr.needsUpdate = true;

                const worldPos = new THREE.Vector3();
                obj.mesh.getWorldPosition(worldPos);
                const sunToComet = worldPos.clone().normalize();
                obj.tail.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), sunToComet);
            }

            // 4. Moon Animation
            if (obj.moons) {
                obj.moons.forEach(moon => {
                    moon.angle += moon.data.speed * CONFIG.rotationSpeed;
                    const mr = moon.data.distance;
                    moon.mesh.position.x = Math.cos(moon.angle) * mr;
                    moon.mesh.position.z = Math.sin(moon.angle) * mr;
                    moon.mesh.rotation.y += 0.01;
                });
            }
        }
    });

    // 5. Dynamic Camera Tracking
    if (focusedObject && focusedObject.type !== 'belt') {
        const worldPos = new THREE.Vector3();
        focusedObject.mesh.getWorldPosition(worldPos);
        
        // Target lerp is slightly faster than camera lerp to stay ahead of the motion
        controls.target.lerp(worldPos, 0.2);
        
        const dist = 15 + (focusedObject.data.size * CONFIG.zoomFactor);
        const relativeOffset = new THREE.Vector3(dist, dist * 0.4, dist);
        
        targetCameraPosition.copy(worldPos).add(relativeOffset);
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();
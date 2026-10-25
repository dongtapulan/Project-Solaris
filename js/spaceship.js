import * as THREE from 'three';
import { SpaceshipModel } from './shipModel.js';

export class SpaceshipHUD {
    constructor(camera, domElement, sceneObjects, scene) {
        this.camera = camera;
        this.domElement = domElement;
        this.sceneObjects = sceneObjects;
        this.scene = scene;
        
        this.isActive = false;
        this.isThirdPerson = false;

        // Physics State
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        
        this.pitch = 0;
        this.yaw = 0;
        this.roll = 0;

        this.enginePower = 0; // Throttle range: -50% (Reverse) to 100% (Forward)
        this.maxThrust = 150;
        this.rotationSpeed = 1.2;
        this.drag = 0.985; 

        this.isMouseDown = false;
        this.mousePos = { x: 0, y: 0 };
        this.orbitAngles = { x: 0, y: 0.2 };

        this.keyState = { W: false, S: false, A: false, D: false, Q: false, E: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

        this.shipModule = new SpaceshipModel(scene, camera);

        this.initUI();
        this.initListeners();
    }

    initUI() {
        this.hudContainer = document.createElement('div');
        this.hudContainer.id = 'spaceship-hud';
        this.hudContainer.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; display: none; font-family: 'Courier New', monospace;
            color: #38bdf8; overflow: hidden; box-sizing: border-box; z-index: 100;
        `;

        this.hudContainer.innerHTML = `
            <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 800px; height: 150px; pointer-events: none; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">
                <div style="position: absolute; bottom: 0; width: 100%; height: 115px; background: linear-gradient(to top, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.8)); border-top: 1.5px solid rgba(56, 189, 248, 0.4); border-left: 1.5px solid rgba(56, 189, 248, 0.2); border-right: 1.5px solid rgba(56, 189, 248, 0.2); border-top-left-radius: 35px; border-top-right-radius: 35px; box-shadow: 0 -10px 30px rgba(56, 189, 248, 0.12); backdrop-filter: blur(6px); display: flex; justify-content: space-between; align-items: center; padding: 12px 40px; box-sizing: border-box; pointer-events: auto;">
                    
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(3, 7, 18, 0.75); border-radius: 50%; width: 65px; height: 65px; position: relative;">
                            <div style="font-size: 6px; color: #94a3b8; position: absolute; top: 6px;">ATTITUDE</div>
                            <div id="cockpit-pitch" style="font-size: 9px; font-weight: bold; color: #38bdf8;">P: 0°</div>
                            <div id="cockpit-roll" style="font-size: 8px; color: #38bdf8;">R: 0°</div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <span style="font-size: 8px; color: #94a3b8;">SYS: <strong style="color: #34d399;">NOMINAL</strong></span>
                            <button id="btn-toggle-view" style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.5); color: #38bdf8; padding: 4px 8px; border-radius: 4px; font-size: 8px; font-family: monospace; font-weight: bold; cursor: pointer; transition: all 0.2s;">
                                VIEW: 1ST PERSON
                            </button>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                        <div style="font-size: 8px; letter-spacing: 1.5px; color: #94a3b8;">THRUSTER THROTTLE (REV / FWD)</div>
                        <div style="width: 220px; height: 10px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 5px; overflow: hidden; padding: 1px; position: relative;">
                            <div id="throttle-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #f87171, #38bdf8, #818cf8); border-radius: 3px; transition: width 0.1s linear;"></div>
                        </div>
                        <div style="display: flex; gap: 15px; font-size: 10px; margin-top: 2px;">
                            <span id="cockpit-speed" style="font-weight: bold; color: #38bdf8;">SPD: 0.0 AU/s</span>
                            <span id="cockpit-throttle-val" style="color: #94a3b8;">THR: 0%</span>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; font-size: 9px; color: #38bdf8; gap: 2px; background: rgba(3, 7, 18, 0.5); padding: 6px 10px; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 5px;">
                        <div style="font-size: 7px; color: #94a3b8; letter-spacing: 0.5px;">INERTIAL POSITION</div>
                        <div id="cockpit-pos-x">X: 0.00 AU</div>
                        <div id="cockpit-pos-y">Y: 0.00 AU</div>
                        <div id="cockpit-pos-z">Z: 0.00 AU</div>
                    </div>
                </div>
            </div>

            <svg id="ufo-visor" width="100%" height="100%" style="position:absolute; top:0; left:0;">
                <ellipse cx="50%" cy="50%" rx="48%" ry="45%" fill="none" stroke="rgba(56, 189, 248, 0.1)" stroke-width="1" stroke-dasharray="10 5" />
                <circle cx="50%" cy="50%" r="4" fill="none" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1"/>
            </svg>

            <div style="position: absolute; top: 70px; left: 25px; background: rgba(8, 15, 30, 0.8); padding: 10px 14px; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px; backdrop-filter: blur(4px); font-size: 9px; color: #94a3b8; line-height: 1.4;">
                <strong style="color: #38bdf8;">NEWTONIAN CONTROLS:</strong><br/>
                [W / S] Throttle Forward / Reverse (-50% to 100%)<br/>
                [A / D / Q / E] Yaw & Roll<br/>
                [Arrow Keys] Pitch & Turn<br/>
                [C] Toggle 1st / 3rd Person View<br/>
                [Mouse Drag] 360° Free Camera Orbit<br/>
                [F] Exit Flight Mode
            </div>

            <div id="ufo-targets-layer" style="position: absolute; top:0; left:0; width:100%; height:100%;"></div>
        `;

        document.body.appendChild(this.hudContainer);
        this.targetsLayer = document.getElementById('ufo-targets-layer');
        this.createMobileUI();

        document.getElementById('btn-toggle-view').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCameraView();
        });
    }

    toggleCameraView() {
        this.isThirdPerson = !this.isThirdPerson;
        const btn = document.getElementById('btn-toggle-view');
        if (btn) {
            btn.innerText = this.isThirdPerson ? 'VIEW: 3RD PERSON' : 'VIEW: 1ST PERSON';
            btn.style.background = this.isThirdPerson ? 'rgba(56, 189, 248, 0.3)' : 'rgba(56, 189, 248, 0.1)';
        }
    }

    createMobileUI() {
        this.mobileBtn = document.createElement('button');
        this.mobileBtn.id = 'mobile-spaceship-btn';
        this.mobileBtn.innerText = '🚀 FLIGHT MODE';
        this.mobileBtn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 999;
            background: rgba(14, 165, 233, 0.2); border: 1px solid #38bdf8;
            color: #38bdf8; padding: 8px 14px; border-radius: 18px;
            font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: bold;
            backdrop-filter: blur(6px); cursor: pointer; user-select: none;
        `;
        this.mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMode();
        });
        document.body.appendChild(this.mobileBtn);
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyF') this.toggleMode();
            if (e.code === 'KeyC') this.toggleCameraView();
            if (!this.isActive) return;

            if (e.code === 'KeyW') this.keyState.W = true;
            if (e.code === 'KeyS') this.keyState.S = true;
            if (e.code === 'KeyA') this.keyState.A = true;
            if (e.code === 'KeyD') this.keyState.D = true;
            if (e.code === 'KeyQ') this.keyState.Q = true;
            if (e.code === 'KeyE') this.keyState.E = true;
            if (e.code === 'ArrowUp') this.keyState.ArrowUp = true;
            if (e.code === 'ArrowDown') this.keyState.ArrowDown = true;
            if (e.code === 'ArrowLeft') this.keyState.ArrowLeft = true;
            if (e.code === 'ArrowRight') this.keyState.ArrowRight = true;
        });

        window.addEventListener('keyup', (e) => {
            if (!this.isActive) return;

            if (e.code === 'KeyW') this.keyState.W = false;
            if (e.code === 'KeyS') this.keyState.S = false;
            if (e.code === 'KeyA') this.keyState.A = false;
            if (e.code === 'KeyD') this.keyState.D = false;
            if (e.code === 'KeyQ') this.keyState.KeyQ = false;
            if (e.code === 'KeyE') this.keyState.KeyE = false;
            if (e.code === 'ArrowUp') this.keyState.ArrowUp = false;
            if (e.code === 'ArrowDown') this.keyState.ArrowDown = false;
            if (e.code === 'ArrowLeft') this.keyState.ArrowLeft = false;
            if (e.code === 'ArrowRight') this.keyState.ArrowRight = false;
        });

        window.addEventListener('mousedown', (e) => {
            if (!this.isActive || e.target.closest('#mobile-spaceship-btn') || e.target.closest('#spaceship-hud')) return;
            this.isMouseDown = true;
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isActive || !this.isMouseDown) return;
            const deltaX = e.clientX - this.mousePos.x;
            const deltaY = e.clientY - this.mousePos.y;

            this.orbitAngles.x -= deltaX * 0.005;
            this.orbitAngles.y += deltaY * 0.005;
            this.orbitAngles.y = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.orbitAngles.y));

            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
    }

    toggleMode() {
        if (this.isActive) this.deactivate();
        else this.activate();
    }

    toggleStandardUI(show) {
        Array.from(document.body.children).forEach(child => {
            const id = child.id;
            const isTopNav = child.classList.contains('top-nav-container');
            const isMobileBtn = id === 'mobile-spaceship-btn';
            if (id !== 'canvas-container' && id !== 'spaceship-hud' && !isTopNav && !isMobileBtn) {
                child.style.display = show ? '' : 'none';
            }
        });
    }

    activate() {
        this.isActive = true;
        this.hudContainer.style.display = 'block';
        this.mobileBtn.innerText = '❌ EXIT FLIGHT';
        this.toggleStandardUI(false);

        // --- START FLIGHT NEAR EARTH ---
        const earthObj = this.sceneObjects.find(o => o.data.name === "Earth");
        if (earthObj && earthObj.mesh) {
            const earthPos = new THREE.Vector3();
            earthObj.mesh.getWorldPosition(earthPos);
            // Spawn slightly offset from Earth so we start right next to it
            this.position.copy(earthPos).add(new THREE.Vector3(15, 5, 15));
        } else {
            this.position.set(0, 50, 150);
        }

        this.velocity.set(0, 0, 0);
        this.pitch = 0;
        this.yaw = 0;
        this.roll = 0;
        this.enginePower = 0;
        this.orbitAngles.x = 0;
        this.orbitAngles.y = 0.2;
    }

    deactivate() {
        this.isActive = false;
        this.hudContainer.style.display = 'none';
        this.mobileBtn.innerText = '🚀 FLIGHT MODE';
        this.toggleStandardUI(true);

        if (this.shipModule) {
            this.shipModule.setVisibility(false);
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        // --- Throttle controls allowing reverse (-50% to 100%) ---
        if (this.keyState.W) this.enginePower = Math.min(100, this.enginePower + 40 * deltaTime);
        if (this.keyState.S) this.enginePower = Math.max(-50, this.enginePower - 40 * deltaTime);

        const rotRate = this.rotationSpeed * deltaTime;
        if (this.keyState.A || this.keyState.ArrowLeft) this.yaw += rotRate;
        if (this.keyState.D || this.keyState.ArrowRight) this.yaw -= rotRate;
        if (this.keyState.ArrowUp) this.pitch += rotRate;
        if (this.keyState.ArrowDown) this.pitch -= rotRate;
        if (this.keyState.Q) this.roll += rotRate;
        if (this.keyState.E) this.roll -= rotRate;

        const forwardDir = new THREE.Vector3(0, 0, -1);
        const euler = new THREE.Euler(this.pitch, this.yaw, this.roll, 'YXZ');
        forwardDir.applyEuler(euler);

        const thrustMagnitude = (this.enginePower / 100) * this.maxThrust;
        this.acceleration.copy(forwardDir).multiplyScalar(thrustMagnitude);

        this.velocity.addScaledVector(this.acceleration, deltaTime);
        this.velocity.multiplyScalar(Math.pow(this.drag, deltaTime * 60));
        this.position.addScaledVector(this.velocity, deltaTime);

        if (this.shipModule) {
            this.shipModule.update(this.position, euler, this.isThirdPerson);
        }

        if (this.isThirdPerson) {
            const orbitDist = 12;
            const offsetX = Math.sin(this.orbitAngles.x) * Math.cos(this.orbitAngles.y) * orbitDist;
            const offsetY = Math.sin(this.orbitAngles.y) * orbitDist;
            const offsetZ = Math.cos(this.orbitAngles.x) * Math.cos(this.orbitAngles.y) * orbitDist;

            const relativeOffset = new THREE.Vector3(offsetX, offsetY, offsetZ).applyEuler(euler);
            this.camera.position.copy(this.position).add(relativeOffset);
            this.camera.lookAt(this.position);
        } else {
            this.camera.position.copy(this.position);
            const cockpitEuler = new THREE.Euler(
                this.pitch + this.orbitAngles.y,
                this.yaw + this.orbitAngles.x,
                this.roll,
                'YXZ'
            );
            this.camera.quaternion.setFromEuler(cockpitEuler);
        }

        // Telemetry UI updates
        const speed = this.velocity.length();
        document.getElementById('cockpit-speed').innerText = `SPD: ${speed.toFixed(1)} AU/s`;
        document.getElementById('cockpit-throttle-val').innerText = `THR: ${Math.round(this.enginePower)}%`;
        
        // Throttle bar percentage representation (-50 to 100)
        const barPct = ((this.enginePower + 50) / 150) * 100;
        document.getElementById('throttle-bar').style.width = `${barPct}%`;

        document.getElementById('cockpit-pitch').innerText = `P: ${Math.round(this.pitch * (180 / Math.PI))}°`;
        document.getElementById('cockpit-roll').innerText = `R: ${Math.round(this.roll * (180 / Math.PI))}°`;

        document.getElementById('cockpit-pos-x').innerText = `X: ${this.position.x.toFixed(2)} AU`;
        document.getElementById('cockpit-pos-y').innerText = `Y: ${this.position.y.toFixed(2)} AU`;
        document.getElementById('cockpit-pos-z').innerText = `Z: ${this.position.z.toFixed(2)} AU`;

        this.renderTargetCrosshairs();
    }

    renderTargetCrosshairs() {
        let html = '';
        const tempVec = new THREE.Vector3();
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.sceneObjects.forEach(obj => {
            if (!obj.mesh || obj.data?.type === 'BELT') return;

            obj.mesh.getWorldPosition(tempVec);

            const camDir = new THREE.Vector3();
            this.camera.getWorldDirection(camDir);
            const toTarget = tempVec.clone().sub(this.camera.position).normalize();
            
            if (camDir.dot(toTarget) <= 0) return;

            tempVec.project(this.camera);

            const x = (tempVec.x * 0.5 + 0.5) * w;
            const y = (-(tempVec.y * 0.5) + 0.5) * h;

            const name = obj.data.name;
            const dist = this.camera.position.distanceTo(obj.mesh.position).toFixed(0);

            html += `
                <div style="position: absolute; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%); pointer-events: none; text-align: center;">
                    <div style="width: 16px; height: 16px; border: 1px dashed rgba(56, 189, 248, 0.3); border-radius: 50%; margin: 0 auto;"></div>
                    <div style="font-size: 8px; font-weight: bold; color: rgba(56, 189, 248, 0.8); background: rgba(3, 7, 18, 0.65); padding: 1px 4px; border-radius: 3px; margin-top: 2px; white-space: nowrap; border: 1px solid rgba(56, 189, 248, 0.15);">
                        ${name.toUpperCase()} <span style="color: #94a3b8; font-size: 7px;">${dist} AU</span>
                    </div>
                </div>
            `;
        });

        this.targetsLayer.innerHTML = html;
    }
}
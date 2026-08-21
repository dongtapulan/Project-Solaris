import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class SpaceshipHUD {
    constructor(camera, domElement, sceneObjects) {
        this.camera = camera;
        this.domElement = domElement;
        this.sceneObjects = sceneObjects;
        
        this.controls = new PointerLockControls(camera, domElement);
        this.isActive = false;

        // Physics State
        this.velocity = new THREE.Vector3();
        this.inputVector = new THREE.Vector3();
        this.accel = 700;
        this.damping = 0.95;

        // Mobile Touch Control State
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        this.touchLookState = { active: false, x: 0, y: 0 };
        this.touchRotationSpeed = 0.003;

        this.keyState = { W: false, S: false, A: false, D: false, Space: false, Shift: false };

        this.initUI();
        this.initListeners();
    }

    initUI() {
        this.hudContainer = document.createElement('div');
        this.hudContainer.id = 'ufo-hud';
        this.hudContainer.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; display: none; font-family: 'Courier New', monospace;
            color: #38bdf8; overflow: hidden; box-sizing: border-box; z-index: 100;
        `;

        this.hudContainer.innerHTML = `
            <svg id="ufo-visor" width="100%" height="100%" style="position:absolute; top:0; left:0;">
                <ellipse cx="50%" cy="50%" rx="48%" ry="45%" fill="none" stroke="rgba(56, 189, 248, 0.25)" stroke-width="3" stroke-dasharray="12 6" />
                <ellipse cx="50%" cy="50%" rx="46%" ry="43%" fill="none" stroke="rgba(56, 189, 248, 0.15)" stroke-width="1" />
                
                <g transform="translate(0,0)" id="center-reticle">
                    <circle cx="50%" cy="50%" r="18" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.6"/>
                    <circle cx="50%" cy="50%" r="4" fill="#38bdf8" opacity="0.8"/>
                </g>
            </svg>

            <div style="position: absolute; top: 80px; left: 35px; background: rgba(8, 15, 30, 0.85); padding: 12px 18px; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; backdrop-filter: blur(4px);">
                <div style="font-size: 11px; color: #94a3b8; letter-spacing: 1px;">FLIGHT TELEMETRY</div>
                <div id="ufo-speed" style="font-size: 16px; font-weight: bold; margin-top: 4px;">VEL: 0.00 AU/s</div>
                <div id="ufo-coords" style="font-size: 11px; color: #38bdf8; margin-top: 2px;">POS: X 0 | Y 0 | Z 0</div>
            </div>

            <div id="ufo-targets-layer" style="position: absolute; top:0; left:0; width:100%; height:100%;"></div>
        `;

        document.body.appendChild(this.hudContainer);
        this.targetsLayer = document.getElementById('ufo-targets-layer');

        this.createMobileUI();
    }

    createMobileUI() {
        // Floating Toggle Button
        this.mobileBtn = document.createElement('button');
        this.mobileBtn.id = 'mobile-spaceship-btn';
        this.mobileBtn.innerText = '🚀 FLIGHT MODE';
        this.mobileBtn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 999;
            background: rgba(14, 165, 233, 0.25); border: 1px solid #38bdf8;
            color: #38bdf8; padding: 10px 16px; border-radius: 20px;
            font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: bold;
            backdrop-filter: blur(8px); box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
            cursor: pointer; user-select: none; -webkit-user-select: none;
        `;
        this.mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMode();
        });
        document.body.appendChild(this.mobileBtn);

        // Mobile Flight Controls Container
        this.mobileControls = document.createElement('div');
        this.mobileControls.id = 'mobile-flight-pad';
        this.mobileControls.style.cssText = `
            position: fixed; bottom: 20px; left: 20px; z-index: 1001;
            display: none; gap: 8px; flex-direction: column; pointer-events: auto;
        `;
        this.mobileControls.innerHTML = `
            <div style="display: flex; gap: 8px;">
                <button id="btn-fwd" style="${this.getTouchBtnStyle()}">▲ FWD</button>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="btn-left" style="${this.getTouchBtnStyle()}">◀ L</button>
                <button id="btn-back" style="${this.getTouchBtnStyle()}">▼ BWD</button>
                <button id="btn-right" style="${this.getTouchBtnStyle()}">R ▶</button>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="btn-up" style="${this.getTouchBtnStyle()}">▲ UP</button>
                <button id="btn-down" style="${this.getTouchBtnStyle()}">▼ DOWN</button>
            </div>
        `;
        document.body.appendChild(this.mobileControls);

        this.bindTouchPadEvents();
    }

    getTouchBtnStyle() {
        return `
            background: rgba(8, 15, 30, 0.85); border: 1px solid rgba(56, 189, 248, 0.5);
            color: #38bdf8; padding: 10px 14px; border-radius: 6px; font-size: 10px;
            font-family: monospace; font-weight: bold; user-select: none; -webkit-user-select: none;
        `;
    }

    bindTouchPadEvents() {
        const bindBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keyState[key] = true; });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); this.keyState[key] = false; });
            btn.addEventListener('mousedown', () => { this.keyState[key] = true; });
            btn.addEventListener('mouseup', () => { this.keyState[key] = false; });
        };

        bindBtn('btn-fwd', 'W');
        bindBtn('btn-back', 'S');
        bindBtn('btn-left', 'A');
        bindBtn('btn-right', 'D');
        bindBtn('btn-up', 'Space');
        bindBtn('btn-down', 'Shift');
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyF') this.toggleMode();
            if (!this.isActive) return;

            if (e.code === 'KeyW') this.keyState.W = true;
            if (e.code === 'KeyS') this.keyState.S = true;
            if (e.code === 'KeyA') this.keyState.A = true;
            if (e.code === 'KeyD') this.keyState.D = true;
            if (e.code === 'Space') this.keyState.Space = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keyState.Shift = true;
        });

        window.addEventListener('keyup', (e) => {
            if (!this.isActive) return;

            if (e.code === 'KeyW') this.keyState.W = false;
            if (e.code === 'KeyS') this.keyState.S = false;
            if (e.code === 'KeyA') this.keyState.A = false;
            if (e.code === 'KeyD') this.keyState.D = false;
            if (e.code === 'Space') this.keyState.Space = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keyState.Shift = false;
        });

        // Touch Drag Camera Look for Mobile
        window.addEventListener('touchstart', (e) => {
            if (!this.isActive || e.target.closest('#mobile-flight-pad') || e.target.closest('#mobile-spaceship-btn')) return;
            this.touchLookState.active = true;
            this.touchLookState.x = e.touches[0].clientX;
            this.touchLookState.y = e.touches[0].clientY;
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!this.isActive || !this.touchLookState.active) return;
            const deltaX = e.touches[0].clientX - this.touchLookState.x;
            const deltaY = e.touches[0].clientY - this.touchLookState.y;

            this.camera.rotation.y -= deltaX * this.touchRotationSpeed;
            this.camera.rotation.x -= deltaY * this.touchRotationSpeed;
            this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));

            this.touchLookState.x = e.touches[0].clientX;
            this.touchLookState.y = e.touches[0].clientY;
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.touchLookState.active = false;
        });

        this.controls.addEventListener('unlock', () => {
            if (this.isActive && !this.isMobile) this.deactivate();
        });
    }

    toggleMode() {
        if (this.isActive) this.deactivate();
        else this.activate();
    }

    toggleStandardUI(show) {
        if (!show) {
            document.body.classList.add('spaceship-active');
        } else {
            document.body.classList.remove('spaceship-active');
        }

        Array.from(document.body.children).forEach(child => {
            const id = child.id;
            const isTopNav = child.classList.contains('top-nav-container');
            const isMobileBtn = id === 'mobile-spaceship-btn';
            const isMobilePad = id === 'mobile-flight-pad';
            if (id !== 'canvas-container' && id !== 'ufo-hud' && !isTopNav && !isMobileBtn && !isMobilePad) {
                child.style.display = show ? '' : 'none';
            }
        });
    }

    activate() {
        this.isActive = true;
        this.hudContainer.style.display = 'block';
        if (this.mobileControls) this.mobileControls.style.display = 'flex';
        this.mobileBtn.innerText = '❌ EXIT FLIGHT';
        this.toggleStandardUI(false);
        this.velocity.set(0, 0, 0);

        if (!this.isMobile) {
            this.controls.lock();
        }
    }

    deactivate() {
        this.isActive = false;
        this.hudContainer.style.display = 'none';
        if (this.mobileControls) this.mobileControls.style.display = 'none';
        this.mobileBtn.innerText = '🚀 FLIGHT MODE';
        this.toggleStandardUI(true);

        if (!this.isMobile) {
            this.controls.unlock();
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        this.inputVector.set(0, 0, 0);
        if (this.keyState.W) this.inputVector.z -= 1;
        if (this.keyState.S) this.inputVector.z += 1;
        if (this.keyState.A) this.inputVector.x -= 1;
        if (this.keyState.D) this.inputVector.x += 1;
        if (this.keyState.Space) this.inputVector.y += 1;
        if (this.keyState.Shift) this.inputVector.y -= 1;

        this.inputVector.normalize();

        const forwardDir = new THREE.Vector3();
        const rightDir = new THREE.Vector3();
        const upDir = new THREE.Vector3(0, 1, 0);

        this.camera.getWorldDirection(forwardDir);
        rightDir.crossVectors(forwardDir, upDir).normalize();

        const thrust = new THREE.Vector3();
        thrust.addScaledVector(forwardDir, -this.inputVector.z);
        thrust.addScaledVector(rightDir, this.inputVector.x);
        thrust.addScaledVector(upDir, this.inputVector.y);

        this.velocity.addScaledVector(thrust, this.accel * deltaTime);
        this.velocity.multiplyScalar(Math.pow(this.damping, deltaTime * 60));
        this.camera.position.addScaledVector(this.velocity, deltaTime);

        const speed = this.velocity.length().toFixed(1);
        const pos = this.camera.position;
        document.getElementById('ufo-speed').innerText = `VEL: ${speed} AU/s`;
        document.getElementById('ufo-coords').innerText = `POS: X ${pos.x.toFixed(0)} | Y ${pos.y.toFixed(0)} | Z ${pos.z.toFixed(0)}`;

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
                    <div style="width: 24px; height: 24px; border: 1px dashed #38bdf8; border-radius: 50%; margin: 0 auto;"></div>
                    <div style="font-size: 10px; font-weight: bold; color: #38bdf8; background: rgba(5, 10, 20, 0.7); padding: 2px 4px; border-radius: 3px; margin-top: 4px; white-space: nowrap;">
                        ${name.toUpperCase()} <span style="color: #94a3b8; font-size: 9px;">${dist} AU</span>
                    </div>
                </div>
            `;
        });

        this.targetsLayer.innerHTML = html;
    }
}
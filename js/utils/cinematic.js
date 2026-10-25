import * as THREE from 'three';

export class CinematicApproach {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
        
        this.isApproaching = false;
        this.targetObject = null;
        
        this.startPos = new THREE.Vector3();
        this.targetPos = new THREE.Vector3();
        
        this.startLookAt = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        
        this.progress = 0;
        this.duration = 2.5; // Duration of cinematic flight in seconds
        
        this.shakeIntensity = 0.0;
    }

    start(object, size) {
        if (!object) return;

        // If a cinematic approach is already happening, capture our current 
        // actual interpolated position/lookAt as the new smooth starting point.
        if (this.isApproaching) {
            this.startPos.copy(this.camera.position);
            this.startLookAt.copy(this.controls.target);
        } else {
            this.startPos.copy(this.camera.position);
            this.startLookAt.copy(this.controls.target);
        }

        this.targetObject = object;
        this.isApproaching = true;
        this.progress = 0; // Reset progress smoothly from current frame

        // Get world position of the target celestial body
        const worldPos = new THREE.Vector3();
        if (object.data.type === 'BELT') {
            worldPos.set(0, 0, 0);
        } else {
            object.mesh.getWorldPosition(worldPos);
        }

        const approachDist = Math.max(size * 3.5, 12);
        
        // Position camera slightly offset and elevated for a cinematic framing angle
        if (object.data.type === 'BELT') {
            this.targetPos.set(0, approachDist * 1.2, approachDist * 1.8);
        } else {
            this.targetPos.set(
                worldPos.x + approachDist * 0.8,
                worldPos.y + approachDist * 0.4,
                worldPos.z + approachDist
            );
        }
        
        this.targetLookAt.copy(worldPos);
    }

    update(deltaTime) {
        if (!this.isApproaching) return;

        // Progress calculation
        this.progress += deltaTime / this.duration;
        let t = Math.min(this.progress, 1.0);
        
        // Cubic easing curve (smooth acceleration and gentle deceleration)
        let easeT = t * t * (3 - 2 * t);

        // Dynamically update target destination if the celestial body is orbiting
        if (this.targetObject && this.targetObject.data.type !== 'BELT') {
            const liveWorldPos = new THREE.Vector3();
            this.targetObject.mesh.getWorldPosition(liveWorldPos);
            this.targetLookAt.copy(liveWorldPos);
            
            const approachDist = Math.max((this.targetObject.data.size || 10) * 3.5, 12);
            this.targetPos.set(
                liveWorldPos.x + approachDist * 0.8,
                liveWorldPos.y + approachDist * 0.4,
                liveWorldPos.z + approachDist
            );
        }

        // Interpolate camera position and control target smoothly
        this.camera.position.lerpVectors(this.startPos, this.targetPos, easeT);
        this.controls.target.lerpVectors(this.startLookAt, this.targetLookAt, easeT);

        // Add subtle procedural engine rumble / camera shake during flight transit
        if (t < 0.95) {
            this.shakeIntensity = Math.sin(t * Math.PI) * 0.4;
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity;
        }

        // Complete the flight approach
        if (t >= 1.0) {
            this.isApproaching = false;
        }
    }
}
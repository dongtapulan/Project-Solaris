import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SpaceshipModel {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.shipMesh = null;
        this.isLoaded = false;

        this.loadModel('./assets/models/spaceship.glb');
    }

    loadModel(modelUrl) {
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
            this.shipMesh = gltf.scene;
            
            this.shipMesh.scale.set(0.35, 0.35, 0.35);
            this.shipMesh.rotation.y = Math.PI; // Flipped 180° so windshield points forward and thrusters point back

            const shipLight = new THREE.PointLight(0xffffff, 3.5, 25);
            shipLight.position.set(0, 3, 3);
            this.shipMesh.add(shipLight);

            this.shipMesh.traverse((child) => {
                if (child.isMesh) {
                    child.material.roughness = 0.3;
                    child.material.metalness = 0.3;
                }
            });

            this.shipMesh.visible = false;
            this.scene.add(this.shipMesh);
            this.isLoaded = true;
        });
    }

    update(position, euler, isThirdPerson) {
        if (this.shipMesh) {
            this.shipMesh.visible = isThirdPerson;
            if (isThirdPerson) {
                this.shipMesh.position.copy(position);
                this.shipMesh.quaternion.setFromEuler(euler);
            }
        }
    }

    setVisibility(visible) {
        if (this.shipMesh) {
            this.shipMesh.visible = visible;
        }
    }
}
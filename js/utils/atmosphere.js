import * as THREE from 'three';

/**
 * Advanced Atmospheric Rim Scattering Shader Material
 */
function createAtmosphereMaterial(colorHex) {
    return new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(colorHex) }
        },
        vertexShader: `
            varying float intensity;
            void main() {
                vec3 vNormal = normalize( normalMatrix * normal );
                vec3 vNormel = normalize( normalMatrix * position );
                intensity = pow( 0.62 - dot(vNormal, vNormel), 2.8 );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            varying float intensity;
            uniform vec3 glowColor;
            void main() {
                vec3 glow = glowColor * intensity * 1.4;
                gl_FragColor = vec4( glow, intensity * 0.85 );
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });
}

/**
 * Attaches atmospheric glow scattering and cloud layers to planets
 */
export function addPlanetaryAtmosphere(mesh, planetName, size) {
    const atmosphericConfigs = {
        "Earth": { color: 0x4488ff, hasClouds: true },
        "Venus": { color: 0xffcc88, hasHaze: true },
        "Mars": { color: 0xff5522 },
        "Jupiter": { color: 0xffaa66 },
        "Saturn": { color: 0xdec28b },
        "Uranus": { color: 0x66ccff },
        "Neptune": { color: 0x2266ff }
    };

    const cfg = atmosphericConfigs[planetName];
    if (!cfg) return;

    // 1. Atmosphere Rim Glow Shell
    const scatteringGeometry = new THREE.SphereGeometry(size * 1.04, 64, 64);
    const scatteringMaterial = createAtmosphereMaterial(cfg.color);
    const atmosphereMesh = new THREE.Mesh(scatteringGeometry, scatteringMaterial);
    mesh.add(atmosphereMesh);

    // 2. Additional Cloud Shell for Earth
    if (cfg.hasClouds) {
        const cloudGeometry = new THREE.SphereGeometry(size * 1.02, 64, 64);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.35,
            blending: THREE.NormalBlending,
            depthWrite: false
        });
        const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        mesh.add(cloudMesh);
    }
}
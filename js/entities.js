import * as THREE from 'three';

// 1. Loading Management
export const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

const TEX_PATH = 'assets/textures/';

const TEXTURE_MAP = {
    "Sun": TEX_PATH + "2k_sun.jpg",
    "Mercury": TEX_PATH + "2k_mercury.jpg",
    "Venus": TEX_PATH + "2k_venus.jpg",
    "Earth": TEX_PATH + "2k_earth_daymap.jpg",
    "Mars": TEX_PATH + "2k_mars.jpg",
    "Jupiter": TEX_PATH + "2k_jupiter.jpg",
    "Saturn": TEX_PATH + "2k_saturn.jpg",
    "Uranus": TEX_PATH + "2k_uranus.jpg",
    "Neptune": TEX_PATH + "2k_neptune.jpg",
    "Pluto": TEX_PATH + "2k_pluto.jpg",
    "Ceres": TEX_PATH + "2k_ceres_fictional.jpg",
    "Eris": TEX_PATH + "2k_eris_fictional.jpg",
    "Haumea": TEX_PATH + "2k_haumea_fictional.jpg",
    "Makemake": TEX_PATH + "2k_makemake_fictional.jpg",
    "Sedna": TEX_PATH + "2k_sedna.jpg"
};

const textureCache = {};
Object.entries(TEXTURE_MAP).forEach(([key, path]) => {
    const tex = textureLoader.load(path);
    tex.anisotropy = 8;
    textureCache[key] = tex;
});

/**
 * Optimized Atmospheric Scattering
 */
function createAtmosphereMaterial(color, camera) {
    return new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { value: new THREE.Color(color) },
            viewVector: { value: camera.position }
        },
        vertexShader: `
            varying float intensity;
            void main() {
                vec3 vNormal = normalize( normalMatrix * normal );
                vec3 vNormel = normalize( normalMatrix * viewVector );
                intensity = pow( 0.6 - dot(vNormal, vNormel), 2.5 );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            varying float intensity;
            uniform vec3 glowColor;
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4( glow, 1.0 );
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
}

export function createStars(scene) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const colorObj = new THREE.Color();
    
    for (let i = 0; i < 8000; i++) {
        vertices.push(
            THREE.MathUtils.randFloatSpread(10000), 
            THREE.MathUtils.randFloatSpread(10000), 
            THREE.MathUtils.randFloatSpread(10000)
        );
        const starType = Math.random();
        if (starType > 0.9) colorObj.setHex(0xffffff);
        else if (starType > 0.7) colorObj.setHex(0xaaaaff);
        else colorObj.setHex(0xffaa88);
        colors.push(colorObj.r, colorObj.g, colorObj.b);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({ 
        size: 2, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true 
    });
    scene.add(new THREE.Points(geometry, material));
}

export function createOortCloud(scene) {
    const particles = 15000;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const color = new THREE.Color(0x99ccff);

    for (let i = 0; i < particles; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 5000 + Math.random() * 3000; 
        positions.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        size: 3, color: color, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending
    });
    const cloud = new THREE.Points(geometry, material);
    scene.add(cloud);
    return cloud;
}

function createOrbitLine(data) {
    const points = [];
    const segments = 256;
    const visualScale = data.distance; 
    const e = data.elements?.eccentricity || 0;
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const r = (visualScale * (1 - e * e)) / (1 + e * Math.cos(theta));
        points.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x444466, transparent: true, opacity: 0.15, 
        blending: THREE.AdditiveBlending, depthWrite: false 
    });
    const line = new THREE.Line(geometry, material);
    const orbitGroup = new THREE.Group();
    orbitGroup.add(line);
    if (data.elements?.inclination) orbitGroup.rotation.x = data.elements.inclination * (Math.PI / 180);
    return orbitGroup;
}

function createBeltMesh(data) {
    const geometry = new THREE.DodecahedronGeometry(data.name === 'Kuiper Belt' ? 0.6 : 0.3, 0);
    const material = new THREE.MeshStandardMaterial({ 
        color: data.color, emissive: data.color, emissiveIntensity: 0.5 
    });
    const mesh = new THREE.InstancedMesh(geometry, material, data.count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < data.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = data.innerRadius + Math.random() * (data.outerRadius - data.innerRadius);
        dummy.position.set(
            Math.cos(angle) * r, 
            THREE.MathUtils.randFloatSpread(data.name === 'Kuiper Belt' ? 12 : 3), 
            Math.sin(angle) * r
        );
        dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        const scale = Math.random() * 0.6 + 0.4;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    return mesh;
}

/**
 * Universal Particle Ring Generator with Banded Color Support
 */
function createParticleRing({ 
    innerRadius, 
    outerRadius, 
    count, 
    color, 
    pointSize = 0.25, 
    opacity = 0.75, 
    tiltX = 0, 
    tiltZ = 0,
    isSaturn = false
}) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    const baseColor = new THREE.Color(color);

    // Color definitions for Saturn's ring bands
    const lightBrown = new THREE.Color(0xe6d3a3);
    const darkBrown = new THREE.Color(0x5c4a30);
    const cassiniGap = new THREE.Color(0x1a1510);

    for (let i = 0; i < count; i++) {
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const theta = Math.random() * Math.PI * 2;

        const y = (Math.random() - 0.5) * 0.2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);

        positions.push(x, y, z);

        let particleColor = baseColor.clone();

        if (isSaturn) {
            // Normalized radius scale from 0.0 to 1.0
            const normR = (radius - innerRadius) / (outerRadius - innerRadius);

            if (normR < 0.25) {
                // Inner C Ring: Darker brown tone
                particleColor.copy(darkBrown);
            } else if (normR >= 0.25 && normR < 0.65) {
                // Bright B Ring: Light tan/cream tone
                particleColor.copy(lightBrown);
            } else if (normR >= 0.65 && normR < 0.72) {
                // Cassini Division Gap: Very dark band
                particleColor.copy(cassiniGap);
            } else {
                // Outer A Ring: Medium brown tone
                particleColor.copy(lightBrown).lerp(darkBrown, 0.4);
            }
        }

        const variance = 0.85 + Math.random() * 0.3;
        colors.push(
            particleColor.r * variance,
            particleColor.g * variance,
            particleColor.b * variance
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: pointSize,
        vertexColors: true,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const ringParticles = new THREE.Points(geometry, material);
    
    ringParticles.rotation.x = tiltX;
    ringParticles.rotation.z = tiltZ;

    return ringParticles;
}

/**
 * Volumetric Comet Tail & Coma Head Generator
 */
function createCometTail(mesh) {
    const group = new THREE.Group();

    // 1. Glowing Nucleus Head (Coma)
    const loader = new THREE.TextureLoader();
    const comaTexture = loader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png');
    const comaMaterial = new THREE.SpriteMaterial({
        map: comaTexture,
        color: 0x99ddff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.95
    });
    const comaSprite = new THREE.Sprite(comaMaterial);
    comaSprite.scale.set(3.5, 3.5, 1);
    group.add(comaSprite);

    // 2. Fanning Particle Stream (Ion Tail)
    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0x88ccff);
    const fadeColor = new THREE.Color(0x224488);

    for (let i = 0; i < particleCount; i++) {
        const lengthRatio = Math.random(); 
        const z = lengthRatio * 25; // Tail stream length

        const spread = lengthRatio * 2.2 + 0.1; // Broadening cone width
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * spread;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        const mixedColor = baseColor.clone().lerp(fadeColor, lengthRatio);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const tailParticles = new THREE.Points(geometry, material);
    group.add(tailParticles);

    mesh.add(group);
    return group;
}

function createSunGlow(size) {
    const loader = new THREE.TextureLoader();
    const glowTexture = loader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png');
    const material = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffdd88,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.7
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size * 6, size * 6, 1);
    return sprite;
}

/**
 * Master Build Function
 */
export function buildSystem(scene, systemData, camera) {
    const objects = [];
    
    systemData.forEach((data) => {
        if (data.type === "BELT") {
            const beltMesh = createBeltMesh(data);
            scene.add(beltMesh);
            objects.push({ type: 'belt', mesh: beltMesh, data: data });
            return;
        }

        const group = new THREE.Group();
        if (data.distance > 0) scene.add(createOrbitLine(data));

        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        let mesh;

        if (data.name === "Sun") {
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
                map: textureCache["Sun"], color: 0xffffff
            }));
            const flares = new THREE.Mesh(
                new THREE.SphereGeometry(data.size * 1.02, 32, 32),
                new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, side: THREE.BackSide })
            );
            mesh.add(flares);
            mesh.add(createSunGlow(data.size));
        } else {
            const mat = new THREE.MeshStandardMaterial({
                roughness: 0.8, 
                metalness: 0.1,
                emissive: new THREE.Color(0xffffff),
                emissiveIntensity: 0.15 
            });
            
            const tex = textureCache[data.name];
            if (tex) {
                mat.map = tex; 
                mat.emissiveMap = tex; 
            } else { 
                mat.color = new THREE.Color(data.color); 
            }

            if (data.name === "Halley's Comet") {
                mat.emissive = new THREE.Color(0xaaeeff);
                mat.emissiveIntensity = 1.2;
            }

            mesh = new THREE.Mesh(geometry, mat);

            const atmosphereConfigs = {
                "Earth": 0x4488ff, "Mars": 0xff4422, "Venus": 0xffcc88, "Neptune": 0x2244ff
            };

            if (atmosphereConfigs[data.name]) {
                const atmosphereMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(data.size * 1.04, 64, 64),
                    createAtmosphereMaterial(atmosphereConfigs[data.name], camera)
                );
                group.add(atmosphereMesh);
            }
        }

        mesh.frustumCulled = false;

        // Particle-based Ring System for Saturn (Light & Dark Brown Bands)
        if (data.name === "Saturn") {
            const saturnRings = createParticleRing({
                innerRadius: data.size * 1.4,
                outerRadius: data.size * 2.8,
                count: 14000,
                color: 0xd4c391,
                pointSize: 0.25,
                opacity: 0.8,
                tiltX: 0,
                tiltZ: Math.PI * (26.7 / 180),
                isSaturn: true
            });
            mesh.add(saturnRings);
        }

        // Particle-based Ring System for Uranus (Darker Cyan Tint)
        if (data.name === "Uranus") {
            const uranusRings = createParticleRing({
                innerRadius: data.size * 1.4,
                outerRadius: data.size * 2.1,
                count: 3500,
                color: 0x336688,
                pointSize: 0.2,
                opacity: 0.45,
                tiltX: Math.PI / 2,
                tiltZ: 0
            });
            mesh.add(uranusRings);
        }

        mesh.userData = data;
        group.add(mesh);
        scene.add(group);

        const planetObj = { 
            type: data.type === "COMET" ? 'comet' : 'planet', 
            mesh: mesh, group: group, data: data, 
            angle: Math.random() * Math.PI * 2, moons: [] 
        };

        if (data.type === "COMET") planetObj.tail = createCometTail(mesh);

        if (data.moons) {
            data.moons.forEach((moonData) => {
                const moonMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(moonData.size, 32, 32),
                    new THREE.MeshStandardMaterial({ 
                        color: moonData.color, 
                        emissive: moonData.color, 
                        emissiveIntensity: 0.1 
                    })
                );
                mesh.add(moonMesh);
                planetObj.moons.push({ mesh: moonMesh, data: moonData, angle: Math.random() * Math.PI * 2 });
            });
        }
        objects.push(planetObj);
    });
    return objects;
}
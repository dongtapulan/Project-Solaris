import * as THREE from 'three';
import { addPlanetaryAtmosphere } from './utils/atmosphere.js';

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
 * Procedural Soft Star Texture for Subtle Star Points
 */
function createStarSpriteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(200,220,255,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    
    return new THREE.CanvasTexture(canvas);
}

/**
 * Balanced, Non-Blinding Starfield with Spectral Star Colors
 */
export function createStars(scene) {
    const particleCount = 6000;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const colorObj = new THREE.Color();
    
    const starPalettes = [
        { hex: 0x9db4ff, weight: 0.15 }, // Blue-white
        { hex: 0xd8e2ff, weight: 0.25 }, // White
        { hex: 0xfff4ea, weight: 0.30 }, // Solar yellow-white
        { hex: 0xffd2a1, weight: 0.20 }, // Orange
        { hex: 0xffa877, weight: 0.10 }  // Red
    ];

    for (let i = 0; i < particleCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 8000 + Math.random() * 2000;

        vertices.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );

        const rand = Math.random();
        let cumulative = 0;
        let selectedHex = 0xffffff;
        for (const p of starPalettes) {
            cumulative += p.weight;
            if (rand <= cumulative) {
                selectedHex = p.hex;
                break;
            }
        }

        colorObj.setHex(selectedHex);
        const intensity = 0.4 + Math.random() * 0.4;
        colors.push(colorObj.r * intensity, colorObj.g * intensity, colorObj.b * intensity);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const starMaterial = new THREE.PointsMaterial({ 
        size: 8, 
        map: createStarSpriteTexture(), 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.55, 
        blending: THREE.AdditiveBlending, 
        depthWrite: false,
        sizeAttenuation: true 
    });

    const starField = new THREE.Points(geometry, starMaterial);
    scene.add(starField);
}

/**
 * Balanced, Atmospheric Milky Way Galaxy Band
 */
export function createMilkyWay(scene) {
    const mwGroup = new THREE.Group();
    const particleCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const colorObj = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 7000 + 400;
        const angle = Math.random() * Math.PI * 2 + (radius * 0.0004);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const coreDistFactor = Math.exp(-radius / 2500);
        const y = (Math.random() - 0.5) * (250 + coreDistFactor * 900);

        positions.push(x, y, z);

        if (radius < 1800) {
            colorObj.setHex(0xffd580);
        } else if (radius < 4500 && Math.sin(angle * 2) > 0) {
            colorObj.setHex(0xd455aa);
        } else if (radius < 5500) {
            colorObj.setHex(0x4488cc);
        } else {
            colorObj.setHex(0x1a1033);
        }

        const alpha = Math.max(0.02, (1.0 - (radius / 7500)) * (0.4 - Math.abs(y) / 800));
        colors.push(colorObj.r * alpha, colorObj.g * alpha, colorObj.b * alpha);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mwMaterial = new THREE.PointsMaterial({
        size: 24,
        map: createStarSpriteTexture(),
        vertexColors: true,
        transparent: true,
        opacity: 0.30,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const mwParticleSystem = new THREE.Points(geometry, mwMaterial);
    
    mwGroup.rotation.x = 0.55;
    mwGroup.rotation.z = -0.35;
    mwGroup.add(mwParticleSystem);

    scene.add(mwGroup);
    return mwGroup;
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
        color: data.color, emissive: data.color, emissiveIntensity: 0.35,
        roughness: 0.9
    });
    const mesh = new THREE.InstancedMesh(geometry, material, data.count);
    const dummy = new THREE.Object3D();

    const isKuiper = data.name === 'Kuiper Belt';
    const innerR = data.innerRadius;
    const outerR = data.outerRadius;
    const thickness = isKuiper ? 16 : 3.5;

    for (let i = 0; i < data.count; i++) {
        const u = Math.random();
        const r = Math.sqrt(u * (outerR * outerR - innerR * innerR) + innerR * innerR);
        const angle = Math.random() * Math.PI * 2;
        const yScatter = (Math.random() - 0.5) * (thickness + (r * 0.05));

        dummy.position.set(
            Math.cos(angle) * r, 
            yScatter, 
            Math.sin(angle) * r
        );
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const scale = Math.random() * 0.6 + 0.4;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    return mesh;
}

function createParticleRing({ 
    innerRadius, 
    outerRadius, 
    count, 
    color, 
    pointSize = 0.18, 
    opacity = 0.60, 
    tiltX = 0, 
    tiltZ = 0,
    isSaturn = false
}) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    const baseColor = new THREE.Color(color);
    const lightBrown = new THREE.Color(0xb8a982);
    const darkBrown = new THREE.Color(0x423522);
    const cassiniGap = new THREE.Color(0x0f0b08);

    for (let i = 0; i < count; i++) {
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const theta = Math.random() * Math.PI * 2;

        const y = (Math.random() - 0.5) * 0.08;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);

        positions.push(x, y, z);

        let particleColor = baseColor.clone();

        if (isSaturn) {
            const normR = (radius - innerRadius) / (outerRadius - innerRadius);

            if (normR < 0.25) {
                particleColor.copy(darkBrown);
            } else if (normR >= 0.25 && normR < 0.63) {
                particleColor.copy(lightBrown);
            } else if (normR >= 0.63 && normR < 0.70) {
                particleColor.copy(cassiniGap);
            } else {
                particleColor.copy(lightBrown).lerp(darkBrown, 0.45);
            }
        }

        const variance = 0.90 + Math.random() * 0.15;
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
        blending: THREE.NormalBlending,
        depthWrite: false
    });

    const ringParticles = new THREE.Points(geometry, material);
    ringParticles.rotation.x = tiltX;
    ringParticles.rotation.z = tiltZ;

    return ringParticles;
}

function createCometTail(mesh) {
    const group = new THREE.Group();

    const loader = new THREE.TextureLoader();
    const comaTexture = loader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png');
    const comaMaterial = new THREE.SpriteMaterial({
        map: comaTexture,
        color: 0x99ddff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.85
    });
    const comaSprite = new THREE.Sprite(comaMaterial);
    comaSprite.scale.set(3.5, 3.5, 1);
    group.add(comaSprite);

    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0x88ccff);
    const fadeColor = new THREE.Color(0x224488);

    for (let i = 0; i < particleCount; i++) {
        const lengthRatio = Math.random(); 
        const z = lengthRatio * 25; 
        const spread = lengthRatio * 2.2 + 0.1; 
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
        opacity: 0.55,
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
        opacity: 0.6
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size * 6, size * 6, 1);
    return sprite;
}

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
                new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, side: THREE.BackSide })
            );
            mesh.add(flares);
            mesh.add(createSunGlow(data.size));
        } else {
            const mat = new THREE.MeshStandardMaterial({
                roughness: 0.85, 
                metalness: 0.05,
                emissive: new THREE.Color(0xffffff),
                emissiveIntensity: 0.08
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
                mat.emissiveIntensity = 1.0;
            }

            mesh = new THREE.Mesh(geometry, mat);

            // Attach Atmospheric Glow & Clouds
            addPlanetaryAtmosphere(mesh, data.name, data.size);
        }

        mesh.frustumCulled = false;

        if (data.name === "Saturn") {
            const saturnRings = createParticleRing({
                innerRadius: data.size * 1.35,
                outerRadius: data.size * 2.45,
                count: 16000,
                color: 0xc4b38d,
                pointSize: 0.16,
                opacity: 0.65,
                tiltX: 0,
                tiltZ: Math.PI * (26.7 / 180),
                isSaturn: true
            });
            mesh.add(saturnRings);
        }

        if (data.name === "Uranus") {
            const uranusRings = createParticleRing({
                innerRadius: data.size * 1.4,
                outerRadius: data.size * 1.95,
                count: 4000,
                color: 0x4477aa,
                pointSize: 0.14,
                opacity: 0.35,
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
                        emissiveIntensity: 0.05 
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
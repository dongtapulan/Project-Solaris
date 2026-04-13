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
    "Sedna": TEX_PATH + "2k_sedna.jpg",
    "Saturn_Ring": TEX_PATH + "2k_saturn_ring_alpha.png"
};

const textureCache = {};
Object.entries(TEXTURE_MAP).forEach(([key, path]) => {
    const tex = textureLoader.load(path);
    tex.anisotropy = 8; // Reduced from 16 to 8 to save laptop memory
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
        color: data.color, emissive: data.color, emissiveIntensity: 0.5 // High visibility
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

function createTexturedRing(data) {
    const geometry = new THREE.RingGeometry(data.size * 1.4, data.size * 2.5, 64);
    const material = new THREE.MeshStandardMaterial({
        map: textureCache["Saturn_Ring"], transparent: true, opacity: 0.6,
        side: THREE.DoubleSide, depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
}

function createParticleRing(data) {
    const particles = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < particles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = data.size * 1.8 + Math.random() * 0.5;
        positions.push(Math.cos(angle) * r, Math.sin(angle) * r, 0);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ 
        color: 0x88ccff, size: 0.1, transparent: true, opacity: 0.5 
    });
    const points = new THREE.Points(geometry, material);
    points.rotation.x = Math.PI / 2; 
    return points;
}

function createCometTail(mesh) {
    const particles = 1000; // Increased for better visual
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);

    for(let i=0; i<particles; i++) {
        positions[i*3] = 0;
        positions[i*3+1] = 0;
        positions[i*3+2] = i * 0.1; // Length of tail
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ 
        color: 0x88aaff, size: 0.15, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
    });
    const tail = new THREE.Points(geometry, material);
    mesh.add(tail);
    return tail;
}

// REALISTIC SUN GLOW (Sprite based for performance)
function createSunGlow(size) {
    const loader = new THREE.TextureLoader();
    // Using a generic glow texture
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
 * Updated Master Build Function
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
            // Add Flare + Sprite Glow
            const flares = new THREE.Mesh(
                new THREE.SphereGeometry(data.size * 1.02, 32, 32),
                new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, side: THREE.BackSide })
            );
            mesh.add(flares);
            mesh.add(createSunGlow(data.size));
        } else {
            // THE "DARK SIDE" LOGIC:
            // We use Emissive to make sure the planet isn't pitch black,
            // but keep EmissiveIntensity low (0.15) so the Sun light still creates a clear day/night.
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

            // Halley's Comet Glow
            if (data.name === "Halley's Comet") {
                mat.emissive = new THREE.Color(0x88aaff);
                mat.emissiveIntensity = 1.0;
            }

            mesh = new THREE.Mesh(geometry, mat);

            // Atmospheric Scattering
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
        if (data.name === "Saturn") mesh.add(createTexturedRing(data));
        if (data.name === "Uranus") mesh.add(createParticleRing(data));

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
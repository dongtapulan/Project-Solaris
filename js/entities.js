import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const TEX_PATH = 'assets/textures/';

const TEXTURE_MAP = {
    "Sun": TEX_PATH + "2k_sun.jpg",
    "Mercury": TEX_PATH + "2k_mercury.jpg",
    "Venus": TEX_PATH + "2k_venus.jpg",
    "Jupiter": TEX_PATH + "2k_jupiter.jpg",
    "Saturn": TEX_PATH + "2k_saturn.jpg",
    "Uranus": TEX_PATH + "2k_uranus.jpg",
    "Neptune": TEX_PATH + "2k_neptune.jpg",
    "Mars": TEX_PATH + "2k_mars.jpg",
    "Ceres": TEX_PATH + "2k_ceres_fictional.jpg",
    "Eris": TEX_PATH + "2k_eris_fictional.jpg",
    "Haumea": TEX_PATH + "2k_haumea_fictional.jpg",
    "Makemake": TEX_PATH + "2k_makemake_fictional.jpg",
    "Saturn_Ring": TEX_PATH + "2k_saturn_ring_alpha.png"
};

export function createStars(scene) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const colorObj = new THREE.Color();
    
    for (let i = 0; i < 8000; i++) {
        vertices.push(
            THREE.MathUtils.randFloatSpread(5000), 
            THREE.MathUtils.randFloatSpread(5000), 
            THREE.MathUtils.randFloatSpread(5000)
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
        size: 1.5, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.8, 
        sizeAttenuation: true 
    });
    scene.add(new THREE.Points(geometry, material));
}

function createOrbitLine(data) {
    const points = [];
    const segments = 128;
    const a = data.distance; 
    const e = data.eccentricity || 0;
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        points.push(new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
    const line = new THREE.Line(geometry, material);
    if (data.inclination) line.rotation.x = data.inclination;
    return line;
}

function createBeltMesh(data) {
    const geometry = new THREE.DodecahedronGeometry(data.name === 'Kuiper Belt' ? 0.6 : 0.3, 0);
    const material = new THREE.MeshStandardMaterial({ color: data.color, emissive: data.color, emissiveIntensity: 0.5 });
    const mesh = new THREE.InstancedMesh(geometry, material, data.count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < data.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = data.innerRadius + Math.random() * (data.outerRadius - data.innerRadius);
        dummy.position.set(Math.cos(angle) * r, THREE.MathUtils.randFloatSpread(data.name === 'Kuiper Belt' ? 12 : 3), Math.sin(angle) * r);
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
    const ringTexPath = (data.name === "Saturn") ? TEXTURE_MAP["Saturn_Ring"] : data.ringTextureUrl;
    const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(ringTexPath),
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide, // FIXED: Viewable from both sides
        depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
}

// NEW: Uranus's vertical particle rings
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
    const material = new THREE.PointsMaterial({ color: 0x88ccff, size: 0.05, transparent: true, opacity: 0.5 });
    const points = new THREE.Points(geometry, material);
    points.rotation.y = Math.PI / 2; // Tilt it vertically for Uranus
    return points;
}

// NEW: Comet Tail
function createCometTail(mesh) {
    const particles = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xaaaaff, size: 0.1, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    const tail = new THREE.Points(geometry, material);
    mesh.add(tail);
    return tail;
}

function createSunFlares(sunMesh) {
    const flareGeo = new THREE.SphereGeometry(sunMesh.geometry.parameters.radius * 1.05, 64, 64);
    const flareMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, side: THREE.BackSide, fog: false 
    });
    const flareMesh = new THREE.Mesh(flareGeo, flareMat);
    sunMesh.add(flareMesh);
    return flareMesh;
}

export function buildSystem(scene, systemData) {
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
        const activeTextureUrl = TEXTURE_MAP[data.name] || data.textureUrl;

        if (data.name === "Sun") {
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ 
                map: textureLoader.load(activeTextureUrl), color: 0xffffff, fog: false 
            }));
            createSunFlares(mesh);
        } else {
            const mat = new THREE.MeshStandardMaterial({
                roughness: 0.8, metalness: 0.1,
                emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.15 
            });
            if (activeTextureUrl) {
                const tex = textureLoader.load(activeTextureUrl);
                mat.map = tex; mat.emissiveMap = tex; 
            } else { mat.color = new THREE.Color(data.color); }
            mesh = new THREE.Mesh(geometry, mat);
        }

        if (data.name === "Saturn") mesh.add(createTexturedRing(data));
        if (data.name === "Uranus") mesh.add(createParticleRing(data)); // FIXED: Uranus Rings

        mesh.userData = data;
        group.add(mesh);
        scene.add(group);

        const planetObj = { 
            type: data.type === "COMET" ? 'comet' : 'planet', 
            mesh: mesh, group: group, data: data, 
            angle: Math.random() * Math.PI * 2, moons: [] 
        };

        if (data.type === "COMET") planetObj.tail = createCometTail(mesh); // FIXED: Comet Tail

        if (data.moons) {
            data.moons.forEach((moonData) => {
                const moonMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(moonData.size, 32, 32),
                    new THREE.MeshStandardMaterial({ map: moonData.textureUrl ? textureLoader.load(moonData.textureUrl) : null, color: moonData.color })
                );
                const moonPivot = new THREE.Group();
                mesh.add(moonPivot);
                moonMesh.position.set(moonData.distance, 0, 0);
                moonPivot.add(moonMesh);
                planetObj.moons.push({ mesh: moonMesh, pivot: moonPivot, data: moonData, angle: Math.random() * Math.PI * 2 });
            });
        }
        objects.push(planetObj);
    });
    return objects;
}
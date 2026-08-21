export const CONFIG = {
    rotationSpeed: 0.15, 
    zoomFactor: 3.0,     
    smoothness: 0.04    
};

export const SYSTEM_DATA = [
    {
        name: "Sun", size: 15, color: "#ffaa00", emissive: "#ff5500", distance: 0, speed: 0,
        textureUrl: "assets/textures/2k_sun.jpg",
        desc: "A G-type main-sequence star (G2V) comprising 99.86% of the solar system's total mass. Its core reaches temperatures around 15 million Kelvin, generating energy through thermonuclear fusion that converts hydrogen into helium via the proton-proton chain reaction.", 
        type: "STAR", year: "--",
        obliquity: 7.25
    },
    {
        name: "Mercury", size: 1.2, color: "#CCCCCC", distance: 40, 
        elements: {
            semiMajorAxis: 0.387,
            eccentricity: 0.2056,
            inclination: 7.005,
            meanLong: 252.25,
            longitudePeri: 77.45
        },
        obliquity: 0.034,
        textureUrl: "assets/textures/2k_mercury.jpg",
        desc: "The smallest planet and closest to the Sun. It experiences extreme temperature swings from 430°C to -180°C due to its lack of a substantial atmosphere. It exhibits a 3:2 spin-orbit resonance, rotating three times for every two orbits around the Sun.", 
        type: "TERRESTRIAL", year: "88 Days"
    },
    {
        name: "Venus", size: 2.4, color: "#F5D08B", distance: 65, 
        elements: {
            semiMajorAxis: 0.723,
            eccentricity: 0.0067,
            inclination: 3.394,
            meanLong: 181.98,
            longitudePeri: 131.53
        },
        obliquity: 177.3,
        textureUrl: "assets/textures/2k_venus.jpg",
        desc: "Earth's structural twin, wrapped in a dense atmosphere composed of 96.5% carbon dioxide. A runaway greenhouse effect drives surface temperatures to 465°C. Venus features retrograde rotation, spinning in the opposite direction of most planets.", 
        type: "TERRESTRIAL", year: "225 Days", hasGlow: true, glowColor: "#FFD700"
    },
    {
        name: "Earth", size: 2.5, color: "#4466FF", distance: 90, 
        elements: {
            semiMajorAxis: 1.000,
            eccentricity: 0.0167,
            inclination: 0.000,
            meanLong: 100.46,
            longitudePeri: 102.94
        },
        obliquity: 23.44,
        textureUrl: "assets/textures/2k_earth_daymap.jpg",
        desc: "The only known world to host life and active plate tectonics. Liquid water covers ~71% of its surface, supported by an atmosphere rich in nitrogen and oxygen. Its strong magnetosphere shields the surface from cosmic solar radiation.", 
        type: "TERRESTRIAL", year: "365.25 Days", hasGlow: true, glowColor: "#00FFFF",
        moons: [
            { 
                name: "Moon", size: 0.6, color: "#999999", distance: 7, 
                elements: { eccentricity: 0.0549, inclination: 5.14 },
                desc: "Earth's only natural satellite. Tidally locked to Earth, it causes planetary ocean tides and acts to stabilize Earth's axial tilt."
            }
        ]
    },
    {
        name: "Mars", size: 1.8, color: "#FF5522", distance: 120, 
        elements: {
            semiMajorAxis: 1.523,
            eccentricity: 0.0934,
            inclination: 1.850,
            meanLong: 355.45,
            longitudePeri: 336.04
        },
        obliquity: 25.19,
        textureUrl: "assets/textures/2k_mars.jpg",
        desc: "A cold, desert world given a red hue by widespread iron oxide on its surface. Mars holds the highest volcano in the solar system, Olympus Mons, and an expansive canyon network known as Valles Marineris.", 
        type: "TERRESTRIAL", year: "687 Days",
        moons: [
            { name: "Phobos", size: 0.2, color: "#888888", distance: 4, desc: "The larger, innermost moon of Mars. It orbits below synchronous altitude and is gradually spiraling inward toward Mars." },
            { name: "Deimos", size: 0.15, color: "#AAAAAA", distance: 6, desc: "The smaller, outer moon of Mars. Highly irregular in shape and heavily cratered, likely a captured C-type asteroid." }
        ]
    },
    {
        name: "Asteroid Belt", type: "BELT", distance: 160, innerRadius: 150, outerRadius: 180, speed: 0.005, count: 3000, color: "#AAAAAA", 
        desc: "A circumstellar torus located between Mars and Jupiter. It consists of primordial planetesimals prevented from accreting into a planet due to Jupiter's immense gravitational disruptions.", 
        year: "3-6 Years"
    },
    {
        name: "Ceres", size: 0.8, color: "#DDDDDD", distance: 165, 
        elements: {
            semiMajorAxis: 2.767,
            eccentricity: 0.075,
            inclination: 10.59,
            meanLong: 153.9,
            longitudePeri: 73.5
        },
        obliquity: 4.0,
        textureUrl: "assets/textures/2k_ceres_fictional.jpg",
        desc: "The largest object in the main asteroid belt and the only dwarf planet located in the inner solar system. It accounts for roughly one-third of the asteroid belt's total mass and exhibits active cryovolcanism.", 
        type: "DWARF PLANET", year: "4.6 Years"
    },
    {
        name: "Jupiter", size: 8, color: "#E0B080", distance: 240, 
        elements: {
            semiMajorAxis: 5.203,
            eccentricity: 0.0483,
            inclination: 1.305,
            meanLong: 34.40,
            longitudePeri: 14.75
        },
        obliquity: 3.13,
        textureUrl: "assets/textures/2k_jupiter.jpg",
        desc: "The solar system's largest planet, possessing over twice the combined mass of all other planets. Composed primarily of hydrogen and helium, its outer atmosphere features the Great Red Spot—an anticyclonic storm larger than Earth.", 
        type: "GAS GIANT", year: "11.86 Years",
        moons: [
            { name: "Io", size: 0.5, color: "#FFDD44", distance: 12, desc: "The most volcanically active body in the solar system, heated internally by intense tidal friction generated by Jupiter and neighbor moons." },
            { name: "Europa", size: 0.45, color: "#CCCCCC", distance: 15, desc: "A smooth, ice-encased world harboring a subterranean liquid water ocean containing more water than all of Earth's oceans combined." },
            { name: "Ganymede", size: 0.7, color: "#998877", distance: 18, desc: "The largest moon in the solar system (larger than Mercury) and the only satellite known to possess its own intrinsic magnetic field." },
            { name: "Callisto", size: 0.65, color: "#666666", distance: 22, desc: "Heavily cratered and ancient, Callisto has the oldest surface in the solar system with little evidence of geologic activity." }
        ]
    },
    {
        name: "Saturn", size: 7, color: "#F0E0C0", distance: 320, 
        elements: {
            semiMajorAxis: 9.537,
            eccentricity: 0.0541,
            inclination: 2.484,
            meanLong: 49.94,
            longitudePeri: 92.43
        },
        obliquity: 26.73,
        textureUrl: "assets/textures/2k_saturn.jpg",
        ringTextureUrl: "assets/textures/2k_saturn_ring_alpha.png",
        desc: "Renowned for its extensive ring system made of water ice crystals and trace rocky debris. Saturn is the least dense planet in the solar system—less dense than liquid water.", 
        type: "GAS GIANT", year: "29.45 Years",
        moons: [
            { name: "Mimas", size: 0.25, color: "#BBBBBB", distance: 11, desc: "Dominated by the huge Herschel impact crater, giving it a distinct visual resemblance to the 'Death Star'." },
            { name: "Enceladus", size: 0.35, color: "#FFFFFF", distance: 14, desc: "Reflects nearly 100% of sunlight. Active geysers at its south pole erupt plumes of water ice into space from a global subsurface ocean." },
            { name: "Titan", size: 0.65, color: "#E0A050", distance: 20, desc: "The second-largest moon in the solar system, surrounded by a dense nitrogen atmosphere with stable lakes of liquid methane and ethane." }
        ]
    },
    {
        name: "Uranus", size: 4.5, color: "#A0F0F5", distance: 400, 
        elements: {
            semiMajorAxis: 19.191,
            eccentricity: 0.0471,
            inclination: 0.772,
            meanLong: 313.23,
            longitudePeri: 170.96
        },
        obliquity: 97.77,
        textureUrl: "assets/textures/2k_uranus.jpg",
        desc: "An ice giant whose atmospheric methane absorbs red light, giving it a cyan hue. It has an extreme axial tilt of 97.8°, causing it to effectively rotate on its side and experience 42-year long seasonal light cycles.", 
        type: "ICE GIANT", year: "84 Years",
        moons: [
            { name: "Miranda", size: 0.2, color: "#AAAAAA", distance: 8, desc: "Displays chaotic, patchwork terrain with canyons up to 12 times deeper than Earth's Grand Canyon." },
            { name: "Ariel", size: 0.3, color: "#C0C0C0", distance: 11, desc: "Features the brightest and youngest-looking surface among Uranus's moons, marked by extensive fault scarps." },
            { name: "Umbriel", size: 0.3, color: "#666666", distance: 14, desc: "The darkest of Uranian moons, covered in ancient, heavily pitted impact craters." },
            { name: "Titania", size: 0.4, color: "#B0B0B0", distance: 17, desc: "The largest moon of Uranus, composed of roughly equal parts ice and rock with fault valleys hundreds of kilometers long." },
            { name: "Oberon", size: 0.38, color: "#888888", distance: 20, desc: "The outermost major moon of Uranus, heavily cratered with dark material coating the floors of many impact basins." }
        ]
    },
    {
        name: "Neptune", size: 4.4, color: "#5577FF", distance: 480, 
        elements: {
            semiMajorAxis: 30.068,
            eccentricity: 0.0085,
            inclination: 1.769,
            meanLong: 304.88,
            longitudePeri: 44.97
        },
        obliquity: 28.32,
        textureUrl: "assets/textures/2k_neptune.jpg",
        desc: "The solar system's outermost major planet. Driven by internal heat, its dynamic atmosphere supports the fastest sustained planetary winds recorded, exceeding 2,100 km/h.", 
        type: "ICE GIANT", year: "164.8 Years",
        moons: [
            { name: "Triton", size: 0.5, color: "#77AABB", distance: 13, desc: "Orbits Neptune in a retrograde direction (opposite the planet's rotation), indicating it was captured from the Kuiper Belt. Features active nitrogen cryogeysers." }
        ]
    },
    {
        name: "Pluto", size: 0.7, color: "#EEDDBB", distance: 540, 
        elements: {
            semiMajorAxis: 39.482,
            eccentricity: 0.2488,
            inclination: 17.16,
            meanLong: 238.92,
            longitudePeri: 224.06
        },
        obliquity: 122.53,
        textureUrl: "assets/textures/2k_pluto.jpg",
        desc: "A prominent dwarf planet in the Kuiper Belt with a highly eccentric and inclined orbit. Its surface features nitrogen ice plains like Sputnik Planitia and mountain ranges made of water ice.", 
        type: "DWARF PLANET", year: "248 Years",
        moons: [
            { name: "Charon", size: 0.35, color: "#998877", distance: 6, desc: "Over half the size of Pluto. The two bodies are mutually tidally locked, orbiting a shared center of mass outside Pluto's surface as a binary system." }
        ]
    },
    {
        name: "Haumea", size: 0.6, color: "#DDDDDD", distance: 580, 
        elements: {
            semiMajorAxis: 43.335,
            eccentricity: 0.191,
            inclination: 28.19,
            meanLong: 215.1,
            longitudePeri: 238.7
        },
        obliquity: 126.0,
        textureUrl: "assets/textures/2k_haumea_fictional.jpg",
        desc: "A fast-rotating trans-Neptunian object whose rapid 3.9-hour spin has distorted its shape into an elongated triaxial ellipsoid. It possesses its own ring system and crystalline ice surface.", 
        type: "DWARF PLANET", year: "285 Years"
    },
    {
        name: "Quaoar", size: 0.6, color: "#888888", distance: 600, 
        elements: {
            semiMajorAxis: 43.694,
            eccentricity: 0.038,
            inclination: 7.99,
            meanLong: 190.5,
            longitudePeri: 96.1
        },
        obliquity: 0.0,
        textureUrl: "assets/textures/2k_quoaoar.jpg",
        desc: "A icy Kuiper Belt object surrounded by a dense ring located far beyond its theoretical Roche limit, defying traditional ring-formation dynamics.", 
        type: "DWARF PLANET", year: "289 Years"
    },
    {
        name: "Makemake", size: 0.6, color: "#FFAA88", distance: 620, 
        elements: {
            semiMajorAxis: 45.791,
            eccentricity: 0.155,
            inclination: 28.96,
            meanLong: 177.3,
            longitudePeri: 295.6
        },
        textureUrl: "assets/textures/2k_makemake_fictional.jpg",
        desc: "The second-brightest Kuiper Belt object visible from Earth after Pluto. Covered in frozen methane, ethane, and tholins, it lacks a substantial persistent atmosphere.", 
        type: "DWARF PLANET", year: "309 Years"
    },
    {
        name: "Gonggong", size: 0.7, color: "#BB4422", distance: 660, 
        elements: {
            semiMajorAxis: 67.33,
            eccentricity: 0.506,
            inclination: 30.7,
            meanLong: 120.4,
            longitudePeri: 151.8
        },
        obliquity: 0.0,
        textureUrl: "assets/textures/2k_gonggong.jpg",
        desc: "A highly eccentric resonant trans-Neptunian object. Its distinctly red surface is caused by organic tholin compounds produced by solar ultraviolet radiation interacting with surface ice.", 
        type: "DWARF PLANET", year: "554 Years"
    },
    {
        name: "Eris", size: 0.7, color: "#FFFFFF", distance: 780, 
        elements: {
            semiMajorAxis: 67.668,
            eccentricity: 0.441,
            inclination: 44.18,
            meanLong: 32.5,
            longitudePeri: 151.4
        },
        textureUrl: "assets/textures/2k_eris_fictional.jpg",
        desc: "One of the most massive dwarf planets known. Its discovery in 2005 prompted the International Astronomical Union (IAU) to formalize the official definition of a planet.", 
        type: "DWARF PLANET", year: "558 Years"
    },
    {
        name: "Sedna", size: 1.0, color: "#993333", distance: 950, 
        elements: {
            semiMajorAxis: 525.8,
            eccentricity: 0.855,
            inclination: 11.92,
            meanLong: 315.4,
            longitudePeri: 311.3
        },
        textureUrl: "assets/textures/2k_sedna.jpg", 
        desc: "An extreme trans-Neptunian object with a hyper-elongated 11,400-year orbit. Its distant perihelion keeps it outside the gravitational influence of Neptune, making it an inner Oort Cloud candidate.", 
        type: "DWARF PLANET", 
        year: "11,400 Years"
    },
    {
        name: "Halley's Comet", size: 0.4, color: "#AAFFFF", distance: 250, 
        elements: {
            semiMajorAxis: 17.834,
            eccentricity: 0.967,
            inclination: 18.0,
            meanLong: 58.0,
            longitudePeri: 111.0
        },
        textureUrl: "assets/textures/2k_halley.jpg",
        desc: "A periodic comet in a highly eccentric retrograde orbit around the Sun. As it approaches perihelion, solar radiation sublimates volatile ice, producing a brilliant coma and tail.", 
        type: "COMET", year: "76 Years"
    },
    {
        name: "Kuiper Belt", type: "BELT", distance: 700, innerRadius: 650, outerRadius: 750, speed: 0.0002, count: 5000, color: "#88AAFF", 
        desc: "A circumstellar disc extending beyond Neptune's orbit (30–50 AU). It contains millions of icy remnants, planetesimals, and short-period comets from the solar system's accretion disk.", 
        year: "Hundreds of Years"
    }
];
export const CONFIG = {
    rotationSpeed: 0.15, 
    zoomFactor: 3.0,     
    smoothness: 0.04    
};

export const SYSTEM_DATA = [
    {
        name: "Sun", size: 15, color: "#ffaa00", emissive: "#ff5500", distance: 0, speed: 0,
        textureUrl: "assets/textures/2k_sun.jpg",
        desc: "The heart of our solar system. A G-type main-sequence star.", type: "STAR", year: "--",
        obliquity: 7.25 // Sun's axial tilt relative to the ecliptic
    },
    {
        name: "Mercury", size: 1.2, color: "#CCCCCC", distance: 40, 
        elements: {
            semiMajorAxis: 0.387,
            eccentricity: 0.2056,
            inclination: 7.005, // Degrees
            meanLong: 252.25,
            longitudePeri: 77.45
        },
        obliquity: 0.034,
        textureUrl: "assets/textures/2k_mercury.jpg",
        desc: "The smallest planet, cratered and scorched.", type: "TERRESTRIAL", year: "88 Days"
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
        obliquity: 177.3, // Retrograde rotation (upside down)
        textureUrl: "assets/textures/2k_venus.jpg",
        desc: "Earth's 'evil twin' with a runaway greenhouse effect.", type: "TERRESTRIAL", year: "225 Days", hasGlow: true, glowColor: "#FFD700"
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
        desc: "The only known world to support life.", type: "TERRESTRIAL", year: "365.25 Days", hasGlow: true, glowColor: "#00FFFF",
        moons: [{ 
            name: "Moon", size: 0.6, color: "#999999", distance: 7, 
            elements: { eccentricity: 0.0549, inclination: 5.14 } 
        }]
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
        desc: "A cold, desert world with iron-oxide dust.", type: "TERRESTRIAL", year: "687 Days",
        moons: [
            { name: "Phobos", size: 0.2, color: "#888888", distance: 4 },
            { name: "Deimos", size: 0.15, color: "#AAAAAA", distance: 6 }
        ]
    },
    {
        name: "Asteroid Belt", type: "BELT", distance: 160, innerRadius: 150, outerRadius: 180, speed: 0.005, count: 3000, color: "#AAAAAA", 
        desc: "Debris left over from the early formation of the solar system.", year: "3-6 Years"
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
        desc: "The largest object in the main asteroid belt.", type: "DWARF PLANET", year: "4.6 Years"
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
        desc: "King of the planets, twice as massive as all others combined.", type: "GAS GIANT", year: "11.86 Years"
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
        desc: "Adorned with a complex system of icy rings.", type: "GAS GIANT", year: "29.45 Years"
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
        obliquity: 97.77, // Rotates on its side
        textureUrl: "assets/textures/2k_uranus.jpg",
        desc: "An ice giant that rotates at a nearly 90-degree angle.", type: "ICE GIANT", year: "84 Years"
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
        desc: "The windiest world, 30 times farther from the Sun than Earth.", type: "ICE GIANT", year: "164.8 Years"
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
        desc: "A complex world of ice mountains and frozen plains.", type: "DWARF PLANET", year: "248 Years"
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
        desc: "Fast-spinning ellipsoid located in the Kuiper Belt.", type: "DWARF PLANET", year: "285 Years"
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
        desc: "A Kuiper Belt object with a small moon named Weywot.", type: "DWARF PLANET", year: "289 Years"
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
        desc: "A reddish dwarf planet with no significant atmosphere.", type: "DWARF PLANET", year: "309 Years"
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
        desc: "A large, distant dwarf planet with a distinct red surface.", type: "DWARF PLANET", year: "554 Years"
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
        desc: "One of the most massive dwarf planets in our solar system.", type: "DWARF PLANET", year: "558 Years"
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
        desc: "An extremely distant trans-Neptunian object.", 
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
        desc: "A periodic comet that returns to Earth's vicinity every 75–76 years.", type: "COMET", year: "76 Years"
    },
    {
        name: "Kuiper Belt", type: "BELT", distance: 700, innerRadius: 650, outerRadius: 750, speed: 0.0002, count: 5000, color: "#88AAFF", 
        desc: "A circumstellar disc in the outer Solar System.", year: "Hundreds of Years"
    }
];
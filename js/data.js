export const CONFIG = {
    rotationSpeed: 0.15, 
    zoomFactor: 3.0,     
    smoothness: 0.04    
};

export const SYSTEM_DATA = [
    {
        name: "Sun", size: 15, color: "#ffaa00", emissive: "#ff5500", distance: 0, speed: 0,
        textureUrl: "assets/textures/2k_sun.jpg",
        desc: "The heart of our solar system. A nearly perfect sphere of hot plasma, radiating energy.", type: "STAR", year: "--"
    },
    {
        name: "Mercury", size: 1.2, color: "#CCCCCC", distance: 40, speed: 0.04, eccentricity: 0.205,
        textureUrl: "assets/textures/2k_mercury.jpg",
        desc: "The smallest planet in the Solar System and the closest to the Sun.", type: "TERRESTRIAL", year: "88 Days"
    },
    {
        name: "Venus", size: 2.4, color: "#F5D08B", distance: 65, speed: 0.015, eccentricity: 0.006,
        textureUrl: "assets/textures/2k_venus.jpg", // Using your atmosphere texture
        desc: "The second planet from the Sun. It has a toxic, thick atmosphere.", type: "TERRESTRIAL", year: "225 Days", hasGlow: true, glowColor: "#FFD700"
    },
    {
        name: "Earth", size: 2.5, color: "#4466FF", distance: 90, speed: 0.01, eccentricity: 0.016,
        textureUrl: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
        desc: "Our home. The only known planet in the universe to support life.", type: "TERRESTRIAL", year: "365 Days", hasGlow: true, glowColor: "#00FFFF",
        moons: [{ 
            name: "Moon", size: 0.6, color: "#999999", distance: 7, speed: 0.04, eccentricity: 0.054,
            textureUrl: "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg"
        }]
    },
    {
        name: "Mars", size: 1.8, color: "#FF5522", distance: 120, speed: 0.008, eccentricity: 0.093,
        textureUrl: "assets/textures/2k_mars.jpg",
        desc: "The Red Planet.", type: "TERRESTRIAL", year: "687 Days",
        moons: [
            { name: "Phobos", size: 0.2, color: "#888888", distance: 4, speed: 0.06 },
            { name: "Deimos", size: 0.15, color: "#AAAAAA", distance: 6, speed: 0.04 }
        ]
    },
    {
        name: "Asteroid Belt", type: "BELT", distance: 160, innerRadius: 150, outerRadius: 180, speed: 0.005, count: 3000, color: "#AAAAAA", 
        desc: "A torus-shaped region occupied by a great many solid bodies.", year: "3-6 Years"
    },
    {
        name: "Ceres", size: 0.8, color: "#DDDDDD", distance: 165, speed: 0.005, eccentricity: 0.075,
        textureUrl: "assets/textures/2k_ceres_fictional.jpg",
        desc: "The largest object in the asteroid belt.", type: "DWARF PLANET", year: "4.6 Years"
    },
    {
        name: "Jupiter", size: 8, color: "#E0B080", distance: 240, speed: 0.002, eccentricity: 0.048,
        textureUrl: "assets/textures/2k_jupiter.jpg",
        desc: "The largest planet.", type: "GAS GIANT", year: "12 Years",
        moons: [
            { name: "Io", size: 0.4, color: "#F0E040", distance: 14, speed: 0.03 },
            { name: "Europa", size: 0.35, color: "#A0A0FF", distance: 18, speed: 0.02 }
        ]
    },
    {
        name: "Saturn", size: 7, color: "#F0E0C0", distance: 320, speed: 0.0009, eccentricity: 0.056,
        textureUrl: "assets/textures/2k_saturn.jpg",
        ringTextureUrl: "assets/textures/2k_saturn_ring_alpha.png",
        desc: "Famous for its rings.", type: "GAS GIANT", year: "29 Years",
        moons: [{ name: "Titan", size: 1.2, color: "#e3bb76", distance: 16, speed: 0.012 }]
    },
    {
        name: "Uranus", size: 4.5, color: "#A0F0F5", distance: 400, speed: 0.0004, eccentricity: 0.047,
        textureUrl: "assets/textures/2k_uranus.jpg",
        desc: "An ice giant.", type: "ICE GIANT", year: "84 Years"
    },
    {
        name: "Neptune", size: 4.4, color: "#5577FF", distance: 480, speed: 0.0001, eccentricity: 0.009,
        textureUrl: "asse",
        desc: "The most distant major planet.", type: "ICE GIANT", year: "165 Years",
        moons: [{ name: "Triton", size: 0.6, color: "#c9c9c9", distance: 10, speed: 0.018 }]
    },
    {
        name: "Pluto", size: 0.7, color: "#EEDDBB", distance: 540, speed: 0.00008, eccentricity: 0.248, inclination: 0.3,
        textureUrl: "assets/textures/2k_pluto.jpg",
        desc: "The most famous dwarf planet.", type: "DWARF PLANET", year: "248 Years"
    },
    {
        name: "Haumea", size: 0.6, color: "#DDDDDD", distance: 580, speed: 0.00007, eccentricity: 0.195,
        textureUrl: "assets/textures/2k_haumea_fictional.jpg",
        desc: "An ellipsoid shaped dwarf planet.", type: "DWARF PLANET", year: "285 Years"
    },
    {
        name: "Makemake", size: 0.6, color: "#FFAA88", distance: 620, speed: 0.00006, eccentricity: 0.155,
        desc: "A dwarf planet in the Kuiper belt.", type: "DWARF PLANET", year: "309 Years"
    },
    {
        name: "Kuiper Belt", type: "BELT", distance: 700, innerRadius: 650, outerRadius: 750, speed: 0.0002, count: 5000, color: "#88AAFF", 
        desc: "A circumstellar disc in the outer Solar System.", year: "Hundreds of Years"
    },
    {
        name: "Eris", size: 0.7, color: "#FFFFFF", distance: 780, speed: 0.00005, eccentricity: 0.441, inclination: 0.7,
        textureUrl: "assets/textures/2k_eris_fictional.jpg",
        desc: "Massive known dwarf planet.", type: "DWARF PLANET", year: "558 Years"
    },
    {
        name: "Sedna", size: 1.0, color: "#993333", distance: 900, speed: 0.00005, eccentricity: 0.85, inclination: 0.2,
        desc: "Deep-red world with a massive orbit.", type: "DWARF PLANET", year: "11,400 Years"
    },
    {
        name: "Halley's Comet", size: 0.4, color: "#AAFFFF", distance: 250, speed: 0.008, eccentricity: 0.967, inclination: 0.3,
        desc: "A famous visitor with a glowing tail.", type: "COMET", year: "76 Years"
    }
];
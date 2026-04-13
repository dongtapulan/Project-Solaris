// utils/telemetry.js

const NASA_API_KEY = 'iqzUzYZuKDZIziv5Abz2Eb2zPZnMisGXwGzdRUFz'; 

/**
 * Fetches recent Coronal Mass Ejection data from NASA DONKI
 */
export async function fetchSolarWeather() {
    try {
        // We use a slightly wider range for solar weather to ensure we catch the last event
        const response = await fetch(`https://api.nasa.gov/DONKI/CME?startDate=2026-03-25&api_key=${NASA_API_KEY}`);
        const data = await response.json();
        
        return data.length > 0 ? data[data.length - 1] : { note: "No recent CMEs" };
    } catch (error) {
        console.error("Tech Alert: NASA Telemetry Link Offline", error);
        return null;
    }
}

/**
 * Fetches Near-Earth Objects (NEOs) for the current date
 * Filters for Potentially Hazardous Asteroids (PHAs)
 */
export async function fetchNEOs() {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // NeoWs returns data mapped by date strings
        const dailyObjects = data.near_earth_objects[today] || [];
        
        // Filter for "Potentially Hazardous" to add tension to the UI
        const hazardous = dailyObjects.filter(neo => neo.is_potentially_hazardous_asteroid);
        
        // Return the top 5 most relevant hazardous objects (or just the list if smaller)
        return hazardous;
    } catch (error) {
        console.error("Deep Space Radar Link Offline:", error);
        return [];
    }
}
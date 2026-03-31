// utils/telemetry.js

const NASA_API_KEY = 'iqzUzYZuKDZIziv5Abz2Eb2zPZnMisGXwGzdRUFz'; // You can get your own at api.nasa.gov

export async function fetchSolarWeather() {
    try {
        // DONKI API for Coronal Mass Ejections (CME)
        const response = await fetch(`https://api.nasa.gov/DONKI/CME?startDate=2026-03-25&api_key=${NASA_API_KEY}`);
        const data = await response.json();
        
        // Return the most recent solar event
        return data.length > 0 ? data[data.length - 1] : { note: "No recent CMEs" };
    } catch (error) {
        console.error("Tech Alert: NASA Telemetry Link Offline", error);
        return null;
    }
}
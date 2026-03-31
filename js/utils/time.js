// utils/time.js

export class TimeEngine {
    constructor() {
        // J2000 Epoch: Standard reference for Keplerian elements
        this.epoch = new Date("2000-01-01T12:00:00Z");
        
        // --- Default Settings ---
        // 1.0 = Real-time
        // 1000.0 = Slower, stable start (Approx 16 mins per real second)
        this.timeScale = 1.0; 
        this.paused = false; 
        
        // Start simulation at the current real-world time
        this.currentSimTime = new Date();
    }

    /**
     * Updates the simulation time.
     * Includes a delta-clamp to prevent "time jumps" if the tab loses focus.
     */
    update(deltaTime) {
        if (this.paused) return;

        // Clamp deltaTime to 0.1s to prevent massive physics jumps during lag
        const safeDelta = Math.min(deltaTime, 0.1);

        // Advance simulated time: (real seconds * scale)
        const msToAdd = safeDelta * 1000 * this.timeScale;
        this.currentSimTime = new Date(this.currentSimTime.getTime() + msToAdd);
    }

    /**
     * Calculates the "Centuries since J2000" (T).
     * Used for precise planet positioning in main.js.
     */
    getCenturiesSinceEpoch() {
        // Total days elapsed since the J2000 epoch
        const daysSinceJ2000 = (this.currentSimTime - this.epoch) / (1000 * 60 * 60 * 24);
        
        // T = Julian centuries (36525 days per century)
        return daysSinceJ2000 / 36525.0; 
    }

    getFormattedTime() {
        // Using a cleaner format for your UI dashboard
        return this.currentSimTime.toLocaleString('en-GB', { 
            timeZone: 'UTC',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + " UTC";
    }
}
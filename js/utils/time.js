// utils/time.js

export class TimeEngine {
    constructor() {
        // J2000 Epoch: The "Zero Point" for our orbital math
        this.epoch = new Date("2000-01-01T12:00:00Z");
        
        // LIVE SYNC: Start the simulation at the exact current real-world time
        this.currentSimTime = new Date();
        
        // Default to Real-Time (1x)
        this.timeScale = 1.0; 
        this.paused = false; 
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
        // Since we start at 'now', this keeps the clock ticking forward.
        const msToAdd = safeDelta * 1000 * this.timeScale;
        this.currentSimTime = new Date(this.currentSimTime.getTime() + msToAdd);
    }

    /**
     * Calculates the "Centuries since J2000" (T).
     * This value 'T' is the heart of your orbital physics in main.js.
     */
    getCenturiesSinceEpoch() {
        // Total days elapsed since the J2000 epoch
        const msSinceJ2000 = this.currentSimTime - this.epoch;
        const daysSinceJ2000 = msSinceJ2000 / (1000 * 60 * 60 * 24);
        
        // T = Julian centuries (36525 days per century)
        return daysSinceJ2000 / 36525.0; 
    }

    /**
     * Formats the time for your Dashboard UI
     */
    getFormattedTime() {
        return this.currentSimTime.toLocaleString('en-GB', { 
            timeZone: 'UTC',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit' // Added seconds for better visual feedback at 1x
        }) + " UTC";
    }
}
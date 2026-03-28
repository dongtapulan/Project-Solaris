/**
 * loader.js
 * Manages the initialization overlay and Three.js loading progress
 */
export function initLoader(manager) {
    const loaderOverlay = document.getElementById('loader-overlay');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('loader-status');

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Extract filename for status text
        const fileName = url.split('/').pop();
        statusText.innerText = `LOADING: ${fileName}`;
    };

    manager.onLoad = () => {
        statusText.innerText = "SYSTEMS READY";
        setTimeout(() => {
            loaderOverlay.classList.add('loader-finished');
            // Remove from DOM after transition to keep the scene performant
            setTimeout(() => loaderOverlay.remove(), 1000);
        }, 500);
    };

    manager.onError = (url) => {
        statusText.innerText = "ERROR LOADING ASSETS";
        statusText.style.color = "#ff4444";
    };
}
const typeStyles = {
    "STAR": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "TERRESTRIAL": "bg-green-500/20 text-green-300 border-green-500/30",
    "GAS GIANT": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    "ICE GIANT": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "DWARF PLANET": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "BELT": "bg-gray-500/30 text-gray-300 border-gray-500/30"
};

export function updatePanel(data) {
    if (!data) return;

    document.getElementById('info-name').innerText = data.name;
    document.getElementById('info-type').innerText = data.type;
    document.getElementById('info-desc').innerText = data.desc;
    
    // Belts don't have a single distance or year usually, so we handle the display
    document.getElementById('info-dist').innerText = data.distance ? data.distance + " AU" : (data.innerRadius + " AU");
    document.getElementById('info-year').innerText = data.year || "--";
    
    const style = typeStyles[data.type] || typeStyles["TERRESTRIAL"];
    document.getElementById('info-type').className = `text-[10px] font-bold tracking-wider px-2 py-1 rounded border ${style}`;

    document.querySelectorAll('.planet-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'border-indigo-400', 'shadow-lg');
        btn.classList.add('bg-white/5', 'border-transparent');
    });
    
    const btnId = `btn-${data.name.replace(/\s+/g, '')}`;
    const active = document.getElementById(btnId);
    if(active) {
        active.classList.remove('bg-white/5', 'border-transparent');
        active.classList.add('bg-indigo-600', 'border-indigo-400', 'shadow-lg');
    }
}

export function initUI(systemData, onSelectCallback, onResetCallback, timeEngine) {
    const planetList = document.getElementById('planet-list');
    const speedDisplay = document.getElementById('speed-display');
    const pauseBtn = document.getElementById('btn-pause');

    systemData.forEach(p => {
        const btn = document.createElement('button');
        const cleanName = p.name.replace(/\s+/g, '');
        btn.id = `btn-${cleanName}`;
        btn.className = 'planet-btn flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-transparent transition-all w-full text-left group mb-1';
        
        let iconColor = p.color;
        let shapeClass = "rounded-full";
        if(p.type === 'BELT') { 
            shapeClass = "rounded-sm border-2 border-dashed"; 
            iconColor = "transparent";
        }
        
        btn.innerHTML = `
            <div class="w-3 h-3 ${shapeClass} shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-110" 
                 style="background-color: ${iconColor}; border-color: ${p.color}"></div> 
            <div class="flex flex-col">
                <span class="text-xs font-bold text-gray-100 uppercase tracking-wide group-hover:text-white">${p.name}</span>
                <span class="text-[9px] text-gray-500 group-hover:text-gray-400">${p.type}</span>
            </div>
        `;

        btn.onclick = () => {
            // BUG FIX: If it's a belt, we pass a flag to NOT focus the camera
            // because belts don't have a single center point mesh.
            const isBelt = p.type === 'BELT';
            onSelectCallback(p.name, isBelt);
        };
        
        planetList.appendChild(btn);
    });

    const resetBtn = document.getElementById('reset-cam');
    if (resetBtn) resetBtn.onclick = onResetCallback;

    const updateSpeedUI = () => {
        const absSpeed = Math.abs(Math.round(timeEngine.timeScale));
        speedDisplay.innerText = `${absSpeed.toLocaleString()}x${timeEngine.timeScale < 0 ? ' (REV)' : ''}`;
    };

    pauseBtn.onclick = () => {
        timeEngine.paused = !timeEngine.paused;
        pauseBtn.innerText = timeEngine.paused ? '▶' : '⏸';
        pauseBtn.classList.toggle('text-blue-400', !timeEngine.paused);
    };

    document.getElementById('btn-forward').onclick = () => {
        timeEngine.timeScale = Math.round(timeEngine.timeScale * 2);
        if (timeEngine.timeScale > 1000000) timeEngine.timeScale = 1000000;
        updateSpeedUI();
    };

    document.getElementById('btn-rewind').onclick = () => {
        if (Math.abs(timeEngine.timeScale) > 1) {
            timeEngine.timeScale = Math.round(timeEngine.timeScale / 2);
        } else {
            timeEngine.timeScale = 1; 
        }
        updateSpeedUI();
    };

    updateSpeedUI();
}
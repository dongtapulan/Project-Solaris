/**
 * UI Controller for Project Solaris
 */

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
    document.getElementById('info-desc').innerText = data.description || data.desc; 
    
    // Reset Academic UI on planet change
    const infoDesc = document.getElementById('info-desc');
    infoDesc.classList.remove('blur-md');
    const blurtArea = document.getElementById('blurt-session');
    if(blurtArea) {
        blurtArea.classList.add('hidden');
        blurtArea.value = "";
    }
    const studyBtn = document.getElementById('btn-study');
    if(studyBtn) studyBtn.innerText = "FEYNMAN METHOD";

    const distEl = document.getElementById('info-dist');
    if (data.name === "Sun") {
        distEl.innerText = "SOLAR CENTER";
    } else if (data.type === 'BELT') {
        distEl.innerText = `${data.innerRadius || data.distance} AU (Avg)`;
    } else {
        distEl.innerText = data.distance ? `${data.distance} AU` : "--";
    }

    const delayEl = document.getElementById('telemetry-delay');
    if (delayEl) delayEl.innerText = "CALCULATING...";

    document.getElementById('info-year').innerText = data.orbit || data.year || "--";
    
    const style = typeStyles[data.type] || typeStyles["TERRESTRIAL"];
    const typeBadge = document.getElementById('info-type');
    typeBadge.className = `text-[10px] font-bold tracking-wider px-2 py-1 rounded border uppercase ${style}`;

    document.querySelectorAll('.planet-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600/40', 'border-indigo-400', 'shadow-lg');
        btn.classList.add('bg-white/5', 'border-transparent');
    });
    
    const btnId = `btn-${data.name.replace(/\s+/g, '')}`;
    const activeBtn = document.getElementById(btnId);
    if(activeBtn) {
        activeBtn.classList.remove('bg-white/5', 'border-transparent');
        activeBtn.classList.add('bg-indigo-600/40', 'border-indigo-400', 'shadow-lg');
    }
}

// NEW: Academic Logic
function initAcademicModule() {
    const studyBtn = document.getElementById('btn-study');
    const blurtArea = document.getElementById('blurt-session');
    const infoDesc = document.getElementById('info-desc');

    if (!studyBtn) return;

    studyBtn.onclick = () => {
        const isHidden = blurtArea.classList.toggle('hidden');
        if (!isHidden) {
            infoDesc.classList.add('blur-md');
            studyBtn.innerText = "FINISH BLURTING";
            blurtArea.focus();
        } else {
            infoDesc.classList.remove('blur-md');
            studyBtn.innerText = "FEYNMAN METHOD";
            // Logic for mastery points could be added here
        }
    };
}

export function initUI(systemData, onSelectCallback, onResetCallback, timeEngine) {
    const planetList = document.getElementById('planet-list');
    const speedDisplay = document.getElementById('speed-display');
    const pauseBtn = document.getElementById('btn-pause');

    systemData.forEach(p => {
        const btn = document.createElement('button');
        const cleanName = p.name.replace(/\s+/g, '');
        btn.id = `btn-${cleanName}`;
        btn.className = 'planet-btn flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent transition-all w-full text-left group mb-1';
        
        let iconColor = p.color || "#ffffff";
        let shapeClass = "rounded-full";
        
        if(p.type === 'BELT') { 
            shapeClass = "rounded-sm border border-dashed"; 
            iconColor = "transparent";
        }
        
        btn.innerHTML = `
            <div class="w-3 h-3 ${shapeClass} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-125" 
                 style="background-color: ${iconColor}; border-color: ${p.color}"></div> 
            <div class="flex flex-col overflow-hidden">
                <span class="text-xs font-bold text-gray-100 uppercase tracking-wide group-hover:text-white truncate">${p.name}</span>
                <span class="text-[8px] text-gray-500 uppercase tracking-tighter group-hover:text-gray-400">${p.type}</span>
            </div>
        `;

        btn.onclick = () => onSelectCallback(p.name);
        planetList.appendChild(btn);
    });

    const resetBtn = document.getElementById('reset-cam');
    if (resetBtn) resetBtn.onclick = onResetCallback;

    const updateSpeedUI = () => {
        const speed = timeEngine.timeScale;
        if (speed === 1) {
            speedDisplay.innerText = "1.0x (LIVE)";
            speedDisplay.classList.add('text-green-400');
            speedDisplay.classList.remove('text-blue-400');
        } else {
            const formatted = Math.abs(speed).toLocaleString();
            speedDisplay.innerText = `${formatted}x${speed < 0 ? ' (REV)' : ''}`;
            speedDisplay.classList.remove('text-green-400');
            speedDisplay.classList.add('text-blue-400');
        }
    };

    pauseBtn.onclick = () => {
        timeEngine.paused = !timeEngine.paused;
        pauseBtn.innerText = timeEngine.paused ? '▶' : '⏸';
        pauseBtn.classList.toggle('text-yellow-500', timeEngine.paused);
    };

    document.getElementById('btn-forward').onclick = () => {
        timeEngine.timeScale = Math.min(timeEngine.timeScale * 2, 1000000);
        updateSpeedUI();
    };

    document.getElementById('btn-rewind').onclick = () => {
        if (Math.abs(timeEngine.timeScale) > 1) {
            timeEngine.timeScale = Math.max(Math.round(timeEngine.timeScale / 2), 1);
        } else {
            timeEngine.timeScale = 1; 
        }
        updateSpeedUI();
    };

    updateSpeedUI();
    initAcademicModule(); // Initialize the blurt system
}
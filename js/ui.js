/**
 * UI Controller for Space.env (Professional Astrodynamic Tool)
 */

const typeStyles = {
    "STAR": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "TERRESTRIAL": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "GAS GIANT": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    "ICE GIANT": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "DWARF PLANET": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "BELT": "bg-slate-500/30 text-slate-300 border-slate-500/30",
    "COMET": "bg-blue-400/20 text-blue-200 border-blue-400/30"
};

export function updatePanel(data) {
    if (!data) return;

    const nameEl = document.getElementById('info-name');
    if (nameEl) nameEl.innerText = data.name;

    const typeEl = document.getElementById('info-type');
    if (typeEl) typeEl.innerText = data.type;

    const descEl = document.getElementById('info-desc');
    if (descEl) descEl.innerText = data.description || data.desc; 

    const distEl = document.getElementById('info-dist');
    if (distEl) {
        if (data.name === "Sun") {
            distEl.innerText = "0.000 AU (Barycenter)";
        } else if (data.type === 'BELT') {
            distEl.innerText = `${data.innerRadius || data.distance} AU (Mean)`;
        } else {
            distEl.innerText = data.distance ? `${data.distance} AU` : "--";
        }
    }

    const delayEl = document.getElementById('telemetry-delay');
    if (delayEl) delayEl.innerText = "CALCULATING...";

    const yearEl = document.getElementById('info-year');
    if (yearEl) yearEl.innerText = data.orbit || data.year || "--";
    
    if (typeEl) {
        const style = typeStyles[data.type] || typeStyles["TERRESTRIAL"];
        typeEl.className = `text-[8px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${style}`;
    }

    // --- BULLETPROOF ASTROPHYSICAL TELEMETRY CARD INJECTION ---
    let cardContainer = document.getElementById('astronomical-telemetry-card');
    if (!cardContainer) {
        cardContainer = document.createElement('div');
        cardContainer.id = 'astronomical-telemetry-card';
        cardContainer.className = 'mt-3 space-y-2 font-mono text-xs';
        
        // Find the right-side info container where info-name or info-desc lives
        const targetParent = descEl ? descEl.closest('div').parentNode : document.querySelector('aside') || document.querySelector('.absolute.right-6');
        if (targetParent) {
            targetParent.appendChild(cardContainer);
        } else {
            document.body.appendChild(cardContainer);
        }
    }

    const isStar = data.type === 'STAR';
    const isBelt = data.type === 'BELT';

    let orbitalPeriodYears = data.elements?.semiMajorAxis ? Math.pow(data.elements.semiMajorAxis, 1.5).toFixed(2) + ' Julian Yrs' : 'N/A';
    if (isStar) orbitalPeriodYears = 'Galactic Year (~230M Yrs)';
    if (isBelt) orbitalPeriodYears = 'Keplerian Orbit';

    let eccentricity = data.elements?.eccentricity !== undefined ? data.elements.eccentricity.toFixed(4) : '0.0000';
    let inclination = data.elements?.inclination !== undefined ? data.elements.inclination.toFixed(2) + '°' : '0.00°';
    let semiMajor = data.elements?.semiMajorAxis ? data.elements.semiMajorAxis.toFixed(3) + ' AU' : (data.distance ? data.distance + ' AU' : '0.000 AU');

    cardContainer.innerHTML = `
        <div class="p-3 bg-slate-900/95 border border-cyan-500/40 rounded-xl backdrop-blur-md shadow-2xl my-2">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] tracking-widest text-cyan-400 uppercase font-semibold">
                <span class="flex items-center gap-1.5"><svg class="w-3 h-3 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> SPICE KERNEL EPHEMERIS</span>
                <span class="text-slate-400 font-mono text-[9px]">ICRS / J2000</span>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span class="text-slate-500 block text-[9px] uppercase tracking-wider">Semi-Major Axis</span>
                    <span class="text-slate-200 font-semibold">${semiMajor}</span>
                </div>
                <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span class="text-slate-500 block text-[9px] uppercase tracking-wider">Eccentricity</span>
                    <span class="text-slate-200 font-semibold">${eccentricity}</span>
                </div>
                <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span class="text-slate-500 block text-[9px] uppercase tracking-wider">Inclination</span>
                    <span class="text-slate-200 font-semibold">${inclination}</span>
                </div>
                <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
                    <span class="text-slate-500 block text-[9px] uppercase tracking-wider">Sidereal Period</span>
                    <span class="text-slate-200 font-semibold">${orbitalPeriodYears}</span>
                </div>
            </div>
        </div>
    `;

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

export function initUI(systemData, onSelectCallback, onResetCallback, timeEngine) {
    const planetList = document.getElementById('planet-list');
    const speedDisplay = document.getElementById('speed-display');
    const pauseBtn = document.getElementById('btn-pause');

    if (!planetList) return;

    systemData.forEach(p => {
        const btn = document.createElement('button');
        const cleanName = p.name.replace(/\s+/g, '');
        btn.id = `btn-${cleanName}`;
        btn.className = 'planet-btn flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-transparent transition-all w-full text-left group';
        
        let iconColor = p.color || "#ffffff";
        let shapeClass = "rounded-full";
        
        if(p.type === 'BELT') { 
            shapeClass = "rounded-sm border border-dashed"; 
            iconColor = "transparent";
        }
        
        btn.innerHTML = `
            <div class="w-2.5 h-2.5 ${shapeClass} shrink-0 shadow-[0_0_6px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-125" 
                 style="background-color: ${iconColor}; border-color: ${p.color}"></div> 
            <div class="flex flex-col overflow-hidden">
                <span class="text-[11px] font-bold text-gray-100 uppercase tracking-wide group-hover:text-white truncate">${p.name}</span>
                <span class="text-[7px] text-gray-500 uppercase tracking-tighter group-hover:text-gray-400">${p.type}</span>
            </div>
        `;

        btn.onclick = () => onSelectCallback(p.name);
        planetList.appendChild(btn);
    });

    // Collapsible Left Drawer Handler
    const sidebarLeft = document.getElementById('sidebar-left');
    const toggleSidebarBtn = document.getElementById('btn-toggle-sidebar');
    const openSidebarBtn = document.getElementById('btn-open-sidebar');
    const planetListContainer = document.getElementById('planet-list-container');

    if (sidebarLeft && toggleSidebarBtn && openSidebarBtn && planetListContainer) {
        toggleSidebarBtn.onclick = () => {
            planetListContainer.classList.add('hidden');
            openSidebarBtn.classList.remove('hidden');
        };

        openSidebarBtn.onclick = () => {
            planetListContainer.classList.remove('hidden');
            openSidebarBtn.classList.add('hidden');
        };
    }

    const resetBtn = document.getElementById('reset-cam');
    if (resetBtn) resetBtn.onclick = onResetCallback;

    const updateSpeedUI = () => {
        if (!speedDisplay) return;
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

    if (pauseBtn) {
        pauseBtn.onclick = () => {
            timeEngine.paused = !timeEngine.paused;
            pauseBtn.innerText = timeEngine.paused ? '▶' : '⏸';
            pauseBtn.classList.toggle('text-yellow-500', timeEngine.paused);
        };
    }

    const btnForward = document.getElementById('btn-forward');
    if (btnForward) {
        btnForward.onclick = () => {
            timeEngine.timeScale = Math.min(timeEngine.timeScale * 2, 1000000);
            updateSpeedUI();
        };
    }

    const btnRewind = document.getElementById('btn-rewind');
    if (btnRewind) {
        btnRewind.onclick = () => {
            if (Math.abs(timeEngine.timeScale) > 1) {
                timeEngine.timeScale = Math.max(Math.round(timeEngine.timeScale / 2), 1);
            } else {
                timeEngine.timeScale = 1; 
            }
            updateSpeedUI();
        };
    }

    updateSpeedUI();
}
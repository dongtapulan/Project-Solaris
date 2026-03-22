const typeStyles = {
    "STAR": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "TERRESTRIAL": "bg-green-500/20 text-green-300 border-green-500/30",
    "GAS GIANT": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    "ICE GIANT": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "DWARF PLANET": "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "BELT": "bg-gray-500/30 text-gray-300 border-gray-500/30"
};

export function updatePanel(data) {
    document.getElementById('info-name').innerText = data.name;
    document.getElementById('info-type').innerText = data.type;
    document.getElementById('info-desc').innerText = data.desc;
    document.getElementById('info-dist').innerText = data.distance + " AU";
    document.getElementById('info-year').innerText = data.year;
    
    const style = typeStyles[data.type] || typeStyles["TERRESTRIAL"];
    document.getElementById('info-type').className = `text-[10px] font-bold tracking-wider px-2 py-1 rounded border ${style}`;

    document.querySelectorAll('.planet-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'border-indigo-400', 'shadow-lg');
        btn.classList.add('bg-white/5', 'border-transparent');
    });
    const active = document.getElementById(`btn-${data.name.replace(/\s+/g, '')}`);
    if(active) {
        active.classList.remove('bg-white/5', 'border-transparent');
        active.classList.add('bg-indigo-600', 'border-indigo-400', 'shadow-lg');
    }
}

export function initUI(systemData, onSelectCallback, onResetCallback) {
    const planetList = document.getElementById('planet-list');

    systemData.forEach(p => {
        const btn = document.createElement('button');
        btn.id = `btn-${p.name.replace(/\s+/g, '')}`;
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
        btn.onclick = () => onSelectCallback(p.name);
        planetList.appendChild(btn);
    });

    document.getElementById('reset-cam').onclick = onResetCallback;
}
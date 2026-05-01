class AutomataStats {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.history = {
            complexity: [],
            activeRatio: [],
            stability: [],
            volatility: [],
            lyapunov: [],
            generations: []
        };
        this.maxHistory = 500;
        this.isActive = false;
        this.charts = {};
        
        this.setupUI();
    }

    setupUI() {
        this.container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 h-full w-full">
                <!-- Row 1 -->
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col lg:col-span-1">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Spatial complexity</span>
                        <span id="currentCompStat" class="text-[10px] font-mono text-brand-400">0%</span>
                    </div>
                    <canvas id="complexityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col lg:col-span-1">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Pixel Density</span>
                        <span id="currentDensityStat" class="text-[10px] font-mono text-indigo-400">0%</span>
                    </div>
                    <canvas id="densityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col lg:col-span-1">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Stability</span>
                        <div class="flex items-center gap-1">
                            <span id="cycleIndicator" class="text-[8px] px-1 bg-amber-500/10 text-amber-500 rounded hidden">C:10</span>
                            <span id="currentStabilityStat" class="text-[10px] font-mono text-amber-400">0%</span>
                        </div>
                    </div>
                    <canvas id="stabilityChart" class="flex-1 w-full"></canvas>
                </div>
                
                <!-- Row 2 (or continued) -->
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col lg:col-span-1">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Volatility</span>
                        <div class="flex flex-col items-end">
                            <span id="currentVolatilityStat" class="text-[10px] font-mono text-rose-400">0%</span>
                            <span id="currentVolatilitySMAStat" class="text-[8px] font-mono text-rose-500/60">AVG: 0%</span>
                        </div>
                    </div>
                    <canvas id="volatilityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col lg:col-span-1">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Lyapunov Exp.</span>
                        <span id="currentLyapunovStat" class="text-[10px] font-mono text-emerald-400">0.00</span>
                    </div>
                    <canvas id="lyapunovChart" class="flex-1 w-full"></canvas>
                </div>
                
                <!-- Rule Props / Metadata -->
                <div class="bg-brand-500/5 rounded-xl border border-brand-500/10 p-3 flex flex-col justify-between lg:col-span-1">
                    <div class="space-y-3">
                        <span class="text-[9px] font-bold text-brand-400 uppercase tracking-widest block">Rule Analysis</span>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-[9px] text-surface-500 uppercase">Langton's λ</span>
                                <span id="lambdaStat" class="text-[10px] font-mono text-white">0.000</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-[9px] text-surface-500 uppercase">Radius</span>
                                <span id="radiusStat" class="text-[10px] font-mono text-white">1</span>
                            </div>
                             <div class="flex justify-between">
                                <span class="text-[9px] text-surface-500 uppercase">Wolfram</span>
                                <span id="wolframClass" class="text-[10px] font-mono text-brand-500 font-bold">Class ?</span>
                            </div>
                        </div>
                    </div>
                    <div id="lambdaIndicator" class="h-1.5 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div id="lambdaBar" class="h-full bg-brand-500 transition-all duration-500" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;

        this.charts.complexity = document.getElementById('complexityChart');
        this.charts.density = document.getElementById('densityChart');
        this.charts.stability = document.getElementById('stabilityChart');
        this.charts.volatility = document.getElementById('volatilityChart');
        this.charts.lyapunov = document.getElementById('lyapunovChart');
        
        window.addEventListener('resize', () => this.resizeCharts());
    }

    resizeCharts() {
        if (!this.isActive) return;
        Object.values(this.charts).forEach(canvas => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        });
        this.draw();
    }

    toggle(active) {
        this.isActive = active;
        this.container.classList.toggle('hidden', !active);
        if (active) {
            setTimeout(() => this.resizeCharts(), 100);
        }
    }

    reset() {
        this.history.complexity = [];
        this.history.activeRatio = [];
        this.history.stability = [];
        this.history.volatility = [];
        this.history.lyapunov = [];
        this.history.generations = [];
        this.draw();
    }

    updateMetadata(lambda, radius) {
        document.getElementById('lambdaStat').textContent = lambda.toFixed(3);
        document.getElementById('radiusStat').textContent = radius;
        document.getElementById('lambdaBar').style.width = `${lambda * 100}%`;
        
        // Basic Wolfram Class heuristic based on Lambda
        let wClass = "?";
        if (lambda === 0) wClass = "Class I";
        else if (lambda < 0.1) wClass = "Class II";
        else if (lambda < 0.3) wClass = "Class IV";
        else wClass = "Class III";
        
        document.getElementById('wolframClass').textContent = wClass;
    }

    addData(generation, complexity, activeCount, totalCount, stability = 0, period = 0, volatility = 0, lyapunov = 0) {
        if (!this.isActive) return;

        const ratio = (activeCount / totalCount) * 100;
        
        this.history.complexity.push(complexity);
        this.history.activeRatio.push(ratio);
        this.history.stability.push(stability);
        this.history.volatility.push(volatility);
        this.history.lyapunov.push(lyapunov);
        this.history.generations.push(generation);

        if (this.history.complexity.length > this.maxHistory) {
            this.history.complexity.shift();
            this.history.activeRatio.shift();
            this.history.stability.shift();
            this.history.volatility.shift();
            this.history.lyapunov.shift();
            this.history.generations.shift();
        }

        document.getElementById('currentCompStat').textContent = `${complexity.toFixed(1)}%`;
        document.getElementById('currentDensityStat').textContent = `${ratio.toFixed(1)}%`;
        document.getElementById('currentStabilityStat').textContent = `${stability.toFixed(1)}%`;
        document.getElementById('currentVolatilityStat').textContent = `${volatility.toFixed(1)}%`;
        document.getElementById('currentLyapunovStat').textContent = lyapunov.toFixed(2);
        
        // Calculate and show SMA for Volatility
        if (this.history.volatility.length > 0) {
            const sma = this.calculateSMA(this.history.volatility, 300);
            const currentSMA = sma[sma.length - 1];
            document.getElementById('currentVolatilitySMAStat').textContent = `AVG: ${currentSMA.toFixed(1)}%`;
        }

        const indicator = document.getElementById('cycleIndicator');
        if (period > 0) {
            indicator.textContent = `P:${period}`;
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }

        this.draw();
    }

    draw() {
        if (!this.isActive) return;
        this.drawChart(this.charts.complexity, this.history.complexity, '#14b8a6');
        this.drawChart(this.charts.density, this.history.activeRatio, '#6366f1');
        this.drawChart(this.charts.stability, this.history.stability, '#fbbf24');
        this.drawChart(this.charts.volatility, this.history.volatility, '#f43f5e', true);
        this.drawChart(this.charts.lyapunov, this.history.lyapunov, '#10b981');
    }

    calculateSMA(data, windowSize) {
        const result = [];
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            if (i >= windowSize) sum -= data[i - windowSize];
            result.push(sum / Math.min(i + 1, windowSize));
        }
        return result;
    }

    drawChart(canvas, data, color, showSMA = false) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (data.length < 2) return;

        const min = 0;
        let max = (canvas.id === 'lyapunovChart') ? 2 : 100; // Lyapunov usually 0-2 range for CA

        // Draw raw data (thin line)
        ctx.strokeStyle = showSMA ? 'rgba(244, 63, 94, 0.3)' : color;
        if (showSMA && color === '#f43f5e') {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
        }
        ctx.lineWidth = showSMA ? 1 : 1.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = (i / (this.maxHistory - 1)) * w;
            const y = h - ((data[i] - min) / (max - min)) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw SMA
        if (showSMA) {
            const smaData = this.calculateSMA(data, 100); 
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            for (let i = 0; i < smaData.length; i++) {
                const x = (i / (this.maxHistory - 1)) * w;
                const y = h - ((smaData[i] - min) / (max - min)) * h;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        let rgba = 'rgba(99, 102, 241, 0.1)';
        if (color === '#14b8a6') rgba = 'rgba(20, 184, 166, 0.1)';
        else if (color === '#fbbf24') rgba = 'rgba(251, 191, 36, 0.1)';
        else if (color === '#f43f5e') rgba = 'rgba(244, 63, 94, 0.1)';
        else if (color === '#10b981') rgba = 'rgba(16, 185, 129, 0.1)';
        
        ctx.fillStyle = gradient;
        gradient.addColorStop(0, rgba);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.lineTo( (data.length-1)/(this.maxHistory-1) * w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
        
        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let j = 0; j <= 4; j++) {
            const y = (j / 4) * h;
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();
    }
}

class AutomataStats {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.history = {
            complexity: [],
            activeRatio: [],
            stability: [],
            volatility: [],
            activity: [],
            lyapunov: [],
            compActivity: [],
            densActivity: [],
            compRange: [],
            densRange: [],
            generations: []
        };
        this.maxHistory = 500;
        this.isActive = false;
        this.charts = {};
        
        this.setupUI();
    }

    setupUI() {
        this.container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 h-full w-full overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
                
                <!-- ROW 1: PRIMARY METRICS -->
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Spatial complexity</span>
                        <span id="currentCompStat" class="text-[10px] font-mono text-brand-400">0%</span>
                    </div>
                    <canvas id="complexityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Pixel Density</span>
                        <span id="currentDensityStat" class="text-[10px] font-mono text-indigo-400">0%</span>
                    </div>
                    <canvas id="densityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Stability</span>
                        <div class="flex items-center gap-1">
                            <span id="cycleIndicator" class="text-[8px] px-1 bg-amber-500/10 text-amber-500 rounded hidden">C:10</span>
                            <span id="currentStabilityStat" class="text-[10px] font-mono text-amber-400">0%</span>
                        </div>
                    </div>
                    <canvas id="stabilityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Volatility</span>
                        <div class="flex flex-col items-end">
                            <span id="currentVolatilityStat" class="text-[10px] font-mono text-rose-400">0%</span>
                        </div>
                    </div>
                    <canvas id="volatilityChart" class="flex-1 w-full"></canvas>
                </div>

                <!-- ROW 2: ACTIVITY ANALYSIS (ACT) -->
                <div class="bg-cyan-500/5 rounded-xl border border-cyan-500/10 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-cyan-400/70 uppercase tracking-widest">Complexity Activity</span>
                        <span id="currentCompActivityStat" class="text-[10px] font-mono text-cyan-400">0.0</span>
                    </div>
                    <canvas id="compActivityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-cyan-500/5 rounded-xl border border-cyan-500/10 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-cyan-400/70 uppercase tracking-widest">Density Activity</span>
                        <span id="currentDensityActivityStat" class="text-[10px] font-mono text-cyan-400">0.0</span>
                    </div>
                    <canvas id="densActivityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-cyan-500/5 rounded-xl border border-cyan-500/10 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-cyan-400/70 uppercase tracking-widest">Global Activity Index</span>
                        <span id="currentActivityStat" class="text-[10px] font-mono text-cyan-400">0.0</span>
                    </div>
                    <canvas id="activityChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-black/20 rounded-xl border border-white/5 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Lyapunov Exp.</span>
                        <span id="currentLyapunovStat" class="text-[10px] font-mono text-emerald-400">0.00</span>
                    </div>
                    <canvas id="lyapunovChart" class="flex-1 w-full"></canvas>
                </div>

                <!-- ROW 3: RANGE ANALYSIS (RNG) -->
                <div class="bg-purple-500/5 rounded-xl border border-purple-500/10 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-purple-400/70 uppercase tracking-widest">Complexity Range</span>
                        <span id="currentCompRangeStat" class="text-[10px] font-mono text-purple-400">0.0</span>
                    </div>
                    <canvas id="compRangeChart" class="flex-1 w-full"></canvas>
                </div>
                <div class="bg-purple-500/5 rounded-xl border border-purple-500/10 p-3 flex flex-col min-h-[140px]">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-bold text-purple-400/70 uppercase tracking-widest">Density Range</span>
                        <span id="currentDensityRangeStat" class="text-[10px] font-mono text-purple-400">0.0</span>
                    </div>
                    <canvas id="densRangeChart" class="flex-1 w-full"></canvas>
                </div>

                <!-- Rule Props / Metadata -->
                <div class="bg-brand-500/5 rounded-xl border border-brand-500/10 p-4 flex flex-col justify-center lg:col-span-2 min-h-[140px]">
                    <div class="space-y-4">
                        <span class="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">Rule Property Analysis</span>
                        <div class="grid grid-cols-2 gap-8">
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-[9px] text-surface-500 uppercase font-bold tracking-wider">Langton's λ</span>
                                    <span id="lambdaStat" class="text-[12px] font-mono text-white">0.000</span>
                                </div>
                                <div id="lambdaIndicator" class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div id="lambdaBar" class="h-full bg-brand-500 transition-all duration-500" style="width: 0%"></div>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex flex-col">
                                    <span class="text-[9px] text-surface-500 uppercase font-bold tracking-wider mb-1">Radius</span>
                                    <span id="radiusStat" class="text-[12px] font-mono text-white">1</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-[9px] text-surface-500 uppercase font-bold tracking-wider mb-1">Wolfram</span>
                                    <span id="wolframClass" class="text-[12px] font-mono text-brand-500 font-bold">Class ?</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;;

        this.charts.complexity = document.getElementById('complexityChart');
        this.charts.density = document.getElementById('densityChart');
        this.charts.stability = document.getElementById('stabilityChart');
        this.charts.volatility = document.getElementById('volatilityChart');
        this.charts.compActivity = document.getElementById('compActivityChart');
        this.charts.densActivity = document.getElementById('densActivityChart');
        this.charts.activity = document.getElementById('activityChart');
        this.charts.compRange = document.getElementById('compRangeChart');
        this.charts.densRange = document.getElementById('densRangeChart');
        this.charts.lyapunov = document.getElementById('lyapunovChart');
        
        window.addEventListener('resize', () => this.resizeCharts());
    }

    resizeCharts() {
        if (!this.isActive) return;
        Object.values(this.charts).forEach(canvas => {
            if (!canvas) return;
            const parent = canvas.parentElement;
            // Set canvas size to parent size minus padding/labels
            canvas.width = parent.clientWidth - 24; // 24px padding total
            canvas.height = parent.clientHeight - 40; // Approx space for labels
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
        this.history.activity = [];
        this.history.lyapunov = [];
        this.history.compActivity = [];
        this.history.densActivity = [];
        this.history.compRange = [];
        this.history.densRange = [];
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

        // Calculate and push Activity and Range histories
        const windowSize = this.maxHistory;
        
        // Use current history as context for calculation
        const compAct = this.calculateInstantActivity(this.history.complexity);
        const densAct = this.calculateInstantActivity(this.history.activeRatio);
        this.history.compActivity.push(compAct);
        this.history.densActivity.push(densAct);

        const compRng = this.calculateInstantRange(this.history.complexity);
        const densRng = this.calculateInstantRange(this.history.activeRatio);
        this.history.compRange.push(compRng);
        this.history.densRange.push(densRng);

        // Global Activity Index (SMA of Volatility)
        if (this.history.volatility.length > 0) {
            const sma = this.calculateSMA(this.history.volatility, windowSize);
            this.history.activity.push(sma[sma.length - 1]);
        } else {
            this.history.activity.push(0);
        }

        if (this.history.complexity.length > this.maxHistory) {
            this.history.complexity.shift();
            this.history.activeRatio.shift();
            this.history.stability.shift();
            this.history.volatility.shift();
            this.history.activity.shift();
            this.history.lyapunov.shift();
            this.history.compActivity.shift();
            this.history.densActivity.shift();
            this.history.compRange.shift();
            this.history.densRange.shift();
            this.history.generations.shift();
        }

        document.getElementById('currentCompStat').textContent = `${complexity.toFixed(1)}%`;
        document.getElementById('currentDensityStat').textContent = `${ratio.toFixed(1)}%`;
        document.getElementById('currentStabilityStat').textContent = `${stability.toFixed(1)}%`;
        document.getElementById('currentVolatilityStat').textContent = `${volatility.toFixed(1)}%`;
        document.getElementById('currentLyapunovStat').textContent = lyapunov.toFixed(2);
        
        document.getElementById('currentCompActivityStat').textContent = compAct.toFixed(1);
        document.getElementById('currentDensityActivityStat').textContent = densAct.toFixed(1);
        document.getElementById('currentActivityStat').textContent = this.history.activity[this.history.activity.length-1].toFixed(1);
        
        document.getElementById('currentCompRangeStat').textContent = compRng.toFixed(1);
        document.getElementById('currentDensityRangeStat').textContent = densRng.toFixed(1);

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
        this.drawChart(this.charts.volatility, this.history.volatility, '#f43f5e');
        
        this.drawChart(this.charts.compActivity, this.history.compActivity, '#22d3ee');
        this.drawChart(this.charts.densActivity, this.history.densActivity, '#22d3ee');
        this.drawChart(this.charts.activity, this.history.activity, '#22d3ee');
        
        this.drawChart(this.charts.compRange, this.history.compRange, '#a855f7');
        this.drawChart(this.charts.densRange, this.history.densRange, '#a855f7');
        
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

    calculateInstantActivity(data) {
        if (data.length < 2) return 0;
        let total = 0;
        for (let i = 1; i < data.length; i++) {
            total += Math.abs(data[i] - data[i - 1]);
        }
        // Normalize to average change per generation to avoid low values at start
        return total / (data.length - 1);
    }

    calculateInstantRange(data) {
        if (data.length === 0) return 0;
        let min = data[0];
        let max = data[0];
        for (let i = 1; i < data.length; i++) {
            if (data[i] < min) min = data[i];
            if (data[i] > max) max = data[i];
        }
        return max - min;
    }

    drawChart(canvas, data, color) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        if (data.length < 2) return;

        const min = 0;
        let max = 100;
        if (canvas.id === 'lyapunovChart') max = 2;
        if (canvas.id.includes('Activity') || canvas.id === 'activityChart') {
            max = Math.max(10, ...data) * 1.2;
        }
        if (canvas.id.includes('Range')) {
            max = 100;
        }

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = (i / (this.maxHistory - 1)) * w;
            const y = h - ((data[i] - min) / (max - min)) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        let rgba = 'rgba(99, 102, 241, 0.1)';
        if (color === '#14b8a6') rgba = 'rgba(20, 184, 166, 0.1)';
        else if (color === '#fbbf24') rgba = 'rgba(251, 191, 36, 0.1)';
        else if (color === '#f43f5e') rgba = 'rgba(244, 63, 94, 0.1)';
        else if (color === '#10b981') rgba = 'rgba(16, 185, 129, 0.1)';
        else if (color === '#22d3ee') rgba = 'rgba(34, 211, 238, 0.1)';
        else if (color === '#a855f7') rgba = 'rgba(168, 85, 247, 0.1)';
        
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

class CellularAutomata {
    constructor() {
        this.canvas = document.getElementById('caCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.container = document.getElementById('canvasContainer');

        this.ruleInput = document.getElementById('ruleInput');
        this.presetRules = document.getElementById('presetRules');
        this.ruleDisplay = document.getElementById('ruleDisplay');
        this.statsDisplay = document.getElementById('statsDisplay');
        this.complexityValue = document.getElementById('complexityValue');

        this.btnPlay = document.getElementById('btnPlay');
        this.btnStep = document.getElementById('btnStep');
        this.btnReset = document.getElementById('btnReset');

        this.speedSlider = document.getElementById('speedSlider');
        this.speedDisplay = document.getElementById('speedDisplay');
        this.sizeSlider = document.getElementById('sizeSlider');
        this.sizeDisplay = document.getElementById('sizeDisplay');

        this.initCenterBtn = document.getElementById('initCenter');
        this.initRandomBtn = document.getElementById('initRandom');

        this.colorAliveInput = document.getElementById('colorAlive');
        this.colorDeadInput = document.getElementById('colorDead');

        this.ruleVisualizer = document.getElementById('ruleVisualizer');
        this.btnRandomRule = document.getElementById('btnRandomRule');
        this.resetOnChangeToggle = document.getElementById('resetOnChange');
        this.advancedToggle = document.getElementById('advancedToggle');
        this.advancedControls = document.getElementById('advancedControls');
        this.radiusBtns = document.querySelectorAll('.radius-btn');
        this.radiusDisplay = document.getElementById('radiusDisplay');
        this.entropyGuardOffBtn = document.getElementById('entropyGuardOff');
        this.entropyGuardOnBtn = document.getElementById('entropyGuardOn');
        this.modeScrollBtn = document.getElementById('modeScroll');
        this.modeScanBtn = document.getElementById('modeScan');
        this.instantFillToggle = document.getElementById('instantFillToggle');
        
        this.colorModeSelect = document.getElementById('colorMode');
        this.intensitySlider = document.getElementById('intensitySlider');
        this.intensityDisplay = document.getElementById('intensityDisplay');

        this.autoRandomToggle = document.getElementById('autoRandomToggle');
        this.waitToggle = document.getElementById('waitToggle');
        this.waitSettings = document.getElementById('waitSettings');
        this.waitSlider = document.getElementById('waitSlider');
        this.waitDisplay = document.getElementById('waitDisplay');
        this.waitProgressBarContainer = document.getElementById('waitProgressBarContainer');
        this.waitProgressBar = document.getElementById('waitProgressBar');

        this.radius = 1;
        this.isAdvanced = false;
        this.rule = 30n;
        this.ruleTable = new Uint8Array(8);
        this.cellSize = parseInt(this.sizeSlider.value);
        this.speed = parseInt(this.speedSlider.value);
        this.resetOnRuleChange = false;
        this.entropyGuardEnabled = false;
        this.isScanMode = false;
        this.instantFill = false;
        this.colorMode = 'solid';
        this.intensity = 1.0;

        this.autoRandom = false;
        this.waitBetweenScans = false;
        this.waitTime = 2.0;
        this.isWaiting = false;
        this.waitStartTime = 0;

        this.cols = 0;
        this.rows = 0;
        this.grid = [];
        this.gridPointer = 0;
        this.totalGenerations = 0;
        this.isRunning = false;
        this.initialMode = 'center';

        this.colorAlive = this.colorAliveInput.value;
        this.colorDead = this.colorDeadInput.value;

        this.lastFrameTime = 0;
        this.frameAccumulator = 0;
        this.animationReq = null;

        this.bindEvents();
        this.setRule(this.rule);
        this.resizeAndReset();
    }

    bindEvents() {
        this.ruleInput.addEventListener('input', (e) => this.setRule(e.target.value));
        this.presetRules.addEventListener('change', (e) => {
            if (e.target.value) {
                this.ruleInput.value = e.target.value;
                this.setRule(e.target.value);
            }
        });
        this.btnRandomRule.addEventListener('click', () => {
            const bitCount = 1 << (2 * this.radius + 1);
            let randomRule = 0n;
            if (bitCount <= 32) {
                randomRule = BigInt(Math.floor(Math.random() * (2 ** bitCount)));
            } else {
                let hex = '0x';
                for (let i = 0; i < bitCount / 4; i++) hex += Math.floor(Math.random() * 16).toString(16);
                randomRule = BigInt(hex);
            }
            this.ruleInput.value = randomRule.toString();
            this.setRule(randomRule);
            if (this.instantFill) {
                this.pause();
                this.resizeAndReset();
                this.fillScreen();
            }
        });
        this.resetOnChangeToggle.addEventListener('change', (e) => this.resetOnRuleChange = e.target.checked);
        this.advancedToggle.addEventListener('change', (e) => {
            this.isAdvanced = e.target.checked;
            this.advancedControls.classList.toggle('hidden', !this.isAdvanced);
            if (!this.isAdvanced) this.setRadius(1);
        });
        this.radiusBtns.forEach(btn => btn.addEventListener('click', () => this.setRadius(parseInt(btn.dataset.radius))));
        this.entropyGuardOffBtn.addEventListener('click', () => {
            this.entropyGuardEnabled = false;
            this.entropyGuardOffBtn.className = "px-2 py-1 rounded text-[9px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.entropyGuardOnBtn.className = "px-2 py-1 rounded text-[9px] font-bold transition-all text-surface-500 hover:text-white";
        });
        this.entropyGuardOnBtn.addEventListener('click', () => {
            this.entropyGuardEnabled = true;
            this.entropyGuardOnBtn.className = "px-2 py-1 rounded text-[9px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.entropyGuardOffBtn.className = "px-2 py-1 rounded text-[9px] font-bold transition-all text-surface-500 hover:text-white";
        });
        this.modeScrollBtn.addEventListener('click', () => {
            this.isScanMode = false;
            this.modeScrollBtn.className = "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.modeScanBtn.className = "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all text-surface-500 hover:text-white";
            this.draw();
        });
        this.modeScanBtn.addEventListener('click', () => {
            this.isScanMode = true;
            this.modeScanBtn.className = "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.modeScrollBtn.className = "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all text-surface-500 hover:text-white";
            this.draw();
        });
        this.instantFillToggle.addEventListener('change', (e) => this.instantFill = e.target.checked);
        this.colorModeSelect.addEventListener('change', (e) => { this.colorMode = e.target.value; this.draw(); });
        this.intensitySlider.addEventListener('input', (e) => {
            this.intensity = parseInt(e.target.value) / 100;
            this.intensityDisplay.textContent = `${e.target.value}%`;
            this.draw();
        });
        this.btnPlay.addEventListener('click', () => this.togglePlay());
        this.btnStep.addEventListener('click', () => { this.pause(); this.generateNextRow(); this.draw(); });
        this.btnReset.addEventListener('click', () => { this.pause(); this.resizeAndReset(); });
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.speedDisplay.textContent = this.speed >= 300 ? 'Hyper' : `${this.speed} fps`;
        });
        this.autoRandomToggle.addEventListener('change', (e) => this.autoRandom = e.target.checked);
        this.waitToggle.addEventListener('change', (e) => {
            this.waitBetweenScans = e.target.checked;
            this.waitSettings.classList.toggle('hidden', !this.waitBetweenScans);
            if (!this.waitBetweenScans) {
                this.isWaiting = false;
                this.waitProgressBarContainer.classList.add('opacity-0');
            }
        });
        this.waitSlider.addEventListener('input', (e) => {
            this.waitTime = parseFloat(e.target.value);
            this.waitDisplay.textContent = `${this.waitTime.toFixed(1)}s`;
        });
        this.sizeSlider.addEventListener('change', (e) => {
            this.cellSize = parseInt(e.target.value);
            this.sizeDisplay.textContent = `${this.cellSize}px`;
            this.pause();
            this.resizeAndReset();
        });
        this.colorAliveInput.addEventListener('input', (e) => { this.colorAlive = e.target.value; this.updateRuleVisualizer(); this.draw(); });
        this.colorDeadInput.addEventListener('input', (e) => { this.colorDead = e.target.value; this.updateRuleVisualizer(); this.draw(); });
        this.initCenterBtn.addEventListener('click', () => {
            this.initialMode = 'center';
            this.initCenterBtn.className = "flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all duration-200 bg-white/10 text-white shadow-sm";
            this.initRandomBtn.className = "flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-surface-500 hover:text-white";
            this.pause(); this.resizeAndReset(); if (this.instantFill) this.fillScreen();
        });
        this.initRandomBtn.addEventListener('click', () => {
            this.initialMode = 'random';
            this.initRandomBtn.className = "flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all duration-200 bg-white/10 text-white shadow-sm";
            this.initCenterBtn.className = "flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-surface-500 hover:text-white";
            this.pause(); this.resizeAndReset(); if (this.instantFill) this.fillScreen();
        });
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => { this.pause(); this.resizeAndReset(); }, 200);
        });
    }

    setRadius(r) {
        this.radius = r;
        this.radiusDisplay.textContent = `R${r}`;
        this.radiusBtns.forEach(btn => {
            const active = parseInt(btn.dataset.radius) === r;
            btn.className = `radius-btn flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${active ? 'bg-white/10 text-white' : 'text-surface-500 hover:text-white'}`;
        });
        this.btnRandomRule.click();
    }

    setRule(ruleValue) {
        try { this.rule = BigInt(ruleValue); } catch (e) { return; }
        const bitCount = 1 << (2 * this.radius + 1);
        this.ruleTable = new Uint8Array(bitCount);
        const rs = this.rule.toString();
        this.ruleDisplay.textContent = `Rule ${rs.length > 8 ? rs.substring(0, 8) + '...' : rs}`;
        for (let i = 0; i < bitCount; i++) this.ruleTable[i] = Number((this.rule >> BigInt(i)) & 1n);
        if (this.radius === 1) { this.ruleVisualizer.parentElement.classList.remove('hidden'); this.updateRuleVisualizer(); }
        else { this.ruleVisualizer.parentElement.classList.add('hidden'); }
        if (this.resetOnRuleChange) { this.pause(); this.resizeAndReset(); }
    }

    updateRuleVisualizer() {
        this.ruleVisualizer.innerHTML = '';
        for (let i = 7; i >= 0; i--) {
            const l = (i >> 2) & 1, c = (i >> 1) & 1, r = i & 1, res = (this.rule >> BigInt(i)) & 1n;
            const col = document.createElement('div'); col.className = 'flex flex-col items-center gap-1.5 flex-1 max-w-[28px]';
            const topRow = document.createElement('div'); topRow.className = 'flex gap-[1px]';
            [l, c, r].forEach(v => {
                const cell = document.createElement('div'); cell.className = 'w-1.5 h-1.5 rounded-[1px]';
                cell.style.backgroundColor = v ? this.colorAlive : 'transparent';
                cell.style.border = v ? 'none' : '1px solid rgba(255,255,255,0.1)';
                topRow.appendChild(cell);
            });
            const rc = document.createElement('div'); rc.className = 'w-1.5 h-1.5 rounded-[1px] mt-0.5';
            rc.style.backgroundColor = res ? this.colorAlive : 'transparent';
            rc.style.border = res ? 'none' : '1px solid rgba(255,255,255,0.1)';
            col.appendChild(topRow); col.appendChild(rc); this.ruleVisualizer.appendChild(col);
        }
    }

    resizeAndReset() {
        const rect = this.container.getBoundingClientRect();
        const p = window.innerWidth < 768 ? 32 : 96;
        this.cols = Math.floor((rect.width - p) / this.cellSize);
        this.rows = Math.floor((rect.height - p) / this.cellSize);
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
        this.resetGrid();
    }

    resetGrid() {
        this.grid = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));
        this.gridPointer = 0; this.totalGenerations = 1;
        if (this.initialMode === 'center') this.grid[0][Math.floor(this.cols / 2)] = 1;
        else for (let i = 0; i < this.cols; i++) this.grid[0][i] = Math.random() > 0.5 ? 1 : 0;
        this.updateStats(); this.draw();
    }

    fillScreen() { for (let i = 0; i < this.rows - 1; i++) this.generateNextRow(); this.draw(); }
    updateStats() { 
        this.statsDisplay.querySelector('span').textContent = `GEN: ${this.totalGenerations}`;
        const complexity = this.calculateComplexity();
        this.complexityValue.textContent = `${complexity.toFixed(1)}%`;
    }

    calculateComplexity() {
        const row = this.grid[this.gridPointer];
        if (!row || this.cols < 5) return 0;

        // Using 5-bit blocks for "advanced" spatial entropy (32 patterns)
        const patternCounts = new Array(32).fill(0);
        const n = this.cols;
        
        for (let i = 0; i < n; i++) {
            const b1 = row[(i - 2 + n) % n];
            const b2 = row[(i - 1 + n) % n];
            const b3 = row[i];
            const b4 = row[(i + 1) % n];
            const b5 = row[(i + 2) % n];
            
            const pattern = (b1 << 4) | (b2 << 3) | (b3 << 2) | (b4 << 1) | b5;
            patternCounts[pattern]++;
        }

        let entropy = 0;
        for (let count of patternCounts) {
            if (count > 0) {
                const p = count / n;
                entropy -= p * Math.log2(p);
            }
        }

        // Normalize to 0-100% (max entropy for 5 bits is 5)
        return (entropy / 5) * 100;
    }

    generateNextRow() {
        const prevRow = this.grid[this.gridPointer];
        this.gridPointer = (this.gridPointer + 1) % this.rows;
        const nextRow = this.grid[this.gridPointer], cols = this.cols, ruleTable = this.ruleTable, radius = this.radius;
        if (radius === 1) {
            let l = prevRow[cols - 1], c = prevRow[0], r = prevRow[1];
            nextRow[0] = ruleTable[(l << 2) | (c << 1) | r];
            for (let i = 1; i < cols - 1; i++) { l = c; c = r; r = prevRow[i + 1]; nextRow[i] = ruleTable[(l << 2) | (c << 1) | r]; }
            nextRow[cols - 1] = ruleTable[(c << 2) | (r << 1) | prevRow[0]];
        } else {
            const mask = (1 << (2 * radius + 1)) - 1; let w = 0;
            for (let d = -radius; d <= radius; d++) w = (w << 1) | prevRow[(d + cols) % cols];
            nextRow[0] = ruleTable[w];
            for (let i = 1; i < cols; i++) { w = ((w << 1) | prevRow[(i + radius) % cols]) & mask; nextRow[i] = ruleTable[w]; }
        }
        if (this.entropyGuardEnabled) {
            let u = true; for (let i = 1; i < cols; i++) if (nextRow[i] !== nextRow[0]) { u = false; break; }
            if (u) for (let i = 0; i < cols; i++) nextRow[i] = Math.random() > 0.5 ? 1 : 0;
        }

        // Check for end of scan cycle
        if (this.isScanMode && this.gridPointer === 0) {
            if (this.autoRandom) this.randomizeRule();
            if (this.waitBetweenScans) {
                this.isWaiting = true;
                this.waitStartTime = performance.now();
                this.waitProgressBarContainer.classList.remove('opacity-0');
            }
        }

        this.totalGenerations++; this.updateStats();
    }

    randomizeRule() {
        const bitCount = 1 << (2 * this.radius + 1);
        let randomRule = 0n;
        if (bitCount <= 32) {
            randomRule = BigInt(Math.floor(Math.random() * (2 ** bitCount)));
        } else {
            let hex = '0x';
            for (let i = 0; i < bitCount / 4; i++) hex += Math.floor(Math.random() * 16).toString(16);
            randomRule = BigInt(hex);
        }
        this.ruleInput.value = randomRule.toString();
        this.setRule(randomRule);
    }

    drawRow(row, y, gridIdx) {
        const cs = this.cellSize, cols = this.cols, mode = this.colorMode, baseI = this.intensity;
        if (mode === 'solid') {
            this.ctx.fillStyle = this.colorAlive; this.ctx.beginPath();
            let xs = -1;
            for (let x = 0; x < cols; x++) {
                if (row[x] === 1) { if (xs === -1) xs = x; }
                else if (xs !== -1) { this.ctx.rect(xs * cs, y * cs, (x - xs) * cs, cs); xs = -1; }
            }
            if (xs !== -1) this.ctx.rect(xs * cs, y * cs, (cols - xs) * cs, cs);
            this.ctx.fill();
        } else {
            for (let x = 0; x < cols; x++) {
                if (row[x] === 0) continue;
                let f = 1;
                if (mode === 'neighbors') {
                    let w = 0; const r = this.radius, pr = this.grid[(gridIdx - 1 + this.rows) % this.rows];
                    for (let d = -r; d <= r; d++) if (pr[(x + d + cols) % cols]) w++;
                    f = w / (2 * r + 1);
                } else if (mode === 'column') {
                    let s = 0; const d = 15;
                    for (let i = 0; i < d; i++) if (this.grid[(gridIdx - i + this.rows) % this.rows][x]) s++;
                    f = s / d;
                } else if (mode === 'row') {
                    let s = 0; const r = 8;
                    for (let d = -r; d <= r; d++) if (row[(x + d + cols) % cols]) s++;
                    f = s / (2 * r + 1);
                }
                this.ctx.globalAlpha = 0.15 + (f * 0.85 * baseI);
                this.ctx.fillStyle = this.colorAlive;
                this.ctx.fillRect(x * cs, y * cs, cs, cs);
            }
            this.ctx.globalAlpha = 1.0;
        }
    }

    draw() {
        this.ctx.fillStyle = this.colorDead; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const count = Math.min(this.totalGenerations, this.rows);
        if (this.isScanMode) {
            for (let i = 0; i < count; i++) {
                this.drawRow(this.grid[i], i, i);
            }
            this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
            this.ctx.fillRect(0, this.gridPointer * this.cellSize, this.canvas.width, Math.max(1, this.cellSize / 2));
        } else {
            const sp = (this.gridPointer - count + 1 + this.rows) % this.rows;
            for (let i = 0; i < count; i++) { const idx = (sp + i) % this.rows; this.drawRow(this.grid[idx], i, idx); }
        }
    }

    togglePlay() { if (this.isRunning) this.pause(); else this.play(); }
    play() {
        this.isRunning = true;
        this.btnPlay.innerHTML = '<i data-lucide="pause" class="w-4 h-4 fill-current"></i> <span>Pause</span>';
        this.btnPlay.classList.replace('bg-brand-500', 'bg-amber-500');
        this.btnPlay.classList.replace('hover:bg-brand-400', 'hover:bg-amber-400');
        lucide.createIcons(); this.lastFrameTime = performance.now();
        this.animationReq = requestAnimationFrame((t) => this.loop(t));
    }
    pause() {
        this.isRunning = false;
        this.isWaiting = false;
        this.waitProgressBarContainer.classList.add('opacity-0');
        this.btnPlay.innerHTML = '<i data-lucide="play" class="w-4 h-4 fill-current"></i> <span>Play</span>';
        this.btnPlay.classList.replace('bg-amber-500', 'bg-brand-500');
        this.btnPlay.classList.replace('hover:bg-amber-400', 'hover:bg-brand-400');
        lucide.createIcons(); if (this.animationReq) cancelAnimationFrame(this.animationReq);
    }
    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = timestamp - this.lastFrameTime; this.lastFrameTime = timestamp;

        if (this.isWaiting) {
            const elapsed = (timestamp - this.waitStartTime) / 1000;
            const progress = Math.min(100, (elapsed / this.waitTime) * 100);
            this.waitProgressBar.style.width = `${progress}%`;
            
            if (elapsed >= this.waitTime) {
                this.isWaiting = false;
                this.waitProgressBarContainer.classList.add('opacity-0');
                setTimeout(() => { this.waitProgressBar.style.width = '0%'; }, 300);
            }
        } else {
            const tpf = 1000 / this.speed; this.frameAccumulator += dt;
            let its = 0, nr = false;
            while (this.frameAccumulator >= tpf && its < 20) { 
                this.generateNextRow(); 
                this.frameAccumulator -= tpf; 
                its++; 
                nr = true;
                if (this.isWaiting) break; // Stop generating if we entered wait state
            }
            if (nr) this.draw();
        }
        
        if (this.isRunning) this.animationReq = requestAnimationFrame((t) => this.loop(t));
    }
}

document.addEventListener('DOMContentLoaded', () => { window.caApp = new CellularAutomata(); });

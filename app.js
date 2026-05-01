class CellularAutomata {
    constructor() {
        this.canvas = document.getElementById('caCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.container = document.getElementById('canvasContainer');

        this.ruleInput = document.getElementById('ruleInput');
        this.btnCopyRule = document.getElementById('btnCopyRule');
        this.presetRules = document.getElementById('presetRules');
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

        this.maxWidthInput = document.getElementById('maxWidthInput');

        this.colorAliveInput = document.getElementById('colorAlive');
        this.colorDeadInput = document.getElementById('colorDead');

        this.ruleVisualizer = document.getElementById('ruleVisualizer');
        this.btnRandomRule = document.getElementById('btnRandomRule');
        this.resetOnChangeToggle = document.getElementById('resetOnChange');
        this.advancedControls = document.getElementById('advancedControls');
        this.radiusBtns = document.querySelectorAll('.radius-btn');
        this.radiusDisplay = document.getElementById('radiusDisplay');
        this.entropyGuardOffBtn = document.getElementById('entropyGuardOff');
        this.entropyGuardOnBtn = document.getElementById('entropyGuardOn');
        this.modeScrollBtn = document.getElementById('modeScroll');
        this.modeScanBtn = document.getElementById('modeScan');
        this.instantFillToggle = document.getElementById('instantFillToggle');
        this.autoPlayToggle = document.getElementById('autoPlayToggle');
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
        this.btnDrawWall = document.getElementById('btnDrawWall');
        this.btnClearWalls = document.getElementById('btnClearWalls');
        this.btnShare = document.getElementById('btnShare');
        this.btnShareMobile = document.getElementById('btnShareMobile');
        this.statsDisplayMobile = document.getElementById('statsDisplayMobile');
        this.sidebar = document.getElementById('sidebar');
        this.xyPropagationToggle = document.getElementById('xyPropagationToggle');
        this.edgeWrapToggle = document.getElementById('edgeWrapToggle');
        this.scaleControls = document.getElementById('scaleControls');
        this.scaleBtns = document.querySelectorAll('.scale-btn');
        
        this.btnMobileMenu = document.getElementById('btnMobileMenu');
        this.btnCloseSidebar = document.getElementById('btnCloseSidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');

        this.minComplexityInput = document.getElementById('minComplexity');
        this.maxComplexityInput = document.getElementById('maxComplexity');
        this.minCompDisplay = document.getElementById('minCompDisplay');
        this.maxCompDisplay = document.getElementById('maxCompDisplay');
        this.maxAttemptsInput = document.getElementById('maxAttempts');
        this.ignoreStableToggle = document.getElementById('ignoreStableToggle');
        this.maxVolatilityToggle = document.getElementById('maxVolatilityToggle');
        this.statsModeToggle = document.getElementById('statsModeToggle');
        
        this.logicStats = document.getElementById('logicStats');
        this.btnCopyMap = document.getElementById('btnCopyMap');
        this.stats = new AutomataStats('statsArea');

        if (this.minComplexityInput) {
            this.minCompDisplay.textContent = `${this.minComplexityInput.value}%`;
            this.maxCompDisplay.textContent = `${this.maxComplexityInput.value}%`;
        }
 
        this.renderScale = 1;
        this.radius = 1;
        this.rule = 30n;
        this.ruleTable = new Uint8Array(8);
        this.cellSize = parseInt(this.sizeSlider.value);
        this.speed = parseInt(this.speedSlider.value);
        this.resetOnRuleChange = false;
        this.entropyGuardEnabled = false;
        this.isScanMode = false;
        this.instantFill = false;
        this.autoPlay = false;
        this.colorMode = 'solid';
        this.intensity = 1.0;

        this.autoRandom = false;
        this.waitBetweenScans = false;
        this.waitTime = 2.0;
        this.isWaiting = false;
        this.isSearching = false;
        this.waitStartTime = 0;
        this.smoothedComplexity = 0;

        this.cols = 0;
        this.rows = 0;
        this.grid = [];
        this.walls = [];
        this.gridPointer = 0;
        this.isDrawingWalls = false;
        this.xyPropagation = false;
        this.edgeWrap = true;
        this.totalGenerations = 0;
        this.isRunning = false;
        this.initialMode = 'center';

        this.colorAlive = this.colorAliveInput.value;
        this.colorDead = this.colorDeadInput.value;
        this.cachedImageData = null;
        this.cachedColors = { alive: 0, dead: 0, wall: 0, scanner: 0 };
 
        this.lastFrameTime = 0;
        this.frameAccumulator = 0;
        this.animationReq = null;

        this.updateUrlDebounced = this.debounce(() => this.updateUrl(), 500);

        this.bindEvents();
        this.populatePresets();
        
        const urlParams = new URLSearchParams(window.location.search);
        const configParam = urlParams.get('c');
        if (configParam && this.decodeConfig(configParam)) {
            this.syncUIToState();
        } else {
            this.setRule(this.rule);
        }
        
        this.resizeAndReset();
        lucide.createIcons();
    }

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    encodeConfig() {
        let flags = 0;
        if (this.resetOnRuleChange) flags |= 1;
        if (this.entropyGuardEnabled) flags |= 2;
        if (this.isScanMode) flags |= 4;
        if (this.instantFill) flags |= 8;
        if (this.autoPlay) flags |= 16;
        if (this.autoRandom) flags |= 32;
        if (this.waitBetweenScans) flags |= 64;
        if (this.xyPropagation) flags |= 128;
        if (this.edgeWrap) flags |= 256;

        const colorModes = ['solid', 'neighbors', 'column', 'row'];
        const m = colorModes.indexOf(this.colorMode);
        
        const data = [
            this.radius,
            this.rule.toString(16),
            this.cellSize,
            this.speed,
            flags,
            m,
            Math.round(this.intensity * 100),
            this.waitTime,
            this.initialMode === 'center' ? 0 : 1,
            this.colorAlive.replace('#', ''),
            this.colorDead.replace('#', ''),
            this.renderScale
        ];
        
        return btoa(data.join('-'));
    }

    decodeConfig(encoded) {
        try {
            const str = atob(encoded);
            const p = str.split('-');
            if (p.length < 11) return false;
 
            this.radius = parseInt(p[0]);
            this.rule = BigInt('0x' + p[1]);
            this.cellSize = parseInt(p[2]);
            this.speed = parseInt(p[3]);
            
            const flags = parseInt(p[4]);
            this.resetOnRuleChange = !!(flags & 1);
            this.entropyGuardEnabled = !!(flags & 2);
            this.isScanMode = !!(flags & 4);
            this.instantFill = !!(flags & 8);
            this.autoPlay = !!(flags & 16);
            this.autoRandom = !!(flags & 32);
            this.waitBetweenScans = !!(flags & 64);
            this.xyPropagation = !!(flags & 128);
            this.edgeWrap = !!(flags & 256);

            const colorModes = ['solid', 'neighbors', 'column', 'row'];
            this.colorMode = colorModes[parseInt(p[5])] || 'solid';
            
            this.intensity = parseInt(p[6]) / 100;
            this.waitTime = parseFloat(p[7]);
            this.initialMode = parseInt(p[8]) === 0 ? 'center' : 'random';
            
            this.colorAlive = '#' + p[9];
            this.colorDead = '#' + p[10];
            if (p.length >= 12) this.renderScale = parseInt(p[11]) || 1;
 
            return true;
        } catch(e) {
            return false;
        }
    }

    updateUrl() {
        const configStr = this.encodeConfig();
        const url = new URL(window.location);
        url.searchParams.set('c', configStr);
        window.history.replaceState({}, '', url);
    }

    syncUIToState() {
        if (this.radiusDisplay) this.radiusDisplay.textContent = `R${this.radius}`;
        this.radiusBtns.forEach(btn => {
            const active = parseInt(btn.dataset.radius) === this.radius;
            btn.className = `radius-btn px-3 py-2 md:py-1 rounded text-[10px] font-bold transition-all ${active ? 'bg-white/10 text-white' : 'text-surface-500 hover:text-white'}`;
        });

        this.ruleInput.value = this.rule.toString(10);

        this.sizeSlider.value = this.cellSize;
        this.sizeDisplay.textContent = `${this.cellSize}px`;

        this.speedSlider.value = this.speed;
        this.speedDisplay.textContent = this.speed >= 300 ? 'Hyper' : `${this.speed} fps`;

        this.resetOnChangeToggle.checked = this.resetOnRuleChange;
        this.autoRandomToggle.checked = this.autoRandom;
        this.instantFillToggle.checked = this.instantFill;
        if (this.autoPlayToggle) this.autoPlayToggle.checked = this.autoPlay;
        this.waitToggle.checked = this.waitBetweenScans;
        if (this.waitSettings) this.waitSettings.classList.toggle('hidden', !this.waitBetweenScans);
        this.xyPropagationToggle.checked = this.xyPropagation;
        this.edgeWrapToggle.checked = this.edgeWrap;

        if (this.entropyGuardEnabled) {
            this.entropyGuardOnBtn.className = "px-2 py-2 md:py-1 rounded text-[9px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.entropyGuardOffBtn.className = "px-2 py-2 md:py-1 rounded text-[9px] font-bold transition-all text-surface-500 hover:text-white";
        } else {
            this.entropyGuardOffBtn.className = "px-2 py-2 md:py-1 rounded text-[9px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.entropyGuardOnBtn.className = "px-2 py-2 md:py-1 rounded text-[9px] font-bold transition-all text-surface-500 hover:text-white";
        }

        if (this.isScanMode) {
            this.modeScanBtn.className = "flex-1 py-2 md:py-1 rounded-lg text-[10px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.modeScrollBtn.className = "flex-1 py-2 md:py-1 rounded-lg text-[10px] font-bold transition-all text-surface-500 hover:text-white";
        } else {
            this.modeScrollBtn.className = "flex-1 py-2 md:py-1 rounded-lg text-[10px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.modeScanBtn.className = "flex-1 py-2 md:py-1 rounded-lg text-[10px] font-bold transition-all text-surface-500 hover:text-white";
        }

        this.colorModeSelect.value = this.colorMode;
        this.intensitySlider.value = Math.round(this.intensity * 100);
        this.intensityDisplay.textContent = `${Math.round(this.intensity * 100)}%`;

        this.waitSlider.value = this.waitTime;
        this.waitDisplay.textContent = `${this.waitTime.toFixed(1)}s`;

        if (this.initialMode === 'center') {
            this.initCenterBtn.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 bg-white/10 text-white shadow-sm";
            this.initRandomBtn.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-surface-500 hover:text-white";
        } else {
            this.initRandomBtn.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 bg-white/10 text-white shadow-sm";
            this.initCenterBtn.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-surface-500 hover:text-white";
        }

        this.colorAliveInput.value = this.colorAlive;
        this.colorDeadInput.value = this.colorDead;
 
        this.scaleBtns.forEach(btn => {
            const active = parseInt(btn.dataset.scale) === this.renderScale;
            btn.className = `scale-btn flex-1 py-2 md:py-1 rounded text-[9px] font-bold transition-all ${active ? 'bg-white/10 text-white shadow-sm' : 'text-surface-500 hover:text-white'}`;
        });
        
        this.setRule(this.rule);
    }

    bindEvents() {
        this.ruleInput.addEventListener('input', (e) => this.setRule(e.target.value));
        this.presetRules.addEventListener('change', (e) => {
            const preset = AUTOMATA_PRESETS[e.target.value];
            if (preset) {
                this.setRadius(preset.radius, false); // false = don't randomize
                this.ruleInput.value = preset.rule;
                this.setRule(preset.rule);
                if (this.instantFill) {
                    this.pause();
                    this.resizeAndReset();
                    this.fillScreen();
                    if (this.autoPlay) this.play();
                }
            }
        });
        this.btnRandomRule.addEventListener('click', () => {
            if (this.isSearching) return;
            this.isSearching = true;

            const icon = this.btnRandomRule.querySelector('i, svg');
            if (icon) icon.classList.add('animate-spin');
            this.btnRandomRule.classList.add('opacity-50', 'cursor-not-allowed');

            const minC = parseFloat(this.minComplexityInput.value);
            const maxC = parseFloat(this.maxComplexityInput.value);
            const maxAttempts = parseInt(this.maxAttemptsInput.value) || 100;
            const isMaxVolMode = this.maxVolatilityToggle ? this.maxVolatilityToggle.checked : false;
            const checkStability = this.ignoreStableToggle ? this.ignoreStableToggle.checked : false;

            let attempts = 0;
            let bestRule = null;
            let maxVolatilityFound = -1;
            let closestRule = this.rule;
            let closestDist = Infinity;

            const searchChunk = () => {
                const chunkSize = 25; // Try 25 rules per chunk
                for (let i = 0; i < chunkSize && attempts < maxAttempts; i++) {
                    const trialRule = this.generateRandomRuleValue();
                    // Using a "shadow" evaluation that doesn't touch the main instance grid
                    const metrics = this.evaluateRuleMetrics(trialRule, this.radius, 128, 64, checkStability);
                    const comp = metrics.complexity;
                    const vol = metrics.volatility;

                    if (comp >= minC && comp <= maxC) {
                        if (isMaxVolMode) {
                            if (vol > maxVolatilityFound) {
                                maxVolatilityFound = vol;
                                bestRule = trialRule;
                            }
                        } else {
                            bestRule = trialRule;
                            attempts = maxAttempts; 
                            break;
                        }
                    }

                    const dist = Math.min(Math.abs(comp - minC), Math.abs(comp - maxC));
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestRule = trialRule;
                    }
                    attempts++;
                }

                if (attempts < maxAttempts) {
                    setTimeout(searchChunk, 5); // Short gap for UI to breathe
                } else {
                    const finalRule = bestRule !== null ? bestRule : closestRule;
                    this.setRule(finalRule);
                    this.resizeAndReset();
                    this.fillScreen();
                    
                    this.isSearching = false;
                    if (icon) icon.classList.remove('animate-spin');
                    this.btnRandomRule.classList.remove('opacity-50', 'cursor-not-allowed');
                    // Only play if it was already playing or autoPlay is on
                    if (this.autoPlay) this.play();
                }
            };

            searchChunk();
        });

        this.minComplexityInput.addEventListener('input', (e) => {
            this.minCompDisplay.textContent = `${e.target.value}%`;
            if (parseFloat(e.target.value) > parseFloat(this.maxComplexityInput.value)) {
                this.maxComplexityInput.value = e.target.value;
                this.maxCompDisplay.textContent = `${e.target.value}%`;
            }
        });

        this.maxComplexityInput.addEventListener('input', (e) => {
            this.maxCompDisplay.textContent = `${e.target.value}%`;
            if (parseFloat(e.target.value) < parseFloat(this.minComplexityInput.value)) {
                this.minComplexityInput.value = e.target.value;
                this.minCompDisplay.textContent = `${e.target.value}%`;
            }
        });
        this.resetOnChangeToggle.addEventListener('change', (e) => this.resetOnRuleChange = e.target.checked);
        this.radiusBtns.forEach(btn => btn.addEventListener('click', () => this.setRadius(parseInt(btn.dataset.radius))));
        this.entropyGuardOffBtn.addEventListener('click', () => {
            this.entropyGuardEnabled = false;
            this.entropyGuardOffBtn.className = "px-2 py-2 md:py-1 rounded text-[9px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.entropyGuardOnBtn.className = "px-2 py-2 md:py-1 rounded text-[9px] font-bold transition-all text-surface-500 hover:text-white";
        });
        this.entropyGuardOnBtn.addEventListener('click', () => {
            this.entropyGuardEnabled = true;
            this.entropyGuardOnBtn.className = "px-2 py-2 md:py-1 rounded text-[9px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.entropyGuardOffBtn.className = "px-2 py-2 md:py-1 rounded text-[9px] font-bold transition-all text-surface-500 hover:text-white";
        });
        this.modeScrollBtn.addEventListener('click', () => {
            this.isScanMode = false;
            this.modeScrollBtn.className = "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.modeScanBtn.className = "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all text-surface-500 hover:text-white";
            this.draw();
        });
        this.modeScanBtn.addEventListener('click', () => {
            this.setScanMode(true);
        });
        this.instantFillToggle.addEventListener('change', (e) => this.instantFill = e.target.checked);
        if (this.autoPlayToggle) {
            this.autoPlayToggle.addEventListener('change', (e) => {
                this.autoPlay = e.target.checked;
            });
        }
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
            if (this.waitSettings) this.waitSettings.classList.toggle('hidden', !this.waitBetweenScans);
            if (!this.waitBetweenScans) {
                this.isWaiting = false;
                this.waitProgressBarContainer.classList.add('opacity-0');
            }
        });
        this.waitSlider.addEventListener('input', (e) => {
            this.waitTime = parseFloat(e.target.value);
            this.waitDisplay.textContent = `${this.waitTime.toFixed(1)}s`;
        });

        if (this.btnCopyMap) {
            this.btnCopyMap.addEventListener('click', () => {
                const bitCount = 1 << (2 * this.radius + 1);
                let map = "";
                for (let i = 0; i < bitCount; i++) {
                    const pattern = i.toString(2).padStart(2 * this.radius + 1, '0');
                    const res = (this.rule >> BigInt(i)) & 1n;
                    map += `${pattern}:${res};\n`;
                }
                navigator.clipboard.writeText(map).then(() => {
                    const icon = this.btnCopyMap.querySelector('i, svg');
                    const originalHTML = this.btnCopyMap.innerHTML;
                    this.btnCopyMap.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i><span>Copied!</span>';
                    lucide.createIcons();
                    setTimeout(() => {
                        this.btnCopyMap.innerHTML = originalHTML;
                        lucide.createIcons();
                    }, 2000);
                });
            });
        }

        if (this.btnCopyRule) {
            this.btnCopyRule.addEventListener('click', () => {
                const val = this.ruleInput.value;
                navigator.clipboard.writeText(val).then(() => {
                    const icon = this.btnCopyRule.querySelector('i, svg');
                    const originalHTML = this.btnCopyRule.innerHTML;
                    this.btnCopyRule.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>';
                    lucide.createIcons();
                    setTimeout(() => {
                        this.btnCopyRule.innerHTML = originalHTML;
                        lucide.createIcons();
                    }, 2000);
                });
            });
        }
        this.sizeSlider.addEventListener('change', (e) => {
            this.cellSize = parseInt(e.target.value);
            this.sizeDisplay.textContent = `${this.cellSize}px`;
            this.pause();
            this.resizeAndReset();
        });
        if (this.maxWidthInput) {
            this.maxWidthInput.addEventListener('input', (e) => {
                this.pause();
                this.resizeAndReset();
            });
        }
        this.colorAliveInput.addEventListener('input', (e) => { this.colorAlive = e.target.value; this.updateRuleVisualizer(); this.draw(); });
        this.colorDeadInput.addEventListener('input', (e) => { this.colorDead = e.target.value; this.updateRuleVisualizer(); this.draw(); });
        this.initCenterBtn.addEventListener('click', () => {
            this.initialMode = 'center';
            this.initCenterBtn.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 bg-white/10 text-white shadow-sm";
            this.initRandomBtn.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-surface-500 hover:text-white";
            this.pause(); this.resizeAndReset(); 
            if (this.instantFill) {
                this.fillScreen();
                if (this.autoPlay) this.play();
            }
        });
        this.initRandomBtn.addEventListener('click', () => {
            this.initialMode = 'random';
            this.initRandomBtn.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 bg-white/10 text-white shadow-sm";
            this.initCenterBtn.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-surface-500 hover:text-white";
            this.pause(); this.resizeAndReset(); 
            if (this.instantFill) {
                this.fillScreen();
                if (this.autoPlay) this.play();
            }
        });
        this.btnDrawWall.addEventListener('click', () => {
            this.isDrawingWalls = !this.isDrawingWalls;
            this.btnDrawWall.classList.toggle('bg-brand-500/20', this.isDrawingWalls);
            this.btnDrawWall.classList.toggle('border-brand-500/50', this.isDrawingWalls);
            this.canvas.style.cursor = this.isDrawingWalls ? 'crosshair' : 'default';
            
            if (this.isDrawingWalls && !this.isScanMode) {
                this.setScanMode(true);
            }
        });
        this.btnClearWalls.addEventListener('click', () => {
            for (let y = 0; y < this.rows; y++) this.walls[y].fill(0);
            this.draw();
        });
        this.xyPropagationToggle.addEventListener('change', (e) => this.xyPropagation = e.target.checked);
        this.maxAttemptsInput.addEventListener('change', (e) => this.updateUrlDebounced());
        
        this.statsModeToggle.addEventListener('change', (e) => {
            this.stats.toggle(e.target.checked);
            this.pause();
            this.resizeAndReset();
        });
        this.edgeWrapToggle.addEventListener('change', (e) => this.edgeWrap = e.target.checked);
 
        this.scaleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.renderScale = parseInt(btn.dataset.scale);
                this.scaleBtns.forEach(b => {
                    const active = parseInt(b.dataset.scale) === this.renderScale;
                    b.className = `scale-btn flex-1 py-2 md:py-1 rounded text-[9px] font-bold transition-all ${active ? 'bg-white/10 text-white shadow-sm' : 'text-surface-500 hover:text-white'}`;
                });
                this.pause();
                this.resizeAndReset();
            });
        });
 
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.isDrawingWalls) return;
            this.isPainting = true;
            this.paintWall(e);
        });
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isPainting) this.paintWall(e);
        });
        window.addEventListener('mouseup', () => {
            this.isPainting = false;
            this.lastX = undefined;
            this.lastY = undefined;
        });

        // Touch events for mobile wall drawing
        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.isDrawingWalls) return;
            e.preventDefault();
            this.isPainting = true;
            this.paintWall(e.touches[0]);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isPainting) {
                e.preventDefault();
                this.paintWall(e.touches[0]);
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            this.isPainting = false;
            this.lastX = undefined;
            this.lastY = undefined;
        });

        if (this.sidebar) {
            const triggerUpdate = () => { if (this.updateUrlDebounced) this.updateUrlDebounced(); };
            this.sidebar.addEventListener('input', triggerUpdate);
            this.sidebar.addEventListener('change', triggerUpdate);
            this.sidebar.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) triggerUpdate();
            });
        }

        const shareAction = () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                const buttons = [this.btnShare, this.btnShareMobile].filter(b => b);
                buttons.forEach(btn => {
                    const icon = btn.querySelector('i');
                    icon.setAttribute('data-lucide', 'check');
                    btn.classList.add('text-brand-400');
                    lucide.createIcons();
                    setTimeout(() => {
                        icon.setAttribute('data-lucide', 'share-2');
                        btn.classList.remove('text-brand-400');
                        lucide.createIcons();
                    }, 2000);
                });
            });
        };

        if (this.btnShare) this.btnShare.addEventListener('click', shareAction);
        if (this.btnShareMobile) this.btnShareMobile.addEventListener('click', shareAction);

        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => { this.pause(); this.resizeAndReset(); }, 200);
        });

        // Mobile Menu Toggles
        if (this.btnMobileMenu) {
            this.btnMobileMenu.addEventListener('click', () => this.toggleSidebar(true));
        }
        if (this.btnCloseSidebar) {
            this.btnCloseSidebar.addEventListener('click', () => this.toggleSidebar(false));
        }
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.toggleSidebar(false));
        }
    }

    toggleSidebar(show) {
        if (!this.sidebar || !this.sidebarOverlay) return;
        
        if (show) {
            this.sidebar.classList.remove('-translate-x-full');
            this.sidebarOverlay.classList.remove('opacity-0', 'pointer-events-none');
            this.sidebarOverlay.classList.add('opacity-100');
        } else {
            this.sidebar.classList.add('-translate-x-full');
            this.sidebarOverlay.classList.add('opacity-0', 'pointer-events-none');
            this.sidebarOverlay.classList.remove('opacity-100');
        }
    }

    paintWall(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.cellSize);
        const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.cellSize);
        
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            if (!this.isScanMode) this.setScanMode(true);
            
            const val = e.shiftKey ? 0 : 1;
            
            if (this.lastX !== undefined && this.lastY !== undefined) {
                // Line interpolation (Bresenham's)
                let dx = Math.abs(x - this.lastX), dy = Math.abs(y - this.lastY);
                let sx = (this.lastX < x) ? 1 : -1, sy = (this.lastY < y) ? 1 : -1;
                let err = dx - dy;
                let lx = this.lastX, ly = this.lastY;
                
                while (true) {
                    if (lx >= 0 && lx < this.cols && ly >= 0 && ly < this.rows) {
                        this.walls[ly][lx] = val;
                    }
                    if (lx === x && ly === y) break;
                    let e2 = 2 * err;
                    if (e2 > -dy) { err -= dy; lx += sx; }
                    if (e2 < dx) { err += dx; ly += sy; }
                }
            } else {
                this.walls[y][x] = val;
            }
            
            this.lastX = x;
            this.lastY = y;
            this.draw();
        }
    }

    setScanMode(isScan) {
        this.isScanMode = isScan;
        if (isScan) {
            this.modeScanBtn.className = "flex-1 py-2 md:py-1 rounded-lg text-[10px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.modeScrollBtn.className = "flex-1 py-2 md:py-1 rounded-lg text-[10px] font-bold transition-all text-surface-500 hover:text-white";
        } else {
            this.modeScrollBtn.className = "flex-1 py-2 md:py-1 rounded-lg text-[10px] font-bold transition-all bg-white/10 text-white shadow-sm";
            this.modeScanBtn.className = "flex-1 py-2 md:py-1 rounded-lg text-[10px] font-bold transition-all text-surface-500 hover:text-white";
        }
        this.draw();
    }

    populatePresets() {
        this.presetRules.innerHTML = '<option value="" class="bg-surface-900">Explore Presets...</option>';
        AUTOMATA_PRESETS.forEach((preset, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = preset.name;
            option.className = 'bg-surface-900';
            this.presetRules.appendChild(option);
        });
    }

    setRadius(r, randomize = true) {
        this.radius = r;
        if (this.radiusDisplay) this.radiusDisplay.textContent = `R${r}`;
        this.radiusBtns.forEach(btn => {
            const active = parseInt(btn.dataset.radius) === r;
            btn.className = `radius-btn px-3 py-2 md:py-1 rounded text-[10px] font-bold transition-all ${active ? 'bg-white/10 text-white' : 'text-surface-500 hover:text-white'}`;
        });
        if (randomize) this.btnRandomRule.click();
    }

    setRule(ruleValue) {
        try { this.rule = BigInt(ruleValue); } catch (e) { return; }
        const bitCount = 1 << (2 * this.radius + 1);
        this.ruleTable = new Uint8Array(bitCount);
        const rs = this.rule.toString();
        this.ruleInput.value = rs;
        for (let i = 0; i < bitCount; i++) this.ruleTable[i] = Number((this.rule >> BigInt(i)) & 1n);
        
        if (this.logicStats) {
            this.logicStats.textContent = `R${this.radius}: ${bitCount} Bits`;
        }
        
        if (this.stats) this.stats.updateMetadata(this.calculateLambda(), this.radius);

        if (this.resetOnRuleChange) { this.pause(); this.resizeAndReset(); }
    }

    calculateLambda() {
        if (!this.ruleTable) return 0;
        let ones = 0;
        for (let val of this.ruleTable) if (val === 1) ones++;
        return ones / this.ruleTable.length;
    }

    resizeAndReset() {
        const rect = this.container.getBoundingClientRect();
        
        let targetCols = Math.ceil(rect.width * this.renderScale / this.cellSize);
        if (this.maxWidthInput) {
            const maxW = parseInt(this.maxWidthInput.value);
            if (!isNaN(maxW) && maxW > 0) {
                targetCols = Math.min(targetCols, maxW);
            }
        }

        this.cols = targetCols;
        this.rows = Math.ceil(rect.height * this.renderScale / this.cellSize);

        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
        
        // Match CSS size to actual grid to allow centering
        this.canvas.style.width = `${this.canvas.width / this.renderScale}px`;
        this.canvas.style.height = `${this.canvas.height / this.renderScale}px`;

        this.resetGrid();
    }

    resetGrid() {
        this.grid = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));
        this.walls = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));
        this.gridPointer = 0; this.totalGenerations = 1;
        if (this.initialMode === 'center') this.grid[0][Math.floor(this.cols / 2)] = 1;
        else for (let i = 0; i < this.cols; i++) this.grid[0][i] = Math.random() > 0.5 ? 1 : 0;
        
        // Ensure initial state isn't inside a wall
        for (let i = 0; i < this.cols; i++) if (this.walls[0][i]) this.grid[0][i] = 0;

        if (this.stats) this.stats.reset();
        this.lastComplexity = undefined;
        this.lastDensity = undefined;
        this.updateStats(); this.draw();
    }

    fillScreen() { for (let i = 0; i < this.rows - 1; i++) this.generateNextRow(); this.draw(); }
    
    updateStats() { 
        this.statsDisplay.querySelector('span').textContent = `GEN: ${this.totalGenerations}`;
        if (this.statsDisplayMobile) this.statsDisplayMobile.textContent = `G:${this.totalGenerations}`;
        const metrics = this.calculateComplexity();
        const rawComplexity = metrics.complexity;
        
        // Exponential Moving Average for stability (alpha = 0.1)
        if (this.totalGenerations === 1) this.smoothedComplexity = rawComplexity;
        else this.smoothedComplexity = (rawComplexity * 0.1) + (this.smoothedComplexity * 0.9);

        this.complexityValue.textContent = `${this.smoothedComplexity.toFixed(1)}%`;
    }

    calculateAverageMetrics(includeStability = false) {
        let totalComp = 0;
        let totalVol = 0;
        const sampleSize = Math.min(this.rows, 50);
        const step = Math.max(1, Math.floor(this.rows / sampleSize));
        let count = 0;
        
        // Reset metrics for consistent volatility calculation in sampling
        this.lastComplexity = undefined;
        this.lastDensity = undefined;

        for (let i = 0; i < this.rows; i += step) {
            const m = this.calculateComplexity(i, false, includeStability);
            totalComp += m.complexity;
            totalVol += m.volatility;
            count++;
        }
        return { 
            complexity: count > 0 ? totalComp / count : 0,
            volatility: count > 0 ? totalVol / count : 0
        };
    }

    calculatePeriodicity() {
        const currentRow = this.grid[this.gridPointer];
        const n = this.rows;
        const cols = this.cols;
        const maxCheck = Math.min(n - 1, 50); // Check up to 50 previous rows
        
        for (let d = 1; d <= maxCheck; d++) {
            const prevIdx = (this.gridPointer - d + n) % n;
            const prevRow = this.grid[prevIdx];
            
            let match = true;
            for (let i = 0; i < cols; i++) {
                if (currentRow[i] !== prevRow[i]) {
                    match = false;
                    break;
                }
            }
            if (match) return d;
        }
        return 0;
    }

    calculateComplexity(rowIdx = this.gridPointer, updateStats = true, includeStability = true) {
        const row = this.grid[rowIdx];
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
        let complexity = (entropy / 5) * 100;
        
        // Detect periodicity (temporal stability)
        let stability = 0;
        let period = 0;
        if (includeStability) {
            period = this.calculatePeriodicity();
            if (period > 0) {
                stability = (1 / period) * 100;
                // Discount complexity based on stability
                complexity *= (1 - (1 / period));
            }
        }
        
        const totalCount = n;
        let activeCount = 0;
        for (let i = 0; i < n; i++) if (row[i] === 1) activeCount++;
        
        const ratio = (activeCount / totalCount) * 100;
        
        // Calculate Volatility (Dynamism)
        let volatility = 0;
        if (this.lastComplexity !== undefined && this.lastDensity !== undefined) {
            // Volatility is the sum of absolute changes in metrics
            volatility = Math.abs(complexity - this.lastComplexity) + Math.abs(ratio - this.lastDensity);
        }
        this.lastComplexity = complexity;
        this.lastDensity = ratio;

        // Estimate Lyapunov Exponent (Sensitivity)
        let lyapunov = 0;
        if (updateStats) {
            lyapunov = this.calculateLyapunov();
        }

        // Update stats engine if active
        if (updateStats && this.stats && this.stats.isActive) {
            this.stats.addData(this.totalGenerations, complexity, activeCount, totalCount, stability, period, volatility, lyapunov);
        }

        return { complexity, volatility, ratio, activeCount, totalCount, stability, period, lyapunov };
    }

    generateRandomRuleValue() {
        const bitCount = 1 << (2 * this.radius + 1);
        if (bitCount <= 32) return BigInt(Math.floor(Math.random() * (2 ** bitCount)));
        let hex = '0x';
        for (let i = 0; i < bitCount / 4; i++) hex += Math.floor(Math.random() * 16).toString(16);
        return BigInt(hex);
    }

    evaluateRuleMetrics(rule, radius, cols, rows, checkStability) {
        // Pure function to evaluate a rule without affecting main state
        const bitCount = 1 << (2 * radius + 1);
        const ruleTable = new Uint8Array(bitCount);
        for (let i = 0; i < bitCount; i++) ruleTable[i] = Number((rule >> BigInt(i)) & 1n);

        const grid = Array.from({ length: rows }, () => new Uint8Array(cols));
        // Seed center
        grid[0][Math.floor(cols / 2)] = 1;
        // Or random seed? Let's use random for better metrics
        for (let i = 0; i < cols; i++) if (Math.random() > 0.5) grid[0][i] = 1;

        // Simulate
        for (let r = 1; r < rows; r++) {
            const prev = grid[r - 1];
            const next = grid[r];
            if (radius === 1) {
                for (let i = 0; i < cols; i++) {
                    const l = (i === 0) ? 0 : prev[i - 1];
                    const c = prev[i];
                    const r_val = (i === cols - 1) ? 0 : prev[i + 1];
                    next[i] = ruleTable[(l << 2) | (c << 1) | r_val];
                }
            } else {
                for (let i = 0; i < cols; i++) {
                    let w = 0;
                    for (let d = -radius; d <= radius; d++) {
                        const idx = i + d;
                        w = (w << 1) | ((idx >= 0 && idx < cols) ? prev[idx] : 0);
                    }
                    next[i] = ruleTable[w];
                }
            }
        }

        // Analyze last 20 rows
        let totalComp = 0;
        let totalVol = 0;
        let lastC = undefined;
        let lastD = undefined;
        let count = 0;

        for (let r = rows - 20; r < rows; r++) {
            const row = grid[r];
            // Simple entropy (3-bit for speed in search)
            const patternCounts = new Array(8).fill(0);
            let active = 0;
            for (let i = 0; i < cols; i++) {
                const p = ((row[(i - 1 + cols) % cols] << 2) | (row[i] << 1) | row[(i + 1) % cols]);
                patternCounts[p]++;
                if (row[i]) active++;
            }
            let entropy = 0;
            for (let c of patternCounts) if (c > 0) { const p = c / cols; entropy -= p * Math.log2(p); }
            let comp = (entropy / 3) * 100;

            // Stability check (simplified)
            if (checkStability) {
                let p = 0;
                for (let prevR = 1; prevR <= 10; prevR++) {
                    let match = true;
                    for (let i = 0; i < cols; i++) if (grid[r - prevR][i] !== row[i]) { match = false; break; }
                    if (match) { p = prevR; break; }
                }
                if (p > 0) comp *= (1 - (1 / p));
            }

            const dens = (active / cols) * 100;
            let vol = 0;
            if (lastC !== undefined) vol = Math.abs(comp - lastC) + Math.abs(dens - lastD);
            lastC = comp; lastD = dens;

            totalComp += comp;
            totalVol += vol;
            count++;
        }

        return { complexity: totalComp / count, volatility: totalVol / count };
    }

    calculateLyapunov() {
        const row = this.grid[this.gridPointer];
        const n = this.cols;
        if (n < 10) return 0;
        
        // Shadow row with one bit flipped
        const shadow = new Uint8Array(row);
        const mid = Math.floor(n / 2);
        shadow[mid] = 1 - shadow[mid];
        
        const nextOrig = this.applyRuleToRow(row);
        const nextShadow = this.applyRuleToRow(shadow);
        
        let diffs = 0;
        for (let i = 0; i < n; i++) if (nextOrig[i] !== nextShadow[i]) diffs++;
        
        return diffs; // Rate of damage spread
    }

    applyRuleToRow(row) {
        const cols = this.cols;
        const next = new Uint8Array(cols);
        const ruleTable = this.ruleTable;
        const radius = this.radius;
        
        if (radius === 1) {
            for (let i = 0; i < cols; i++) {
                let l, c, r;
                if (this.edgeWrap) {
                    l = row[(i - 1 + cols) % cols];
                    c = row[i];
                    r = row[(i + 1) % cols];
                } else {
                    l = (i === 0) ? 0 : row[i - 1];
                    c = row[i];
                    r = (i === cols - 1) ? 0 : row[i + 1];
                }
                next[i] = ruleTable[(l << 2) | (c << 1) | r];
            }
        } else {
            const mask = (1 << (2 * radius + 1)) - 1;
            for (let i = 0; i < cols; i++) {
                let w = 0;
                for (let d = -radius; d <= radius; d++) {
                    let val = 0;
                    if (this.edgeWrap) {
                        val = row[(i + d + cols) % cols];
                    } else {
                        const idx = i + d;
                        val = (idx >= 0 && idx < cols) ? row[idx] : 0;
                    }
                    w = (w << 1) | val;
                }
                next[i] = ruleTable[w];
            }
        }
        return next;
    }

    generateNextRow() {
        if (this.rows === 0) return;
        const prevRow = this.grid[this.gridPointer];
        this.gridPointer = (this.gridPointer + 1) % this.rows;
        const nextRow = this.grid[this.gridPointer];
        if (!nextRow) return;
        
        const baseNextRow = this.applyRuleToRow(prevRow);
        const currentWalls = this.walls[this.gridPointer];
        const cols = this.cols;

        // 2. Apply walls and X-Y Propagation
        nextRow.fill(0);
        for (let i = 0; i < cols; i++) {
            if (baseNextRow[i] === 0) continue;

            if (!currentWalls[i]) {
                nextRow[i] = 1;
            } else if (this.xyPropagation) {
                // Life is blocked! Try to leak to the nearest available side
                let found = false;
                for (let d = 1; d < 10; d++) { // Search up to 10 cells away
                    const left = (i - d + cols) % cols;
                    const right = (i + d + cols) % cols;
                    if (!currentWalls[left] && !nextRow[left]) { nextRow[left] = 1; found = true; break; }
                    if (!currentWalls[right] && !nextRow[right]) { nextRow[right] = 1; found = true; break; }
                }
            }
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
        if (this.renderScale >= 2 && this.cellSize === 1 && this.colorMode === 'solid') {
            this.drawFast();
            return;
        }

        this.ctx.fillStyle = this.colorDead; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const count = Math.min(this.totalGenerations, this.rows);
        
        if (this.isScanMode) {
            for (let i = 0; i < count; i++) {
                this.drawRow(this.grid[i], i, i);
                this.drawWalls(this.walls[i], i);
            }
            this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
            this.ctx.fillRect(0, this.gridPointer * this.cellSize, this.canvas.width, Math.max(1, this.cellSize / 2));
        } else {
            const sp = (this.gridPointer - count + 1 + this.rows) % this.rows;
            for (let i = 0; i < count; i++) { 
                const idx = (sp + i) % this.rows; 
                this.drawRow(this.grid[idx], i, idx); 
                this.drawWalls(this.walls[idx], i);
            }
        }
    }

    drawFast() {
        if (!this.cachedImageData || this.cachedImageData.width !== this.canvas.width || this.cachedImageData.height !== this.canvas.height) {
            this.cachedImageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        }
        
        const data = new Uint32Array(this.cachedImageData.data.buffer);
        
        const parseColor = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return (255 << 24) | (b << 16) | (g << 8) | r;
        };

        const colorAlive32 = parseColor(this.colorAlive);
        const colorDead32 = parseColor(this.colorDead);
        const colorWall32 = parseColor('#3f3f46');
        const colorScanner32 = (255 << 24) | (150 << 16) | (150 << 8) | 150;

        const count = Math.min(this.totalGenerations, this.rows);
        const width = this.canvas.width;

        if (this.isScanMode) {
            for (let y = 0; y < count; y++) {
                const row = this.grid[y];
                const walls = this.walls[y];
                const offset = y * width;
                for (let x = 0; x < width; x++) {
                    if (walls[x]) data[offset + x] = colorWall32;
                    else data[offset + x] = row[x] ? colorAlive32 : colorDead32;
                }
            }
            // Scanner line
            const scanOffset = this.gridPointer * width;
            for (let x = 0; x < width; x++) data[scanOffset + x] = colorScanner32;
        } else {
            const sp = (this.gridPointer - count + 1 + this.rows) % this.rows;
            for (let y = 0; y < count; y++) {
                const idx = (sp + y) % this.rows;
                const row = this.grid[idx];
                const walls = this.walls[idx];
                const offset = y * width;
                for (let x = 0; x < width; x++) {
                    if (walls[x]) data[offset + x] = colorWall32;
                    else data[offset + x] = row[x] ? colorAlive32 : colorDead32;
                }
            }
        }
        
        this.ctx.putImageData(this.cachedImageData, 0, 0);
    }

    drawWalls(row, y) {
        if (!row.some(v => v === 1)) return;
        const cs = this.cellSize;
        this.ctx.save();
        
        for (let x = 0; x < this.cols; x++) {
            if (row[x]) {
                const px = x * cs;
                const py = y * cs;
                
                if (cs < 4) {
                    // Simple fast path for high-res walls
                    this.ctx.fillStyle = '#3f3f46';
                    this.ctx.fillRect(px, py, cs, cs);
                    continue;
                }

                // Wall Base with subtle gradient
                const grad = this.ctx.createLinearGradient(px, py, px + cs, py + cs);
                grad.addColorStop(0, '#3f3f46'); // zinc-700
                grad.addColorStop(1, '#27272a'); // zinc-800
                this.ctx.fillStyle = grad;
                this.ctx.fillRect(px, py, cs, cs);
                
                // Highlight edges
                this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeRect(px + 0.5, py + 0.5, cs - 1, cs - 1);
                
                // Inner "structural" detail for larger cells
                if (cs >= 6) {
                    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    this.ctx.fillRect(px + cs*0.2, py + cs*0.2, cs*0.6, cs*0.6);
                    this.ctx.strokeStyle = 'rgba(161,161,170,0.2)'; // zinc-400
                    this.ctx.strokeRect(px + cs*0.2, py + cs*0.2, cs*0.6, cs*0.6);
                } else if (cs >= 3) {
                    // Small dot for medium cells
                    this.ctx.fillStyle = 'rgba(161,161,170,0.3)';
                    this.ctx.fillRect(px + cs*0.3, py + cs*0.3, cs*0.4, cs*0.4);
                }
            }
        }
        this.ctx.restore();
    }

    togglePlay() { if (this.isRunning) this.pause(); else this.play(); }
    play() {
        this.isRunning = true;
        this.btnPlay.innerHTML = '<i data-lucide="pause" class="w-5 h-5 fill-current"></i>';
        this.btnPlay.classList.replace('bg-brand-500', 'bg-amber-500');
        this.btnPlay.classList.replace('hover:bg-brand-400', 'hover:bg-amber-400');
        lucide.createIcons(); this.lastFrameTime = performance.now();
        this.animationReq = requestAnimationFrame((t) => this.loop(t));
    }
    pause() {
        this.isRunning = false;
        this.isWaiting = false;
        this.waitProgressBarContainer.classList.add('opacity-0');
        this.btnPlay.innerHTML = '<i data-lucide="play" class="w-5 h-5 fill-current"></i>';
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

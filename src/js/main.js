// Main application entry point
import * as THREE from 'three';
import iro from '@jaames/iro';
import { gsap } from 'gsap';
import katex from 'katex';
import 'katex/dist/katex.css';

import { CONFIG, DEFAULT_PARAMS, MATHEMATICAL_EQUATIONS, CAMERA_PRESETS } from './config.js';
import { debounce, throttle } from './utils.js';
import { RotarySwitch, Knob } from './ui-controls.js';
import { AudioSystem } from './audio-system.js';
import { SceneManager } from './scene-manager.js';
import { PerformanceMonitor } from './performance-monitor.js';

class LissajousExplorer {
    constructor() {
        this.params = { ...DEFAULT_PARAMS };
        this.knobs = {};
        this.switches = {};
        this.frameCount = 0;
        
        this.audioSystem = new AudioSystem();
        this.sceneManager = new SceneManager();
        this.performanceMonitor = new PerformanceMonitor();
        
        this.clock = new THREE.Clock();
        
        // Make gsap available globally for camera animations
        window.gsap = gsap;
        
        this.init();
    }async init() {
        try {
            // Initialize SceneManager after DOM is ready
            this.sceneManager.initialize();
            
            this.initializeUI();
            this.setupEventListeners();
            this.setupMathRendering();
            this.startAnimationLoop();
            
            console.log('3D Lissajous Figure Explorer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.fallbackInit();
        }
    }

    fallbackInit() {
        try {
            this.sceneManager.initialize();
            this.sceneManager.updateCurve(this.params);
            this.startAnimationLoop();        } catch (fallbackError) {
            console.error('Critical initialization failure:', fallbackError);
        }
    }

    initializeUI() {
        this.initializeKnobs();
        this.initializeColorPicker();
        this.initializeSliders();
        this.initializeToggles();
        this.initializeCameraControls();
        this.initializePanelControls();
    }

    initializeKnobs() {
        // Clean up existing knobs first
        this.cleanupKnobs();
        
        const freqContainer = document.getElementById('frequency-knobs');
        const ampContainer = document.getElementById('amplitude-knobs');

        // Clear any existing knobs to prevent duplicates
        freqContainer.innerHTML = '';
        ampContainer.innerHTML = '';

        // Frequency knobs
        ['a', 'b', 'c'].forEach(key => {
            const wrapper = document.createElement('div');
            wrapper.className = 'knob-wrapper';
            freqContainer.appendChild(wrapper);
            this.switches[key] = new RotarySwitch(wrapper, key, { 
                min: key === 'c' ? 0 : 1, 
                max: 10, 
                initial: this.params[key] 
            });
            this.switches[key].addEventListener('change', e => {
                this.params[key] = e.detail.value;
                this.debouncedUpdateCurve();
                this.throttledUpdateAudio();
            });
        });

        // Amplitude knobs
        ['A', 'B', 'C'].forEach(key => {
            const wrapper = document.createElement('div');
            wrapper.className = 'knob-wrapper';
            ampContainer.appendChild(wrapper);
            this.knobs[key] = new Knob(wrapper, key, {
                initial: this.params[key], 
                min: 0.1, 
                max: 2, 
                precision: 1
            });
            this.knobs[key].addEventListener('change', e => {
                this.params[key] = e.detail.value;
                this.debouncedUpdateCurve();
                this.throttledUpdateAudio();
            });        });

        // Clear phase shift containers and create phase shift knobs
        document.getElementById('knob-deltaX-container').innerHTML = '';
        document.getElementById('knob-deltaY-container').innerHTML = '';
        document.getElementById('knob-deltaZ-container').innerHTML = '';

        this.knobs.deltaX = new Knob(document.getElementById('knob-deltaX-container'), 'δx', {
            initial: this.params.deltaX / Math.PI, 
            min: 0, 
            max: 2, 
            isPhase: true
        });
        this.knobs.deltaY = new Knob(document.getElementById('knob-deltaY-container'), 'δy', {
            initial: this.params.deltaY / Math.PI, 
            min: 0, 
            max: 2, 
            isPhase: true
        });
        this.knobs.deltaZ = new Knob(document.getElementById('knob-deltaZ-container'), 'δz', {
            initial: this.params.deltaZ / Math.PI, 
            min: 0, 
            max: 2, 
            isPhase: true
        });

        for (const knobKey of ['deltaX', 'deltaY', 'deltaZ']) {
            this.knobs[knobKey].addEventListener('change', (e) => {
                this.params[knobKey] = e.detail.value * Math.PI;
                this.debouncedUpdateCurve();
            });
        }
    }

    cleanupKnobs() {
        // Remove event listeners and clean up existing knobs/switches
        for (const key in this.knobs) {
            if (this.knobs[key] && typeof this.knobs[key].cleanup === 'function') {
                this.knobs[key].cleanup();
            }
        }
        for (const key in this.switches) {
            if (this.switches[key] && typeof this.switches[key].cleanup === 'function') {
                this.switches[key].cleanup();
            }
        }
        this.knobs = {};
        this.switches = {};
    }initializeColorPicker() {
        const colorPickerWrapper = document.getElementById("color-picker-wrapper");
        
        // Clear any existing color picker
        colorPickerWrapper.innerHTML = '<div id="color-picker"></div>';
        
        this.colorPicker = new iro.ColorPicker("#color-picker", {
            width: 280,
            color: { 
                h: this.params.color.h, 
                s: this.params.color.s * 100, 
                l: this.params.color.l * 100 
            },
            borderWidth: 1,
            borderColor: "#fff",
            layout: [
                { component: iro.ui.Wheel },
                { component: iro.ui.Slider, options: { sliderType: 'value' } }
            ]
        });

        this.colorPicker.on('color:change', (color) => {
            const { h, s, l } = color.hsl;
            this.params.color = { h, s: s/100, l: l/100 };
            this.debouncedUpdateCurve();
        });
    }

    initializeSliders() {
        const sliderParams = ['damping', 'lineThickness', 'gridThickness', 'gridBrightness', 'glow'];
        
        sliderParams.forEach(key => {
            document.getElementById(key).addEventListener('input', (event) => {
                const newValue = parseFloat(event.target.value);
                this.params[key] = newValue;
                  if (key === 'damping' || key === 'lineThickness') {
                    this.debouncedUpdateCurve();
                }
                if (key === 'gridThickness') {
                    this.updateGridThickness(newValue);
                }
                if (key === 'gridBrightness') {
                    this.updateGridBrightness(newValue);
                }
                if (key === 'glow') {
                    this.sceneManager.updateBloomStrength(newValue);
                }
            });
        });
    }

    initializeToggles() {
        const toggles = [
            { id: 'toggle-aa', param: 'aa', handler: (checked) => this.sceneManager.setAntiAliasing(checked) },
            { id: 'toggle-phase', param: 'isPhaseAnimating' },
            { id: 'toggle-audio', param: 'isAudioEnabled', handler: this.handleAudioToggle.bind(this) }
        ];

        toggles.forEach(({ id, param, handler }) => {
            document.getElementById(id).addEventListener('change', (event) => {
                this.params[param] = event.target.checked;
                if (handler) handler(event.target.checked);
            });
        });
    }

    initializeCameraControls() {
        const presets = {
            'preset-persp': CAMERA_PRESETS.perspective,
            'preset-top': CAMERA_PRESETS.top,
            'preset-front': CAMERA_PRESETS.front,
            'preset-side': CAMERA_PRESETS.side
        };

        for (const [id, position] of Object.entries(presets)) {
            document.getElementById(id).addEventListener('click', () => {
                this.sceneManager.setCameraPosition(position);
            });
        }        document.getElementById('toggle-rotate').addEventListener('click', () => {
            this.sceneManager.controls.autoRotate = !this.sceneManager.controls.autoRotate;
        });
    }    initializePanelControls() {
        this.initializeSidebarToggle();
        this.initializeInfoPanel();
    }    initializeSidebarToggle() {
        // Add a small delay to ensure DOM is fully ready
        setTimeout(() => {
            // Get DOM elements
            this.collapseBtn = document.getElementById('collapse-btn');
            this.expandBtn = document.getElementById('expand-btn');
            this.controlsPanel = document.getElementById('controls');
            
            console.log('DOM elements check:', {
                collapseBtn: this.collapseBtn,
                expandBtn: this.expandBtn,
                controlsPanel: this.controlsPanel
            });
            
            // Validate elements exist
            if (!this.collapseBtn || !this.expandBtn || !this.controlsPanel) {
                console.error('Sidebar toggle elements not found:', {
                    collapseBtn: !!this.collapseBtn,
                    expandBtn: !!this.expandBtn,
                    controlsPanel: !!this.controlsPanel
                });
                return;
            }

            console.log('Initializing sidebar toggle functionality...');

            // Initialize sidebar state - start expanded
            this.sidebarCollapsed = false;
            this.updateSidebarState();

            // Add event listeners with error handling
            try {
                this.collapseBtn.addEventListener('click', this.handleCollapseClick.bind(this));
                this.expandBtn.addEventListener('click', this.handleExpandClick.bind(this));
                console.log('Sidebar toggle initialized successfully');
            } catch (error) {
                console.error('Failed to add event listeners:', error);
            }
        }, 100);
    }

    handleCollapseClick(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('Collapsing sidebar...');
        this.toggleSidebar(true);
    }

    handleExpandClick(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('Expanding sidebar...');
        this.toggleSidebar(false);
    }

    toggleSidebar(shouldCollapse = null) {
        // Toggle state if not explicitly set
        if (shouldCollapse === null) {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        } else {
            this.sidebarCollapsed = shouldCollapse;
        }

        console.log('Sidebar state:', this.sidebarCollapsed ? 'collapsed' : 'expanded');
        this.updateSidebarState();
    }    updateSidebarState() {
        if (!this.controlsPanel || !this.expandBtn) {
            console.error('Cannot update sidebar state - missing elements:', {
                controlsPanel: !!this.controlsPanel,
                expandBtn: !!this.expandBtn
            });
            return;
        }

        console.log('Updating sidebar state to:', this.sidebarCollapsed ? 'collapsed' : 'expanded');

        if (this.sidebarCollapsed) {
            // Sidebar is collapsed - hide panel, show expand button
            this.controlsPanel.classList.add('collapsed');
            this.expandBtn.classList.add('show');
            this.expandBtn.setAttribute('aria-hidden', 'false');
            console.log('Applied collapsed state: panel hidden, expand button visible');
        } else {
            // Sidebar is expanded - show panel, hide expand button
            this.controlsPanel.classList.remove('collapsed');
            this.expandBtn.classList.remove('show');
            this.expandBtn.setAttribute('aria-hidden', 'true');
            console.log('Applied expanded state: panel visible, expand button hidden');
        }
        
        // Debug: log current classes
        console.log('Current classes:', {
            controlsPanel: this.controlsPanel.className,
            expandBtn: this.expandBtn.className
        });
    }

    initializeInfoPanel() {
        const infoBtn = document.getElementById('info-btn');
        const infoPanel = document.getElementById('info-panel');
        const infoCloseBtn = document.getElementById('info-close-btn');
        
        if (!infoBtn || !infoPanel) {
            console.warn('Info panel elements not found');
            return;
        }

        // Info button toggle functionality
        infoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleInfoPanel();
        });

        // Info close button functionality
        if (infoCloseBtn) {
            infoCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeInfoPanel();
            });
        }
    }

    toggleInfoPanel() {
        const infoBtn = document.getElementById('info-btn');
        const infoPanel = document.getElementById('info-panel');
        
        if (infoBtn && infoPanel) {
            const isVisible = infoPanel.classList.contains('visible');
            
            if (isVisible) {
                this.closeInfoPanel();
            } else {
                this.openInfoPanel();
            }
        }
    }

    openInfoPanel() {
        const infoBtn = document.getElementById('info-btn');
        const infoPanel = document.getElementById('info-panel');
        
        if (infoBtn && infoPanel) {
            infoPanel.classList.add('visible');
            infoBtn.classList.add('active');
        }
    }

    closeInfoPanel() {
        const infoBtn = document.getElementById('info-btn');
        const infoPanel = document.getElementById('info-panel');
        
        if (infoBtn && infoPanel) {
            infoPanel.classList.remove('visible');
            infoBtn.classList.remove('active');
        }
    }

    setupEventListeners() {
        // Create debounced/throttled versions of update functions
        this.debouncedUpdateCurve = debounce(() => this.sceneManager.updateCurve(this.params), CONFIG.DEBOUNCE_CURVE_UPDATE);
        this.debouncedUpdateGrid = debounce(() => this.sceneManager.updateGrid(this.params), CONFIG.DEBOUNCE_GRID_UPDATE);
        this.throttledUpdateAudio = throttle(() => this.audioSystem.updateParams(this.params), CONFIG.THROTTLE_AUDIO_UPDATE);
        
        // Window resize handler
        window.addEventListener('resize', debounce(() => this.sceneManager.handleResize(), CONFIG.DEBOUNCE_RESIZE));
          // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
        window.addEventListener('pagehide', () => this.cleanup());
    }

    setupMathRendering() {
        try {
            const equationsDiv = document.getElementById("equations");
            if (!equationsDiv) {
                console.warn('Equations div not found');
                return;
            }
            
            console.log('Setting up math rendering...');
            
            // Parse and render each equation manually
            const equations = [
                'x(t) = A e^{-\\lambda t} \\sin(a t\' + \\delta_x)',
                'y(t) = B e^{-\\lambda t} \\sin(b t\' + \\delta_y)',
                'z(t) = C e^{-\\lambda t} \\sin(c t\' + \\delta_z)'
            ];
            
            // Clear the div
            equationsDiv.innerHTML = '';
            
            equations.forEach((equation, index) => {
                try {
                    const div = document.createElement('div');
                    div.className = 'equation-item';
                    div.innerHTML = katex.renderToString(equation, {
                        displayMode: true,
                        throwOnError: false,
                        trust: true
                    });
                    equationsDiv.appendChild(div);
                    console.log(`Equation ${index + 1} rendered successfully`);
                } catch (eqError) {
                    console.warn(`Failed to render equation ${index + 1}:`, eqError);
                    // Fallback: show the raw LaTeX
                    const div = document.createElement('div');
                    div.className = 'equation-fallback';
                    div.textContent = `$$${equation}$$`;
                    equationsDiv.appendChild(div);
                }
            });
            
            console.log('Math rendering completed');
        } catch (error) {
            console.error('Math rendering setup failed:', error);
            // Ultimate fallback
            const equationsDiv = document.getElementById("equations");
            if (equationsDiv) {
                equationsDiv.innerHTML = `
                    <div class="equation-fallback">
                        <p>x(t) = A e^(-λt) sin(at' + δₓ)</p>
                        <p>y(t) = B e^(-λt) sin(bt' + δᵧ)</p>
                        <p>z(t) = C e^(-λt) sin(ct' + δᵧ)</p>
                    </div>
                `;
            }
        }
    }

    updateGridBrightness(brightness) {
        const material = this.sceneManager.getGridMaterial(brightness);
        this.sceneManager.gridGroup.traverse(child => {
            if (child.material) {
                child.material = material;
            }
        });
    }

    updateGridThickness(thickness) {
        // Use a very short throttle for smooth grid thickness updates
        if (!this.throttledGridThicknessUpdate) {
            this.throttledGridThicknessUpdate = throttle(() => {
                this.sceneManager.updateGrid(this.params);
            }, 16); // 60fps
        }
        this.throttledGridThicknessUpdate();
    }

    async handleAudioToggle(enabled) {
        try {
            if (enabled) {
                await this.audioSystem.init();
                this.audioSystem.setVolume(0.15);
                console.log('Audio enabled');
            } else {
                this.audioSystem.setVolume(0);
                console.log('Audio disabled');
            }
        } catch (error) {
            console.warn('Audio toggle failed:', error);
            // Reset the toggle if audio fails
            const audioToggle = document.getElementById('toggle-audio');
            if (audioToggle) {
                audioToggle.checked = false;
                this.params.isAudioEnabled = false;
            }
        }
    }

    startAnimationLoop() {
        // Initialize scene elements
        this.sceneManager.updateGrid(this.params);
        this.sceneManager.updateCurve(this.params);
        
        // Start the animation loop
        this.animate();
    }

    animate = (currentTime = 0) => {
        requestAnimationFrame(this.animate);
        
        // Frame rate limiting
        if (!this.performanceMonitor.shouldRender(currentTime)) {
            return;
        }
        
        this.performanceMonitor.update();
        this.frameCount++;

        // Handle phase animation
        if (this.params.isPhaseAnimating) {
            this.updatePhaseAnimation();
        }
        
        // Main render
        this.sceneManager.render();
        
        // Update projections less frequently for performance
        if (this.frameCount % CONFIG.PROJECTION_UPDATE_INTERVAL === 0) {
            this.sceneManager.renderProjections();
        }
    }

    updatePhaseAnimation() {
        const time = this.clock.getElapsedTime();
        const deltaXValue = ((time * 0.3) % 2);
        const deltaYValue = ((time * 0.4) % 2);
        const deltaZValue = ((time * 0.5) % 2);
        
        this.params.deltaX = deltaXValue * Math.PI;
        this.params.deltaY = deltaYValue * Math.PI;
        this.params.deltaZ = deltaZValue * Math.PI;
        
        this.knobs.deltaX.setValue(deltaXValue);
        this.knobs.deltaY.setValue(deltaYValue);
        this.knobs.deltaZ.setValue(deltaZValue);
        this.debouncedUpdateCurve();
    }    cleanup() {
        try {
            this.cleanupKnobs();
            this.cleanupSidebarEventListeners();
            this.sceneManager.cleanup();
            this.audioSystem.cleanup();
            console.log('Application cleanup completed');
        } catch (error) {
            console.warn('Cleanup error:', error);
        }
    }

    cleanupSidebarEventListeners() {
        if (this.collapseBtn) {
            this.collapseBtn.removeEventListener('click', this.handleCollapseClick);
        }
        if (this.expandBtn) {
            this.expandBtn.removeEventListener('click', this.handleExpandClick);
        }
    }
}

// Initialize the application when the DOM is loaded
let appInitialized = false;
let appInstance = null;

function initializeApp() {
    if (appInitialized) return;
    appInitialized = true;
    
    // Clean up any existing instance
    if (appInstance && typeof appInstance.cleanup === 'function') {
        appInstance.cleanup();
    }
    
    appInstance = new LissajousExplorer();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

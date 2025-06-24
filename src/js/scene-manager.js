// 3D Scene management for the Lissajous curves
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { CONFIG } from './config.js';
import { validateParams, createCacheKey, needsUpdate } from './utils.js';

export class SceneManager {
    constructor() {
        this.mainScene = new THREE.Scene();
        this.projectionScenes = {
            xy: new THREE.Scene(),
            xz: new THREE.Scene(),
            yz: new THREE.Scene()
        };
        
        this.geometryCache = new Map();
        this.gridMaterialCache = new Map();
        this.lastUpdateParams = {};
        
        // Initialize non-DOM dependent parts first
        this.initializeScenes();
        
        // DOM-dependent initialization will be called later
        this.initialized = false;
    }
    
    initialize() {
        if (this.initialized) return;
        
        this.initializeRenderers();
        this.initializeCameras();
        this.initializePostProcessing();
        this.initializeControls();
        this.initializeGrid();
        
        this.initialized = true;
    }

    initializeScenes() {
        this.mainScene.background = new THREE.Color('#0a0a0a');
        
        // Add axis labels
        this.mainScene.add(
            this.createAxisLabel('X', '#ff7b7b', new THREE.Vector3(2.5, 0, 0)),
            this.createAxisLabel('Y', '#7bff7b', new THREE.Vector3(0, 2.5, 0)),
            this.createAxisLabel('Z', '#7b7bff', new THREE.Vector3(0, 0, 2.5))
        );

        // Setup projection scenes
        const projGridColor = new THREE.Color(0x227722);
        for (const [key, scene] of Object.entries(this.projectionScenes)) {
            scene.background = new THREE.Color('#0a0a0a');
            const grid = new THREE.GridHelper(4, 8, projGridColor, projGridColor);
            if (key === 'xy') grid.rotation.x = Math.PI / 2;
            else if (key === 'yz') grid.rotation.z = Math.PI / 2;
            scene.add(grid);
        }
    }    initializeRenderers() {
        const webglCanvas = document.querySelector('#webgl');
        const canvasXY = document.querySelector('#canvas-xy');
        const canvasXZ = document.querySelector('#canvas-xz');
        const canvasYZ = document.querySelector('#canvas-yz');
        
        if (!webglCanvas || !canvasXY || !canvasXZ || !canvasYZ) {
            throw new Error('Required canvas elements not found in DOM');
        }
        
        this.mainRenderer = new THREE.WebGLRenderer({ 
            canvas: webglCanvas, 
            antialias: false,
            powerPreference: "high-performance",
            alpha: false
        });
        this.mainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.mainRenderer.setSize(window.innerWidth, window.innerHeight);
        this.mainRenderer.shadowMap.enabled = false;

        this.projectionRenderers = {
            xy: new THREE.WebGLRenderer({ 
                canvas: canvasXY, 
                antialias: true,
                alpha: false,
                powerPreference: "default"
            }),
            xz: new THREE.WebGLRenderer({ 
                canvas: canvasXZ, 
                antialias: true,
                alpha: false,
                powerPreference: "default"
            }),
            yz: new THREE.WebGLRenderer({ 
                canvas: canvasYZ, 
                antialias: true,
                alpha: false,
                powerPreference: "default"
            }),
        };
        
        Object.values(this.projectionRenderers).forEach(r => {
            r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        });
    }

    initializeCameras() {
        this.mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.mainCamera.position.set(2, 3, 5);
        
        this.projectionCameras = {
            xy: new THREE.OrthographicCamera(-2.2, 2.2, 2.2, -2.2, 0.1, 1000),
            xz: new THREE.OrthographicCamera(-2.2, 2.2, 2.2, -2.2, 0.1, 1000),
            yz: new THREE.OrthographicCamera(-2.2, 2.2, 2.2, -2.2, 0.1, 1000),
        };
        
        this.projectionCameras.xy.position.set(0, 0, 10);
        this.projectionCameras.xz.position.set(0, 10, 0);
        this.projectionCameras.xz.lookAt(0, 0, 0);
        this.projectionCameras.yz.position.set(10, 0, 0);
        this.projectionCameras.yz.lookAt(0, 0, 0);
    }

    initializePostProcessing() {
        this.composer = new EffectComposer(this.mainRenderer);
        this.renderPass = new RenderPass(this.mainScene, this.mainCamera);
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight), 
            0.5, 0.3, 0.0
        );
        this.smaaPass = new SMAAPass(
            window.innerWidth * this.mainRenderer.getPixelRatio(), 
            window.innerHeight * this.mainRenderer.getPixelRatio()
        );
        
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.bloomPass);
        this.composer.addPass(this.smaaPass);
    }

    initializeControls() {
        this.controls = new OrbitControls(this.mainCamera, this.mainRenderer.domElement);
        this.controls.enableDamping = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    initializeGrid() {
        this.gridGroup = new THREE.Group();
        this.mainScene.add(this.gridGroup);
    }

    createAxisLabel(text, color, position) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        context.font = `bold ${size * 0.8}px 'Roboto Mono', monospace`;
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, size / 2, size / 2);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, sizeAttenuation: false });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(0.1, 0.1, 1);
        return sprite;
    }

    getGridMaterial(brightness) {
        const key = brightness.toFixed(2);
        if (!this.gridMaterialCache.has(key)) {
            this.gridMaterialCache.set(key, new THREE.MeshStandardMaterial({
                color: '#000000', 
                emissive: new THREE.Color(0x1a4d1a), 
                emissiveIntensity: brightness
            }));
        }
        return this.gridMaterialCache.get(key);
    }

    createGlowingGridPlane(size, divisions, material, thickness) {
        const group = new THREE.Group();
        const step = size / divisions;
        const halfSize = size / 2;
        for (let i = 0; i <= divisions; i++) {
            const pos = -halfSize + i * step;
            const vPath = new THREE.LineCurve3(new THREE.Vector3(pos, -halfSize, 0), new THREE.Vector3(pos, halfSize, 0));
            group.add(new THREE.Mesh(new THREE.TubeGeometry(vPath, 1, thickness, 4), material));
            const hPath = new THREE.LineCurve3(new THREE.Vector3(-halfSize, pos, 0), new THREE.Vector3(halfSize, pos, 0));
            group.add(new THREE.Mesh(new THREE.TubeGeometry(hPath, 1, thickness, 4), material));
        }
        return group;
    }

    updateGrid(params) {
        // Clean up old grid objects
        while(this.gridGroup.children.length > 0) {
            const child = this.gridGroup.children[0];
            this.gridGroup.remove(child);
            if (child.children) {
                child.children.forEach(grandchild => {
                    if (grandchild.geometry) grandchild.geometry.dispose();
                    if (grandchild.material && !this.gridMaterialCache.has(grandchild.material)) {
                        grandchild.material.dispose();
                    }
                });
            }
        }
        
        const currentMaterial = this.getGridMaterial(params.gridBrightness);
        const gridXY = this.createGlowingGridPlane(4, 8, currentMaterial, params.gridThickness);
        const gridXZ = this.createGlowingGridPlane(4, 8, currentMaterial, params.gridThickness);
        gridXZ.rotation.x = Math.PI / 2;
        const gridYZ = this.createGlowingGridPlane(4, 8, currentMaterial, params.gridThickness);
        gridYZ.rotation.y = Math.PI / 2;
        this.gridGroup.add(gridXY, gridXZ, gridYZ);    }

    needsCurveUpdate(params) {
        const currentParams = {
            a: params.a, b: params.b, c: params.c,
            A: params.A, B: params.B, C: params.C,
            deltaX: params.deltaX, deltaY: params.deltaY, deltaZ: params.deltaZ,
            damping: params.damping, lineThickness: params.lineThickness,
            color: `${params.color.h}-${params.color.s}-${params.color.l}`
        };
        
        if (needsUpdate(currentParams, this.lastUpdateParams)) {
            this.lastUpdateParams = currentParams;
            return true;
        }
        return false;
    }

    updateCurve(params) {
        if (!this.needsCurveUpdate(params)) return;
        
        validateParams(params);
        
        // Clean up previous resources
        if (this.mainCurve) {
            this.mainScene.remove(this.mainCurve);
            this.mainCurve.geometry.dispose();
        }
        if (this.mainMaterial) this.mainMaterial.dispose();
        if (this.projectionMaterial) this.projectionMaterial.dispose();
        
        if (this.projectionLines) {
            for(const [key, line] of Object.entries(this.projectionLines)) {
                this.projectionScenes[key].remove(line);
                line.geometry.dispose();
            }
        }
        
        const tempColor = new THREE.Color();
        tempColor.setHSL(params.color.h / 360, params.color.s, params.color.l);

        this.mainMaterial = new THREE.MeshStandardMaterial({
            color: '#000000', 
            emissive: tempColor, 
            emissiveIntensity: 1.5 
        });
        this.projectionMaterial = new THREE.LineBasicMaterial({ color: tempColor });
        
        // Generate curve points with caching
        const cacheKey = createCacheKey(params);
        let points;
        
        if (this.geometryCache.has(cacheKey) && this.geometryCache.size < CONFIG.GEOMETRY_CACHE_LIMIT) {
            points = this.geometryCache.get(cacheKey);
        } else {
            points = this.generateCurvePoints(params);
            if (this.geometryCache.size < CONFIG.GEOMETRY_CACHE_LIMIT) {
                this.geometryCache.set(cacheKey, points);
            }
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const path = new THREE.CatmullRomCurve3(points);
        const mainGeometry = new THREE.TubeGeometry(path, CONFIG.CURVE_POINTS / 4, params.lineThickness, 8, false);
        
        this.mainCurve = new THREE.Mesh(mainGeometry, this.mainMaterial);
        this.mainScene.add(this.mainCurve);

        // Create projection lines
        this.projectionLines = {};
        for (const [key, scene] of Object.entries(this.projectionScenes)) {
            this.projectionLines[key] = new THREE.Line(lineGeometry.clone(), this.projectionMaterial);
            scene.add(this.projectionLines[key]);
        }
    }

    generateCurvePoints(params) {
        const points = [];
        for (let i = 0; i <= CONFIG.CURVE_POINTS; i++) {
            const t = i / CONFIG.CURVE_POINTS;
            const time = t * 20 * Math.PI;
            const decay = Math.exp(-params.damping * t * 5);
            const x = params.A * decay * Math.sin(params.a * time / 10 + params.deltaX);
            const y = params.B * decay * Math.sin(params.b * time / 10 + params.deltaY);
            const z = params.c === 0 ? 0 : params.C * decay * Math.sin(params.c * time / 10 + params.deltaZ);
            points.push(new THREE.Vector3(x, y, z));
        }
        return points;
    }

    setCameraPosition(position, target = new THREE.Vector3(0, 0, 0)) {
        if (typeof window.gsap !== 'undefined') {
            window.gsap.to(this.mainCamera.position, { 
                duration: 1.2, 
                ease: "power2.inOut", 
                ...position,
                onUpdate: () => this.mainCamera.updateProjectionMatrix()
            });
            window.gsap.to(this.controls.target, { 
                duration: 1.2, 
                ease: "power2.inOut", 
                ...target,
                onUpdate: () => this.controls.update()
            });
        } else {
            this.mainCamera.position.set(position.x, position.y, position.z);
            this.controls.target.set(target.x, target.y, target.z);
            this.controls.update();
        }
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.mainCamera.aspect = width / height;
        this.mainCamera.updateProjectionMatrix();
        this.mainRenderer.setSize(width, height);
        this.composer.setSize(width, height);
        this.bloomPass.resolution.set(width, height);
    }

    updateBloomStrength(strength) {
        this.bloomPass.strength = Math.cbrt(strength);
    }

    setAntiAliasing(enabled) {
        this.smaaPass.enabled = enabled;
    }

    render() {
        this.controls.update();
        this.composer.render();
    }

    renderProjections() {
        for (const [key, renderer] of Object.entries(this.projectionRenderers)) {
            renderer.render(this.projectionScenes[key], this.projectionCameras[key]);
        }
    }

    cleanup() {
        try {
            if (this.mainCurve) {
                this.mainCurve.geometry.dispose();
                this.mainMaterial.dispose();
            }
            
            if (this.projectionLines) {
                for (const line of Object.values(this.projectionLines)) {
                    line.geometry.dispose();
                }
            }
            if (this.projectionMaterial) this.projectionMaterial.dispose();
            
            this.geometryCache.clear();
            this.gridMaterialCache.forEach(material => material.dispose());
            this.gridMaterialCache.clear();
            
            console.log('Scene cleanup completed');
        } catch (error) {
            console.warn('Scene cleanup error:', error);
        }
    }
}

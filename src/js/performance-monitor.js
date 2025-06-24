// Performance monitoring and optimization utilities
export class PerformanceMonitor {
    constructor() {
        this.stats = {
            frameCount: 0,
            lastFPSUpdate: performance.now(),
            fps: 0,
            lastFrameTime: 0
        };
        this.targetFrameTime = 1000 / 60; // 60 FPS
    }

    shouldRender(currentTime = 0) {
        if (currentTime - this.stats.lastFrameTime < this.targetFrameTime) {
            return false;
        }
        this.stats.lastFrameTime = currentTime;
        return true;
    }

    update() {
        this.stats.frameCount++;
        const now = performance.now();
        
        if (now - this.stats.lastFPSUpdate >= 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (now - this.stats.lastFPSUpdate));
            this.stats.frameCount = 0;
            this.stats.lastFPSUpdate = now;
            
            // Optional: Display FPS in console for debugging
            if (window.location.search.includes('debug')) {
                console.log(`FPS: ${this.stats.fps}`);
            }
        }
    }

    getFPS() {
        return this.stats.fps;
    }
}

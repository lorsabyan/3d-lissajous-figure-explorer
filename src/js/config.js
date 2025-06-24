// Application configuration and constants
export const CONFIG = {
    CURVE_POINTS: 2000,
    ANIMATION_FRAME_LIMIT: 60,
    PROJECTION_UPDATE_INTERVAL: 2,
    GEOMETRY_CACHE_LIMIT: 10,
    DEBOUNCE_CURVE_UPDATE: 16,
    DEBOUNCE_GRID_UPDATE: 100,
    THROTTLE_AUDIO_UPDATE: 50,
    DEBOUNCE_RESIZE: 100
};

export const DEFAULT_PARAMS = {
    a: 1, b: 2, c: 3, 
    A: 1, B: 1, C: 1,
    deltaX: Math.PI / 2, 
    deltaY: 0, 
    deltaZ: 0,
    damping: 0.0,
    lineThickness: 0.015, 
    gridThickness: 0.010, 
    gridBrightness: 1.7,
    color: { h: 120, s: 1, l: 0.5 }, 
    glow: 0.5, 
    aa: true, 
    isPhaseAnimating: false,
    isAudioEnabled: false
};

export const MATHEMATICAL_EQUATIONS = `
    $$x(t) = A e^{-\\lambda t} \\sin(a t' + \\delta_x)$$
    $$y(t) = B e^{-\\lambda t} \\sin(b t' + \\delta_y)$$
    $$z(t) = C e^{-\\lambda t} \\sin(c t' + \\delta_z)$$
`;

export const CAMERA_PRESETS = {
    perspective: { x: 2, y: 3, z: 5 },
    top: { x: 0, y: 6, z: 0.01 },
    front: { x: 0, y: 0, z: 6 },
    side: { x: 6, y: 0, z: 0 }
};

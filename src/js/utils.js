// Utility functions for the application
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

export const validateParams = (params) => {
    params.a = clamp(params.a, 1, 10);
    params.b = clamp(params.b, 1, 10);
    params.c = clamp(params.c, 0, 10);
    params.A = clamp(params.A, 0.1, 2);
    params.B = clamp(params.B, 0.1, 2);
    params.C = clamp(params.C, 0.1, 2);
    params.damping = clamp(params.damping, 0, 0.5);
    return params;
};

export const createCacheKey = (params) => {
    return `${params.a}-${params.b}-${params.c}-${params.A}-${params.B}-${params.C}-${params.deltaX.toFixed(3)}-${params.deltaY.toFixed(3)}-${params.deltaZ.toFixed(3)}-${params.damping.toFixed(3)}`;
};

export const needsUpdate = (currentParams, lastParams) => {
    const currentString = JSON.stringify(currentParams);
    const lastString = JSON.stringify(lastParams);
    return currentString !== lastString;
};

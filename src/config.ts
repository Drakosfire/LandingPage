// config.ts
// This file is used to set the configuration for the application.

// Auto-detect environment based on current domain
const getCurrentDomain = () => {
    if (typeof window !== 'undefined') {
        return window.location.hostname;
    }
    return 'localhost';
};

const currentDomain = getCurrentDomain();

// Use the environment variable if set, otherwise auto-detect based on domain
export const DUNGEONMIND_API_URL = (() => {
    const envUrl = process.env.REACT_APP_DUNGEONMIND_API_URL;

    // If we're on dev domain but env var points to production, ignore env var and auto-detect
    if (currentDomain === 'dev.dungeonmind.net' && envUrl === 'https://www.dungeonmind.net') {
        return 'https://dev.dungeonmind.net';
    }

    // Use environment variable if set and appropriate
    if (envUrl) {
        return envUrl;
    }

    // Auto-detect based on domain
    if (currentDomain === 'dev.dungeonmind.net') {
        return 'https://dev.dungeonmind.net';
    } else if (currentDomain === 'localhost') {
        return 'https://dev.dungeonmind.net'; // Use dev API for local development
    } else {
        return 'https://dungeonmind.net'; // Production
    }
})();


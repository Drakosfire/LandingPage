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

    // If we're on dev domain, always use https://dev.dungeonmind.net
    if (currentDomain === 'dev.dungeonmind.net') {
        return 'https://dev.dungeonmind.net';
    }

    // Use environment variable if set and appropriate
    if (envUrl) {
        return envUrl;
    }

    // Auto-detect based on domain
    if (currentDomain === 'localhost') {
        return 'http://localhost:7860'; // Use local server for development
    } else {
        return 'https://dungeonmind.net'; // Production
    }
})();

// Base URL for DnD statblock CSS assets (served by server or CDN)
// Never hardcode paths; prefer env var REACT_APP_DND_CSS_BASE_URL [[memory:6447958]]
export const DND_CSS_BASE_URL = (() => {
    const envUrl = process.env.REACT_APP_DND_CSS_BASE_URL?.replace(/\/$/, '');
    if (envUrl) return envUrl;

    // Auto-detect based on domain for production
    if (currentDomain === 'dungeonmind.net' || currentDomain === 'www.dungeonmind.net') {
        return 'https://www.dungeonmind.net/dnd-static';
    }
    if (currentDomain === 'dev.dungeonmind.net') {
        return 'https://dev.dungeonmind.net/dnd-static';
    }

    // Local development - use relative path
    return '/dnd-static';
})();


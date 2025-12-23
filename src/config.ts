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

// Check if we're running in local development
const isLocalDevelopment = () => {
    if (typeof window === 'undefined') return false;

    // Check hostname (localhost, 127.0.0.1, or local IP)
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.');

    // Check port (development server typically runs on 3000)
    const port = window.location.port;
    const isDevPort = port === '3000' || port === '';

    return isLocalhost && isDevPort;
};

// Use the environment variable if set, otherwise auto-detect based on domain
export const DUNGEONMIND_API_URL = (() => {
    // Priority 1: Environment variable (explicit override)
    const envUrl = process.env.REACT_APP_DUNGEONMIND_API_URL;
    if (envUrl) {
        return envUrl;
    }

    // Priority 2: Check if we're in local development
    if (isLocalDevelopment()) {
        return 'http://localhost:7860'; // Use local server for development
    }

    // Priority 3: If we're on dev domain, always use https://dev.dungeonmind.net
    if (currentDomain === 'dev.dungeonmind.net') {
        return 'https://dev.dungeonmind.net';
    }

    // Priority 4: Auto-detect based on domain
    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
        return 'http://localhost:7860'; // Use local server for development
    } else {
        return 'https://www.dungeonmind.net'; // Production - use www to avoid Cloudflare redirect
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


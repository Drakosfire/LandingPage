// config.ts
// This file is used to set the configuration for the application.
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_DUNGEONMIND_API_URL:', process.env.REACT_APP_DUNGEONMIND_API_URL);
export const DUNGEONMIND_API_URL = process.env.REACT_APP_DUNGEONMIND_API_URL || 'https://dev.dungeonmind.net';
console.log('Final API URL:', DUNGEONMIND_API_URL);


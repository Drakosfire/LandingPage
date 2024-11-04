// src/components/AppLinks.tsx
import React from 'react';
import './AppLinks.css'; // We'll create this file next
import { DUNGEONMIND_API_URL } from '../config';

// environment variable to store the route
const route = `${DUNGEONMIND_API_URL}/storegenerator`;
const AppLinks: React.FC = () => {
    return (
        <div className="app-links">
            <a href={route} className="app-card">
                <img
                    src={`${process.env.PUBLIC_URL}/images/StoreGeneratorLogov2.png`}
                    alt="Store Generator"
                    className="app-logo"
                />
            </a>
            {/* <a href="/npcgenerator" className="app-card">NPC Generator</a>
            <a href="/mapcreator" className="app-card">Map Creator</a> */}
        </div>
    );
};

export default AppLinks;

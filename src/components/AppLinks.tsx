// src/components/AppLinks.tsx
import React from 'react';
import './AppLinks.css'; // We'll create this file next
import { DUNGEONMIND_API_URL } from '../config';
import { Link } from 'react-router-dom';

// environment variable to store the route
const storeGeneratorRoute = `${DUNGEONMIND_API_URL}/storegenerator`;
const rulesLawyerRoute = `${DUNGEONMIND_API_URL}/ruleslawyer`;
const AppLinks: React.FC = () => {
    return (
        <div className="app-links">
            <a href={storeGeneratorRoute} className="app-card" target="_blank" rel="noopener noreferrer">
                <img
                    src={`${process.env.PUBLIC_URL}/images/StoreGeneratorLogov2.png`}
                    alt="Store Generator"
                    className="app-logo"
                />
            </a>
            <a href={rulesLawyerRoute} className="app-card" target="_blank" rel="noopener noreferrer">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/0ed83976-6007-4b56-7943-1c08d3117e00/public"
                    alt="Rules Lawyer"
                    className="app-logo"
                />
            </a>
            <a href="/statblockgenerator" className="app-card" target="_blank" rel="noopener noreferrer">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/99334c98-8fef-4c5c-bb18-1deaedb6da00/public"
                    alt="Stat Block Generator"
                    className="app-logo"
                />
            </a>
            <a href="/itemgenerator" className="app-card" target="_blank" rel="noopener noreferrer">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/2b57f794-35fc-4380-5330-c020dd6cf200/public"
                    alt="Item Generator"
                    className="app-logo"
                />
            </a>
        </div>
    );
};

export default AppLinks;

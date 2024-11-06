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
            <a href="/ruleslawyer" className="app-card">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/7f63ae8a-2427-4d98-f5e4-dd66be493d00/public"
                    alt="Rules Lawyer"
                    className="app-logo"
                />
            </a>
            <a href="/statblockgenerator" className="app-card">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/99334c98-8fef-4c5c-bb18-1deaedb6da00/public"
                    alt="Stat Block Generator"
                    className="app-logo"
                />
            </a>
            <a href="/itemgenerator" className="app-card">
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

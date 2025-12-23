// src/components/AppLinks.tsx
import React from 'react';
import './AppLinks.css'; // We'll create this file next
import { DUNGEONMIND_API_URL } from '../config';
import { Link } from 'react-router-dom';

// environment variable to store the route
const storeGeneratorRoute = `${DUNGEONMIND_API_URL}/storegenerator`;
// RulesLawyer and CardGenerator are frontend routes, not external links
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
            <Link to="/ruleslawyer" className="app-card">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/0ed83976-6007-4b56-7943-1c08d3117e00/public"
                    alt="Rules Lawyer"
                    className="app-logo"
                />
            </Link>
            <Link to="/cardgenerator" className="app-card">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/ddef578a-7b1e-499e-a1b0-1374f57a5200/public"
                    alt="Item Generator"
                    className="app-logo"
                />
            </Link>
            <Link to="/statblockgenerator" className="app-card">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/03b709db-7da7-42cf-a0a0-f82b40deb300/public"
                    alt="Stat Block Generator"
                    className="app-logo"
                />
            </Link>
            <Link to="/playercharactergenerator" className="app-card">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/102ae220-107f-44e6-f261-8208dd245900/public"
                    alt="Character Generator"
                    className="app-logo"
                />
            </Link>
        </div>
    );
};

export default AppLinks;

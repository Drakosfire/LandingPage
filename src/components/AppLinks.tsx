// src/components/AppLinks.tsx
import React from 'react';
import './AppLinks.css'; // We'll create this file next
import { DUNGEONMIND_API_URL } from '../config';
import { Link } from 'react-router-dom';

// environment variable to store the route
const storeGeneratorRoute = `${DUNGEONMIND_API_URL}/storegenerator`;
const rulesLawyerRoute = `${DUNGEONMIND_API_URL}/ruleslawyer`;
const cardGeneratorRoute = `${DUNGEONMIND_API_URL}/cardgenerator`;
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
            <a href={cardGeneratorRoute} className="app-card" target="_blank" rel="noopener noreferrer">
                <img

                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/ddef578a-7b1e-499e-a1b0-1374f57a5200/public"
                    alt="Item Generator"
                    className="app-logo"
                />
            </a>
            <Link to="/statblockgenerator" className="app-card">
                <img
                    src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/03b709db-7da7-42cf-a0a0-f82b40deb300/public"
                    alt="Stat Block Generator"
                    className="app-logo"
                />
            </Link>
            <Link to="/charactergenerator" className="app-card">
                <div
                    className="app-logo placeholder-logo"
                    style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: '#2b1d0f',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#EEE5CE',
                        fontSize: '3rem',
                        fontFamily: 'serif'
                    }}
                    title="Character Generator (Coming Soon)"
                >
                    🧙
                </div>
            </Link>
        </div>
    );
};

export default AppLinks;

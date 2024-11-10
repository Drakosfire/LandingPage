// src/components/NavBar.tsx
import React from 'react';
import './NavBar.css'; // Assuming styles specific to NavBar are here
import { DUNGEONMIND_API_URL } from '../config';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const NavBar: React.FC = () => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error('Error loading image:', e.currentTarget.src);
    };

    return (
        <nav>
            <ul>
                <li>
                    <a href="#about-dungeonmind" className="logo-link">
                        <img
                            src={`${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`}
                            alt="DungeonMind Logo"
                        />
                    </a>
                </li>
                <li>
                    <a href="#app-links" className="logo-link">
                        <img
                            src={`${process.env.PUBLIC_URL}/images/WorldBuildingAppsButton3.png`}
                            alt="World Building Apps"
                        />
                    </a>
                </li>
                <li>
                    <a href="#about-me" className="logo-link">
                        <img
                            src={`${process.env.PUBLIC_URL}/images/AboutMeButtonv2.png`}
                            alt="About Me"
                        />
                    </a>
                </li>
                <li>
                    <a href="#contact" className="logo-link">
                        <img
                            src={`${process.env.PUBLIC_URL}/images/ContactMeButton.png`}
                            alt="Contact Me"
                        />
                    </a>
                </li>
                <li>
                    <Link to="/blog" className="logo-link">
                        <img
                            src={`${process.env.PUBLIC_URL}/images/BlogButton.png`}
                            alt="Blog"
                        />
                    </Link>
                </li>
                <li>
                    <a href={`${DUNGEONMIND_API_URL}/auth/login`} className="login-btn">Login</a>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;

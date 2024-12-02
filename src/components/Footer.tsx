// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer id="contact" style={{ position: 'fixed', bottom: 0, width: '100%' }}>
            <p>&copy; 2024 DungeonMind. All rights reserved.</p>
            <p>Email: dungeon.mind.am@gmail.com</p>
        </footer>
    );
};

export default Footer;

// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer id="contact" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'rgba(255, 253, 245, 0.9)',  // Light cream color matching the theme
            color: '#474E68',  // Darker text for contrast
            textAlign: 'center',
            padding: '8px 0',
            fontSize: '0.8rem',  // Smaller text
            borderTop: '1px solid rgba(71, 78, 104, 0.2)'  // Subtle top border
        }}>
            <p>&copy; 2024 DungeonMind. All rights reserved.</p>
            <p>Email: dungeon.mind.am@gmail.com</p>
        </footer>
    );
};

export default Footer;

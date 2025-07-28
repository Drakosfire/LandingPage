// src/components/AboutMe.tsx
import React from 'react';
// import './AboutMe.css';

const AboutMe: React.FC = () => {
    return (
        <section id="about">
            <h2>About Me</h2>
            <p>I'm a TTRPG and generative AI enthusiast on my journey to becoming a full stack software developer. I love creating tools that blend technology and creativity to enhance interactive experiences.</p>
            <div className="app-links">
                <a href="https://huggingface.co/TheDrakosfire" className="cta-button">Visit My HuggingFace Spaces</a>
                <a href="https://github.com/Drakosfire" className="cta-button">Visit My GitHub</a>
                <a href="https://www.linkedin.com/in/alan-meigs/" className="cta-button">Visit My LinkedIn Profile</a>
            </div>
        </section>
    );
};

export default AboutMe;


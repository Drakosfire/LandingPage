// src/components/AboutMe.tsx
import React from 'react';
import './AboutDungeonMind.css';

const AboutDungeonMind: React.FC = () => {
    return (
        <section id="about" className="about-dungeon-mind">
            <h2>About DungeonMind</h2>
            <p>DungeonMind is a collection of tools for tabletop roleplaying game world building powered by multimodal generative AI.
                This project was inspired by my initial generative AI skepticism and my desire to understand more about how the technology works.
                I started at generating images locally on my PC, which lead into fine tuning Stable Diffusion models on my hardware and experimenting with what I could generate with custom training sets.
                This led to beginning to build on HuggingFace with Gradio and Docker Containers. I learned a lot about how to deploy applications and was hooked.
                I've now built my own custom UI framework with Javascript and a Python backend running on FastAPI.
                Currently i'm in the process of learning Typescript and React and porting the rest of the tools to the site.
                This site is under construction. Additional tools that are built and ready to be ported to the site are:</p>
            <ul>
                <li>Statblock Generator</li>
                <li>Item Card Generator</li>
                <li>Rules Lawyer</li>
            </ul>
        </section>
    );
};

export default AboutDungeonMind;

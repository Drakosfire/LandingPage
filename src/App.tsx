// src/App.tsx
import React from 'react';
import { DUNGEONMIND_API_URL } from './config';
import NavBar from './components/NavBar';
import AppLinks from './components/AppLinks';
import AboutMe from './components/AboutMe';
import AboutDungeonMind from './components/AboutDungeonMind';
import Footer from './components/Footer';
import './App.css'; // Assuming this is your main CSS file

const App: React.FC = () => {
  console.log(`${DUNGEONMIND_API_URL}/health`);
  const response = fetch(`${DUNGEONMIND_API_URL}/health`).then((res) => res.json());
  console.log(response);
  return (
    <div className="App">
      <NavBar />
      <div className="main-content">
        <section id="app-links">
          <AppLinks />
        </section>
        <section id="about-me">
          <AboutMe />
        </section>
        <section id="about-dungeonmind">
          <AboutDungeonMind />
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default App;

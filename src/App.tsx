// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DUNGEONMIND_API_URL } from './config';
import NavBar from './components/NavBar';
import AppLinks from './components/AppLinks';
import AboutMe from './components/AboutMe';
import AboutDungeonMind from './components/AboutDungeonMind';
import Footer from './components/Footer';
import BlogList from './Blog/BlogList';
import BlogPost from './Blog/BlogPost';
import './App.css';

const App: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await fetch(`${DUNGEONMIND_API_URL}/health`);
        const data = await response.json();
        setHealthStatus(data.status);
        console.log(data);
      } catch (error) {
        console.error('Error fetching health status:', error);
      }
    };

    fetchHealthStatus();
  }, []);

  return (
    <Router>
      <div className="App">
        <NavBar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={
              <div>
                <section id="app-links">
                  <AppLinks />
                </section>
                <section id="about-me">
                  <AboutMe />
                </section>
                <section id="about-dungeonmind">
                  <AboutDungeonMind />
                </section>
              </div>
            } />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogPost />} />
          </Routes>
          <Footer />
        </div>
      </div>
    </Router>
  );
};

export default App;

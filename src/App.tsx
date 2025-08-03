// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { DUNGEONMIND_API_URL } from './config';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import AppLinks from './components/AppLinks';
import AboutMe from './components/AboutMe';
import AboutDungeonMind from './components/AboutDungeonMind';
import Footer from './components/Footer';
import BlogList from './Blog/BlogList';
import BlogPost from './Blog/BlogPost';
import RulesLawyer from './components/RulesLawyer';
import './styles/App.css';
import CardGenerator from './components/CardGenerator/CardGenerator';

// Component to conditionally render Footer
const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  const isCardGeneratorRoute = location.pathname === '/cardgenerator';

  // Don't render Footer on CardGenerator route
  if (isCardGeneratorRoute) {
    return null;
  }

  return <Footer />;
};

const App: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await fetch(`${DUNGEONMIND_API_URL}/health`);
        const data = await response.json();
        setHealthStatus(data.status);
      } catch (error) {
        console.error('Error fetching health status:', error);
      }
    };

    fetchHealthStatus();
  }, []);

  return (
    <AuthProvider>
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
              <Route path="/ruleslawyer" element={<RulesLawyer />} />
              <Route path="/cardgenerator" element={<CardGenerator />} />
            </Routes>
            <ConditionalFooter />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

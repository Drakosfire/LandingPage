// src/App.tsx
// Phase 1 Visual Refresh: Removed NavBar, using UnifiedHeader on all routes
import React, { useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { DUNGEONMIND_API_URL } from './config';
import dungeonMindTheme from './config/mantineTheme';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppLinks from './components/AppLinks';
import AboutMe from './components/AboutMe';
import AboutDungeonMind from './components/AboutDungeonMind';
import Footer from './components/Footer';
import BlogList from './Blog/BlogList';
import BlogPost from './Blog/BlogPost';
import RulesLawyer from './components/RulesLawyer';
import './styles/App.css';
import CardGenerator from './components/CardGenerator/CardGenerator';
import StatBlockGenerator from './components/StatBlockGenerator/StatBlockGenerator';
import { StatBlockGeneratorProvider } from './components/StatBlockGenerator/StatBlockGeneratorProvider';
import PlayerCharacterGenerator from './components/PlayerCharacterGenerator/PlayerCharacterGenerator';
import UnifiedHeaderTest from './pages/UnifiedHeaderTest';
import GenerationDrawerDemo from './pages/GenerationDrawerDemo';
import { UnifiedHeader } from './components/UnifiedHeader';

// DungeonMind Logo URL for home page header
const DM_LOGO_URL = `${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`;

// Component to conditionally render Footer
const ConditionalFooter: React.FC = () => {
  const location = useLocation();

  // Hide footer on all generator routes (exact or nested)
  const generatorRoutes = ['/cardgenerator', '/statblockgenerator', '/playercharactergenerator'];
  const isGeneratorRoute = generatorRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Don't render Footer on generator routes
  if (isGeneratorRoute) {
    return null;
  }

  return <Footer />;
};

// Simplified wrapper - no more conditional margin for NavBar
const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="main-content">
      {children}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await fetch(`${DUNGEONMIND_API_URL}/health`);
        const data = await response.json();
        console.log('API Health Status:', data.status);
      } catch (error) {
        console.error('Error fetching health status:', error);
      }
    };

    fetchHealthStatus();
  }, []);

  return (
    <MantineProvider theme={dungeonMindTheme}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <StatBlockGeneratorProvider>
              <div className="App">
                <MainContent>
                  <Routes>
                    <Route path="/" element={
                      <>
                        <UnifiedHeader
                          app={{ id: 'home', name: 'DungeonMind', icon: DM_LOGO_URL }}
                          showAuth={true}
                        />
                        <section id="app-links">
                          <AppLinks />
                        </section>
                        <section id="about-me">
                          <AboutMe />
                        </section>
                        <section id="about-dungeonmind">
                          <AboutDungeonMind />
                        </section>
                      </>
                    } />
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/ruleslawyer" element={<RulesLawyer />} />
                    <Route path="/cardgenerator" element={<CardGenerator />} />
                    <Route path="/statblockgenerator" element={<StatBlockGenerator />} />
                    <Route path="/playercharactergenerator" element={<PlayerCharacterGenerator />} />
                    <Route path="/test-unified-header" element={<UnifiedHeaderTest />} />
                    <Route path="/generation-drawer-demo" element={<GenerationDrawerDemo />} />
                  </Routes>
                  <ConditionalFooter />
                </MainContent>
              </div>
            </StatBlockGeneratorProvider>
          </Router>
        </AppProvider>
      </AuthProvider>
    </MantineProvider>
  );
};

export default App;

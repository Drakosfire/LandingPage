// src/App.tsx
import React, { useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { DUNGEONMIND_API_URL } from './config';
import dungeonMindTheme from './config/mantineTheme';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
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
import StatBlockGenerator from './components/StatBlockGenerator/StatBlockGenerator';
import { StatBlockGeneratorProvider } from './components/StatBlockGenerator/StatBlockGeneratorProvider';
import PlayerCharacterGenerator from './components/PlayerCharacterGenerator/PlayerCharacterGenerator';
import UnifiedHeaderTest from './pages/UnifiedHeaderTest';

// Component to conditionally render Footer
const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  const isCardGeneratorRoute = location.pathname === '/cardgenerator';
  const isStatBlockGeneratorRoute = location.pathname === '/statblockgenerator';
  const isCharacterGeneratorRoute = location.pathname === '/charactergenerator';

  // Don't render Footer on generator routes
  if (isCardGeneratorRoute || isStatBlockGeneratorRoute || isCharacterGeneratorRoute) {
    return null;
  }

  return <Footer />;
};

// Component to conditionally render NavBar
const ConditionalNavBar: React.FC = () => {
  const location = useLocation();
  const isTestUnifiedHeaderRoute = location.pathname === '/test-unified-header';
  const isStatBlockGeneratorRoute = location.pathname === '/statblockgenerator';
  const isCharacterGeneratorRoute = location.pathname === '/charactergenerator';

  // Don't render NavBar on UnifiedHeader routes
  if (isTestUnifiedHeaderRoute || isStatBlockGeneratorRoute || isCharacterGeneratorRoute) {
    return null;
  }

  return <NavBar />;
};

// Wrapper component to handle main-content class
const MainContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isTestUnifiedHeaderRoute = location.pathname === '/test-unified-header';
  const isStatBlockGeneratorRoute = location.pathname === '/statblockgenerator';
  const isCharacterGeneratorRoute = location.pathname === '/charactergenerator';

  // Remove margin-left when NavBar is hidden (UnifiedHeader routes)
  const noMargin = isTestUnifiedHeaderRoute || isStatBlockGeneratorRoute || isCharacterGeneratorRoute;

  return (
    <div className="main-content" style={noMargin ? { marginLeft: 0 } : undefined}>
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
                <ConditionalNavBar />
                <MainContent>
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
                    <Route path="/statblockgenerator" element={<StatBlockGenerator />} />
                    <Route path="/charactergenerator" element={<PlayerCharacterGenerator />} />
                    <Route path="/test-unified-header" element={<UnifiedHeaderTest />} />
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

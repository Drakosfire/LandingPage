// src/pages/UnifiedHeaderTest.tsx
// Temporary test page for UnifiedHeader system (Phase 0)
// This file will be deleted after Phase 1 verification
import React from 'react';
import { Switch } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconDeviceFloppy, IconDownload, IconWand, IconHelp } from '@tabler/icons-react';
import { AppProvider } from '../context/AppContext';
import { UnifiedHeader } from '../components/UnifiedHeader';
import { ToolboxSection } from '../components/AppToolbox';

/**
 * StatBlock App Icon URL (Cloudflare CDN)
 */
const STATBLOCK_APP_ICON = 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/30ea7744-02d4-4e1e-5aab-2c617ffdb200/public';

/**
 * UnifiedHeaderTest - Test page for Phase 0 verification
 * 
 * Tests:
 * - UnifiedHeader renders with mock controls
 * - Navigation drawer opens/closes
 * - Responsive breakpoints work
 * - Sticky header behavior
 * - Shadow on scroll
 * - Auth button integration
 * 
 * To test:
 * 1. Add route to App.tsx: <Route path="/test-unified-header" element={<UnifiedHeaderTest />} />
 * 2. Navigate to http://localhost:3000/test-unified-header
 * 3. Test on desktop, tablet, mobile breakpoints
 * 4. Click navigation drawer icon
 * 5. Scroll page to see shadow effect
 */
const UnifiedHeaderTest: React.FC = () => {
  const [editMode, setEditMode] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 1000);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  // Help functionality moved to toolbox

  const handleExportHTML = () => {
    alert('Export as HTML');
  };

  const handleExportPDF = () => {
    alert('Export as PDF');
  };

  const handleGeneration = () => {
    alert('Generation drawer would open here');
  };

  const handleTutorial = () => {
    alert('Tutorial would start here');
  };

  // Configure AppToolbox sections
  const toolboxSections: ToolboxSection[] = [
    {
      id: 'editing',
      label: 'Editing',
      controls: [
        {
          id: 'edit-mode',
          type: 'component',
          component: (
            <Switch
              checked={editMode}
              onChange={(event) => setEditMode(event.currentTarget.checked)}
              label="Edit Mode"
              size={isMobile ? "md" : "sm"}
              style={{
                minHeight: isMobile ? '48px' : '36px',
                fontSize: isMobile ? '16px' : '14px'
              }}
            />
          )
        }
      ]
    },
    {
      id: 'actions',
      label: 'Actions',
      controls: [
        {
          id: 'save',
          type: 'menu-item',
          label: saveStatus === 'idle' ? 'Save' : saveStatus === 'saving' ? 'Saving...' : 'Saved ✓',
          icon: <IconDeviceFloppy size={16} />,
          onClick: handleSave,
          disabled: saveStatus === 'saving',
          color: saveStatus === 'saved' ? 'green' : undefined
        },
        {
          id: 'export-html',
          type: 'menu-item',
          label: 'Export as HTML',
          icon: <IconDownload size={16} />,
          onClick: handleExportHTML
        },
        {
          id: 'export-pdf',
          type: 'menu-item',
          label: 'Export as PDF',
          icon: <IconDownload size={16} />,
          onClick: handleExportPDF
        }
      ]
    },
    {
      id: 'generation',
      label: 'Generation',
      controls: [
        {
          id: 'generate',
          type: 'menu-item',
          label: 'Open Generation',
          icon: <IconWand size={16} />,
          onClick: handleGeneration,
          color: 'violet'
        }
      ]
    },
    {
      id: 'help',
      label: 'Help',
      controls: [
        {
          id: 'tutorial',
          type: 'menu-item',
          label: 'Start Tutorial',
          icon: <IconHelp size={16} />,
          onClick: handleTutorial
        }
      ]
    }
  ];

  return (
    <AppProvider>
      {/* UnifiedHeader with AppToolbox */}
      <UnifiedHeader
        app={{
          id: 'statblock-generator',
          name: 'StatBlock Generator',
          icon: STATBLOCK_APP_ICON
        }}
        toolboxSections={toolboxSections}
        showAuth={true}
        showHelp={false}
      />

      {/* Test Content */}
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Unified Header Test Page</h1>
        <p>This page tests the Phase 0 UnifiedHeader system with StatBlock Generator branding.</p>

        <h2>Testing Checklist:</h2>
        <ul>
          <li><strong>NavBar Hidden:</strong> No vertical sidebar should be visible ✅</li>
          <li><strong>Left Section:</strong>
            <ul>
              <li>DM Logo (original DungeonMindLogo2.png) - 80px, opens drawer</li>
              <li>Auth Icon (Login/Logout) - 80px, circular</li>
            </ul>
          </li>
          <li><strong>Center Section:</strong>
            <ul>
              <li>App Icon (StatBlock CDN logo) - 80px, circular, centered</li>
              <li>No title text visible (app name used as alt text / tooltip)</li>
            </ul>
          </li>
          <li><strong>Right Section:</strong>
            <ul>
              <li><strong>App Toolbox:</strong> Custom toolbox icon (CDN image) - contains all app controls</li>
            </ul>
          </li>
          <li><strong>Toolbox Dropdown:</strong>
            <ul>
              <li><strong>Editing Section:</strong> Edit Mode switch (inline component)</li>
              <li><strong>Actions Section:</strong> Save, Export as HTML, Export as PDF</li>
              <li><strong>Generation Section:</strong> Open Generation</li>
              <li><strong>Help Section:</strong> Start Tutorial</li>
            </ul>
          </li>
          <li><strong>Drawer Links:</strong> All links should navigate correctly (includes Blog)</li>
          <li><strong>Drawer Close:</strong> Drawer should close on overlay click or link click</li>
          <li><strong>Sticky Header:</strong> Header should stay at top when scrolling</li>
          <li><strong>Shadow on Scroll:</strong> Header should show shadow after scrolling 10px</li>
        </ul>

        <h2>Design Verification:</h2>
        <ul>
          <li><strong>Full Width:</strong> Header extends to edges of page (no left margin) ✅</li>
          <li><strong>Layout:</strong> Left (DM + Auth) | Center (App Icon only) | Right (Toolbox only) ✅</li>
          <li><strong>Icon Size:</strong> All 80px height ✅</li>
          <li><strong>Header Padding:</strong> Minimal padding (4px vertical) - tight fit ✅</li>
          <li><strong>No Square Cropping:</strong> Icons are pure images (no ActionIcon backgrounds) ✅</li>
          <li><strong>DM Logo:</strong> Uses original local image (DungeonMindLogo2.png) ✅</li>
          <li><strong>App Icon Centered:</strong> StatBlock CDN logo perfectly centered ✅</li>
          <li><strong>Title Hidden:</strong> No text title visible (app name in alt/title tooltip) ✅</li>
          <li><strong>Blog Removed:</strong> No blog link in header (it's in drawer) ✅</li>
          <li><strong>Toolbox Integration:</strong> All app controls consolidated into dropdown ✅</li>
        </ul>

        <h2>Toolbox Features to Test:</h2>
        <ul>
          <li><strong>Custom Toolbox Icon:</strong> CDN image (matches header icon style) - click to open dropdown</li>
          <li><strong>Edit Mode Switch:</strong> Toggle stays open when clicked (inline component)</li>
          <li><strong>Save Action:</strong> Click shows "Saving..." then "Saved ✓" with green color</li>
          <li><strong>Export Options:</strong> Both HTML and PDF export menu items work</li>
          <li><strong>Generation:</strong> Opens generation drawer (alert for now)</li>
          <li><strong>Tutorial:</strong> Starts tutorial (alert for now) - replaces header help button</li>
          <li><strong>Section Labels:</strong> Editing, Actions, Generation, Help headers visible</li>
          <li><strong>Section Dividers:</strong> Visual separation between sections</li>
          <li><strong>Clean Header:</strong> No duplicate help button in header</li>
        </ul>

        <h2>Responsive Testing:</h2>
        <p>Open DevTools and test these breakpoints:</p>
        <ul>
          <li><strong>Desktop (&gt;1024px):</strong> Toolbox icon large, dropdown 280px wide</li>
          <li><strong>Tablet (768-1024px):</strong> Toolbox icon medium size</li>
          <li><strong>Mobile (&lt;768px):</strong> Toolbox icon smaller, still accessible</li>
        </ul>

        <h2>Filler Content for Scrolling</h2>
        {[...Array(20)].map((_, i) => (
          <p key={i}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        ))}
      </div>
    </AppProvider>
  );
};

export default UnifiedHeaderTest;


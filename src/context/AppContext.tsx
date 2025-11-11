// src/context/AppContext.tsx
// Context for tracking current app metadata across the unified navigation system
import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Metadata for the currently active app
 */
export interface AppMetadata {
    id: string;                  // Unique app identifier (e.g., 'statblock-generator')
    name: string;                // Display name (e.g., 'StatBlock Generator')
    icon: string;                // Icon URL or path
    iconFallback?: ReactNode;    // Fallback icon if URL fails to load
}

/**
 * AppContext value interface
 */
interface AppContextValue {
    currentApp: AppMetadata | null;
    setCurrentApp: (app: AppMetadata | null) => void;
}

/**
 * AppContext - provides current app metadata to UnifiedHeader and other components
 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * AppProvider - wraps the application to provide app metadata context
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentApp, setCurrentApp] = useState<AppMetadata | null>(null);

    return (
        <AppContext.Provider value={{ currentApp, setCurrentApp }}>
            {children}
        </AppContext.Provider>
    );
};

/**
 * useAppContext - hook to access current app metadata
 * 
 * Usage:
 * ```typescript
 * const { currentApp, setCurrentApp } = useAppContext();
 * 
 * // Set current app (typically in useEffect of each app)
 * useEffect(() => {
 *   setCurrentApp({
 *     id: 'statblock-generator',
 *     name: 'StatBlock Generator',
 *     icon: STATBLOCK_ICON_URL
 *   });
 *   
 *   // Cleanup: clear app on unmount
 *   return () => setCurrentApp(null);
 * }, []);
 * ```
 * 
 * @throws Error if used outside AppProvider
 */
export const useAppContext = (): AppContextValue => {
    const context = useContext(AppContext);

    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }

    return context;
};

/**
 * useSetCurrentApp - convenience hook for setting current app in useEffect
 * 
 * Usage:
 * ```typescript
 * const MyApp = () => {
 *   useSetCurrentApp({
 *     id: 'my-app',
 *     name: 'My App',
 *     icon: MY_APP_ICON
 *   });
 *   
 *   return <div>App content</div>;
 * };
 * ```
 */
export const useSetCurrentApp = (app: AppMetadata): void => {
    const { setCurrentApp } = useAppContext();

    React.useEffect(() => {
        setCurrentApp(app);

        // Cleanup: clear app on unmount
        return () => setCurrentApp(null);
    }, [app, setCurrentApp]); // Dependencies: app object and setter
};

/**
 * App Metadata Constants
 * Pre-defined metadata for DungeonMind apps
 */

export const STATBLOCK_APP: AppMetadata = {
    id: 'statblock-generator',
    name: 'StatBlock Generator',
    icon: 'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/30ea7744-02d4-4e1e-5aab-2c617ffdb200/public'
};

export const CARD_GENERATOR_APP: AppMetadata = {
    id: 'card-generator',
    name: 'Card Generator',
    icon: `${process.env.PUBLIC_URL}/images/CardGeneratorLogo.png`
};

export const CHARACTER_GENERATOR_APP: AppMetadata = {
    id: 'character-generator',
    name: 'Character Generator',
    icon: `${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`
};

export const RULES_LAWYER_APP: AppMetadata = {
    id: 'rules-lawyer',
    name: 'Rules Lawyer',
    icon: `${process.env.PUBLIC_URL}/images/RulesLawyerLogo.png`
};


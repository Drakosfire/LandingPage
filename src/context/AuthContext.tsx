import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DUNGEONMIND_API_URL } from '../config';

// Types
export interface User {
    sub: string;          // Google user ID
    email: string;
    name: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    verified_email?: boolean;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextType {
    // State
    authState: AuthState;

    // Methods
    login: () => void;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    clearError: () => void;

    // Computed properties
    userId: string | null;
    isLoggedIn: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Props
interface AuthProviderProps {
    children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        isLoading: true,
        error: null
    });

    // Login function - redirects to OAuth
    const login = () => {
        window.location.href = `${DUNGEONMIND_API_URL}/api/auth/login`;
    };

    // Logout function
    const logout = async () => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            // Call logout endpoint
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/auth/logout`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    isLoading: false,
                    error: null
                });
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Logout failed'
            }));

            // Force clear local state even if server call failed
            setTimeout(() => {
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    isLoading: false,
                    error: null
                });
            }, 1000);
        }
    };

    // Refresh authentication state
    const refreshAuth = async () => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch(`${DUNGEONMIND_API_URL}/api/auth/current-user`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                setAuthState({
                    isAuthenticated: true,
                    user: userData,
                    isLoading: false,
                    error: null
                });
            } else if (response.status === 401) {
                // Not authenticated
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    isLoading: false,
                    error: null
                });
            } else {
                throw new Error(`Auth check failed: ${response.status}`);
            }
        } catch (error) {
            console.error('AuthContext: Auth refresh error:', error);
            setAuthState({
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: 'Authentication check failed'
            });
        }
    };

    // Clear error function
    const clearError = () => {
        setAuthState(prev => ({ ...prev, error: null }));
    };

    // Computed properties
    const userId = authState.user?.sub || null;
    const isLoggedIn = authState.isAuthenticated && !!authState.user;

    // No debug logging needed for computed properties

    // Check authentication on mount and periodically
    useEffect(() => {
        console.log('AuthContext: Setting up auth check on mount');

        // Check if we just returned from OAuth (look for common OAuth params)
        const urlParams = new URLSearchParams(window.location.search);
        const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('auth_error');

        if (hasOAuthParams) {
            // Clean up URL params
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        refreshAuth();

        // Set up periodic auth check (every 5 minutes)
        const authCheckInterval = setInterval(() => {
            refreshAuth();
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(authCheckInterval);
        };
    }, []);

    // Listen for focus events to refresh auth when user returns to tab
    useEffect(() => {
        const handleFocus = () => {
            if (!authState.isLoading) {
                refreshAuth();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [authState.isLoading]);

    // Also listen for page visibility changes (user returning from OAuth)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && !authState.isLoading) {
                refreshAuth();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [authState.isLoading]);

    // Context value
    const contextValue: AuthContextType = {
        authState,
        login,
        logout,
        refreshAuth,
        clearError,
        userId,
        isLoggedIn
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Auth Guard Component
interface AuthGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    fallback = null,
    requireAuth = true
}) => {
    const { authState, isLoggedIn } = useAuth();

    if (authState.isLoading) {
        return (
            <div className="auth-loading">
                <div>Checking authentication...</div>
            </div>
        );
    }

    if (requireAuth && !isLoggedIn) {
        if (fallback) {
            return <>{fallback}</>;
        }
        return (
            <div className="auth-required">
                <div>Authentication required</div>
            </div>
        );
    }

    return <>{children}</>;
};

// Login Button Component
interface LoginButtonProps {
    className?: string;
    children?: ReactNode;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
    className = 'login-btn',
    children = 'Login'
}) => {
    const { login, authState } = useAuth();

    return (
        <button
            onClick={login}
            disabled={authState.isLoading}
            className={className}
        >
            {authState.isLoading ? 'Loading...' : children}
        </button>
    );
};

// Logout Button Component
interface LogoutButtonProps {
    className?: string;
    children?: ReactNode;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
    className = 'logout-btn',
    children = 'Logout'
}) => {
    const { logout, authState } = useAuth();

    return (
        <button
            onClick={logout}
            disabled={authState.isLoading}
            className={className}
        >
            {authState.isLoading ? 'Logging out...' : children}
        </button>
    );
};

// User Display Component
interface UserDisplayProps {
    className?: string;
    showPicture?: boolean;
}

export const UserDisplay: React.FC<UserDisplayProps> = ({
    className = 'user-display',
    showPicture = true
}) => {
    const { authState } = useAuth();

    if (!authState.user) return null;

    return (
        <div className={className}>
            {showPicture && authState.user.picture && (
                <img
                    src={authState.user.picture}
                    alt={authState.user.name}
                    className="user-avatar"
                />
            )}
            <span className="user-name">{authState.user.name}</span>
        </div>
    );
};

export default AuthProvider; 
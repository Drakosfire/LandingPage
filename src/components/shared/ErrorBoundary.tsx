import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showRetry?: boolean;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);

        this.setState({ error, errorInfo });
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        this.props.onRetry?.();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <Alert
                    icon={<IconAlertTriangle size={16} />}
                    title="Something went wrong"
                    color="red"
                    variant="light"
                    style={{ margin: '1rem' }}
                >
                    <Stack gap="md">
                        <Text size="sm" c="dimmed">
                            An unexpected error occurred. This has been logged and we're working to fix it.
                        </Text>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{ fontSize: '12px', color: '#666' }}>
                                <summary>Error Details (Development)</summary>
                                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        {this.props.showRetry && (
                            <Button
                                leftSection={<IconRefresh size={16} />}
                                variant="outline"
                                size="sm"
                                onClick={this.handleRetry}
                            >
                                Try Again
                            </Button>
                        )}
                    </Stack>
                </Alert>
            );
        }

        return this.props.children;
    }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
    const handleError = (error: Error, context?: string) => {
        console.error(`🚨 Error in ${context || 'component'}:`, error);

        // In a real app, you might want to send this to an error reporting service
        // like Sentry, LogRocket, etc.

        // For now, just log to console
        if (process.env.NODE_ENV === 'development') {
            console.group('Error Details');
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            console.error('Context:', context);
            console.groupEnd();
        }
    };

    return { handleError };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
};
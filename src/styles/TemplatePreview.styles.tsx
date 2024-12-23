import { CSSProperties } from 'react';

interface Styles {
    previewContainer: CSSProperties;
    previewCanvas: CSSProperties;
    generateButton: CSSProperties & {
        '&:hover:not(:disabled)': CSSProperties;
        '&:disabled': CSSProperties;
    };
    selectButton: CSSProperties & {
        '&:hover:not(:disabled)': CSSProperties;
        '&:disabled': CSSProperties;
    };
}

const styles: Styles = {
    previewContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
    },

    previewCanvas: {
        maxWidth: '100%',
        height: 'auto',
        border: '1px solid #ccc',
        borderRadius: '0.5rem',
        backgroundColor: '#fff',
    },

    generateButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#4a90e2',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover:not(:disabled)': {
            backgroundColor: '#357abd',
        },
        '&:disabled': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
        },
    },

    selectButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#4a90e2',
        color: 'white',
        border: 'none',
        borderRadius: '0.375rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover:not(:disabled)': {
            backgroundColor: '#357abd',
        },
        '&:disabled': {
            backgroundColor: '#ccc',
            cursor: 'not-allowed',
        },
    },
};

export default styles; 

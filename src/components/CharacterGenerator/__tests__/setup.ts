/**
 * Test setup and configuration
 * 
 * Jest configuration for CharacterGenerator tests.
 * Custom matchers and test utilities.
 * 
 * @module CharacterGenerator/__tests__
 */

import '@testing-library/jest-dom';

// Mock Canvas APIs (if needed for future phases)
if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: [] })),
        putImageData: jest.fn(),
        createImageData: jest.fn(() => ({ data: [] })),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn()
    })) as any;
}

// Custom matchers
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidAbilityScore(): R;
            toBeValidCharacter(): R;
        }
    }
}

expect.extend({
    /**
     * Check if value is a valid D&D 5e ability score (3-20 typical range)
     */
    toBeValidAbilityScore(received: number) {
        const pass = received >= 1 && received <= 30; // Allow wider range for edge cases
        return {
            pass,
            message: () => 
                pass 
                    ? `Expected ${received} not to be a valid ability score`
                    : `Expected ${received} to be a valid ability score (1-30)`
        };
    },
    
    /**
     * Check if object has all required character fields
     */
    toBeValidCharacter(received: any) {
        const hasRequiredFields = 
            typeof received === 'object' &&
            received !== null &&
            typeof received.id === 'string' &&
            typeof received.name === 'string' &&
            typeof received.level === 'number' &&
            typeof received.system === 'string' &&
            typeof received.createdAt === 'string' &&
            typeof received.updatedAt === 'string';
        
        return {
            pass: hasRequiredFields,
            message: () => 
                hasRequiredFields
                    ? `Expected object not to be a valid character`
                    : `Expected object to have all required character fields (id, name, level, system, createdAt, updatedAt)`
        };
    }
});

/**
 * Test console output helper
 */
export const expectConsoleLog = (fn: () => void, expectedMessage: string) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    fn();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(expectedMessage));
    consoleSpy.mockRestore();
};


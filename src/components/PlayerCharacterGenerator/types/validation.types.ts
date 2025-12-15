/**
 * Validation types for character creation
 * 
 * Defines validation error structures and results.
 * 
 * @module CharacterGenerator/types/validation
 */

/**
 * Validation error level
 */
export type ValidationLevel = 'error' | 'warning' | 'info';

/**
 * Validation error
 */
export interface ValidationError {
    level: ValidationLevel;
    step: number;                   // Which creation step (0-based)
    field?: string;                 // Which field has the error
    message: string;                // Human-readable error message
    fix?: () => void;               // Optional auto-fix function
}

/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean;               // True if no errors (warnings OK)
    errors: ValidationError[];      // Blocking errors
    warnings: ValidationError[];    // Non-blocking warnings
    info?: ValidationError[];       // Informational messages
}

/**
 * Helper: Create error
 */
export function createValidationError(
    level: ValidationLevel,
    step: number,
    message: string,
    field?: string
): ValidationError {
    return { level, step, field, message };
}

/**
 * Helper: Create successful validation result
 */
export function createSuccessResult(): ValidationResult {
    return {
        isValid: true,
        errors: [],
        warnings: []
    };
}

/**
 * Helper: Create failed validation result
 */
export function createFailureResult(errors: ValidationError[]): ValidationResult {
    return {
        isValid: false,
        errors,
        warnings: []
    };
}

/**
 * Helper: Merge validation results
 */
export function mergeValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    
    for (const result of results) {
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
    }
    
    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    };
}


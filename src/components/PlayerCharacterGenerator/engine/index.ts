/**
 * Rule Engine Module
 * 
 * Exports the RuleEngine interface and D&D 5e implementation.
 * This module abstracts game-system rules from the frontend.
 * 
 * @module PlayerCharacterGenerator/engine
 */

// Interface and shared types
export * from './RuleEngine.interface';
export * from './RuleEngine.types';

// D&D 5e implementation
export * from './dnd5e';


/**
 * Step 1: Ability Score Assignment
 * 
 * UI for assigning character ability scores using one of three methods:
 * - Point Buy (27 points)
 * - Standard Array (15, 14, 13, 12, 10, 8)
 * - Roll Dice (4d6 drop lowest)
 * 
 * @module CharacterGenerator/components
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
    Stack, 
    SegmentedControl, 
    Paper, 
    Text, 
    Title,
    Group,
    Badge,
    Divider
} from '@mantine/core';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import { 
    DnD5eAbilityScores,
    AbilityScoreMethod
} from '../types';
import { 
    validatePointBuy,
    calculateTotalPointsSpent
} from '../rules/dnd5e/pointBuy';
import { POINT_BUY_TOTAL } from '../types/dnd5e/abilityScores.types';
import { validateStandardArray } from '../rules/dnd5e/standardArray';
import { applyRacialBonuses } from '../rules/dnd5e/racialBonuses';
import { rollAbilityScores } from '../rules/dnd5e/diceRoller';

// Sub-components
import { PointBuyInterface } from './PointBuyInterface';
import { StandardArrayInterface } from './StandardArrayInterface';
import { DiceRollerInterface } from './DiceRollerInterface';
import { AbilityScoreDisplay } from './AbilityScoreDisplay';

/**
 * Step 1: Ability Score Assignment Component
 * 
 * Updates character context directly (live preview on canvas).
 * Consistent with RaceSelectionStep and ClassSelectionStep patterns.
 */
export const Step1AbilityScores: React.FC = () => {
    const { character, updateDnD5eData } = usePlayerCharacterGenerator();
    
    // Method selection (local state - only affects UI, not character data)
    const [method, setMethod] = useState<AbilityScoreMethod>('pointBuy');
    
    // Get base scores from context (single source of truth)
    const baseScores: DnD5eAbilityScores = useMemo(() => {
        if (character?.dnd5eData?.abilityScores) {
            return character.dnd5eData.abilityScores;
        }
        return {
            strength: 8,
            dexterity: 8,
            constitution: 8,
            intelligence: 8,
            wisdom: 8,
            charisma: 8
        };
    }, [character?.dnd5eData?.abilityScores]);
    
    // Point buy calculation
    const pointsSpent = useMemo(() => {
        if (method !== 'pointBuy') return 0;
        return calculateTotalPointsSpent(baseScores);
    }, [method, baseScores]);
    
    const pointsRemaining = POINT_BUY_TOTAL - pointsSpent;
    
    // Validation
    const validation = useMemo(() => {
        if (method === 'pointBuy') {
            return validatePointBuy(baseScores);
        }
        if (method === 'standardArray') {
            return validateStandardArray(baseScores);
        }
        // Rolled method has no validation (any scores are valid)
        return { isValid: true, errors: [], warnings: [] };
    }, [method, baseScores]);
    
    // Apply racial bonuses (if race selected)
    const finalScores = useMemo(() => {
        const race = character?.dnd5eData?.race;
        if (!race || !race.id || !race.abilityBonuses) {
            return baseScores;
        }
        return applyRacialBonuses(baseScores, race);
    }, [baseScores, character?.dnd5eData?.race]);
    
    // ===== HANDLERS (update context directly for live preview) =====
    
    // Update a single ability score - writes to context immediately
    const handleScoreChange = useCallback((ability: keyof DnD5eAbilityScores, value: number) => {
        console.log(`📝 [Step1] ${ability} set to ${value}`);
        updateDnD5eData({
            abilityScores: {
                ...baseScores,
                [ability]: value
            }
        });
    }, [updateDnD5eData, baseScores]);
    
    // Update all scores at once (for StandardArray drag-drop or dice roll)
    const handleScoresChange = useCallback((newScores: DnD5eAbilityScores) => {
        console.log('📝 [Step1] All scores updated:', newScores);
        updateDnD5eData({
            abilityScores: newScores
        });
    }, [updateDnD5eData]);
    
    const handleMethodChange = useCallback((newMethod: string) => {
        setMethod(newMethod as AbilityScoreMethod);
        console.log(`🔄 [Step1] Method changed to ${newMethod}`);
        
        // Reset to default scores when changing method
        if (newMethod === 'pointBuy' || newMethod === 'standardArray') {
            const defaultScores = {
                strength: 8,
                dexterity: 8,
                constitution: 8,
                intelligence: 8,
                wisdom: 8,
                charisma: 8
            };
            updateDnD5eData({ abilityScores: defaultScores });
        }
    }, [updateDnD5eData]);
    
    const handleRollDice = useCallback(() => {
        const rollResult = rollAbilityScores();
        const [str, dex, con, int, wis, cha] = rollResult.scores;
        
        const rolledScores = {
            strength: str,
            dexterity: dex,
            constitution: con,
            intelligence: int,
            wisdom: wis,
            charisma: cha
        };
        
        console.log('🎲 [Step1] Rolled scores:', rollResult.scores);
        updateDnD5eData({ abilityScores: rolledScores });
    }, [updateDnD5eData]);
    
    return (
        <Stack gap="lg" data-testid="step1-ability-scores">
            <Title order={2}>Step 1: Ability Scores</Title>
            
            <Text size="sm" c="dimmed">
                Choose how to assign your character's ability scores.
            </Text>
            
            {/* Method Selector */}
            <SegmentedControl
                value={method}
                onChange={handleMethodChange}
                data={[
                    { label: 'Point Buy', value: 'pointBuy' },
                    { label: 'Standard Array', value: 'standardArray' },
                    { label: 'Roll Dice', value: 'rolled' }
                ]}
                data-testid="method-selector"
            />
            
            {/* Method-specific interface */}
            <Paper p="md" withBorder>
                {method === 'pointBuy' && (
                    <PointBuyInterface
                        scores={baseScores}
                        onScoreChange={handleScoreChange}
                        pointsSpent={pointsSpent}
                        pointsRemaining={pointsRemaining}
                    />
                )}
                
                {method === 'standardArray' && (
                    <StandardArrayInterface
                        scores={baseScores}
                        onScoresChange={handleScoresChange}
                    />
                )}
                
                {method === 'rolled' && (
                    <DiceRollerInterface
                        scores={baseScores}
                        onRoll={handleRollDice}
                        onScoresChange={handleScoresChange}
                    />
                )}
            </Paper>
            
            <Divider />
            
            {/* Ability Score Display */}
            <AbilityScoreDisplay
                baseScores={baseScores}
                finalScores={finalScores}
                race={character?.dnd5eData?.race}
                showRacialBonuses={!!character?.dnd5eData?.race?.id}
            />
            
            {/* Validation Display */}
            {validation.errors.length > 0 && (
                <Paper p="sm" withBorder bg="red.0">
                    <Stack gap="xs">
                        {validation.errors.map((error, idx) => (
                            <Text key={idx} size="sm" c="red">
                                ❌ {error.message}
                            </Text>
                        ))}
                    </Stack>
                </Paper>
            )}
            
            {/* Status Badge */}
            <Group justify="space-between">
                <Badge 
                    color={validation.isValid ? 'green' : 'red'}
                    size="lg"
                >
                    {validation.isValid ? 'Valid ✅' : 'Invalid ❌'}
                </Badge>
                
                {method === 'pointBuy' && (
                    <Badge 
                        color={pointsRemaining === 0 ? 'green' : 'blue'}
                        size="lg"
                    >
                        Points: {pointsSpent} / {POINT_BUY_TOTAL}
                    </Badge>
                )}
            </Group>
            
            {/* Live preview note - scores update canvas automatically */}
            <Text size="xs" c="dimmed" ta="center">
                Changes are saved automatically and shown on the character sheet.
            </Text>
        </Stack>
    );
};


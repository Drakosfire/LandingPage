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

import React, { useState, useMemo } from 'react';
import { 
    Stack, 
    SegmentedControl, 
    Button, 
    Paper, 
    Text, 
    Title,
    Group,
    Badge,
    Divider
} from '@mantine/core';
import { useCharacterGenerator } from '../CharacterGeneratorProvider';
import { 
    DnD5eAbilityScores,
    AbilityScoreMethod,
    createEmptyDnD5eCharacter
} from '../types';
import { 
    validatePointBuy,
    calculateTotalPointsSpent
} from '../rules/dnd5e/pointBuy';
import { POINT_BUY_TOTAL } from '../types/dnd5e/abilityScores.types';
import { validateStandardArray, STANDARD_ARRAY_VALUES } from '../rules/dnd5e/standardArray';
import { applyRacialBonuses } from '../rules/dnd5e/racialBonuses';
import { rollAbilityScores, shouldRerollScores } from '../rules/dnd5e/diceRoller';

// Sub-components
import { PointBuyInterface } from './PointBuyInterface';
import { StandardArrayInterface } from './StandardArrayInterface';
import { DiceRollerInterface } from './DiceRollerInterface';
import { AbilityScoreDisplay } from './AbilityScoreDisplay';

/**
 * Step 1: Ability Score Assignment Component
 */
export const Step1AbilityScores: React.FC = () => {
    const { character, updateDnD5eData } = useCharacterGenerator();
    
    // State
    const [method, setMethod] = useState<AbilityScoreMethod>('pointBuy');
    const [baseScores, setBaseScores] = useState<DnD5eAbilityScores>(() => {
        // Initialize from character if exists, otherwise default to 8s
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
    });
    
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
    
    // Handlers
    const handleScoreChange = (ability: keyof DnD5eAbilityScores, value: number) => {
        setBaseScores(prev => ({ ...prev, [ability]: value }));
        console.log(`📝 [Step1] ${ability} set to ${value}`);
    };
    
    const handleMethodChange = (newMethod: string) => {
        setMethod(newMethod as AbilityScoreMethod);
        console.log(`🔄 [Step1] Method changed to ${newMethod}`);
        
        // Reset to default scores when changing method
        if (newMethod === 'pointBuy' || newMethod === 'standardArray') {
            setBaseScores({
                strength: 8,
                dexterity: 8,
                constitution: 8,
                intelligence: 8,
                wisdom: 8,
                charisma: 8
            });
        }
    };
    
    const handleRollDice = () => {
        const rollResult = rollAbilityScores();
        const [str, dex, con, int, wis, cha] = rollResult.scores;
        
        setBaseScores({
            strength: str,
            dexterity: dex,
            constitution: con,
            intelligence: int,
            wisdom: wis,
            charisma: cha
        });
        
        console.log('🎲 [Step1] Rolled scores:', rollResult.scores);
    };
    
    const handleConfirm = () => {
        if (!validation.isValid) {
            console.warn('⚠️ [Step1] Cannot confirm: validation errors');
            return;
        }
        
        console.log('✅ [Step1] Confirming ability scores:', finalScores);
        
        updateDnD5eData({
            abilityScores: finalScores
        });
    };
    
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
                        onScoresChange={setBaseScores}
                    />
                )}
                
                {method === 'rolled' && (
                    <DiceRollerInterface
                        scores={baseScores}
                        onRoll={handleRollDice}
                        onScoresChange={setBaseScores}
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
            
            {/* Confirm Button */}
            <Button
                onClick={handleConfirm}
                disabled={!validation.isValid}
                size="lg"
                data-testid="confirm-button"
            >
                Confirm Ability Scores
            </Button>
        </Stack>
    );
};


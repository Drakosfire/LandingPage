/**
 * SubraceSelector Component
 * 
 * Displays inline radio buttons for selecting a subrace.
 * Used within RaceCard when a race has multiple subrace options.
 * 
 * @module CharacterGenerator/components
 */

import React, { useCallback } from 'react';
import { Stack, Radio, Text, Box, Group } from '@mantine/core';
import type { DnD5eRace } from '../types';

interface SubraceSelectorProps {
    subraces: DnD5eRace[];
    selectedSubraceId: string | null;
    onSelect: (subrace: DnD5eRace) => void;
}

const SubraceSelector: React.FC<SubraceSelectorProps> = ({
    subraces,
    selectedSubraceId,
    onSelect
}) => {
    const handleChange = useCallback((subraceId: string) => {
        const subrace = subraces.find(s => s.id === subraceId);
        if (subrace) {
            onSelect(subrace);
        }
    }, [subraces, onSelect]);
    
    // Format subrace bonuses for display
    const formatBonuses = (subrace: DnD5eRace): string => {
        return subrace.abilityBonuses
            .map(b => `+${b.bonus} ${b.ability.substring(0, 3).toUpperCase()}`)
            .join(', ');
    };
    
    // Get unique subrace trait (the one that differs from base)
    const getUniqueTraitName = (subrace: DnD5eRace): string | null => {
        // Look for trait that mentions the subrace name or is specific to it
        const uniqueTrait = subrace.traits.find(t => 
            t.id.includes(subrace.id.split('-')[0]) || 
            t.name.toLowerCase().includes(subrace.id.split('-')[0])
        );
        
        // Or just get the last trait which is usually the subrace-specific one
        if (!uniqueTrait && subrace.traits.length > 0) {
            return subrace.traits[subrace.traits.length - 1].name;
        }
        
        return uniqueTrait?.name || null;
    };
    
    return (
        <Box>
            <Text size="xs" fw={500} c="dimmed" mb="xs">
                Subrace:
            </Text>
            <Radio.Group
                value={selectedSubraceId || ''}
                onChange={handleChange}
            >
                <Stack gap="xs">
                    {subraces.map(subrace => {
                        const uniqueTrait = getUniqueTraitName(subrace);
                        const bonuses = formatBonuses(subrace);
                        
                        return (
                            <Radio
                                key={subrace.id}
                                value={subrace.id}
                                label={
                                    <Group gap="xs" wrap="nowrap">
                                        <Text size="sm" fw={500}>
                                            {subrace.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            ({bonuses}{uniqueTrait ? `, ${uniqueTrait}` : ''})
                                        </Text>
                                    </Group>
                                }
                                color="red"
                                size="sm"
                                data-testid={`subrace-radio-${subrace.id}`}
                            />
                        );
                    })}
                </Stack>
            </Radio.Group>
        </Box>
    );
};

export default SubraceSelector;


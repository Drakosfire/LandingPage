/**
 * ClassSelectionStep Component
 * 
 * Step 3 of character creation wizard - Class Selection.
 * Displays a scrollable list of classes with subsections for:
 * - L1 subclass selection (for Cleric, Sorcerer, Warlock)
 * - Skill selection
 * - Equipment choices
 * 
 * Features:
 * - Scrollable list of class cards (not grid)
 * - Collapsible class details (collapsed by default)
 * - Inline subclass selection for L1 subclass classes
 * - Skill checkbox selection
 * - Equipment choice groups
 * - Validation feedback from rule engine
 * 
 * @module CharacterGenerator/creationDrawerComponents
 */

import React, { useMemo, useCallback } from 'react';
import { Stack, Text, Box, Alert, Divider, Title } from '@mantine/core';
import { IconAlertCircle, IconWand } from '@tabler/icons-react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';
import ClassCard from '../components/ClassCard';
import SubclassSelector from '../components/SubclassSelector';
import SkillSelector from '../components/SkillSelector';
import EquipmentChoiceSelector from '../components/EquipmentChoiceSelector';
import type { DnD5eClass, DnD5eSubclass } from '../types';

const ClassSelectionStep: React.FC = () => {
    const {
        character,
        updateDnD5eData,
        ruleEngine,
        validation
    } = usePlayerCharacterGenerator();

    // Get the D&D 5e specific data
    const dnd5eData = character?.dnd5eData;

    // Get all available classes
    const availableClasses = useMemo(() => {
        return ruleEngine.getAvailableClasses();
    }, [ruleEngine]);

    // Get currently selected class
    const selectedClass = useMemo(() => {
        if (!dnd5eData?.classes?.length) return null;
        const classId = dnd5eData.classes[0]?.name?.toLowerCase();
        return availableClasses.find(c => c.id === classId) || null;
    }, [dnd5eData?.classes, availableClasses]);

    // Get subclasses for selected class
    const availableSubclasses = useMemo(() => {
        if (!selectedClass) return [];
        return ruleEngine.getAvailableSubclasses(selectedClass.id);
    }, [selectedClass, ruleEngine]);

    // Check if class requires L1 subclass
    const requiresL1Subclass = useMemo(() => {
        if (!selectedClass) return false;
        return ruleEngine.requiresLevel1Subclass(selectedClass.id);
    }, [selectedClass, ruleEngine]);

    // Get skill choices for selected class
    const skillChoices = useMemo(() => {
        if (!dnd5eData) return { count: 0, options: [], selected: [] };
        return ruleEngine.getValidSkillChoices(dnd5eData);
    }, [dnd5eData, ruleEngine]);

    // Get equipment choices for selected class
    const equipmentChoices = useMemo(() => {
        if (!selectedClass) return [];
        return ruleEngine.getEquipmentChoices(selectedClass.id);
    }, [selectedClass, ruleEngine]);

    // Check if class is a spellcaster
    const isSpellcaster = useMemo(() => {
        if (!selectedClass) return false;
        return selectedClass.spellcasting !== undefined;
    }, [selectedClass]);

    // Get selected subclass from primary class
    const selectedSubclassId = dnd5eData?.classes?.[0]?.subclass || null;
    const selectedSubclass = useMemo(() => {
        if (!selectedSubclassId || !selectedClass) return null;
        return availableSubclasses.find(s => s.id === selectedSubclassId) || null;
    }, [selectedSubclassId, availableSubclasses, selectedClass]);

    // Get validation errors for this step
    const classErrors = useMemo(() => {
        return validation.errors.filter(e => e.step === 'class');
    }, [validation]);

    // Handle class selection
    const handleClassSelect = useCallback((classData: DnD5eClass) => {
        updateDnD5eData({
            classes: [{
                name: classData.name,
                level: 1,
                subclass: undefined,
                hitDie: classData.hitDie,
                features: []
            }],
            // Reset skills when changing class
            proficiencies: {
                ...dnd5eData?.proficiencies,
                skills: [],
                savingThrows: dnd5eData?.proficiencies?.savingThrows ?? [],
                armor: dnd5eData?.proficiencies?.armor ?? [],
                weapons: dnd5eData?.proficiencies?.weapons ?? [],
                tools: dnd5eData?.proficiencies?.tools ?? [],
                languages: dnd5eData?.proficiencies?.languages ?? []
            },
            // Reset equipment choices when changing class
            equipmentChoices: {}
        });
    }, [updateDnD5eData, dnd5eData?.proficiencies]);

    // Handle subclass selection
    const handleSubclassSelect = useCallback((subclass: DnD5eSubclass) => {
        if (!dnd5eData?.classes) return;
        
        updateDnD5eData({
            classes: dnd5eData.classes.map((cls, idx) => 
                idx === 0 ? { ...cls, subclass: subclass.id } : cls
            )
        });
    }, [updateDnD5eData, dnd5eData?.classes]);

    // Handle skill selection
    const handleSkillsChange = useCallback((selectedSkills: string[]) => {
        if (!dnd5eData?.proficiencies) return;
        
        updateDnD5eData({
            proficiencies: {
                ...dnd5eData.proficiencies,
                skills: selectedSkills
            }
        });
    }, [updateDnD5eData, dnd5eData?.proficiencies]);

    // Handle equipment choice selection
    const handleEquipmentChoice = useCallback((groupId: string, optionIndex: number) => {
        updateDnD5eData({
            equipmentChoices: {
                ...dnd5eData?.equipmentChoices,
                [groupId]: optionIndex
            }
        });
    }, [updateDnD5eData, dnd5eData?.equipmentChoices]);

    // Don't render if no character data
    if (!dnd5eData) {
        return <Text c="dimmed">Loading character data...</Text>;
    }

    return (
        <Stack gap="md">
            {/* Header */}
            <Box>
                <Title order={4}>Class Selection</Title>
                <Text size="sm" c="dimmed">
                    Choose your character's class. This determines your abilities, skills, and starting equipment.
                </Text>
            </Box>

            {/* Validation Errors */}
            {classErrors.length > 0 && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                >
                    <Stack gap={4}>
                        {classErrors.map((error, idx) => (
                            <Text key={idx} size="sm">{error.message}</Text>
                        ))}
                    </Stack>
                </Alert>
            )}

            {/* Class List - parent drawer handles scrolling */}
                <Stack gap="xs">
                    {availableClasses.map(classData => (
                        <ClassCard
                            key={classData.id}
                            classData={classData}
                            isSelected={selectedClass?.id === classData.id}
                            onSelect={handleClassSelect}
                            requiresL1Subclass={ruleEngine.requiresLevel1Subclass(classData.id)}
                        />
                    ))}
                </Stack>

            {/* Subsections (only shown when a class is selected) */}
            {selectedClass && (
                <>
                    {/* L1 Subclass Section (for Cleric, Sorcerer, Warlock) */}
                    {requiresL1Subclass && availableSubclasses.length > 0 && (
                        <>
                            <Divider
                                label={
                                    <Text size="sm" fw={600}>
                                        {selectedClass.name === 'Cleric' ? 'Divine Domain' :
                                         selectedClass.name === 'Sorcerer' ? 'Sorcerous Origin' :
                                         selectedClass.name === 'Warlock' ? 'Otherworldly Patron' :
                                         'Subclass'} (Required at Level 1)
                                    </Text>
                                }
                                labelPosition="center"
                            />
                            <SubclassSelector
                                subclasses={availableSubclasses}
                                selectedSubclassId={selectedSubclassId}
                                onSelect={handleSubclassSelect}
                                className={selectedClass.name}
                            />
                        </>
                    )}

                    {/* Skills Section */}
                    {skillChoices.count > 0 && (
                        <>
                            <Divider
                                label={
                                    <Text size="sm" fw={600}>
                                        Skills — Choose {skillChoices.count}
                                    </Text>
                                }
                                labelPosition="center"
                            />
                            <SkillSelector
                                skillChoices={skillChoices}
                                onSelectionChange={handleSkillsChange}
                            />
                        </>
                    )}

                    {/* Equipment Section */}
                    {equipmentChoices.length > 0 && (
                        <>
                            <Divider
                                label={
                                    <Text size="sm" fw={600}>
                                        Starting Equipment
                                    </Text>
                                }
                                labelPosition="center"
                            />
                            <EquipmentChoiceSelector
                                equipmentGroups={equipmentChoices}
                                selectedChoices={dnd5eData.equipmentChoices || {}}
                                onChoiceSelect={handleEquipmentChoice}
                            />
                        </>
                    )}

                    {/* Spellcasting Notice (spells selected in Step 4) */}
                    {isSpellcaster && (
                        <>
                            <Divider />
                            <Alert
                                icon={<IconWand size={16} />}
                                color="blue"
                                variant="light"
                            >
                                <Text size="sm">
                                    <strong>{selectedClass.name}</strong> is a spellcaster.
                                    You'll select your cantrips and spells in the next step.
                                </Text>
                            </Alert>
                        </>
                    )}
                </>
            )}

            {/* Selection Summary */}
            {selectedClass && (
                <Box
                    p="sm"
                    style={{
                        backgroundColor: 'var(--mantine-color-gray-1)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        borderTop: '1px solid var(--mantine-color-gray-3)'
                    }}
                >
                    <Text size="sm" fw={600}>
                        Selected: {selectedClass.name}
                        {selectedSubclass && ` — ${selectedSubclass.name}`}
                    </Text>
                    <Text size="xs" c="dimmed">
                        Hit Die: d{selectedClass.hitDie} | 
                        Saving Throws: {selectedClass.savingThrows.map(s => s.slice(0, 3).toUpperCase()).join(', ')} |
                        Skills: {dnd5eData.proficiencies?.skills?.length || 0}/{skillChoices.count} selected
                    </Text>
                </Box>
            )}

            {/* Live preview note */}
            <Text size="xs" c="dimmed" ta="center">
                Changes are saved automatically and shown on the character sheet.
            </Text>
        </Stack>
    );
};

export default ClassSelectionStep;

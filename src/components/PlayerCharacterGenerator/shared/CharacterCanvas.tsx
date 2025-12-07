/**
 * CharacterCanvas Component
 * 
 * Canvas-based character sheet display for CharacterGenerator.
 * Uses the new PHB-styled sheetComponents built from HTML prototypes.
 * 
 * Features:
 * - Responsive scaling via ResizeObserver (fits viewport without horizontal scroll)
 * - Font loading gate for accurate text measurement
 * - CSS variables for page dimensions
 * - Mobile viewport switch: < 800px renders MobileCharacterCanvas (vertical scroll)
 * 
 * @module PlayerCharacterGenerator/shared/CharacterCanvas
 */

import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { usePlayerCharacterGenerator } from '../PlayerCharacterGeneratorProvider';

// Import the new PHB-styled sheet components
// CSS is imported via CharacterSheetPage component
import {
    CharacterSheet,
    CharacterSheetPage,
    CharacterSheetContainer,
    BackgroundPersonalitySheet,
    InventorySheet,
    SpellSheet,
    type Attack,
    type Feature,
    type SpellSlotLevel
} from '../sheetComponents';

// Overflow components for pagination (desktop only)
import { FeaturesOverflowPage, InventoryOverflowPage, SpellsOverflowPage } from '../sheetComponents/overflow';
import { useFeaturesOverflow, useInventoryOverflow, useSpellsOverflow } from '../hooks';
import type { SpellOverflowPageData, InventoryPageData } from '../hooks';

// Mobile canvas for viewports < 800px
import MobileCharacterCanvas from './MobileCharacterCanvas';

// ============================================================================
// Constants
// ============================================================================

/** Page dimensions (US Letter at 96dpi) */
const PAGE_WIDTH_PX = 816;
const PAGE_HEIGHT_PX = 1056;

/** Scale bounds */
const MIN_SCALE = 0.35;
const MAX_SCALE = 2.5;

/** Gap between pages when multiple pages are shown */
const PAGE_GAP_PX = 32;

/** Mobile breakpoint - below this, use MobileCharacterCanvas */
const MOBILE_BREAKPOINT = 800;

/** Clamp utility */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// ============================================================================
// Responsive Scale Factors (Hybrid System)
// ============================================================================
// These factors are set as CSS variables and used by components via calc()
// This centralizes responsive breakpoint logic in the canvas layer.

/** Breakpoints for responsive scaling */
const BREAKPOINT_TABLET = 768;
const BREAKPOINT_PHONE = 480;

/** Calculate font scale factor based on viewport width */
const getFontScale = (viewportWidth: number): number => {
    if (viewportWidth <= BREAKPOINT_PHONE) return 0.8;
    if (viewportWidth <= BREAKPOINT_TABLET) return 0.9;
    return 1;
};

/** Calculate spacing scale factor based on viewport width */
const getSpacingScale = (viewportWidth: number): number => {
    if (viewportWidth <= BREAKPOINT_PHONE) return 0.75;
    if (viewportWidth <= BREAKPOINT_TABLET) return 0.85;
    return 1;
};

const CharacterCanvas: React.FC = () => {
    const { character } = usePlayerCharacterGenerator();

    // ===== STATE =====
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [containerWidth, setContainerWidth] = useState(1024); // For hybrid scaling
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024); // For mobile switch
    const [fontsReady, setFontsReady] = useState(false);

    // ===== WINDOW RESIZE TRACKING =====
    // Track window width for mobile breakpoint (separate from container width)
    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Initial set
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ===== MOBILE CHECK =====
    const isMobile = windowWidth < MOBILE_BREAKPOINT;

    // ===== FEATURES EXTRACTION (for overflow detection) =====
    // Extract features separately so we can use the overflow hook
    const allFeatures = useMemo<Feature[]>(() => {
        const dnd5e = character?.dnd5eData;
        if (!dnd5e) return [];

        const features: Feature[] = [];

        // Add class features
        dnd5e.classes?.forEach(cls => {
            cls.features?.forEach(f => {
                features.push({
                    name: f.name,
                    description: f.description
                });
            });
        });

        // Add racial/background features
        dnd5e.features?.forEach(f => {
            features.push({
                name: f.name,
                description: f.description
            });
        });

        return features;
    }, [character?.dnd5eData]);

    // ===== SPELLS EXTRACTION (for overflow detection) =====
    // Extract spells by level for overflow hook
    const spellsData = useMemo(() => {
        const dnd5e = character?.dnd5eData;
        const spellcasting = dnd5e?.spellcasting;
        
        if (!spellcasting) {
            return {
                cantrips: [],
                level1Spells: [],
                level2Spells: [],
                level3Spells: [],
                level4Spells: [],
                level5Spells: [],
                level6Spells: [],
                level7Spells: [],
                level8Spells: [],
                level9Spells: [],
            };
        }

        // Helper to convert spell to SpellEntry
        const toSpellEntry = (spell: typeof spellcasting.cantrips[0]) => ({
            id: spell.id,
            name: spell.name,
            isPrepared: spellcasting.spellsPrepared?.includes(spell.id),
            isConcentration: spell.concentration,
            isRitual: spell.ritual,
            level: spell.level,
            school: spell.school,
            castingTime: spell.castingTime,
            range: spell.range,
            components: spell.components,
            duration: spell.duration,
            description: spell.description,
            higherLevels: spell.higherLevels,
            damage: spell.damage,
            healing: spell.healing,
            source: spell.source
        });

        return {
            cantrips: (spellcasting.cantrips || []).map(toSpellEntry),
            level1Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 1).map(toSpellEntry),
            level2Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 2).map(toSpellEntry),
            level3Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 3).map(toSpellEntry),
            level4Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 4).map(toSpellEntry),
            level5Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 5).map(toSpellEntry),
            level6Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 6).map(toSpellEntry),
            level7Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 7).map(toSpellEntry),
            level8Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 8).map(toSpellEntry),
            level9Spells: (spellcasting.spellsKnown || []).filter(s => s.level === 9).map(toSpellEntry),
        };
    }, [character?.dnd5eData]);

    // ===== INVENTORY DATA (for overflow hook) =====
    // Extract inventory items by category, similar to spellsData
    const inventoryData = useMemo(() => {
        const dnd5e = character?.dnd5eData;
        if (!dnd5e) {
            return {
                weapons: [],
                armor: [],
                magicItems: [],
                adventuringGear: [],
                treasure: [],
                consumables: [],
                otherItems: [],
            };
        }

        // Map weapons
        const weapons = (dnd5e.weapons || []).map((w, idx) => ({
            id: w.id || `weapon-${idx}`,
            name: w.name,
            quantity: 1,
            weight: w.weight,
            value: w.value ? `${w.value} gp` : '—',
            attuned: dnd5e.attunement?.attunedItemIds?.includes(w.id),
            type: 'weapon' as const,
            description: w.description,
            isMagical: w.isMagical,
            rarity: w.rarity,
            requiresAttunement: w.requiresAttunement,
            damage: w.damage,
            damageType: w.damageType,
            properties: w.properties,
            range: w.range,
            weaponCategory: w.weaponCategory,
            weaponType: w.weaponType,
            valueNumber: w.value
        }));

        // Map armor
        const armor = dnd5e.armor ? [{
            id: dnd5e.armor.id || 'armor-1',
            name: dnd5e.armor.name + ' (worn)',
            quantity: 1,
            weight: dnd5e.armor.weight,
            notes: `AC ${dnd5e.armor.armorClass}`,
            attuned: dnd5e.attunement?.attunedItemIds?.includes(dnd5e.armor.id),
            type: 'armor' as const,
            description: dnd5e.armor.description,
            isMagical: dnd5e.armor.isMagical,
            rarity: dnd5e.armor.rarity,
            requiresAttunement: dnd5e.armor.requiresAttunement,
            armorClass: dnd5e.armor.armorClass,
            armorCategory: dnd5e.armor.armorCategory,
            stealthDisadvantage: dnd5e.armor.stealthDisadvantage,
            valueNumber: dnd5e.armor.value
        }] : [];

        // Map magic items
        const magicItems = (dnd5e.equipment || [])
            .filter(e => e.isMagical || e.type === 'wondrous item')
            .filter(e => e.type !== 'weapon' && e.type !== 'armor' && e.type !== 'consumable')
            .map((e, idx) => ({
                id: e.id || `magic-${idx}`,
                name: e.name,
                quantity: e.quantity || 1,
                weight: e.weight,
                notes: e.rarity?.charAt(0).toUpperCase() || '—',
                attuned: dnd5e.attunement?.attunedItemIds?.includes(e.id),
                type: e.type,
                description: e.description,
                isMagical: e.isMagical,
                rarity: e.rarity,
                requiresAttunement: e.requiresAttunement,
                valueNumber: e.value
            }));

        // Map adventuring gear
        const adventuringGear = (dnd5e.equipment || [])
            .filter(e => e.type === 'adventuring gear' || e.type === 'container')
            .filter(e => !e.isMagical)
            .map((e, idx) => ({
                id: e.id || `equip-${idx}`,
                name: e.name,
                quantity: e.quantity || 1,
                weight: e.weight,
                value: e.value ? `${e.value} gp` : '—',
                type: e.type,
                description: e.description,
                valueNumber: e.value
            }));

        // Map treasure
        const treasure = (dnd5e.equipment || [])
            .filter(e => e.type === 'treasure')
            .map((e, idx) => ({
                id: e.id || `treasure-${idx}`,
                name: e.name,
                quantity: e.quantity || 1,
                weight: e.weight,
                value: e.value ? `${e.value} gp` : '—',
                type: 'treasure' as const,
                description: e.description,
                valueNumber: e.value
            }));

        // Map consumables
        const consumables = (dnd5e.equipment || [])
            .filter(e => e.type === 'consumable')
            .map((e, idx) => ({
                id: e.id || `consumable-${idx}`,
                name: e.name,
                quantity: e.quantity || 1,
                weight: e.weight,
                notes: e.description?.slice(0, 20) || '—',
                type: 'consumable' as const,
                description: e.description,
                isMagical: e.isMagical,
                rarity: e.rarity,
                valueNumber: e.value
            }));

        return {
            weapons,
            armor,
            magicItems,
            adventuringGear,
            treasure,
            consumables,
            otherItems: [], // Not yet mapped from character data
        };
    }, [character?.dnd5eData]);

    // ===== FEATURES OVERFLOW DETECTION (desktop only) =====
    // Uses actual DOM measurements for accurate overflow detection.
    // Supports multi-page overflow when features exceed a single overflow page.
    const {
        visibleFeatures,
        overflowPages: featuresOverflowPages,
        hasOverflow: hasFeaturesOverflow,
        overflowPageCount: featuresOverflowPageCount,
        measurementPortal: featuresMeasurementPortal,
    } = useFeaturesOverflow({
        features: allFeatures,
        maxHeightPx: 580, // Column 3 available height (approx)
        enabled: !isMobile // Only on desktop - mobile scrolls naturally
    });

    // ===== INVENTORY OVERFLOW DETECTION (desktop only) =====
    // Uses category-based overflow - items are grouped by category with 3-column layout.
    const {
        visibleInventory,
        overflowPages: inventoryOverflowPages,
        hasOverflow: hasInventoryOverflow,
        overflowPageCount: inventoryOverflowPageCount,
        measurementPortal: inventoryMeasurementPortal,
    } = useInventoryOverflow({
        inventory: inventoryData,
        maxHeightPx: 700, // Approximate height for inventory content area
        enabled: !isMobile // Only on desktop - mobile scrolls naturally
    });

    // ===== SPELLS OVERFLOW DETECTION (desktop only) =====
    // Uses actual DOM measurements for accurate spell overflow detection.
    // Implements per-spell overflow - spells flow continuously with "(continued)" labels.
    const {
        visibleSpellsByLevel,
        overflowPages: spellsOverflowPages,
        hasOverflow: hasSpellsOverflow,
        overflowPageCount: spellsOverflowPageCount,
        measurementPortal: spellsMeasurementPortal,
    } = useSpellsOverflow({
        ...spellsData,
        maxHeightPx: 750, // Approximate height for spell list area on SpellSheet
        enabled: !isMobile && !!character?.dnd5eData?.spellcasting
    });

    // ===== DISPLAY SPELLS (respects overflow) =====
    // When overflow is active, show only visible spells on main SpellSheet
    const displaySpellsData = useMemo(() => {
        if (!hasSpellsOverflow) {
            return spellsData; // Use all spells when no overflow
        }
        // Use visible spells from overflow detection
        return {
            cantrips: visibleSpellsByLevel.get(0) || [],
            level1Spells: visibleSpellsByLevel.get(1) || [],
            level2Spells: visibleSpellsByLevel.get(2) || [],
            level3Spells: visibleSpellsByLevel.get(3) || [],
            level4Spells: visibleSpellsByLevel.get(4) || [],
            level5Spells: visibleSpellsByLevel.get(5) || [],
            level6Spells: visibleSpellsByLevel.get(6) || [],
            level7Spells: visibleSpellsByLevel.get(7) || [],
            level8Spells: visibleSpellsByLevel.get(8) || [],
            level9Spells: visibleSpellsByLevel.get(9) || [],
        };
    }, [hasSpellsOverflow, spellsData, visibleSpellsByLevel]);

    // ===== FONT LOADING =====
    // Wait for custom fonts to load before rendering (prevents layout shift)
    useLayoutEffect(() => {
        if (typeof document === 'undefined' || !document.fonts) {
            setFontsReady(true);
            return;
        }

        const loadFonts = async () => {
            try {
                // Wait for the D&D fonts used in character sheets
                await Promise.all([
                    document.fonts.load('700 24px NodestoCapsCondensed'),
                    document.fonts.load('400 14px ScalySansRemake'),
                    document.fonts.load('700 14px ScalySansRemake'),
                    document.fonts.load('400 14px BookInsanityRemake'),
                ]);

                // Also wait for fonts.ready to ensure rendering is complete
                await document.fonts.ready;

                // Brief delay for next paint cycle
                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(resolve);
                    });
                });

                setFontsReady(true);
                console.log('✅ [CharacterCanvas] Fonts loaded');
            } catch (error) {
                console.warn('⚠️ [CharacterCanvas] Font loading failed:', error);
                setFontsReady(true); // Proceed even if font loading fails
            }
        };

        loadFonts();
    }, []);

    // ===== RESPONSIVE SCALING =====
    // ResizeObserver scales the canvas to fit the container
    // for hybrid responsive system (CSS variables + calc())
    useLayoutEffect(() => {
        if (typeof ResizeObserver === 'undefined') {
            console.warn('[CharacterCanvas] ResizeObserver not available');
            return;
        }

        const node = containerRef.current;
        if (!node) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry || entry.contentRect.width === 0) return;

            // Track container width for responsive scale factors
            const width = entry.contentRect.width;
            setContainerWidth(width);

            // Account for container padding
            const computedStyle = window.getComputedStyle(node);
            const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
            const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
            const availableWidth = width - paddingLeft - paddingRight;

            // Calculate scale to fit page width
            const widthScale = availableWidth / PAGE_WIDTH_PX;
            const nextScale = clamp(widthScale, MIN_SCALE, MAX_SCALE);

            setScale((current) => (Math.abs(current - nextScale) > 0.01 ? nextScale : current));
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const canvasContent = useMemo(() => {
        const dnd5e = character?.dnd5eData;
        const hasCharacter = character?.name && character.name.trim().length > 0;
        const hasAbilityScores = dnd5e?.abilityScores &&
            Object.values(dnd5e.abilityScores).some(v => v > 0);

        if (hasCharacter && hasAbilityScores && dnd5e) {
            // Build class and level string
            const classAndLevel = dnd5e.classes?.length > 0
                ? dnd5e.classes.map(c => `${c.name} ${c.level}`).join(' / ')
                : 'Unknown';

            // Build attacks array from weapons
            const attacks: Attack[] = (dnd5e.weapons || []).map(weapon => {
                const strMod = Math.floor(((dnd5e.abilityScores?.strength ?? 10) - 10) / 2);
                const dexMod = Math.floor(((dnd5e.abilityScores?.dexterity ?? 10) - 10) / 2);
                const profBonus = dnd5e.derivedStats?.proficiencyBonus ?? 2;

                // Use DEX for finesse/ranged, STR otherwise
                const isFinesse = weapon.properties?.includes('finesse');
                const isRanged = weapon.weaponType === 'ranged';
                const abilityMod = (isFinesse || isRanged) ? Math.max(strMod, dexMod) : strMod;

                const attackBonus = abilityMod + profBonus;
                const damageMod = abilityMod >= 0 ? `+${abilityMod}` : `${abilityMod}`;

                return {
                    name: weapon.name,
                    attackBonus: `+${attackBonus}`,
                    damage: `${weapon.damage}${damageMod} ${weapon.damageType?.slice(0, 5) || ''}`
                };
            });

            // Features are now extracted via useMemo above for overflow detection
            // Use visibleFeatures (desktop) or allFeatures (not applicable here, mobile uses scroll)

            // Build equipment list
            const equipmentList: string[] = [];
            if (dnd5e.armor) equipmentList.push(dnd5e.armor.name);
            if (dnd5e.shield) equipmentList.push('Shield');
            dnd5e.weapons?.forEach(w => equipmentList.push(w.name));
            dnd5e.equipment?.forEach(e => equipmentList.push(e.name));

            // Build personality strings
            const traits = dnd5e.personality?.traits?.join(' ') || '';
            const ideals = dnd5e.personality?.ideals?.join(' ') || '';
            const bonds = dnd5e.personality?.bonds?.join(' ') || '';
            const flaws = dnd5e.personality?.flaws?.join(' ') || '';

            // Calculate passive perception
            const wisMod = Math.floor(((dnd5e.abilityScores?.wisdom ?? 10) - 10) / 2);
            const isProficientPerception = dnd5e.proficiencies?.skills?.includes('Perception');
            const passivePerception = 10 + wisMod + (isProficientPerception ? (dnd5e.derivedStats?.proficiencyBonus ?? 2) : 0);

            return (
                <CharacterSheetContainer>
                    {/* Page 1: Main Character Sheet */}
                    <CharacterSheet
                        // Header
                        name={character.name}
                        classAndLevel={classAndLevel}
                        race={dnd5e.race?.name || 'Unknown'}
                        background={dnd5e.background?.name || 'Unknown'}
                        playerName=""
                        alignment={dnd5e.alignment || ''}
                        xp={0}
                        portraitUrl={undefined}

                        // Ability Scores
                        abilityScores={dnd5e.abilityScores}

                        // Proficiency
                        proficiencyBonus={dnd5e.derivedStats?.proficiencyBonus ?? 2}
                        proficientSaves={dnd5e.proficiencies?.savingThrows || []}
                        proficientSkills={dnd5e.proficiencies?.skills || []}
                        hasInspiration={false}
                        passivePerception={passivePerception}

                        // Languages & Proficiencies
                        languages={dnd5e.proficiencies?.languages || ['Common']}
                        armorProficiencies={dnd5e.proficiencies?.armor || []}
                        weaponProficiencies={dnd5e.proficiencies?.weapons || []}
                        toolProficiencies={dnd5e.proficiencies?.tools || []}

                        // Combat
                        armorClass={dnd5e.derivedStats?.armorClass ?? 10}
                        initiative={dnd5e.derivedStats?.initiative ?? 0}
                        speed={dnd5e.derivedStats?.speed?.walk ?? 30}
                        maxHP={dnd5e.derivedStats?.maxHp ?? 1}
                        currentHP={dnd5e.derivedStats?.currentHp}
                        tempHP={dnd5e.derivedStats?.tempHp}
                        hitDiceTotal={dnd5e.classes?.length > 0
                            ? `${dnd5e.classes[0].level}d${dnd5e.classes[0].hitDie || 10}`
                            : '1d10'}

                        // Attacks & Equipment
                        attacks={attacks}
                        currency={dnd5e.currency}
                        equipment={equipmentList}

                        // Features (may be truncated if overflow detected)
                        features={visibleFeatures}
                    />

                    {/* Page 2: Background & Personality */}
                    <BackgroundPersonalitySheet
                        characterName={character.name}
                        backgroundName={dnd5e.background?.name}
                        traits={traits}
                        ideals={ideals}
                        bonds={bonds}
                        flaws={flaws}
                    />

                    {/* Page 3: Inventory Sheet */}
                    <InventorySheet
                        characterName={character.name}
                        classAndLevel={classAndLevel}
                        strength={dnd5e.abilityScores?.strength ?? 10}
                        currency={{
                            cp: dnd5e.currency?.cp ?? 0,
                            sp: dnd5e.currency?.sp ?? 0,
                            ep: dnd5e.currency?.ep ?? 0,
                            gp: dnd5e.currency?.gp ?? 0,
                            pp: dnd5e.currency?.pp ?? 0
                        }}
                        attunedItems={(() => {
                            // Build attunement slots from character data
                            const maxSlots = dnd5e.attunement?.maxSlots ?? 3;
                            const attunedIds = dnd5e.attunement?.attunedItemIds ?? [];

                            // Look up item names from IDs
                            const allItems = [
                                ...(dnd5e.weapons || []),
                                ...(dnd5e.equipment || []),
                                ...(dnd5e.armor ? [dnd5e.armor] : [])
                            ];

                            const slots = attunedIds.map(itemId => {
                                const item = allItems.find(i => i.id === itemId);
                                return { name: item?.name ?? itemId, active: true };
                            });

                            // Pad with empty slots
                            while (slots.length < maxSlots) {
                                slots.push({ name: '', active: false });
                            }

                            return slots;
                        })()}
                        weapons={inventoryData.weapons}
                        armor={inventoryData.armor}
                        magicItems={inventoryData.magicItems}
                        adventuringGear={inventoryData.adventuringGear}
                        treasure={inventoryData.treasure}
                        consumables={inventoryData.consumables}
                        otherItems={inventoryData.otherItems}
                        containers={[]}
                    />

                    {/* Page 4: Spell Sheet (if spellcaster) */}
                    {dnd5e.spellcasting && (
                        <SpellSheet
                            spellcastingClass={dnd5e.spellcasting.class}
                            spellcastingAbility={dnd5e.spellcasting.ability.substring(0, 3).toUpperCase()}
                            spellSaveDC={dnd5e.spellcasting.spellSaveDC}
                            spellAttackBonus={dnd5e.spellcasting.spellAttackBonus}
                            spellSlots={(() => {
                                const slots: SpellSlotLevel[] = [];
                                const spellSlots = dnd5e.spellcasting?.spellSlots;
                                if (spellSlots) {
                                    for (let level = 1; level <= 9; level++) {
                                        const slotData = spellSlots[level as keyof typeof spellSlots];
                                        if (slotData) {
                                            slots.push({
                                                level,
                                                total: slotData.total,
                                                used: slotData.used
                                            });
                                        }
                                    }
                                }
                                return slots;
                            })()}
                            cantrips={displaySpellsData.cantrips}
                            level1Spells={displaySpellsData.level1Spells}
                            level2Spells={displaySpellsData.level2Spells}
                            level3Spells={displaySpellsData.level3Spells}
                            level4Spells={displaySpellsData.level4Spells}
                            level5Spells={displaySpellsData.level5Spells}
                            level6Spells={displaySpellsData.level6Spells}
                            level7Spells={displaySpellsData.level7Spells}
                            level8Spells={displaySpellsData.level8Spells}
                            level9Spells={displaySpellsData.level9Spells}
                        />
                    )}

                    {/* Features Overflow Pages (if needed) - renders first after main sheets */}
                    {hasFeaturesOverflow && featuresOverflowPages.map((pageFeatures: Feature[], idx: number) => {
                        // Calculate page number: base pages + features overflow page index
                        // Base: CharacterSheet(1) + Background(2) + Inventory(3) + SpellSheet(4 if caster)
                        const basePages = dnd5e.spellcasting ? 4 : 3;
                        const pageNumber = basePages + idx + 1;

                        return (
                            <FeaturesOverflowPage
                                key={`features-overflow-${idx}`}
                                features={pageFeatures}
                                characterName={character.name}
                                pageNumber={pageNumber}
                                currentOverflowPage={idx + 1}
                                totalOverflowPages={featuresOverflowPages.length}
                            />
                        );
                    })}

                    {/* Inventory Overflow Pages (if needed) - renders after features overflow */}
                    {hasInventoryOverflow && inventoryOverflowPages.map((pageData: InventoryPageData, idx: number) => {
                        // Calculate page number: base pages + features overflow + inventory overflow index
                        // Base: CharacterSheet(1) + Background(2) + Inventory(3) + SpellSheet(4 if caster)
                        const basePages = dnd5e.spellcasting ? 4 : 3;
                        const featuresOverflowOffset = hasFeaturesOverflow ? featuresOverflowPageCount : 0;
                        const pageNumber = basePages + featuresOverflowOffset + idx + 1;

                        return (
                            <InventoryOverflowPage
                                key={`inventory-overflow-${idx}`}
                                pageData={pageData}
                                characterName={character.name}
                                pageNumber={pageNumber}
                                currentOverflowPage={idx + 1}
                                totalOverflowPages={inventoryOverflowPages.length}
                            />
                        );
                    })}

                    {/* Spells Overflow Pages (if needed) - renders after features/inventory overflow */}
                    {hasSpellsOverflow && spellsOverflowPages.map((pageData: SpellOverflowPageData, idx: number) => {
                        // Calculate page number: base pages + features overflow + inventory overflow + spell overflow index
                        // Base: CharacterSheet(1) + Background(2) + Inventory(3) + SpellSheet(4)
                        const basePages = 4;
                        const featuresOverflowOffset = hasFeaturesOverflow ? featuresOverflowPageCount : 0;
                        const inventoryOverflowOffset = hasInventoryOverflow ? inventoryOverflowPageCount : 0;
                        const pageNumber = basePages + featuresOverflowOffset + inventoryOverflowOffset + idx + 1;

                        return (
                            <SpellsOverflowPage
                                key={`spells-overflow-${idx}`}
                                pageData={pageData}
                                characterName={character.name}
                                pageNumber={pageNumber}
                                currentOverflowPage={idx + 1}
                                totalOverflowPages={spellsOverflowPages.length}
                            />
                        );
                    })}
                </CharacterSheetContainer>
            );
        }

        // Empty state - show blank sheet
        return (
            <CharacterSheetPage>
                <div
                    style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        fontFamily: 'BookInsanityRemake, serif'
                    }}
                >
                    <h2
                        style={{
                            fontFamily: 'NodestoCapsCondensed, serif',
                            fontSize: '2.4rem',
                            color: 'var(--text-red, #58180D)',
                            margin: '0 0 1rem',
                            letterSpacing: '0.02em'
                        }}
                    >
                        📜 Character Sheet
                    </h2>
                    <p
                        style={{
                            fontFamily: 'ScalySansRemake, sans-serif',
                            fontSize: '1.1rem',
                            color: 'rgba(43, 29, 15, 0.8)',
                            lineHeight: 1.5,
                            margin: 0
                        }}
                    >
                        Create a new character to see the character sheet preview.
                        <br />
                        <br />
                        Click <strong style={{ color: '#a11d18' }}>&quot;Generate&quot;</strong> in the header to start building your character,
                        <br />
                        or use <strong style={{ color: '#a11d18' }}>Dev Tools → Load Demo Character</strong> in the toolbox.
                    </p>
                </div>
            </CharacterSheetPage>
        );
    }, [character, visibleFeatures, featuresOverflowPages, hasFeaturesOverflow, displaySpellsData, hasSpellsOverflow, spellsOverflowPages]);

    // ===== PAGE COUNT =====
    // Calculate number of pages (for container height)
    const pageCount = useMemo(() => {
        const dnd5e = character?.dnd5eData;
        const hasCharacter = character?.name && character.name.trim().length > 0;
        const hasAbilityScores = dnd5e?.abilityScores &&
            Object.values(dnd5e.abilityScores).some(v => v > 0);

        if (!hasCharacter || !hasAbilityScores || !dnd5e) return 1;

        // Base pages: CharacterSheet, BackgroundPersonalitySheet, InventorySheet
        let pages = 3;
        // Add SpellSheet if character has spellcasting
        if (dnd5e.spellcasting) pages += 1;
        // Add Features overflow pages (supports multi-page overflow)
        if (hasFeaturesOverflow) pages += featuresOverflowPageCount;
        // Add Inventory overflow pages (supports multi-page overflow)
        if (hasInventoryOverflow) pages += inventoryOverflowPageCount;
        // Add Spells overflow pages (supports multi-page overflow)
        if (hasSpellsOverflow) pages += spellsOverflowPageCount;

        return pages;
    }, [character, hasFeaturesOverflow, featuresOverflowPageCount, hasInventoryOverflow, inventoryOverflowPageCount, hasSpellsOverflow, spellsOverflowPageCount]);

    // ===== COMPUTED STYLES =====
    // Full unscaled height (before transform) - must be defined first
    const fullHeightPx = pageCount * PAGE_HEIGHT_PX + (pageCount - 1) * PAGE_GAP_PX;

    // Scaled height for container (after transform)
    const scaledHeightPx = PAGE_HEIGHT_PX * scale;
    const totalScaledHeightPx = pageCount * scaledHeightPx + (pageCount - 1) * PAGE_GAP_PX * scale;

    // ===== RESPONSIVE SCALE FACTORS =====
    // Calculated from container width, used by CSS via calc()
    const fontScale = getFontScale(containerWidth);
    const spacingScale = getSpacingScale(containerWidth);

    const containerStyle = useMemo<React.CSSProperties>(() => ({
        width: '100%',
        height: `${totalScaledHeightPx}px`,
        minHeight: 'unset', // Override CSS min-height: 100%
        maxWidth: '100%',
        position: 'relative',
        overflow: 'visible', // Allow content to be visible (scrolling handled by parent)
        margin: '0 auto',
        padding: 0, // Override CSS padding
        display: 'flex',
        flexDirection: 'row', // Override CSS flex-direction: column
        justifyContent: 'center',
        alignItems: 'flex-start', // Align content to top
        background: '#4a3728', // Dark wood background
        // CSS Variables for child components
        '--dm-page-width': `${PAGE_WIDTH_PX}px`,
        '--dm-page-height': `${PAGE_HEIGHT_PX}px`,
        '--dm-page-count': `${pageCount}`,
        '--dm-page-scale': `${scale}`,
        '--dm-page-gap': `${PAGE_GAP_PX}px`,
        // Hybrid Responsive System: Scale factors for font/spacing
        // Components use these via calc(), e.g.: font-size: calc(14px * var(--dm-font-scale));
        '--dm-font-scale': `${fontScale}`,
        '--dm-spacing-scale': `${spacingScale}`,
        '--dm-container-width': `${containerWidth}px`,
    } as React.CSSProperties), [totalScaledHeightPx, pageCount, scale, fontScale, spacingScale, containerWidth]);

    const transformWrapperStyle = useMemo<React.CSSProperties>(() => ({
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        margin: 0,
        padding: 0,
        width: `${PAGE_WIDTH_PX}px`,
        height: `${fullHeightPx}px`,
    }), [scale, fullHeightPx]);

    const canvasRendererStyle = useMemo<React.CSSProperties>(() => ({
        width: `${PAGE_WIDTH_PX}px`,
        height: `${fullHeightPx}px`,
    }), [fullHeightPx]);

    // ===== MOBILE VIEWPORT SWITCH =====
    // isMobile is calculated earlier (after window resize tracking) for overflow hook
    // Below 800px window width, render mobile-optimized vertical scroll layout

    // Debug: Log viewport switch decisions
    console.log(`📱 [CharacterCanvas] windowWidth: ${windowWidth}px, isMobile: ${isMobile}`);

    // ===== LOADING STATE =====
    if (!fontsReady) {
        return (
            <div
                className="character-canvas-area"
                data-testid="character-canvas"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    color: '#666'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <p>Loading fonts...</p>
                </div>
            </div>
        );
    }

    // ===== MOBILE CANVAS =====
    // Vertical scroll layout for viewports < 800px
    if (isMobile) {
        return (
            <div
                className="character-canvas-area character-canvas-mobile"
                ref={containerRef}
                data-testid="character-canvas"
                style={{
                    width: '100%',
                    minHeight: '100%',
                    background: '#4a3728',
                }}
            >
                <MobileCharacterCanvas />
            </div>
        );
    }

    // ===== DESKTOP CANVAS =====
    // Scaled page layout for viewports >= 800px
    return (
        <>
            {/* Measurement portals for accurate overflow detection (render offscreen) */}
            {featuresMeasurementPortal}
            {inventoryMeasurementPortal}
            {spellsMeasurementPortal}

            <div
                className="character-canvas-area"
                ref={containerRef}
                style={containerStyle}
                data-testid="character-canvas"
            >
                <div className="character-canvas-wrapper" style={transformWrapperStyle}>
                    <div className="character-canvas-renderer" style={canvasRendererStyle}>
                        {canvasContent}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CharacterCanvas;

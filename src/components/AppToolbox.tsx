// src/components/AppToolbox.tsx
// Dropdown toolbox component for app-specific controls
import React, { ReactNode } from 'react';
import { Menu, Box, Divider, Text } from '@mantine/core';
import { IconTool } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

/**
 * AppToolbox Control Configuration
 * Each control can be a component, menu item, or submenu
 */
export interface ToolboxControl {
    // Unique identifier
    id: string;

    // Control type
    type: 'component' | 'menu-item' | 'submenu';

    // For type='component': render the component inline
    component?: ReactNode;

    // For type='menu-item' or 'submenu': label and icon
    label?: string;
    icon?: ReactNode;

    // For type='menu-item': click handler
    onClick?: () => void;

    // For type='submenu': nested items
    submenuItems?: Array<{
        id: string;
        label: string;
        icon?: ReactNode;
        onClick: () => void;
        disabled?: boolean;
        color?: string;
    }>;

    // Common properties
    disabled?: boolean;
    color?: string;

    // Data attributes (for testing/tutorials)
    dataAttributes?: Record<string, string>;
}

/**
 * AppToolbox Section (groups related controls)
 */
export interface ToolboxSection {
    id: string;
    label?: string;  // Section heading (optional)
    controls: ToolboxControl[];
}

/**
 * AppToolbox Props
 */
export interface AppToolboxProps {
    // Sections of controls to display
    sections: ToolboxSection[];

    // Toolbox icon size
    size?: 'sm' | 'md' | 'lg';

    // Disabled state
    disabled?: boolean;

    // Custom icon (default: IconTool)
    icon?: ReactNode;

    // Menu position
    position?: 'bottom-end' | 'bottom-start' | 'bottom';

    // Menu width
    width?: number | string;
}

/**
 * AppToolbox - Dropdown menu for app-specific controls
 * 
 * Features:
 * - Consolidates multiple app controls into a single dropdown
 * - Supports both inline components and menu items
 * - Sectioned organization with optional dividers
 * - Responsive sizing
 * - Customizable icon and positioning
 * 
 * Usage:
 * ```typescript
 * <AppToolbox
 *   sections={[
 *     {
 *       id: 'editing',
 *       label: 'Editing',
 *       controls: [
 *         {
 *           id: 'edit-mode',
 *           type: 'component',
 *           component: <Switch label="Edit Mode" />
 *         }
 *       ]
 *     },
 *     {
 *       id: 'actions',
 *       label: 'Actions',
 *       controls: [
 *         {
 *           id: 'save',
 *           type: 'menu-item',
 *           label: 'Save',
 *           icon: <IconDeviceFloppy size={16} />,
 *           onClick: handleSave
 *         },
 *         {
 *           id: 'export',
 *           type: 'submenu',
 *           label: 'Export',
 *           icon: <IconDownload size={16} />,
 *           submenuItems: [
 *             {
 *               id: 'export-html',
 *               label: 'Export as HTML',
 *               icon: <IconFileText size={14} />,
 *               onClick: handleExportHTML
 *             },
 *             {
 *               id: 'export-pdf',
 *               label: 'Export as PDF',
 *               icon: <IconPrinter size={14} />,
 *               onClick: handleExportPDF
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]}
 * />
 * ```
 */
export const AppToolbox: React.FC<AppToolboxProps> = ({
    sections,
    size = 'lg',
    disabled = false,
    icon,
    position = 'bottom-end',
    width = 280
}) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Responsive icon sizing - match header icon scale exactly
    const iconSize = isMobile ? '40px' : isTablet ? '70px' : '80px'; // Match UnifiedHeader sizing

    return (
        <Menu
            shadow="md"
            width={width}
            position={position}
            closeOnItemClick={false}  // Allow toggling switches without closing
            withinPortal
            offset={8}  // Add offset to prevent cutoff
        >
            <Menu.Target>
                <Box
                    data-tutorial="app-toolbox"
                    style={{
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: disabled ? 0.5 : 1,
                        height: iconSize,
                        width: iconSize
                    }}
                    aria-label="Open app toolbox"
                    title="App Toolbox"
                >
                    {icon || (
                        <img
                            src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/187dcbd3-49b3-4015-f09b-4543edc74000/public"
                            alt="App Toolbox"
                            style={{
                                height: iconSize,
                                width: iconSize,
                                objectFit: 'contain',
                                cursor: 'pointer'
                            }}
                            onError={(e) => {
                                // Fallback to IconTool if image fails to load
                                e.currentTarget.style.display = 'none';
                                const fallback = document.createElement('div');
                                fallback.innerHTML = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
                                e.currentTarget.parentNode?.appendChild(fallback);
                            }}
                        />
                    )}
                </Box>
            </Menu.Target>

            <Menu.Dropdown>
                {sections.map((section, sectionIndex) => (
                    <React.Fragment key={section.id}>
                        {/* Section Header (if provided) */}
                        {section.label && (
                            <Box px={isMobile ? "md" : "sm"} py={isMobile ? "sm" : "xs"}>
                                <Text size={isMobile ? "sm" : "xs"} fw={600} c="dimmed" tt="uppercase">
                                    {section.label}
                                </Text>
                            </Box>
                        )}

                        {/* Section Controls */}
                        {section.controls.map((control) => {
                            if (control.type === 'component') {
                                // Render component inline with mobile-friendly padding
                                return (
                                    <Box key={control.id} px={isMobile ? "md" : "sm"} py={isMobile ? "sm" : "xs"}>
                                        {control.component}
                                    </Box>
                                );
                            } else if (control.type === 'submenu' && control.submenuItems) {
                                // Render as nested submenu
                                return (
                                    <Menu key={control.id} trigger="click" openDelay={100} closeDelay={200}>
                                        <Menu.Target>
                                            <Menu.Item
                                                leftSection={control.icon}
                                                rightSection={
                                                    <Text size="xs" c="dimmed">›</Text>
                                                }
                                                disabled={control.disabled}
                                                style={{
                                                    minHeight: isMobile ? '48px' : '36px',
                                                    fontSize: isMobile ? '16px' : '14px',
                                                    padding: isMobile ? '12px 16px' : '8px 12px'
                                                }}
                                                {...(control.dataAttributes || {})}
                                            >
                                                {control.label}
                                            </Menu.Item>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {control.submenuItems.map((subItem) => (
                                                <Menu.Item
                                                    key={subItem.id}
                                                    leftSection={subItem.icon}
                                                    onClick={subItem.onClick}
                                                    disabled={subItem.disabled}
                                                    color={subItem.color}
                                                    style={{
                                                        minHeight: isMobile ? '48px' : '36px',
                                                        fontSize: isMobile ? '16px' : '14px',
                                                        padding: isMobile ? '12px 16px' : '8px 12px'
                                                    }}
                                                >
                                                    {subItem.label}
                                                </Menu.Item>
                                            ))}
                                        </Menu.Dropdown>
                                    </Menu>
                                );
                            } else {
                                // Render as menu item with mobile-friendly sizing
                                return (
                                    <Menu.Item
                                        key={control.id}
                                        leftSection={control.icon}
                                        onClick={control.onClick}
                                        disabled={control.disabled}
                                        color={control.color}
                                        style={{
                                            minHeight: isMobile ? '48px' : '36px',
                                            fontSize: isMobile ? '16px' : '14px',
                                            padding: isMobile ? '12px 16px' : '8px 12px'
                                        }}
                                        {...(control.dataAttributes || {})}
                                    >
                                        {control.label}
                                    </Menu.Item>
                                );
                            }
                        })}

                        {/* Divider between sections (except last) */}
                        {sectionIndex < sections.length - 1 && (
                            <Divider my={isMobile ? "sm" : "xs"} />
                        )}
                    </React.Fragment>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
};

export default AppToolbox;


import React from 'react';
import { Button } from '@mantine/core';

/** A normal cross-origin link; authentication stays with Buddy's existing flow. */
export const BuddyEntryLink: React.FC = () => (
    <Button
        component="a"
        href="https://buddy.dungeonmind.net/"
        size="xs"
        color="var(--dm-accent-gold, #d9a441)"
        styles={{ root: { color: 'var(--dm-text-dark-brown, #241b10)', minHeight: 44, paddingInline: 10 } }}
    >
        Open Buddy <span aria-hidden="true"> →</span>
    </Button>
);

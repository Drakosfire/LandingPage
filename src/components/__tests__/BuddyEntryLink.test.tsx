import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { BuddyEntryLink } from '../BuddyEntryLink';

it('opens Buddy in the same browsing context without inventing a separate sign-in route', () => {
    render(<MantineProvider><BuddyEntryLink /></MantineProvider>);
    const entry = screen.getByRole('link', { name: 'Open Buddy' });
    expect(entry).toHaveAttribute('href', 'https://buddy.dungeonmind.net/');
    expect(entry).not.toHaveAttribute('target');
});

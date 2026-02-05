'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeInitializer() {
    const { theme, setTheme } = useThemeStore();

    useEffect(() => {
        // Re-apply theme on amount to ensure document class is correct
        setTheme(theme);
    }, [theme, setTheme]);

    return null;
}

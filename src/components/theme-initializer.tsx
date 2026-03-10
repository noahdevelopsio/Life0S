'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeInitializer() {
    const theme = useThemeStore((s) => s.theme);
    const setTheme = useThemeStore((s) => s.setTheme);
    const hasHydrated = useThemeStore((s) => s._hasHydrated);

    useEffect(() => {
        // Only apply theme AFTER zustand has rehydrated from localStorage
        // This prevents the default 'system' from overwriting the user's saved preference
        if (hasHydrated) {
            setTheme(theme);
        }
    }, [theme, setTheme, hasHydrated]);

    return null;
}

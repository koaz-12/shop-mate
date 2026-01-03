'use client';

import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

export default function ThemeApplicator() {
    const { themeColor } = useStore();

    useEffect(() => {
        const root = document.documentElement;
        if (themeColor && themeColor !== 'emerald') {
            root.setAttribute('data-theme-color', themeColor);
        } else {
            root.removeAttribute('data-theme-color'); // Default
        }
    }, [themeColor]);

    return null;
}

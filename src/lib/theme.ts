import type { ThemeColor } from '../types';

/**
 * Multiple Theme Color Definitions & Smooth Transition Engine
 * Provides glitch-free, GPU-accelerated theme switching using the View Transitions API
 * when supported, with a graceful CSS transition-class fallback.
 */

export interface ThemeOption {
  id: ThemeColor;
  name: string;
  badge: string;
  description: string;
  primary: string;
  secondary: string;
  gradient: string;
  darkMeta: string;
  lightMeta: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'indigo',
    name: 'Indigo Vault',
    badge: 'Default',
    description: 'Electric indigo and violet for a refined, modern security aesthetic',
    primary: '#6366f1',
    secondary: '#4f46e5',
    gradient: 'from-indigo-600 to-violet-600',
    darkMeta: '#090d16',
    lightMeta: '#f8fafc',
  },
  {
    id: 'emerald',
    name: 'Emerald Mint',
    badge: 'Finance',
    description: 'Crisp emerald and cyber jade inspired by secure banking and prosperity',
    primary: '#10b981',
    secondary: '#059669',
    gradient: 'from-emerald-600 to-teal-600',
    darkMeta: '#041712',
    lightMeta: '#f0fdf4',
  },
  {
    id: 'ocean',
    name: 'Ocean Azure',
    badge: 'Clarity',
    description: 'Deep sapphire and sky cyan for maximum contrast, focus and trust',
    primary: '#0284c7',
    secondary: '#2563eb',
    gradient: 'from-sky-600 to-blue-600',
    darkMeta: '#081e2b',
    lightMeta: '#f0f9ff',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    badge: 'Prestige',
    description: 'Warm gold and radiant copper tones for a prestigious executive feel',
    primary: '#f59e0b',
    secondary: '#d97706',
    gradient: 'from-amber-500 to-orange-600',
    darkMeta: '#1a1306',
    lightMeta: '#fffbeb',
  },
  {
    id: 'rose',
    name: 'Rose Crimson',
    badge: 'Vibrant',
    description: 'Rich velvet crimson and rose magenta for bold, elegant expression',
    primary: '#f43f5e',
    secondary: '#e11d48',
    gradient: 'from-rose-500 to-pink-600',
    darkMeta: '#1a0a10',
    lightMeta: '#fff1f2',
  },
  {
    id: 'purple',
    name: 'Cyber Violet',
    badge: 'Aceternity',
    description: 'Futuristic neon violet and fuchsia inspired by synthwave interfaces',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    gradient: 'from-purple-600 to-fuchsia-600',
    darkMeta: '#140c24',
    lightMeta: '#faf5ff',
  },
  {
    id: 'slate',
    name: 'Titanium Slate',
    badge: 'Minimal',
    description: 'Monochromatic obsidian and brushed titanium for high-stealth privacy',
    primary: '#64748b',
    secondary: '#334155',
    gradient: 'from-slate-700 to-zinc-800',
    darkMeta: '#090d16',
    lightMeta: '#f8fafc',
  },
];

export function getThemeConfig(id?: ThemeColor): ThemeOption {
  return THEME_OPTIONS.find(t => t.id === id) || THEME_OPTIONS[0];
}

let transitionTimeout: number | null = null;

/**
 * Smoothly applies both Dark/Light mode and chosen Accent Theme Color.
 * Leverages View Transitions API or fallback transition class.
 */
export function applyThemeSmoothly(isDarkMode: boolean, themeColor?: ThemeColor) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Read current color if not explicitly provided
  const activeColor =
    themeColor ||
    (root.getAttribute('data-theme-color') as ThemeColor) ||
    'indigo';

  const themeConfig = getThemeConfig(activeColor);

  const updateDOM = () => {
    // 1. Dark Mode class & native colorScheme
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // 2. Data attribute for CSS variables
    root.setAttribute('data-theme-color', activeColor);

    // 3. Meta theme-color for iOS Safari / Chrome top bars
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        'content',
        isDarkMode ? themeConfig.darkMeta : themeConfig.lightMeta
      );
    }
  };

  // Check if browser supports View Transitions API
  const doc = document as unknown as {
    startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
  };

  if (typeof doc.startViewTransition === 'function') {
    try {
      doc.startViewTransition(() => {
        updateDOM();
      });
      return;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for browsers without View Transitions:
  // Add temporary .theme-transitioning class to synchronize CSS transitions
  if (transitionTimeout) {
    window.clearTimeout(transitionTimeout);
  }

  root.classList.add('theme-transitioning');
  updateDOM();

  transitionTimeout = window.setTimeout(() => {
    root.classList.remove('theme-transitioning');
    transitionTimeout = null;
  }, 350);
}

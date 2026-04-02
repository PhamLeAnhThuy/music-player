export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_MODE_STORAGE_KEY = 'music-player-theme-mode';

function resolveSystemDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getStoredThemeMode(): ThemeMode {
  const rawValue = localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (rawValue === 'light' || rawValue === 'dark' || rawValue === 'system') {
    return rawValue;
  }

  return 'system';
}

function applyThemeClass(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = resolveSystemDarkMode();
  const shouldUseDark = mode === 'dark' || (mode === 'system' && prefersDark);

  root.classList.toggle('dark', shouldUseDark);
  root.style.colorScheme = shouldUseDark ? 'dark' : 'light';
}

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  applyThemeClass(mode);
}

export function initializeThemeMode() {
  const mode = getStoredThemeMode();
  applyThemeClass(mode);

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = () => {
    const nextMode = getStoredThemeMode();
    if (nextMode === 'system') {
      applyThemeClass(nextMode);
    }
  };

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', handleSystemThemeChange);
  } else {
    media.addListener(handleSystemThemeChange);
  }
}

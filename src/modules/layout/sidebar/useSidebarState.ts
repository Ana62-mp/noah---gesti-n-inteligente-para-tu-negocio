import { useEffect, useState } from 'react';
import { SIDEBAR_COLLAPSED_KEY, SIDEBAR_LARGE_SCREEN_QUERY } from './sidebar.constants';

const readCollapsed = (): boolean => {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const useSidebarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(readCollapsed);
  const [isLargeScreen, setIsLargeScreen] = useState(() => window.matchMedia(SIDEBAR_LARGE_SCREEN_QUERY).matches);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(SIDEBAR_LARGE_SCREEN_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsLargeScreen(event.matches);
      if (event.matches) setIsMobileOpen(false);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const setCollapsed = (value: boolean) => {
    setIsCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value));
    } catch {
      // The preference simply lasts until reload when storage is blocked.
    }
  };

  return { isCollapsed, setCollapsed, isLargeScreen, isMobileOpen, setIsMobileOpen };
};

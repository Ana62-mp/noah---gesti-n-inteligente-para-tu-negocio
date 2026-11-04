import { useEffect, useRef, useState } from 'react';
import { SIDEBAR_HOVER_CLOSE_DELAY_MS } from './sidebar.constants';

export const useSidebarHover = (isEnabled: boolean) => {
  const [isHovered, setIsHovered] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const open = () => {
    cancelClose();
    if (isEnabled) setIsHovered(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setIsHovered(false), SIDEBAR_HOVER_CLOSE_DELAY_MS);
  };

  useEffect(() => {
    if (!isEnabled) setIsHovered(false);
  }, [isEnabled]);

  useEffect(() => {
    if (!isHovered) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsHovered(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isHovered]);

  useEffect(() => cancelClose, []);

  return { isHovered, open, scheduleClose };
};

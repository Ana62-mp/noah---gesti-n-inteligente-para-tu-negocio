import { useEffect, useState } from 'react';
import { NavSection } from './navigation.config';

export const useExpandedModules = (sections: NavSection[], activeSection: string) => {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const parent = sections.find(({ items }) => items.some(({ id }) => id === activeSection));
    if (!parent) return;
    setExpanded(new Set([parent.title]));
  }, [activeSection, sections.length]);

  const toggle = (title: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  return { expanded, toggle };
};

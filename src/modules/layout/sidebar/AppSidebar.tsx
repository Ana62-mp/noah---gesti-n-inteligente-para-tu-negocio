import React from 'react';
import { ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useApp } from '../../../shared/context/AppContext';
import { ROLE_LABELS } from '../../../shared/permissions/rolePermissions';
import { Logo } from '../../../shared/ui/Logo';
import { preloadSection } from '../../sections/sectionRegistry';
import { buildNavSections } from './navigation.config';
import { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_MINI } from './sidebar.constants';
import { useExpandedModules } from './useExpandedModules';
import { useSidebarHover } from './useSidebarHover';
import { useSidebarState } from './useSidebarState';

type SidebarState = ReturnType<typeof useSidebarState>;

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export const AppSidebar: React.FC<{ state: SidebarState }> = ({ state }) => {
  const { accessibleSections, activeSection, setActiveSection, currentBusiness, currentMember, logout } = useApp();
  const { isCollapsed, setCollapsed, isLargeScreen, isMobileOpen, setIsMobileOpen } = state;
  const isMiniMode = isLargeScreen && isCollapsed;
  const { isHovered, open, scheduleClose } = useSidebarHover(isMiniMode);
  const isCompact = isMiniMode && !isHovered;
  const sections = React.useMemo(
    () => buildNavSections(accessibleSections, currentBusiness.type),
    [accessibleSections, currentBusiness.type]
  );
  const { expanded, toggle } = useExpandedModules(sections, activeSection);

  const navigate = (section: string) => {
    setActiveSection(section);
    setIsMobileOpen(false);
  };

  const renderItem = (item: (typeof sections)[number]['items'][number]) => {
    const isActive = activeSection === item.id;
    return (
      <button
        key={item.id}
        onClick={() => navigate(item.id)}
        onMouseEnter={() => preloadSection(item.id)}
        onFocus={() => preloadSection(item.id)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
        title={isCompact ? item.label : undefined}
        className={`flex items-center rounded-lg border text-xs font-semibold transition-colors ${
          isCompact ? 'w-10 h-10 justify-center mx-auto' : 'w-full gap-2.5 px-2.5 min-h-9'
        } ${
          isActive
            ? 'bg-[#CF6811]/25 border-[#D59F3F]/60 text-white'
            : 'border-transparent text-white/75 hover:bg-white/10 hover:text-white'
        }`}
      >
        {item.icon}
        {!isCompact && <span className="truncate text-left">{item.label}</span>}
      </button>
    );
  };

  return (
    <aside
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocus={open}
      onBlur={scheduleClose}
      style={{ width: isCompact ? SIDEBAR_WIDTH_MINI : SIDEBAR_WIDTH_EXPANDED }}
      className={`fixed inset-y-0 left-0 z-40 gradient-espresso text-white flex flex-col transition-[width,transform] duration-200 ease-out ${
        isLargeScreen || isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isMiniMode && isHovered ? 'shadow-2xl ring-1 ring-white/10' : ''}`}
    >
      <div className={`shrink-0 h-14 flex items-center border-b border-white/10 ${isCompact ? 'justify-center' : 'justify-between px-4'}`}>
        <Logo variant={isCompact ? 'icon-only' : 'dark'} size="sm" />
        {!isLargeScreen && (
          <button onClick={() => setIsMobileOpen(false)} className="p-1.5 text-white/70 hover:text-white" aria-label="Cerrar menú">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!isCompact && (
        <div className="shrink-0 px-4 py-2.5 border-b border-white/10">
          <div className="text-xs font-extrabold truncate">{currentBusiness.name}</div>
          <div className="text-[11px] text-[#EBD48F]/90 truncate">{currentBusiness.city} · datos de ejemplo</div>
        </div>
      )}

      <nav className="sidebar-nav-scroll flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-1" aria-label="Navegación principal">
        {sections.map((section) =>
          isCompact ? (
            <div key={section.title} className="space-y-1 pb-1 border-b border-white/10 last:border-0">
              {section.items.map(renderItem)}
            </div>
          ) : (
            <div key={section.title}>
              <button
                onClick={() => toggle(section.title)}
                aria-expanded={expanded.has(section.title)}
                className="w-full min-h-8 px-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#EBD48F]/90 hover:text-[#EBD48F]"
              >
                <span>{section.title}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded.has(section.title) ? 'rotate-90' : ''}`} />
              </button>
              {expanded.has(section.title) && (
                <div className="ml-2 pl-2 border-l border-white/15 space-y-0.5 pb-1">{section.items.map(renderItem)}</div>
              )}
            </div>
          )
        )}
      </nav>

      <div className={`shrink-0 border-t border-white/10 ${isCompact ? 'p-2 space-y-2' : 'p-3 space-y-2'}`}>
        {isLargeScreen && (
          <div className={`flex rounded-full bg-black/25 p-0.5 ${isCompact ? 'w-10 mx-auto' : ''}`} role="group" aria-label="Modo del menú">
            {!isCompact && (
              <button
                onClick={() => setCollapsed(false)}
                aria-pressed={!isCollapsed}
                className={`flex-1 h-7 rounded-full flex items-center justify-center gap-1.5 text-[11px] font-semibold ${!isCollapsed ? 'bg-white/20 shadow' : 'text-white/70 hover:text-white'}`}
              >
                <PanelLeftOpen className="w-3.5 h-3.5" />
                Fijo
              </button>
            )}
            <button
              onClick={() => setCollapsed(isCompact ? false : true)}
              aria-pressed={isCollapsed}
              title={isCompact ? 'Fijar menú' : 'Compactar menú'}
              aria-label={isCompact ? 'Fijar menú' : 'Compactar menú'}
              className={`flex-1 h-7 rounded-full flex items-center justify-center gap-1.5 text-[11px] font-semibold ${isCollapsed ? 'bg-white/20 shadow' : 'text-white/70 hover:text-white'}`}
            >
              {isCompact ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
              {!isCompact && 'Mini'}
            </button>
          </div>
        )}

        <div className={`flex items-center gap-2 ${isCompact ? 'flex-col' : ''}`}>
          <div
            title={isCompact ? `${currentMember.name} · ${ROLE_LABELS[currentMember.role]}` : undefined}
            className="w-9 h-9 shrink-0 rounded-full bg-[#EBD48F] text-[#421A05] font-extrabold text-xs flex items-center justify-center"
          >
            {getInitials(currentMember.name)}
          </div>
          {!isCompact && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">{currentMember.name}</div>
              <span className="inline-block mt-0.5 px-1.5 rounded-full bg-[#CF6811] text-[10px] font-bold uppercase tracking-wide">
                {currentMember.role === 'owner' ? 'Administrador' : ROLE_LABELS[currentMember.role]}
              </span>
            </div>
          )}
          <button onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión" className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

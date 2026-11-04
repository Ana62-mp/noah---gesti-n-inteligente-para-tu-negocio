import React, { useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { getVisibleAlerts } from '../../shared/permissions/rolePermissions';
import { apiService } from '../../shared/services/apiService';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { SidePanel } from '../../shared/ui/SidePanel';
import { ToastContainer } from '../../shared/ui/ToastContainer';
import { NoahChat } from '../assistant/NoahChat';
import { GuidedTour } from '../tour/GuidedTour';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './sidebar/AppSidebar';
import { SIDEBAR_WIDTH_EXPANDED, SIDEBAR_WIDTH_MINI } from './sidebar/sidebar.constants';
import { useSidebarState } from './sidebar/useSidebarState';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeSection,
    currentBusiness,
    currentMember,
    accessibleSections,
    isAssistantOpen,
    setIsAssistantOpen,
    setUnreadNotificationsCount,
  } = useApp();
  const sidebar = useSidebarState();
  const contentMargin = sidebar.isLargeScreen ? (sidebar.isCollapsed ? SIDEBAR_WIDTH_MINI : SIDEBAR_WIDTH_EXPANDED) : 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsAssistantOpen(!isAssistantOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAssistantOpen]);

  useEffect(() => {
    apiService.getNotifications().then((alerts) => {
      setUnreadNotificationsCount(getVisibleAlerts(accessibleSections, alerts).filter(({ dismissed }) => !dismissed).length);
    });
  }, [accessibleSections, currentBusiness.id]);

  return (
    <div className="h-dvh bg-app overflow-hidden antialiased">
      <AppSidebar state={sidebar} />

      {!sidebar.isLargeScreen && sidebar.isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-[#2A1103]/50 backdrop-blur-xs" onClick={() => sidebar.setIsMobileOpen(false)} />
      )}

      <div style={{ marginLeft: contentMargin }} className="h-full flex flex-col min-w-0 transition-[margin] duration-200 ease-out">
        <AppHeader onOpenMenu={() => sidebar.setIsMobileOpen(true)} />
        <main key={activeSection} className="page-enter flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>

      {activeSection !== 'mobile_preview' && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-4 right-4 z-30 w-12 h-12 rounded-full bg-white shadow-xl border border-[#CF6811]/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Abrir asistente Noah"
          title="Pregúntale a Noah (Ctrl+K)"
        >
          <NoahOrb state="idle" size="sm" showRipples={false} />
        </button>
      )}

      <SidePanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        title="Noah · Asistente de negocio"
        subtitle="Consulta por voz o escribe tu pregunta"
        width="lg"
      >
        <NoahChat key={`${currentMember.id}-${currentBusiness.id}`} isFullScreen={false} />
      </SidePanel>

      <GuidedTour />
      <ToastContainer />
    </div>
  );
};

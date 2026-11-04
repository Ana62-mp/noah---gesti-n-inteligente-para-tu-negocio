import React from 'react';
import { BellRing, Compass, Eye, Menu as MenuIcon, Settings } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { ROLE_LABELS } from '../../shared/permissions/rolePermissions';
import { getSectionTitle } from './sidebar/navigation.config';

const ICON_BUTTON = 'relative w-9 h-9 rounded-lg flex items-center justify-center text-[#421A05] hover:bg-[#FBF6E6] transition-colors';

export const AppHeader: React.FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => {
  const {
    activeSection,
    setActiveSection,
    currentBusiness,
    team,
    currentMember,
    viewAsMember,
    startGuidedTour,
    canAccess,
    unreadNotificationsCount,
  } = useApp();

  return (
    <header className="shrink-0 h-14 bg-white border-b border-[#EBD48F]/60 px-3 sm:px-5 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onOpenMenu} className={`${ICON_BUTTON} lg:hidden`} aria-label="Abrir menú">
          <MenuIcon className="w-5 h-5" />
        </button>
        <h1 className="font-display font-extrabold text-base sm:text-lg text-[#421A05] truncate">
          {getSectionTitle(activeSection, currentBusiness.type)}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <label className="flex items-center gap-1.5 h-9 px-2 rounded-lg bg-[#FBF6E6] border border-[#EBD48F] text-xs">
          <Eye className="hidden sm:block w-3.5 h-3.5 text-[#CF6811] shrink-0" />
          <span className="hidden md:inline text-[#6B6B6B]">Vista demo</span>
          <select
            value={currentMember.id}
            onChange={(event) => viewAsMember(event.target.value)}
            aria-label="Vista demo"
            className="bg-transparent font-bold text-[#111111] max-w-[92px] sm:max-w-[210px]"
          >
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name.split(' ')[0]} · {ROLE_LABELS[member.role]}
              </option>
            ))}
          </select>
        </label>

        <button onClick={startGuidedTour} className="hidden sm:flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-[#E7E5E0] text-xs font-semibold text-[#111111] hover:bg-[#FBF6E6]">
          <Compass className="w-3.5 h-3.5 text-[#CF6811]" />
          <span className="hidden lg:inline">Recorrido demo</span>
        </button>

        {canAccess('alerts') && (
          <button onClick={() => setActiveSection('alerts')} className={ICON_BUTTON} aria-label={`Notificaciones: ${unreadNotificationsCount} sin revisar`}>
            <BellRing className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-[#A43108] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        {canAccess('settings') && (
          <button onClick={() => setActiveSection('settings')} className={ICON_BUTTON} aria-label="Configuración">
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

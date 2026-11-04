import React, { useState } from 'react';
import { BarChart3, Boxes, CalendarDays, ChefHat, ChevronRight, Settings, Users } from 'lucide-react';
import { useApp } from '../../../shared/context/AppContext';
import { PhoneHeader } from '../components/PhoneChrome';

const WEB_LINKS = [
  { section: 'reports', label: 'Reportes completos', icon: <BarChart3 className="w-4 h-4 text-[#CF6811]" /> },
  { section: 'inventory', label: 'Inventario y bodega', icon: <Boxes className="w-4 h-4 text-[#CF6811]" /> },
  { section: 'kitchen', label: 'Tablero de cocina', icon: <ChefHat className="w-4 h-4 text-[#CF6811]" /> },
  { section: 'appointments', label: 'Agenda de citas', icon: <CalendarDays className="w-4 h-4 text-[#CF6811]" /> },
  { section: 'team', label: 'Equipo y permisos', icon: <Users className="w-4 h-4 text-[#CF6811]" /> },
  { section: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4 text-[#CF6811]" /> },
];

const NOTIFICATION_OPTIONS = [
  { id: 'stock', label: 'Vencimientos y merma' },
  { id: 'margin', label: 'Márgenes bajos' },
  { id: 'daily', label: 'Resumen diario por voz' },
];

export const OwnerMore: React.FC = () => {
  const { setActiveSection, canAccess, currentBusiness } = useApp();
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ stock: true, margin: true, daily: false });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
      <PhoneHeader eyebrow={`${currentBusiness.ownerName} · Administrador`} title="Más opciones" />

      <div className="ph-card p-3 text-[11px] space-y-0.5">
        <div className="font-bold text-xs">{currentBusiness.name}</div>
        <div className="ph-muted">{currentBusiness.city} · USD · {currentBusiness.employeeCount} colaboradores</div>
      </div>

      <div className="ph-card p-3 space-y-2">
        <div className="font-bold text-xs">Notificaciones push (simuladas)</div>
        {NOTIFICATION_OPTIONS.map(({ id, label }) => (
          <label key={id} className="flex items-center justify-between gap-2 text-[11px] cursor-pointer">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={enabled[id]}
              onChange={(event) => setEnabled((prev) => ({ ...prev, [id]: event.target.checked }))}
              className="w-4 h-4 accent-[#CF6811]"
            />
          </label>
        ))}
      </div>

      <div className="ph-card divide-y ph-divide overflow-hidden">
        <div className="px-3 pt-2.5 pb-2 font-bold text-xs">Abrir en la versión web</div>
        {WEB_LINKS.filter(({ section }) => canAccess(section)).map(({ section, label, icon }) => (
          <button key={section} onClick={() => setActiveSection(section)} className="w-full min-h-11 px-3 flex items-center gap-2 text-xs font-semibold text-left">
            {icon}
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-4 h-4 ph-muted" />
          </button>
        ))}
      </div>
    </div>
  );
};

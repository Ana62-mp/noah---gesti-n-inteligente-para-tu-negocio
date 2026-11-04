import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button';

interface AccessDeniedProps {
  roleLabel: string;
  roleScope: string;
  onGoHome?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ roleLabel, roleScope, onGoHome }) => (
  <div className="max-w-md mx-auto mt-12 bg-white rounded-3xl border border-[#EBD48F] p-8 text-center shadow-[var(--shadow-soft)] space-y-3">
    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FBF6E6] border border-[#EBD48F] flex items-center justify-center">
      <ShieldAlert className="w-7 h-7 text-[#A43108]" />
    </div>
    <h2 className="text-lg font-display font-extrabold text-[#421A05]">Esta sección no está en tu perfil</h2>
    <p className="text-sm text-[#6B6B6B]">
      Estás usando el perfil de <strong className="text-[#111111]">{roleLabel}</strong>. {roleScope}
    </p>
    {onGoHome ? (
      <Button variant="primary" onClick={onGoHome}>
        Ir a mi pantalla principal
      </Button>
    ) : (
      <p className="text-xs font-semibold text-[#A43108]">Aún no tienes pantallas asignadas. Pídele acceso al administrador.</p>
    )}
  </div>
);

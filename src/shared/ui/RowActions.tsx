import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface RowActionsProps {
  name: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const BUTTON = 'w-8 h-8 rounded-lg flex items-center justify-center text-[#6B6B6B] hover:bg-[#FBF6E6] hover:text-[#CF6811] transition-colors';

export const RowActions: React.FC<RowActionsProps> = ({ name, onView, onEdit, onDelete }) => (
  <div className="flex items-center justify-end gap-0.5" onClick={(event) => event.stopPropagation()}>
    {onView && (
      <button onClick={onView} className={BUTTON} aria-label={`Ver ${name}`} title="Ver detalle">
        <Eye className="w-4 h-4" />
      </button>
    )}
    {onEdit && (
      <button onClick={onEdit} className={BUTTON} aria-label={`Editar ${name}`} title="Editar">
        <Pencil className="w-4 h-4" />
      </button>
    )}
    {onDelete && (
      <button onClick={onDelete} className={`${BUTTON} hover:!bg-[#F8E4DD] hover:!text-[#A43108]`} aria-label={`Eliminar ${name}`} title="Eliminar">
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
);

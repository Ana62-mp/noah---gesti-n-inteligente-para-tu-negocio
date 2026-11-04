import React, { useState } from 'react';
import { Lock, Search } from 'lucide-react';
import { CATEGORY_LABELS, CatalogModule, filterCatalog, getCatalogFor } from '../business/moduleCatalog';
import { BusinessType, ModuleCategory, ModuleId } from '../types';
import { Badge } from './Badge';

interface ModuleCatalogProps {
  type: BusinessType;
  selected: readonly ModuleId[];
  onToggle: (id: ModuleId) => void;
}

const getTag = (module: CatalogModule, type: BusinessType) => {
  if (module.kind === 'required') return <Badge variant="neutral" size="sm" icon={<Lock className="w-3 h-3" />}>Obligatorio</Badge>;
  if (module.kind === 'future') return <Badge variant="harvest" size="sm">Próximamente</Badge>;
  if (module.recommendedFor.includes(type)) return <Badge variant="cinnamon" size="sm">Recomendado</Badge>;
  return <Badge variant="neutral" size="sm" icon={<span />}>Adicional</Badge>;
};

export const ModuleCatalog: React.FC<ModuleCatalogProps> = ({ type, selected, onToggle }) => {
  const [category, setCategory] = useState<ModuleCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const modules = filterCatalog(type, category, search);
  const categories = [...new Set(getCatalogFor(type).map((module) => module.category))];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#6B6B6B]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar módulo…"
            aria-label="Buscar módulo"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-[#E7E5E0] bg-white text-xs"
          />
        </label>
        <span className="text-xs font-bold text-[#421A05] tabular-nums">
          {selected.filter((id) => getCatalogFor(type).some((module) => module.id === id)).length} activos
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Categorías de módulos">
        {(['all', ...categories] as const).map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={category === id}
            onClick={() => setCategory(id)}
            className={`min-h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
              category === id ? 'bg-[#421A05] text-white' : 'bg-[#F5F4F1] text-[#421A05] hover:bg-[#FBF6E6]'
            }`}
          >
            {id === 'all' ? 'Todos' : CATEGORY_LABELS[id]}
          </button>
        ))}
      </div>

      {modules.length === 0 && <p className="py-6 text-center text-xs text-[#6B6B6B]">No hay módulos con esa búsqueda.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {modules.map((module) => {
          const isOn = selected.includes(module.id);
          const isLocked = module.kind !== 'optional';
          return (
            <label
              key={module.id}
              className={`p-3 rounded-xl border flex items-start gap-2.5 transition-colors ${
                isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${isOn ? 'bg-[#FBF6E6] border-[#CF6811]/50' : 'bg-white border-[#E7E5E0] hover:border-[#D59F3F]/60'} ${
                module.kind === 'future' ? 'opacity-70' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={isOn}
                disabled={isLocked}
                onChange={() => onToggle(module.id)}
                aria-label={module.name}
                className="mt-0.5 w-4 h-4 accent-[#CF6811] shrink-0"
              />
              <span className="flex-1 min-w-0 space-y-1">
                <span className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#111111]">{module.name}</span>
                  {getTag(module, type)}
                </span>
                <span className="block text-[11px] text-[#6B6B6B] leading-snug">{module.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

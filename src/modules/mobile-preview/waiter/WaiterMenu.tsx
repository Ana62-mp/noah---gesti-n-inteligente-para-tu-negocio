import React, { useEffect, useState } from 'react';
import { apiService } from '../../../shared/services/apiService';
import { Dish } from '../../../shared/types';
import { Badge } from '../../../shared/ui/Badge';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { ErrorState } from '../../../shared/ui/ErrorState';
import { getErrorMessage } from '../../../shared/utils/errors';
import { formatCurrency } from '../../../shared/utils/formatters';
import { PhoneHeader } from '../components/PhoneChrome';

const PAGE_SIZE = 15;

export const WaiterMenu: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);
  const filtered = dishes.filter((dish) => dish.name.toLowerCase().includes(search.toLowerCase()));

  const load = async () => {
    setError(null);
    try {
      setDishes(await apiService.getDishes());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
      <PhoneHeader eyebrow="Precios de venta" title="Carta de hoy" />
      <input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setLimit(PAGE_SIZE);
        }}
        placeholder="Buscar plato…"
        aria-label="Buscar plato"
        className="ph-input w-full h-10 rounded-xl px-3 text-xs"
      />
      {error && <ErrorState message={error} onRetry={load} />}
      {!error && filtered.length === 0 && <EmptyState title="Sin resultados" description="Prueba con otro nombre." />}
      {filtered.slice(0, limit).map((dish) => (
        <div key={dish.id} className="ph-card p-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">{dish.name}</div>
            <div className="text-[11px] font-bold tabular-nums ph-muted">{formatCurrency(dish.sellingPrice)}</div>
          </div>
          <Badge variant={dish.isAvailable ? 'olive' : 'terracotta'} size="sm">
            {dish.isAvailable ? 'Disponible' : 'Agotado'}
          </Badge>
        </div>
      ))}
      {filtered.length > limit && (
        <button onClick={() => setLimit((prev) => prev + PAGE_SIZE)} className="w-full min-h-10 text-xs font-bold text-[#CF6811]">
          Ver más platos
        </button>
      )}
    </div>
  );
};

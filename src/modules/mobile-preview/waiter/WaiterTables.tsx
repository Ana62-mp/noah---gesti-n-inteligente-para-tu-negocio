import React, { useEffect, useState } from 'react';
import { Clock, Mic, Receipt } from 'lucide-react';
import { useApp } from '../../../shared/context/AppContext';
import { apiService } from '../../../shared/services/apiService';
import { TableItem } from '../../../shared/types';
import { Badge, BadgeVariant } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { PhoneHeader, PhoneSheet } from '../components/PhoneChrome';

export const WAITER_NAME = 'Ana';

const STATUS: Record<TableItem['status'], { label: string; variant: BadgeVariant }> = {
  free: { label: 'Libre', variant: 'neutral' },
  ordering: { label: 'Pidiendo', variant: 'banana' },
  occupied: { label: 'Ocupada', variant: 'cinnamon' },
  billing: { label: 'Por cobrar', variant: 'terracotta' },
};

export const WaiterTables: React.FC<{ onTakeOrder: (table: number) => void }> = ({ onTakeOrder }) => {
  const { showToast } = useApp();
  const [tables, setTables] = useState<TableItem[]>([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [selected, setSelected] = useState<TableItem | null>(null);
  const visible = onlyMine ? tables.filter((table) => table.waiterName === WAITER_NAME) : tables;

  const load = async () => setTables(await apiService.getTables());

  useEffect(() => {
    load();
  }, []);

  const requestBill = async () => {
    if (!selected) return;
    await apiService.updateTableStatus(selected.id, 'billing');
    showToast(`${selected.name}: Caja ya tiene la cuenta`, 'success');
    setSelected(null);
    load();
  };

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
        <PhoneHeader eyebrow={`${WAITER_NAME} · Mesera`} title="Mesas del salón" />

        <div className="ph-chip flex p-0.5 rounded-xl">
          {[{ value: false, label: 'Todas' }, { value: true, label: 'Mis mesas' }].map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setOnlyMine(value)}
              className={`flex-1 min-h-8 rounded-lg text-[11px] font-bold ${onlyMine === value ? 'gradient-brand text-white' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {visible.map((table) => (
            <button key={table.id} onClick={() => setSelected(table)} className="ph-card p-2.5 text-left space-y-1">
              <div className="flex items-start justify-between gap-1">
                <span className="font-extrabold text-sm">Mesa {table.id}</span>
              </div>
              <Badge variant={STATUS[table.status].variant} size="sm">{STATUS[table.status].label}</Badge>
              <div className="text-[10px] ph-muted truncate">
                {table.seatedAt ? `Desde ${table.seatedAt} · ${table.waiterName}` : `${table.capacity} personas`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <PhoneSheet title={selected.name} onClose={() => setSelected(null)}>
          <div className="flex items-center gap-2 text-[11px] ph-muted">
            <Clock className="w-3.5 h-3.5" />
            <span>{selected.seatedAt ? `Sentados desde las ${selected.seatedAt}` : 'Mesa libre'} · {selected.capacity} personas</span>
          </div>
          <Button variant="primary" className="w-full" leftIcon={<Mic className="w-4 h-4" />} onClick={() => onTakeOrder(selected.id)}>
            Tomar pedido por voz
          </Button>
          {selected.status === 'occupied' && (
            <Button variant="secondary" className="w-full" leftIcon={<Receipt className="w-4 h-4" />} onClick={requestBill}>
              Pedir la cuenta a Caja
            </Button>
          )}
          {selected.status === 'billing' && <p className="text-xs font-bold text-center">Caja ya tiene esta cuenta para cobrar.</p>}
        </PhoneSheet>
      )}
    </>
  );
};

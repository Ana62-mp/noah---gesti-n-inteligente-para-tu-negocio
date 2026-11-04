import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Mic, Minus, Plus, Trash2, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../../shared/context/AppContext';
import { apiService } from '../../../shared/services/apiService';
import { DISHES_MOCK } from '../../../shared/services/mockData';
import { speechService } from '../../../shared/services/speechService';
import { Button } from '../../../shared/ui/Button';
import { NoahOrb } from '../../../shared/ui/NoahOrb';
import { formatCurrency } from '../../../shared/utils/formatters';
import { PhoneHeader } from '../components/PhoneChrome';
import { WAITER_NAME } from './WaiterTables';

type Step = 'idle' | 'listening' | 'review' | 'sent';

interface DraftItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

const LINE_DELAY_MS = 900;
const TABLE_COUNT = 12;

const DIALOGUE = [
  { speaker: 'Cliente', text: 'Queremos dos secos de pollo, por favor.' },
  { speaker: 'Mesero', text: '¿Con arroz y maduro?' },
  { speaker: 'Cliente', text: 'Sí. Y tres ceviches de camarón, uno sin cebolla, con chifles.' },
  { speaker: 'Cliente', text: 'Y una jarra de naranjilla.' },
];

const findPrice = (dishName: string): number =>
  DISHES_MOCK.find((dish) => dish.name.toLowerCase().includes(dishName.toLowerCase()))?.sellingPrice ?? 0;

const buildDetectedOrder = (): DraftItem[] => [
  { name: 'Seco de pollo', quantity: 2, price: findPrice('seco de pollo') },
  { name: 'Ceviche de camarón', quantity: 3, price: findPrice('ceviche de camarón'), notes: '1 sin cebolla, con chifles' },
  { name: 'Jarra de naranjilla', quantity: 1, price: findPrice('naranjilla') },
];

interface WaiterOrderProps {
  tableNumber: number;
  onChangeTable: (table: number) => void;
  onSeeOrders: () => void;
}

export const WaiterOrder: React.FC<WaiterOrderProps> = ({ tableNumber, onChangeTable, onSeeOrders }) => {
  const { showToast, setActiveSection } = useApp();
  const [step, setStep] = useState<Step>('idle');
  const [lines, setLines] = useState(0);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [extraDish, setExtraDish] = useState('');
  const [sentNumber, setSentNumber] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    []
  );

  const listen = () => {
    setStep('listening');
    setLines(0);
    let shown = 0;
    timer.current = setInterval(() => {
      shown += 1;
      setLines(shown);
      if (shown < DIALOGUE.length) return;
      if (timer.current) clearInterval(timer.current);
      setItems(buildDetectedOrder());
      setStep('review');
    }, LINE_DELAY_MS);
  };

  const changeQuantity = (name: string, delta: number) =>
    setItems((prev) =>
      prev.map((item) => (item.name === name ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
    );

  const addDish = () => {
    const dish = DISHES_MOCK.find(({ id }) => id === extraDish);
    if (!dish) return;
    setItems((prev) => [...prev, { name: dish.name, quantity: 1, price: dish.sellingPrice }]);
    setExtraDish('');
  };

  const repeatAloud = () => {
    const summary = items.map((item) => `${item.quantity} ${item.name}${item.notes ? `, ${item.notes}` : ''}`).join('. ');
    speechService.speak(`Mesa ${tableNumber}: ${summary}. Total ${formatCurrency(total)}`);
  };

  const confirm = async () => {
    const orderNumber = apiService.getNextOrderNumber();
    await apiService.addKitchenTicket({
      orderNumber,
      tableNumber,
      channel: 'salon',
      waiterName: WAITER_NAME,
      createdAt: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      status: 'pending',
      urgency: 'normal',
      items: items.map(({ name, quantity, notes }) => ({ dishName: name, quantity, notes })),
    });
    const table = (await apiService.getTables()).find(({ id }) => id === tableNumber);
    await apiService.updateTableStatus(tableNumber, 'occupied', (table?.total ?? 0) + total, WAITER_NAME);
    confetti({ particleCount: 40, spread: 60 });
    setSentNumber(orderNumber);
    setStep('sent');
    showToast(`Comanda ${orderNumber} enviada a Cocina y Caja`, 'success');
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
      <PhoneHeader
        eyebrow="Pedido por voz"
        title={`Mesa ${tableNumber}`}
        right={
          step === 'idle' && (
            <select
              value={tableNumber}
              onChange={(event) => onChangeTable(Number(event.target.value))}
              aria-label="Cambiar de mesa"
              className="ph-input h-9 rounded-xl px-2 text-xs font-bold"
            >
              {Array.from({ length: TABLE_COUNT }, (_, index) => index + 1).map((table) => (
                <option key={table} value={table}>Mesa {table}</option>
              ))}
            </select>
          )
        }
      />

      {step === 'idle' && (
        <div className="ph-card p-5 flex flex-col items-center text-center gap-3">
          <NoahOrb state="idle" size="xl" onClick={listen} />
          <p className="text-xs ph-muted">Toca el orbe y deja el celular escuchando mientras conversas con la mesa.</p>
          <Button variant="primary" className="w-full" leftIcon={<Mic className="w-4 h-4" />} onClick={listen}>
            Tomar pedido por voz
          </Button>
          <p className="text-[10px] ph-muted">Audio simulado para la demostración.</p>
        </div>
      )}

      {step === 'listening' && (
        <div className="ph-card p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#CF6811]">
            <NoahOrb state="listening" size="sm" showRipples={false} />
            Escuchando la mesa…
          </div>
          {DIALOGUE.slice(0, lines).map(({ speaker, text }) => (
            <div key={text} className="text-[11px] page-enter">
              <strong className={speaker === 'Mesero' ? 'text-[#CF6811]' : ''}>{speaker}:</strong> {text}
            </div>
          ))}
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-2">
          <p className="text-[11px] ph-muted">Borrador: revisa y corrige antes de enviar.</p>
          {items.map((item) => (
            <div key={item.name} className="ph-card p-2.5 space-y-1">
              <div className="flex justify-between gap-2 text-xs font-bold">
                <span>{item.name}</span>
                <span className="tabular-nums">{formatCurrency(item.price * item.quantity)}</span>
              </div>
              {item.notes && <div className="text-[11px] text-[#CF6811]">{item.notes}</div>}
              <div className="flex items-center gap-1.5">
                <button onClick={() => changeQuantity(item.name, -1)} className="ph-chip w-8 h-8 rounded-lg flex items-center justify-center" aria-label={`Quitar una unidad de ${item.name}`}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                <button onClick={() => changeQuantity(item.name, 1)} className="ph-chip w-8 h-8 rounded-lg flex items-center justify-center" aria-label={`Agregar una unidad de ${item.name}`}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setItems((prev) => prev.filter(({ name }) => name !== item.name))} className="ml-auto p-1.5 ph-muted" aria-label={`Eliminar ${item.name}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-1.5">
            <select value={extraDish} onChange={(event) => setExtraDish(event.target.value)} aria-label="Agregar otro plato" className="ph-input flex-1 min-w-0 h-9 rounded-xl px-2 text-[11px]">
              <option value="">Agregar otro plato…</option>
              {DISHES_MOCK.filter((dish) => dish.isAvailable && !items.some(({ name }) => name === dish.name)).map((dish) => (
                <option key={dish.id} value={dish.id}>{dish.name}</option>
              ))}
            </select>
            <Button variant="secondary" size="sm" disabled={!extraDish} onClick={addDish}>Agregar</Button>
          </div>

          <div className="flex items-center justify-between text-sm font-black px-1">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
          <Button variant="secondary" className="w-full" leftIcon={<Volume2 className="w-4 h-4" />} onClick={repeatAloud}>
            Repetir en voz alta
          </Button>
          <Button variant="primary" className="w-full" disabled={items.length === 0} onClick={confirm}>
            {items.length === 0 ? 'Agrega al menos un plato' : 'Confirmar y enviar a cocina'}
          </Button>
        </div>
      )}

      {step === 'sent' && (
        <div className="ph-card p-5 flex flex-col items-center text-center gap-2 page-enter">
          <CheckCircle2 className="w-10 h-10 text-[#CF6811]" />
          <div className="font-extrabold text-sm">Comanda {sentNumber} en cocina</div>
          <p className="text-[11px] ph-muted">Ya aparece en el tablero de Cocina y en Mesas de la versión web.</p>
          <Button variant="primary" className="w-full" onClick={onSeeOrders}>Ver mis pedidos</Button>
          <Button variant="secondary" className="w-full" onClick={() => setActiveSection('kitchen')}>Abrir Cocina en la web</Button>
          <Button variant="ghost" size="sm" className="ph-ghost" onClick={() => setStep('idle')}>Tomar otro pedido</Button>
        </div>
      )}
    </div>
  );
};

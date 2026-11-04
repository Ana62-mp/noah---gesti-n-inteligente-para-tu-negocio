import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { formatCurrency } from '../../shared/utils/formatters';

type EntryKind = 'income' | 'expense';

const TODAY = '2026-11-03';
const FIELD = 'w-full border border-[#E7E5E0] rounded-xl p-2.5 text-sm bg-[#F5F4F1] focus:bg-white';

export const StoreQuickEntry: React.FC = () => {
  const { showToast } = useApp();
  const [kind, setKind] = useState<EntryKind | null>(null);
  const [amount, setAmount] = useState('');
  const [detail, setDetail] = useState('');
  const parsedAmount = Number(amount.replace(',', '.'));
  const isValid = parsedAmount > 0 && (kind === 'income' || detail.trim().length > 0);

  const close = () => {
    setKind(null);
    setAmount('');
    setDetail('');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    if (kind === 'income') {
      await apiService.addSale({
        date: TODAY,
        time: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        channel: 'counter',
        items: [{ dishId: 'venta-rapida', dishName: detail.trim() || 'Venta de mostrador', quantity: 1, unitPrice: parsedAmount, subtotal: parsedAmount }],
        subtotal: parsedAmount,
        tax: parsedAmount * 0.15,
        total: parsedAmount,
        paymentMethod: 'cash',
        status: 'completed',
      });
    } else {
      await apiService.addExpense({ date: TODAY, concept: 'Compra a proveedor', category: 'insumos', supplier: detail.trim(), amount: parsedAmount, paymentMethod: 'cash' });
    }
    confetti({ particleCount: 30, spread: 50 });
    showToast(`${kind === 'income' ? 'Ingreso' : 'Egreso'} de ${formatCurrency(parsedAmount)} guardado`, 'success');
    close();
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setKind('income')} className="min-h-16 rounded-2xl bg-[#5C5011] hover:brightness-110 text-white font-display font-extrabold text-base flex items-center justify-center gap-2 shadow-md">
          <Plus className="w-5 h-5" /> Ingreso
        </button>
        <button onClick={() => setKind('expense')} className="min-h-16 rounded-2xl bg-[#A43108] hover:brightness-110 text-white font-display font-extrabold text-base flex items-center justify-center gap-2 shadow-md">
          <Minus className="w-5 h-5" /> Egreso
        </button>
      </div>

      <Modal
        isOpen={kind !== null}
        onClose={close}
        title={kind === 'income' ? 'Registrar ingreso' : 'Registrar egreso'}
        subtitle={kind === 'income' ? 'Venta de mostrador' : 'Factura o nota de venta de un proveedor'}
        maxWidth="sm"
      >
        <form onSubmit={save} className="space-y-3 text-xs">
          <label className="block font-semibold text-[#111111]">
            Monto ($)
            <input autoFocus inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className={`${FIELD} mt-1 font-bold`} />
          </label>
          <label className="block font-semibold text-[#111111]">
            {kind === 'income' ? 'Detalle (opcional)' : 'Proveedor'}
            <input value={detail} onChange={(event) => setDetail(event.target.value)} className={`${FIELD} mt-1 font-normal`} />
          </label>
          <Button variant="primary" className="w-full" type="submit" disabled={!isValid}>
            {parsedAmount > 0 ? 'Guardar' : 'Escribe el monto'}
          </Button>
        </form>
      </Modal>
    </>
  );
};

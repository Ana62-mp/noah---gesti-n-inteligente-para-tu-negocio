import React, { useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { STORE_MONTHLY_DATA } from '../../shared/services/mockData';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import {
  ShoppingBag,
  Plus,
  Minus,
  Mic,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StoreModeView: React.FC = () => {
  const { showToast, setIsAssistantOpen } = useApp();
  const [invoices, setInvoices] = useState(STORE_MONTHLY_DATA.recentInvoices);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Quick entry states
  const [entryAmount, setEntryAmount] = useState<number>(25.00);
  const [entryConcept, setEntryConcept] = useState('');
  const [entrySupplier, setEntrySupplier] = useState('');

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {}
    setIsIncomeModalOpen(false);
    showToast(`Venta por ${formatCurrency(entryAmount)} registrada en caja diaria`, 'success');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv = {
      id: `inv-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      supplier: entrySupplier || 'Distribuidor de abarrotes',
      amount: entryAmount,
      type: 'nota_de_venta',
    };
    setInvoices([newInv, ...invoices]);
    setIsExpenseModalOpen(false);
    showToast(`Comprobante por ${formatCurrency(entryAmount)} guardado en compras`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Plan Básico Banner */}
      <div className="bg-[#FBF6E6] border border-[#EBD48F] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBD48F] flex items-center justify-center text-[#421A05] font-extrabold text-sm shrink-0">
            PB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#421A05]">
                Tienda Doña Rosa (Guayaquil) · Modo Tienda Simplificado
              </h3>
              <Badge variant="olive" size="sm">Plan Básico</Badge>
            </div>
            <p className="text-xs text-[#6B6B6B]">
              Diseñado para microcomercios que no requieren costeo de platos ni inventario complejo.
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast('Puedes activar el módulo de Insumos en el catálogo de personalización', 'info')}
          className="text-xs font-bold text-[#CF6811] hover:underline flex items-center gap-1 self-start sm:self-center"
        >
          <span>Activar Inventario como adicional</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Large KPI Cards (Simplificación visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-[#E7E5E0] shadow-[var(--shadow-soft)] flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C5011]">
            Ingresos del Mes (Octubre)
          </span>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-[#5C5011] tabular-nums my-3">
            $4.800,00
          </div>
          <div className="text-xs text-[#6B6B6B]">Ventas de mostrador y cobros DeUna</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E7E5E0] shadow-[var(--shadow-soft)] flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A43108]">
            Egresos del Mes (Compras)
          </span>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-[#A43108] tabular-nums my-3">
            $3.650,00
          </div>
          <div className="text-xs text-[#6B6B6B]">20 facturas y notas de venta de proveedores</div>
        </div>

        <div className="bg-[#FBF6E6] rounded-3xl p-6 border border-[#EBD48F] shadow-[var(--shadow-soft)] flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#421A05]">
            Resultado Aproximado
          </span>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-[#421A05] tabular-nums my-3">
            ≈ $1.150,00
          </div>
          <div className="text-xs text-[#8A7424] font-medium">
            * Te quedan aprox. $1.150 antes de pagar el arriendo ($350)
          </div>
        </div>
      </div>

      {/* TWO GIANT ACTION BUTTONS: + Ingreso & + Egreso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setIsIncomeModalOpen(true)}
          className="bg-[#5C5011] hover:bg-[#483F0D] text-white p-6 rounded-3xl shadow-md transition-all flex items-center justify-center gap-4 active:scale-98 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Plus className="w-7 h-7" />
          </div>
          <div className="text-left">
            <div className="text-xl font-extrabold font-display">+ Registrar Ingreso</div>
            <div className="text-xs text-white/80">Cobro rápido en mostrador</div>
          </div>
        </button>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="bg-[#A43108] hover:bg-[#8A2906] text-white p-6 rounded-3xl shadow-md transition-all flex items-center justify-center gap-4 active:scale-98 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Minus className="w-7 h-7" />
          </div>
          <div className="text-left">
            <div className="text-xl font-extrabold font-display">+ Registrar Egreso</div>
            <div className="text-xs text-white/80">Factura o nota de compra</div>
          </div>
        </button>
      </div>

      {/* Noah's Store Insight */}
      <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-[var(--shadow-soft)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NoahOrb state="idle" size="md" />
          <div>
            <div className="text-sm font-bold text-[#111111]">
              "Doña Rosa, este mes vendiste $4.800 y gastaste $3.650. Te quedan aprox. $1.150 antes de pagar el arriendo."
            </div>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Puedes consultarme por voz o tocar el micrófono para registrar facturas al vuelo.
            </p>
          </div>
        </div>

        <Button
          variant="cinnamon"
          size="sm"
          leftIcon={<Mic className="w-4 h-4" />}
          onClick={() => setIsAssistantOpen(true)}
        >
          Hablar con Noah
        </Button>
      </div>

      {/* Recent Supplier Receipts Table */}
      <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-[var(--shadow-soft)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#111111]">
              Facturas y Notas de Venta de Proveedores
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              Distribuidoras de bebidas, lácteos, pan y confitería
            </p>
          </div>
          <span className="text-xs text-[#6B6B6B]">Lectura automática OCR: Próximamente</span>
        </div>

        <div className="divide-y divide-[#E7E5E0]">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F4F1] flex items-center justify-center text-[#6B6B6B]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111111]">{inv.supplier}</div>
                  <div className="text-[11px] text-[#6B6B6B]">
                    {formatDate(inv.date)} ·{' '}
                    <span className="capitalize">{inv.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold font-mono text-[#A43108] tabular-nums">
                  -{formatCurrency(inv.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: + Ingreso */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Registrar Ingreso en Tienda"
        subtitle="Venta en mostrador de víveres o abarrotes"
      >
        <form onSubmit={handleAddIncome} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#111111] block mb-1">Monto del cobro ($ USD):</label>
            <input
              type="number"
              step="0.5"
              value={entryAmount}
              onChange={(e) => setEntryAmount(parseFloat(e.target.value) || 0)}
              className="w-full border border-[#E7E5E0] rounded-xl p-3 text-base text-[#111111] font-bold font-mono bg-[#F5F4F1] focus:bg-white"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-[#111111] block mb-1">Detalle opcional:</label>
            <input
              type="text"
              value={entryConcept}
              onChange={(e) => setEntryConcept(e.target.value)}
              placeholder="Ej. Compra de víveres / golosinas / leche"
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsIncomeModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar ingreso
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: + Egreso */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Registrar Nota de Compra a Proveedor"
        subtitle="Ingresa el monto pagado a distribuidoras"
      >
        <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#111111] block mb-1">Distribuidor / Proveedor:</label>
            <input
              type="text"
              value={entrySupplier}
              onChange={(e) => setEntrySupplier(e.target.value)}
              placeholder="Ej. Coca-Cola, Toni, Panadería"
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-[#111111] block mb-1">Monto ($ USD):</label>
            <input
              type="number"
              step="0.5"
              value={entryAmount}
              onChange={(e) => setEntryAmount(parseFloat(e.target.value) || 0)}
              className="w-full border border-[#E7E5E0] rounded-xl p-3 text-base text-[#111111] font-bold font-mono bg-[#F5F4F1] focus:bg-white"
              required
            />
          </div>
          <div className="p-3 bg-[#FAFAF8] rounded-xl border border-dashed border-[#E7E5E0] text-center">
            <Camera className="w-5 h-5 text-[#CF6811] mx-auto mb-1" />
            <span className="text-[11px] text-[#6B6B6B]">Foto opcional de la factura</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsExpenseModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar compra
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

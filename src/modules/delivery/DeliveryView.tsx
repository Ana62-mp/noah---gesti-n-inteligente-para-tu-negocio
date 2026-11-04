import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { DeliveryOrder } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { formatCurrency } from '../../shared/utils/formatters';
import {
  Bike,
  Plus,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const DeliveryView: React.FC = () => {
  const { showToast } = useApp();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New takeout order form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('099 123 4567');
  const [dishName, setDishName] = useState('Encebollado mixto de albacora');
  const [quantity, setQuantity] = useState(2);
  const [channel, setChannel] = useState<DeliveryOrder['channel']>('propio');

  useEffect(() => {
    loadDeliveryOrders();
  }, []);

  const loadDeliveryOrders = async () => {
    const data = await apiService.getDeliveryOrders();
    setOrders(data);
  };

  const handleUpdateStatus = async (orderId: string, status: DeliveryOrder['status']) => {
    await apiService.updateDeliveryStatus(orderId, status);
    showToast(`Estado de pedido ${orderId} actualizado`, 'info');
    loadDeliveryOrders();
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: DeliveryOrder = {
      id: `del-${Date.now()}`,
      orderNumber: `#D-${Math.floor(Math.random() * 900 + 100)}`,
      channel,
      channelLabel: channel === 'propio' ? 'Pedido Directo (WhatsApp)' : channel.toUpperCase(),
      customerName,
      customerPhone,
      address: 'Retiro en local / Salón',
      status: 'received',
      items: [{ dishName, quantity, price: 4.50 }],
      total: 4.50 * quantity,
      estimatedMinutes: 20,
      createdAt: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      isSimulatedIntegration: channel !== 'propio',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setIsModalOpen(false);
    setCustomerName('');
    showToast('Pedido para llevar creado y enrutado a cocina', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-[#CF6811]" />
            <h2 className="text-lg font-bold text-[#111111]">Delivery y Para Llevar</h2>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Gestión de canales propios y pedidos de plataformas externas.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo pedido para llevar
        </Button>
      </div>

      {/* Integration Disclaimer Banner (RN-09 & CA-09) */}
      <div className="bg-[#FBF6E6] border border-[#EBD48F] rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#CF6811] shrink-0 mt-0.5" />
        <div className="text-xs text-[#421A05] leading-relaxed">
          <strong className="font-bold">Aviso de Integraciones Externas:</strong> Las plataformas externas de delivery
          se muestran como <em>"App delivery A, B, C"</em> con fines de validación UX. Todas las APIs de terceros
          requieren acuerdos comerciales y credenciales oficiales, por lo que figuran como <strong>"Integración pendiente"</strong>.
        </div>
      </div>

      {/* Channels Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((o) => {
          const statusLabels: Record<DeliveryOrder['status'], { label: string; v: 'banana' | 'harvest' | 'cinnamon' | 'olive' }> = {
            received: { label: 'Recibido', v: 'banana' },
            in_kitchen: { label: 'En cocina', v: 'harvest' },
            on_the_way: { label: 'En camino', v: 'cinnamon' },
            delivered: { label: 'Entregado', v: 'olive' },
          };

          const st = statusLabels[o.status];

          return (
            <div
              key={o.id}
              className="bg-white rounded-2xl border border-[#E7E5E0] p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-display font-extrabold text-base text-[#111111]">
                      {o.orderNumber}
                    </span>
                    <div className="text-xs text-[#6B6B6B]">{o.channelLabel}</div>
                  </div>
                  <Badge variant={st.v} size="sm">
                    {st.label}
                  </Badge>
                </div>

                {/* External simulated integration badge */}
                {o.isSimulatedIntegration && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7E5E0]/60 text-[#6B6B6B]">
                    <AlertCircle className="w-3 h-3 text-[#D59F3F]" />
                    <span>Integración pendiente</span>
                  </div>
                )}

                {/* Customer Details */}
                <div className="space-y-1 text-xs text-[#6B6B6B]">
                  <div className="font-bold text-[#111111]">{o.customerName}</div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#CF6811]" />
                    <span>{o.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A43108] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{o.address}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-[#FAFAF8] p-3 rounded-xl border border-[#E7E5E0] text-xs space-y-1">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.quantity}x {it.dishName}</span>
                      <span className="font-bold font-mono">${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-[#E7E5E0] pt-1.5 flex justify-between font-bold text-[#111111]">
                    <span>Total pedido:</span>
                    <span className="font-mono text-sm">{formatCurrency(o.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status workflow transitions */}
              <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-between text-xs">
                {o.status === 'received' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpdateStatus(o.id, 'in_kitchen')}
                  >
                    Pasar a Cocina →
                  </Button>
                )}
                {o.status === 'in_kitchen' && (
                  <Button
                    variant="cinnamon"
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpdateStatus(o.id, 'on_the_way')}
                  >
                    Despachar con motorizado →
                  </Button>
                )}
                {o.status === 'on_the_way' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpdateStatus(o.id, 'delivered')}
                  >
                    Marcar como entregado ✓
                  </Button>
                )}
                {o.status === 'delivered' && (
                  <div className="w-full text-center text-xs font-bold text-[#5C5011] py-1 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Entregado con éxito
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Takeout Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Pedido Para Llevar"
        subtitle="Registra un pedido telefónico, por WhatsApp o en mostrador"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#111111] block mb-1">Nombre del cliente:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Ing. Daniel Ortiz"
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Teléfono:</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Canal:</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              >
                <option value="propio">WhatsApp / Mostrador propio</option>
                <option value="delivery_a">App Delivery A (Simulado)</option>
                <option value="delivery_b">App Delivery B (Simulado)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#111111] block mb-1">Plato a ordenar:</label>
            <select
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
            >
              <option value="Encebollado mixto de albacora">Encebollado mixto ($4,50)</option>
              <option value="Seco de pollo">Seco de pollo ($5,50)</option>
              <option value="Ceviche de camarón">Ceviche de camarón ($9,00)</option>
              <option value="Churrasco ecuatoriano">Churrasco ($6,50)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Crear pedido
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

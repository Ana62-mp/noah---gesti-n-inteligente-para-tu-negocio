import React from 'react';
import { Cake, Mail, MapPin, Phone, StickyNote } from 'lucide-react';
import { Customer } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { getCustomerKind } from './customerForm';

interface CustomerDetailProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onSettle: (customer: Customer) => void;
}

const Row: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5 text-xs">
    <span className="mt-0.5 text-[#CF6811]">{icon}</span>
    <span className="w-24 shrink-0 text-[#6B6B6B]">{label}</span>
    <span className="font-semibold text-[#111111] break-words min-w-0">{value || 'Sin registrar'}</span>
  </div>
);

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, onClose, onEdit, onDelete, onSettle }) => (
  <Modal isOpen={customer !== null} onClose={onClose} title={customer?.name} subtitle={customer ? `${getCustomerKind(customer.documentId)} · cliente desde ${formatDate(customer.createdAt)}` : undefined} maxWidth="xl">
    {customer && (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Visitas', value: String(customer.visits) },
            { label: 'Total comprado', value: formatCurrency(customer.totalSpent) },
            { label: 'Saldo pendiente', value: formatCurrency(customer.balanceDue) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-[#FBF6E6] border border-[#EBD48F] py-2">
              <div className="text-[10px] font-bold uppercase text-[#6B6B6B]">{label}</div>
              <div className="text-base font-black tabular-nums text-[#111111]">{value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Row icon={<Phone className="w-4 h-4" />} label="Teléfono" value={customer.phone} />
          <Row icon={<Mail className="w-4 h-4" />} label="Correo" value={customer.email} />
          <Row icon={<MapPin className="w-4 h-4" />} label="Dirección" value={[customer.address, customer.city].filter(Boolean).join(', ')} />
          <Row icon={<Cake className="w-4 h-4" />} label="Cumpleaños" value={customer.birthday ? formatDate(customer.birthday) : ''} />
          <Row icon={<StickyNote className="w-4 h-4" />} label="Notas" value={customer.notes} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" size="sm" icon={<span />}>Documento: {customer.documentId || 'sin registrar'}</Badge>
          <Badge variant={customer.marketingOptIn ? 'olive' : 'neutral'} size="sm" icon={<span />}>{customer.marketingOptIn ? 'Acepta promociones' : 'Sin promociones'}</Badge>
          <span className="text-[11px] text-[#6B6B6B]">Última visita: {formatDate(customer.lastVisit)}</span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#E7E5E0]">
          {customer.balanceDue > 0 && <Button variant="cinnamon" size="sm" onClick={() => onSettle(customer)}>Registrar pago de {formatCurrency(customer.balanceDue)}</Button>}
          <Button variant="secondary" size="sm" onClick={() => onEdit(customer)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(customer)}>Eliminar</Button>
        </div>
      </div>
    )}
  </Modal>
);

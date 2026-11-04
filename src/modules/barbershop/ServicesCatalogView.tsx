import React, { useState } from 'react';
import { CalendarPlus, Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { FormField, FormValues, parseMoney } from '../../shared/forms/validators';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { apiService } from '../../shared/services/apiService';
import { crud } from '../../shared/services/crudService';
import { BarberService } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { EmptyState } from '../../shared/ui/EmptyState';
import { FilterBar } from '../../shared/ui/FilterBar';
import { FormModal } from '../../shared/ui/FormModal';
import { Pagination } from '../../shared/ui/Pagination';
import { StatStrip } from '../../shared/ui/StatStrip';
import { formatCurrency } from '../../shared/utils/formatters';

const CATEGORIES = ['Corte', 'Barba', 'Combo', 'Tratamiento'];
const PAGE_SIZES = [8, 16, 32];
const DEFAULT_PAGE_SIZE = 8;

const FIELDS: FormField[] = [
  { key: 'name', label: 'Nombre del servicio', type: 'text', required: true, span: 2, placeholder: 'Ej. Corte clásico' },
  { key: 'category', label: 'Categoría', type: 'select', required: true, options: CATEGORIES.map((value) => ({ value, label: value })) },
  { key: 'price', label: 'Precio ($)', type: 'money', required: true, min: 0.5, max: 500, placeholder: '8,00' },
  { key: 'durationMinutes', label: 'Duración (minutos)', type: 'number', required: true, min: 5, max: 240, help: 'Define cuánto bloquea la agenda.' },
  { key: 'isActive', label: 'Estado', type: 'checkbox', placeholder: 'Disponible para agendar' },
  { key: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Qué incluye el servicio' },
];

const toValues = (service?: BarberService): FormValues => ({
  name: service?.name ?? '',
  category: service?.category ?? CATEGORIES[0],
  price: service ? String(service.price).replace('.', ',') : '',
  durationMinutes: service ? String(service.durationMinutes) : '30',
  isActive: service?.isActive ?? true,
  description: service?.description ?? '',
});

export const ServicesCatalogView: React.FC = () => {
  const { setActiveSection, canAccess, showToast } = useApp();
  const list = usePagedList((params) => apiService.getServicesPage(params), 'all', DEFAULT_PAGE_SIZE);
  const [editing, setEditing] = useState<BarberService | 'new' | null>(null);
  const [deleting, setDeleting] = useState<BarberService | null>(null);
  const all = apiService.listServices();
  const maxBookings = Math.max(...all.map((service) => service.bookingsThisMonth), 1);
  const topService = [...all].sort((a, b) => b.bookingsThisMonth - a.bookingsThisMonth)[0];
  const monthIncome = all.reduce((sum, service) => sum + service.price * service.bookingsThisMonth, 0);

  const save = async (values: FormValues) => {
    const data = {
      name: String(values.name).trim(),
      category: String(values.category),
      price: parseMoney(String(values.price)),
      durationMinutes: Number(values.durationMinutes),
      isActive: Boolean(values.isActive),
      description: String(values.description).trim(),
    };
    if (editing === 'new') await crud.create<BarberService>('services', { ...data, bookingsThisMonth: 0 });
    else if (editing) await crud.update<BarberService>('services', editing.id, data);
    showToast(editing === 'new' ? `"${data.name}" se agregó al catálogo` : `"${data.name}" actualizado`, 'success');
    setEditing(null);
    list.reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await crud.remove('services', deleting.id);
    showToast(`"${deleting.name}" se eliminó del catálogo`, 'info');
    setDeleting(null);
    list.reload();
  };

  return (
    <div className="space-y-4">
      <StatStrip
        stats={[
          { label: 'Servicios', value: String(all.length), hint: `${all.filter((s) => s.isActive).length} disponibles`, tone: 'cinnamon' },
          { label: 'Más pedido', value: topService?.name ?? '—', hint: `${topService?.bookingsThisMonth ?? 0} citas en octubre`, tone: 'olive' },
          { label: 'Ingreso estimado', value: formatCurrency(monthIncome), hint: 'Citas de octubre por tarifa', tone: 'banana' },
          { label: 'Duración promedio', value: `${Math.round(all.reduce((sum, s) => sum + s.durationMinutes, 0) / Math.max(all.length, 1))} min`, hint: 'Por servicio', tone: 'harvest' },
        ]}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#6B6B6B]">Cada servicio define su precio y cuánto tiempo bloquea la agenda.</p>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setEditing('new')}>Nuevo servicio</Button>
      </div>
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar servicio…' }}
        fields={[
          { key: 'filter', label: 'Categoría', type: 'select', options: [{ value: 'all', label: 'Todas' }, ...CATEGORIES.map((value) => ({ value, label: value }))] },
          { key: 'status', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'active', label: 'Disponibles' }, { value: 'inactive', label: 'Pausados' }] },
        ]}
        values={list.fieldValues}
        onChange={list.setField}
        onReset={list.reset}
        activeCount={list.activeFilters}
        total={list.result.total}
        totalLabel="servicios"
      />

      {list.result.total === 0 && !list.isLoading ? (
        <EmptyState title="Sin servicios para mostrar" description="Prueba con otro filtro o crea un servicio." actionLabel="Nuevo servicio" onAction={() => setEditing('new')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {list.result.items.map((service) => (
            <article key={service.id} className={`card-lift bg-white rounded-2xl border border-[#E7E5E0] border-t-4 p-4 flex flex-col gap-2 ${service.isActive ? 'border-t-[#CF6811]' : 'border-t-[#8C8479] opacity-80'}`}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display font-extrabold text-sm text-[#111111] leading-tight">{service.name}</h2>
                <Badge variant={service.isActive ? 'olive' : 'neutral'} size="sm" icon={<span />}>{service.isActive ? 'Disponible' : 'Pausado'}</Badge>
              </div>
              <span className="text-[11px] font-semibold text-[#8A7424]">{service.category}</span>
              <p className="flex-1 text-xs text-[#6B6B6B] leading-snug">{service.description || 'Sin descripción'}</p>
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#6B6B6B] mb-1">
                  <span>{service.bookingsThisMonth} citas en octubre</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{service.durationMinutes} min</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#F5F4F1] overflow-hidden"><div className="h-full rounded-full bg-[#CF6811]" style={{ width: `${(service.bookingsThisMonth / maxBookings) * 100}%` }} /></div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-lg font-black tabular-nums text-[#111111]">{formatCurrency(service.price)}</span>
                <div className="flex items-center gap-1">
                  {canAccess('appointments') && service.isActive && (
                    <button onClick={() => setActiveSection('appointments')} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B6B6B] hover:bg-[#FBF6E6] hover:text-[#CF6811]" aria-label={`Agendar ${service.name}`} title="Agendar"><CalendarPlus className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => setEditing(service)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B6B6B] hover:bg-[#FBF6E6] hover:text-[#CF6811]" aria-label={`Editar ${service.name}`} title="Editar"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleting(service)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B6B6B] hover:bg-[#F8E4DD] hover:text-[#A43108]" aria-label={`Eliminar ${service.name}`} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {list.result.total > 0 && (
        <div className="rounded-xl overflow-hidden border border-[#E7E5E0]">
          <Pagination page={list.result.page} pageSize={list.result.pageSize} total={list.result.total} totalPages={list.result.totalPages} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} sizes={PAGE_SIZES} />
        </div>
      )}

      <FormModal
        isOpen={editing !== null}
        title={editing === 'new' ? 'Nuevo servicio' : 'Editar servicio'}
        fields={FIELDS}
        initialValues={editing && editing !== 'new' ? toValues(editing) : toValues()}
        submitLabel={editing === 'new' ? 'Guardar servicio' : 'Guardar cambios'}
        onClose={() => setEditing(null)}
        onSubmit={save}
      />
      <ConfirmDialog isOpen={deleting !== null} title="¿Eliminar este servicio?" message={`"${deleting?.name ?? ''}" dejará de aparecer al agendar. Las citas ya creadas se conservan.`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </div>
  );
};

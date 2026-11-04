import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { apiService } from '../../shared/services/apiService';
import { crud } from '../../shared/services/crudService';
import { Customer } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';
import { FilterBar } from '../../shared/ui/FilterBar';
import { FormModal } from '../../shared/ui/FormModal';
import { Column, PaginatedTable } from '../../shared/ui/PaginatedTable';
import { RowActions } from '../../shared/ui/RowActions';
import { StatStrip } from '../../shared/ui/StatStrip';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import { FormValues } from '../../shared/forms/validators';
import { CustomerDetail } from './CustomerDetail';
import { CUSTOMER_FIELDS, emptyCustomerValues, fromCustomerValues, toCustomerValues } from './customerForm';

const FREQUENT_VISITS = 15;
const TODAY = '2026-11-03';

export const CustomersView: React.FC = () => {
  const { showToast, currentBusiness } = useApp();
  const list = usePagedList((params) => apiService.getCustomers(params));
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const all = apiService.getCollection('customers') as Customer[];
  const city = currentBusiness.city.split(' ')[0];

  const stats = [
    { label: 'Clientes', value: String(all.length), hint: `${all.filter((c) => c.createdAt >= '2026-07-01').length} nuevos desde julio`, tone: 'cinnamon' as const },
    { label: 'Por cobrar', value: formatCurrency(all.reduce((sum, c) => sum + c.balanceDue, 0)), hint: `${all.filter((c) => c.balanceDue > 0).length} clientes con saldo`, tone: 'terracotta' as const },
    { label: 'Frecuentes', value: String(all.filter((c) => c.visits >= FREQUENT_VISITS).length), hint: `${FREQUENT_VISITS} o más visitas`, tone: 'olive' as const },
    { label: 'Aceptan promociones', value: String(all.filter((c) => c.marketingOptIn).length), hint: 'Listos para recibir ofertas', tone: 'banana' as const },
  ];

  const save = async (values: FormValues) => {
    const data = fromCustomerValues(values);
    if (editing === 'new') {
      await crud.create<Customer>('customers', { ...data, createdAt: TODAY, lastVisit: TODAY, visits: 0, totalSpent: 0, balanceDue: 0 });
      showToast(`${data.name} se agregó a tus clientes`, 'success');
    } else if (editing) {
      await crud.update<Customer>('customers', editing.id, data);
      showToast(`Datos de ${data.name} actualizados`, 'success');
    }
    setEditing(null);
    setViewing(null);
    list.reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await crud.remove('customers', deleting.id);
    showToast(`${deleting.name} se eliminó de tus clientes`, 'info');
    setDeleting(null);
    setViewing(null);
    list.reload();
  };

  const settle = async (customer: Customer) => {
    await apiService.settleCustomerBalance(customer.id);
    showToast(`${customer.name}: pago de ${formatCurrency(customer.balanceDue)} registrado`, 'success');
    setViewing(null);
    list.reload();
  };

  const columns: Column<Customer>[] = [
    { header: 'Cliente', accessor: (c) => (<div><div className="text-xs font-bold text-[#111111]">{c.name}</div><div className="text-[11px] text-[#6B6B6B]">{c.documentId || 'Sin documento'}</div></div>) },
    { header: 'Contacto', accessor: (c) => (<div className="text-xs"><div>{c.phone}</div><div className="text-[11px] text-[#6B6B6B] truncate max-w-[190px]">{c.email || 'Sin correo'}</div></div>) },
    { header: 'Última visita', accessor: (c) => <span className="text-xs">{formatDate(c.lastVisit)}</span> },
    { header: 'Visitas', align: 'right', accessor: (c) => <span className="text-xs tabular-nums">{c.visits}</span> },
    { header: 'Total', align: 'right', accessor: (c) => <span className="text-xs font-semibold tabular-nums">{formatCurrency(c.totalSpent)}</span> },
    { header: 'Saldo', align: 'right', accessor: (c) => (c.balanceDue > 0 ? <Badge variant="terracotta" size="sm">{formatCurrency(c.balanceDue)}</Badge> : <Badge variant="olive" size="sm">Al día</Badge>) },
    { header: '', align: 'right', accessor: (c) => <RowActions name={c.name} onView={() => setViewing(c)} onEdit={() => setEditing(c)} onDelete={() => setDeleting(c)} /> },
  ];

  return (
    <div className="space-y-4">
      <StatStrip stats={stats} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#6B6B6B]">Guarda los datos que realmente necesitas para facturar, contactar y fidelizar.</p>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setEditing('new')}>Nuevo cliente</Button>
      </div>
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar por nombre, cédula, teléfono o correo…' }}
        fields={[
          { key: 'filter', label: 'Saldo', type: 'select', options: [{ value: 'all', label: 'Todos' }, { value: 'owing', label: 'Con saldo pendiente' }] },
          { key: 'frequency', label: 'Frecuencia', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'frequent', label: 'Frecuentes (15+ visitas)' }, { value: 'occasional', label: 'Ocasionales' }] },
        ]}
        values={list.fieldValues}
        onChange={list.setField}
        onReset={list.reset}
        activeCount={list.activeFilters}
        total={list.result.total}
        totalLabel="clientes"
      />
      <PaginatedTable
        columns={columns}
        data={list.result.items}
        total={list.result.total}
        page={list.result.page}
        pageSize={list.result.pageSize}
        totalPages={list.result.totalPages}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={list.reload}
        onRowClick={setViewing}
        emptyTitle="Sin clientes para mostrar"
        emptyDescription="Prueba con otro filtro o agrega tu primer cliente."
        emptyAction={{ label: 'Nuevo cliente', onClick: () => setEditing('new') }}
        rowKey={(c) => c.id}
      />

      <CustomerDetail customer={viewing} onClose={() => setViewing(null)} onEdit={(c) => { setViewing(null); setEditing(c); }} onDelete={setDeleting} onSettle={settle} />
      <FormModal
        isOpen={editing !== null}
        title={editing === 'new' ? 'Nuevo cliente' : 'Editar cliente'}
        subtitle="Los campos con * son obligatorios"
        fields={CUSTOMER_FIELDS}
        initialValues={editing && editing !== 'new' ? toCustomerValues(editing) : emptyCustomerValues(city)}
        submitLabel={editing === 'new' ? 'Guardar cliente' : 'Guardar cambios'}
        onClose={() => setEditing(null)}
        onSubmit={save}
      />
      <ConfirmDialog isOpen={deleting !== null} title="¿Eliminar este cliente?" message={`Se borrará la ficha de ${deleting?.name ?? ''}. Esta acción no se puede deshacer.`} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />
    </div>
  );
};

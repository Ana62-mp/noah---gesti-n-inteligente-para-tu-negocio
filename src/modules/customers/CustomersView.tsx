import React from 'react';
import { useApp } from '../../shared/context/AppContext';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { apiService } from '../../shared/services/apiService';
import { Customer } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
import { FilterBar } from '../../shared/ui/FilterBar';
import { Button } from '../../shared/ui/Button';
import { Column, PaginatedTable } from '../../shared/ui/PaginatedTable';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'owing', label: 'Con saldo pendiente' },
];

export const CustomersView: React.FC = () => {
  const { showToast } = useApp();
  const list = usePagedList((params) => apiService.getCustomers(params));

  const settle = async (customer: Customer) => {
    await apiService.settleCustomerBalance(customer.id);
    showToast(`${customer.name}: pago de ${formatCurrency(customer.balanceDue)} registrado`, 'success');
    list.reload();
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Cliente',
      accessor: (customer) => (
        <div>
          <div className="text-xs font-bold text-[#111111]">{customer.name}</div>
          <div className="text-[11px] text-[#6B6B6B]">{customer.phone}</div>
        </div>
      ),
    },
    { header: 'Última visita', accessor: (customer) => <span className="text-xs">{formatDate(customer.lastVisit)}</span> },
    { header: 'Visitas', align: 'right', accessor: (customer) => <span className="text-xs tabular-nums">{customer.visits}</span> },
    { header: 'Total comprado', align: 'right', accessor: (customer) => <span className="text-xs font-semibold tabular-nums">{formatCurrency(customer.totalSpent)}</span> },
    {
      header: 'Saldo',
      align: 'right',
      accessor: (customer) =>
        customer.balanceDue > 0 ? (
          <div className="flex items-center justify-end gap-2">
            <Badge variant="terracotta" size="sm">{formatCurrency(customer.balanceDue)}</Badge>
            <Button variant="secondary" size="sm" onClick={() => settle(customer)}>Registrar pago</Button>
          </div>
        ) : (
          <Badge variant="olive" size="sm">Al día</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar cliente…' }}
        fields={[
          { key: 'filter', label: 'Saldo', type: 'select', options: FILTERS.map(({ id, label }) => ({ value: id, label })) },
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
        emptyTitle="Sin clientes para mostrar"
        emptyDescription="Prueba con otro filtro o búsqueda."
        rowKey={(customer) => customer.id}
      />
    </div>
  );
};

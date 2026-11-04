import React from 'react';
import { useApp } from '../../shared/context/AppContext';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { apiService } from '../../shared/services/apiService';
import { Customer } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {FILTERS.map(({ id, label }) => (
            <button key={id} onClick={() => list.setFilter(id)} aria-pressed={list.filter === id} className={`min-h-8 px-2.5 rounded-lg text-xs font-semibold ${list.filter === id ? 'bg-[#421A05] text-white' : 'bg-white border border-[#E7E5E0] text-[#421A05]'}`}>
              {label}
            </button>
          ))}
        </div>
        <input value={list.search} onChange={(event) => list.setSearch(event.target.value)} placeholder="Buscar cliente…" aria-label="Buscar cliente" className="h-9 w-56 rounded-lg border border-[#E7E5E0] bg-white px-3 text-xs" />
      </div>
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

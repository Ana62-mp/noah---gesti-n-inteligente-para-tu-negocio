import React from 'react';
import { useApp } from '../../shared/context/AppContext';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { apiService } from '../../shared/services/apiService';
import { Product } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
import { FilterBar } from '../../shared/ui/FilterBar';
import { Column, PaginatedTable } from '../../shared/ui/PaginatedTable';
import { formatCurrency } from '../../shared/utils/formatters';

const LOW_STOCK_UNITS = 10;

export const ProductsView: React.FC = () => {
  const { showToast, currentRole } = useApp();
  const list = usePagedList((params) => apiService.getProducts(params));
  const categories = ['all', ...apiService.getProductCategories()];

  const toggle = async (product: Product) => {
    await apiService.toggleProduct(product.id);
    showToast(`${product.name}: ${product.isAvailable ? 'marcado como agotado' : 'disponible'}`, 'info');
    list.reload();
  };

  const columns: Column<Product>[] = [
    { header: 'Producto', accessor: (product) => <span className="text-xs font-bold text-[#111111]">{product.name}</span> },
    { header: 'Categoría', accessor: (product) => <span className="text-xs text-[#6B6B6B]">{product.category}</span> },
    { header: 'Precio', align: 'right', accessor: (product) => <span className="text-xs font-bold tabular-nums">{formatCurrency(product.price)}</span> },
    {
      header: 'Stock',
      align: 'right',
      accessor: (product) =>
        product.stock === 0 ? (
          <Badge variant="terracotta" size="sm">Sin stock</Badge>
        ) : product.stock < LOW_STOCK_UNITS ? (
          <Badge variant="banana" size="sm">{product.stock} unidades</Badge>
        ) : (
          <span className="text-xs tabular-nums">{product.stock} unidades</span>
        ),
    },
    {
      header: 'Disponible',
      align: 'center',
      accessor: (product) => (
        <input type="checkbox" checked={product.isAvailable} disabled={currentRole !== 'owner'} onChange={() => toggle(product)} aria-label={`Disponibilidad de ${product.name}`} className="w-4 h-4 accent-[#CF6811]" />
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar producto…' }}
        fields={[
          { key: 'filter', label: 'Categoría', type: 'select', options: categories.map((category) => ({ value: category, label: category === 'all' ? 'Todas' : category })) },
          { key: 'stock', label: 'Stock', type: 'select', options: [{ value: '', label: 'Todo' }, { value: 'ok', label: 'Con stock' }, { value: 'low', label: 'Stock bajo' }, { value: 'out', label: 'Sin stock' }] },
        ]}
        values={list.fieldValues}
        onChange={list.setField}
        onReset={list.reset}
        activeCount={list.activeFilters}
        total={list.result.total}
        totalLabel="productos"
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
        emptyTitle="Sin productos para mostrar"
        emptyDescription="Prueba con otra categoría o búsqueda."
        rowKey={(product) => product.id}
      />
    </div>
  );
};

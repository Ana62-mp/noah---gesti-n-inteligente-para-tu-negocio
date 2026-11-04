import React from 'react';
import { useApp } from '../../shared/context/AppContext';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { apiService } from '../../shared/services/apiService';
import { Product } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button key={category} onClick={() => list.setFilter(category)} aria-pressed={list.filter === category} className={`min-h-8 px-2.5 rounded-lg text-xs font-semibold ${list.filter === category ? 'bg-[#421A05] text-white' : 'bg-white border border-[#E7E5E0] text-[#421A05]'}`}>
              {category === 'all' ? 'Todos' : category}
            </button>
          ))}
        </div>
        <input value={list.search} onChange={(event) => list.setSearch(event.target.value)} placeholder="Buscar producto…" aria-label="Buscar producto" className="h-9 w-56 rounded-lg border border-[#E7E5E0] bg-white px-3 text-xs" />
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
        emptyTitle="Sin productos para mostrar"
        emptyDescription="Prueba con otra categoría o búsqueda."
        rowKey={(product) => product.id}
      />
    </div>
  );
};

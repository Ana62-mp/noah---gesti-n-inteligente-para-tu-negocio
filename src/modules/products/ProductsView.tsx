import React from 'react';
import { useApp } from '../../shared/context/AppContext';
import { RowActions } from '../../shared/ui/RowActions';
import { StatStrip } from '../../shared/ui/StatStrip';
import { useEntityCrud } from '../../shared/hooks/useEntityCrud';
import { Plus } from 'lucide-react';
import { PRODUCT_FIELDS, emptyProduct, productFromValues, productToValues } from '../../shared/forms/catalogForms';
import { Button } from '../../shared/ui/Button';
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
  const crud = useEntityCrud<Product>({
    collection: 'products', noun: 'producto', fields: PRODUCT_FIELDS, emptyValues: emptyProduct, toValues: productToValues, fromValues: productFromValues,
    nameOf: (item) => item.name ?? 'El producto', onChanged: () => list.reload(),
  });
  const all = apiService.getCollection('products') as Product[];
  const stockValue = all.reduce((sum, product) => sum + product.costPrice * product.stock, 0);
  const margin = all.length ? all.reduce((sum, product) => sum + (product.price - product.costPrice) / product.price, 0) / all.length : 0;

  const toggle = async (product: Product) => {
    await apiService.toggleProduct(product.id);
    showToast(`${product.name}: ${product.isAvailable ? 'marcado como agotado' : 'disponible'}`, 'info');
    list.reload();
  };

  const columns: Column<Product>[] = [
    { header: 'Producto', accessor: (product) => (<div><div className="text-xs font-bold text-[#111111]">{product.name}</div><div className="text-[11px] text-[#6B6B6B]">{product.sku || 'Sin código'}</div></div>) },
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
    { header: '', align: 'right', accessor: (item) => <RowActions name={item.name} onEdit={() => crud.openEdit(item)} onDelete={() => crud.askDelete(item)} /> },
  ];

  return (
    <div className="space-y-3">
      <StatStrip stats={[
        { label: 'Productos', value: String(all.length), hint: `${all.filter((p) => p.isAvailable).length} disponibles`, tone: 'cinnamon' },
        { label: 'Sin stock', value: String(all.filter((p) => p.stock === 0).length), hint: 'Por reponer', tone: 'terracotta' },
        { label: 'Valor en bodega', value: formatCurrency(stockValue), hint: 'Al costo de compra', tone: 'olive' },
        { label: 'Margen promedio', value: `${Math.round(margin * 100)} %`, hint: 'Sobre el precio de venta', tone: 'banana' },
      ]} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#6B6B6B]">Controla precios, costos y stock de lo que vendes.</p>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={crud.openNew}>Nuevo producto</Button>
      </div>
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

      {crud.modals}
    </div>
  );
};

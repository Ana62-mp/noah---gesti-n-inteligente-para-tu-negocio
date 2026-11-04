import { getErrorMessage } from '../../shared/utils/errors';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { RowActions } from '../../shared/ui/RowActions';
import { StatStrip } from '../../shared/ui/StatStrip';
import { useEntityCrud } from '../../shared/hooks/useEntityCrud';
import { Plus } from 'lucide-react';
import { SUPPLIER_DEFAULTS, SUPPLIER_FIELDS, emptySupplier, supplierFromValues, supplierToValues } from '../../shared/forms/catalogForms';
import { Button } from '../../shared/ui/Button';
import { FilterBar } from '../../shared/ui/FilterBar';
import { useListParams } from '../../shared/hooks/useListParams';
import { apiService, PaginatedResult } from '../../shared/services/apiService';
import { Supplier } from '../../shared/types';
import { PaginatedTable, Column } from '../../shared/ui/PaginatedTable';
import { Badge } from '../../shared/ui/Badge';
import { SidePanel } from '../../shared/ui/SidePanel';
import { formatDate, formatCurrency } from '../../shared/utils/formatters';
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingBag,
} from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { showToast } = useApp();
  const [suppliersResult, setSuppliersResult] = useState<PaginatedResult<Supplier>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const list = useListParams();
  const { page, pageSize, search, setPage, setPageSize } = list;
  const facets = apiService.getFacets();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { currentBusiness } = useApp();
  const crud = useEntityCrud<Supplier>({
    collection: 'suppliers', noun: 'proveedor', fields: SUPPLIER_FIELDS, emptyValues: () => emptySupplier(currentBusiness.city.split(' ')[0]), toValues: supplierToValues,
    fromValues: supplierFromValues, newDefaults: SUPPLIER_DEFAULTS, nameOf: (item) => item.name ?? 'El proveedor', onChanged: () => loadSuppliers(),
  });
  const all = apiService.getCollection('suppliers') as Supplier[];

  useEffect(() => {
    loadSuppliers();
  }, [page, pageSize, search, JSON.stringify(list.extras)]);

  const loadSuppliers = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiService.getSuppliers({ page, pageSize, search, extras: list.extras });
      setSuppliersResult(res);
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Supplier>[] = [
    {
      header: 'Proveedor / Contacto',
      accessor: (s) => (
        <div>
          <div className="font-bold text-[#111111] text-xs">{s.name}</div>
          <div className="text-[11px] text-[#6B6B6B] flex items-center gap-1.5 mt-0.5">
            <span>{s.contactPerson}</span>
            <span>·</span>
            <span>{s.phone}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Ciudad / Origen',
      accessor: (s) => <span className="text-xs text-[#6B6B6B]">{s.city}</span>,
    },
    {
      header: 'Insumos que provee',
      accessor: (s) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {s.suppliedItems.slice(0, 3).map((item, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-[#F5F4F1] text-[10px] text-[#111111] font-medium"
            >
              {item}
            </span>
          ))}
          {s.suppliedItems.length > 3 && (
            <span className="text-[10px] text-[#6B6B6B] self-center">
              +{s.suppliedItems.length - 3} más
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Tendencia de precio',
      accessor: (s) => {
        if (s.priceTrend === 'increased') {
          return (
            <Badge variant="terracotta" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
              +{s.priceChangePercent}% este mes
            </Badge>
          );
        }
        if (s.priceTrend === 'decreased') {
          return (
            <Badge variant="olive" size="sm" icon={<TrendingDown className="w-3 h-3" />}>
              {s.priceChangePercent}%
            </Badge>
          );
        }
        return (
          <Badge variant="neutral" size="sm" icon={<Minus className="w-3 h-3" />}>
            Precios estables
          </Badge>
        );
      },
    },
    {
      header: 'Última compra',
      accessor: (s) => (
        <span className="text-xs font-mono tabular-nums text-[#6B6B6B]">
          {formatDate(s.lastPurchaseDate)}
        </span>
      ),
    },
    { header: '', align: 'right', accessor: (item) => <RowActions name={item.name} onEdit={() => crud.openEdit(item)} onDelete={() => crud.askDelete(item)} /> },
  ];

  return (
    <div className="space-y-3">
      <StatStrip stats={[
        { label: 'Proveedores', value: String(all.length), hint: `${new Set(all.map((s) => s.city)).size} ciudades`, tone: 'cinnamon' },
        { label: 'Compras del año', value: formatCurrency(all.reduce((sum, s) => sum + s.totalPurchasedThisYear, 0)), hint: 'Acumulado 2026', tone: 'olive' },
        { label: 'Precios en alza', value: String(all.filter((s) => s.priceTrend === 'increased').length), hint: 'Revisa antes de comprar', tone: 'terracotta' },
        { label: 'Precios a la baja', value: String(all.filter((s) => s.priceTrend === 'decreased').length), hint: 'Buen momento para comprar', tone: 'banana' },
      ]} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#6B6B6B]">Directorio de quién te vende, cuánto le compras y cómo cambian sus precios.</p>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={crud.openNew}>Nuevo proveedor</Button>
      </div>
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar proveedor o producto…' }}
        fields={[
          { key: 'trend', label: 'Precios', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'increased', label: 'En alza' }, { value: 'stable', label: 'Estables' }, { value: 'decreased', label: 'A la baja' }] },
          { key: 'city', label: 'Ciudad', type: 'select', options: [{ value: '', label: 'Todas' }, ...facets.supplierCities.map((value) => ({ value, label: value }))] },
        ]}
        values={list.fieldValues}
        onChange={list.setField}
        onReset={list.reset}
        activeCount={list.activeFilters}
        total={suppliersResult.total}
        totalLabel="proveedores"
      />

      {/* Paginated Table */}
      <PaginatedTable
        columns={columns}
        data={suppliersResult.items}
        total={suppliersResult.total}
        page={suppliersResult.page}
        pageSize={suppliersResult.pageSize}
        totalPages={suppliersResult.totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
            error={loadError}
            onRetry={loadSuppliers}
        rowKey={(s) => s.id}
        onRowClick={(s) => setSelectedSupplier(s)}
      />

      {/* SidePanel with purchase history & contact details */}
      {selectedSupplier && (
        <SidePanel
          isOpen={Boolean(selectedSupplier)}
          onClose={() => setSelectedSupplier(null)}
          title={selectedSupplier.name}
          subtitle={`Proveedor de ${selectedSupplier.city}`}
        >
          <div className="space-y-3 text-xs">
            {/* Contact Card */}
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] space-y-2">
              <div className="font-bold text-[#111111] text-sm">Contacto Comercial</div>
              <div className="flex items-center gap-2 text-[#6B6B6B]">
                <Phone className="w-3.5 h-3.5 text-[#CF6811]" />
                <span className="text-[#111111] font-medium">{selectedSupplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#6B6B6B]">
                <Mail className="w-3.5 h-3.5 text-[#CF6811]" />
                <span className="text-[#111111]">{selectedSupplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[#6B6B6B]">
                <MapPin className="w-3.5 h-3.5 text-[#CF6811]" />
                <span>{selectedSupplier.city}</span>
              </div>
            </div>

            {/* Price Alert */}
            {selectedSupplier.priceTrend === 'increased' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  Alza registrada de +{selectedSupplier.priceChangePercent}%
                </div>
                <p className="text-[11px] leading-relaxed">
                  Noah detectó que los productos de este proveedor subieron este mes, lo que redujo
                  el margen de platos como el Ceviche de camarón.
                </p>
              </div>
            )}

            {/* Supplied Items */}
            <div className="space-y-2">
              <div className="font-bold text-[#111111]">Insumos suministrados:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedSupplier.suppliedItems.map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#111111]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Simulated Purchases List */}
            <div className="space-y-2">
              <div className="font-bold text-[#111111]">Historial reciente de facturas:</div>
              <div className="divide-y divide-[#E7E5E0] border border-[#E7E5E0] rounded-xl overflow-hidden bg-white">
                <div className="p-3 flex justify-between items-center bg-[#FAFAF8]">
                  <div>
                    <div className="font-bold">FAC-00982 (Insumos frescos)</div>
                    <div className="text-[10px] text-[#6B6B6B]">{formatDate(selectedSupplier.lastPurchaseDate)}</div>
                  </div>
                  <span className="font-bold font-mono">$198,50</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <div className="font-bold">FAC-00841 (Pedido mayorista)</div>
                    <div className="text-[10px] text-[#6B6B6B]">15/10/2026</div>
                  </div>
                  <span className="font-bold font-mono">$320,00</span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
              onClick={() => showToast('Generador de orden de compra (Próximamente)', 'info')}
            >
              Generar Orden de Compra (Simulado)
            </Button>
          </div>
        </SidePanel>
      )}

      {crud.modals}
    </div>
  );
};

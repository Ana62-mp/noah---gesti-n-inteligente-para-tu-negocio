import { getErrorMessage } from '../../shared/utils/errors';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { useListParams } from '../../shared/hooks/useListParams';
import { apiService, PaginatedResult } from '../../shared/services/apiService';
import { Supplier } from '../../shared/types';
import { PaginatedTable, Column } from '../../shared/ui/PaginatedTable';
import { Button } from '../../shared/ui/Button';
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

  const { page, pageSize, search, setPage, setPageSize, setSearch } = useListParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, [page, pageSize, search]);

  const loadSuppliers = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiService.getSuppliers({ page, pageSize, search });
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
  ];

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-end gap-2">
<input
          type="text"
          placeholder="Buscar proveedor…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-lg px-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#CF6811] w-56"
        />
      </div>

      {/* Paginated Table */}
      <PaginatedTable
        columns={columns}
        data={suppliersResult.items}
        total={suppliersResult.total}
        page={suppliersResult.page}
        pageSize={suppliersResult.pageSize}
        totalPages={suppliersResult.totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
        }}
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
    </div>
  );
};

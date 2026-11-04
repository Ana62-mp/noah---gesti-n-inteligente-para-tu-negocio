import React from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { PROMOTION_FIELDS, emptyPromotion, promotionFromValues, promotionToValues } from '../../shared/forms/catalogForms';
import { useEntityCrud } from '../../shared/hooks/useEntityCrud';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { apiService } from '../../shared/services/apiService';
import { Promotion } from '../../shared/types';
import { Badge, BadgeVariant } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { FilterBar } from '../../shared/ui/FilterBar';
import { Column, PaginatedTable } from '../../shared/ui/PaginatedTable';
import { RowActions } from '../../shared/ui/RowActions';
import { StatStrip } from '../../shared/ui/StatStrip';

const STATUS: Record<Promotion['status'], { label: string; variant: BadgeVariant }> = {
  draft: { label: 'Borrador', variant: 'banana' },
  active: { label: 'Activa', variant: 'olive' },
  ended: { label: 'Finalizada', variant: 'neutral' },
};

export const PromotionsView: React.FC = () => {
  const { showToast } = useApp();
  const list = usePagedList((params) => apiService.getPromotions(params));
  const crud = useEntityCrud<Promotion>({
    collection: 'promotions', noun: 'promoción', fields: PROMOTION_FIELDS, emptyValues: emptyPromotion, toValues: promotionToValues, fromValues: promotionFromValues,
    nameOf: (item) => `"${item.title ?? 'La promoción'}"`, onChanged: () => list.reload(),
  });
  const all = apiService.getCollection('promotions') as Promotion[];
  const count = (status: Promotion['status']) => all.filter((promotion) => promotion.status === status).length;

  const setStatus = async (promotion: Promotion, status: Promotion['status']) => {
    await apiService.setPromotionStatus(promotion.id, status);
    showToast(status === 'active' ? `"${promotion.title}" aprobada y activa` : `"${promotion.title}" finalizada`, 'success');
    list.reload();
  };

  const columns: Column<Promotion>[] = [
    { header: 'Promoción', accessor: (p) => <span className="text-xs font-bold text-[#111111]">{p.title}</span> },
    { header: 'Aplica a', accessor: (p) => <span className="text-xs">{p.item}</span> },
    { header: 'Oferta', accessor: (p) => <span className="text-xs">{p.discount}</span> },
    { header: 'Vigencia', accessor: (p) => <span className="text-xs text-[#6B6B6B]">{p.duration}</span> },
    { header: 'Estado', accessor: (p) => <Badge variant={STATUS[p.status].variant} size="sm">{STATUS[p.status].label}</Badge> },
    {
      header: 'Aprobación',
      align: 'right',
      accessor: (p) => (p.status === 'draft' ? <Button variant="primary" size="sm" onClick={() => setStatus(p, 'active')}>Aprobar</Button> : p.status === 'active' ? <Button variant="secondary" size="sm" onClick={() => setStatus(p, 'ended')}>Finalizar</Button> : null),
    },
    { header: '', align: 'right', accessor: (p) => <RowActions name={p.title} onEdit={() => crud.openEdit(p)} onDelete={() => crud.askDelete(p)} /> },
  ];

  return (
    <div className="space-y-4">
      <StatStrip stats={[
        { label: 'Activas', value: String(count('active')), hint: 'Aplicándose ahora', tone: 'olive' },
        { label: 'Borradores', value: String(count('draft')), hint: 'Esperan tu aprobación', tone: 'banana' },
        { label: 'Finalizadas', value: String(count('ended')), hint: 'Historial', tone: 'harvest' },
      ]} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#6B6B6B]">Noah sugiere, tú apruebas. Ninguna promoción cambia precios ni se publica sola.</p>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={crud.openNew}>Nueva promoción</Button>
      </div>
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar promoción…' }}
        fields={[{ key: 'filter', label: 'Estado', type: 'select', options: [{ value: 'all', label: 'Todas' }, { value: 'draft', label: 'Borradores' }, { value: 'active', label: 'Activas' }, { value: 'ended', label: 'Finalizadas' }] }]}
        values={list.fieldValues}
        onChange={list.setField}
        onReset={list.reset}
        activeCount={list.activeFilters}
        total={list.result.total}
        totalLabel="promociones"
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
        emptyTitle="Aún no tienes promociones"
        emptyDescription="Crea una o acepta una sugerencia de Noah desde Alertas."
        emptyAction={{ label: 'Nueva promoción', onClick: crud.openNew }}
        rowKey={(p) => p.id}
      />
      {crud.modals}
    </div>
  );
};

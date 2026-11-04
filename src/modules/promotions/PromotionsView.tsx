import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { apiService } from '../../shared/services/apiService';
import { Promotion } from '../../shared/types';
import { Badge, BadgeVariant } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { Column, PaginatedTable } from '../../shared/ui/PaginatedTable';

const STATUS: Record<Promotion['status'], { label: string; variant: BadgeVariant }> = {
  draft: { label: 'Borrador', variant: 'banana' },
  active: { label: 'Activa', variant: 'olive' },
  ended: { label: 'Finalizada', variant: 'neutral' },
};

const FIELD = 'mt-1 w-full h-10 border border-[#E7E5E0] rounded-xl px-3 font-normal';
const EMPTY_FORM = { title: '', item: '', discount: '', duration: '' };

export const PromotionsView: React.FC = () => {
  const { showToast } = useApp();
  const list = usePagedList((params) => apiService.getPromotions(params));
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const isComplete = Object.values(form).every((value) => value.trim());

  const setStatus = async (promotion: Promotion, status: Promotion['status']) => {
    await apiService.setPromotionStatus(promotion.id, status);
    showToast(status === 'active' ? `"${promotion.title}" aprobada y activa` : `"${promotion.title}" finalizada`, 'success');
    list.reload();
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isComplete) return;
    await apiService.addPromotion(form);
    showToast('Borrador guardado. No se aplica hasta que lo apruebes.', 'success');
    setForm(EMPTY_FORM);
    setIsCreating(false);
    list.reload();
  };

  const columns: Column<Promotion>[] = [
    { header: 'Promoción', accessor: (promotion) => <span className="text-xs font-bold text-[#111111]">{promotion.title}</span> },
    { header: 'Aplica a', accessor: (promotion) => <span className="text-xs">{promotion.item}</span> },
    { header: 'Oferta', accessor: (promotion) => <span className="text-xs">{promotion.discount}</span> },
    { header: 'Vigencia', accessor: (promotion) => <span className="text-xs text-[#6B6B6B]">{promotion.duration}</span> },
    { header: 'Estado', accessor: (promotion) => <Badge variant={STATUS[promotion.status].variant} size="sm">{STATUS[promotion.status].label}</Badge> },
    {
      header: 'Acción',
      align: 'right',
      accessor: (promotion) =>
        promotion.status === 'draft' ? (
          <Button variant="primary" size="sm" onClick={() => setStatus(promotion, 'active')}>Aprobar</Button>
        ) : promotion.status === 'active' ? (
          <Button variant="secondary" size="sm" onClick={() => setStatus(promotion, 'ended')}>Finalizar</Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[#6B6B6B]">Noah sugiere, tú apruebas. Ninguna promoción cambia precios ni se publica sola.</p>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>Nueva promoción</Button>
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
        emptyTitle="Aún no tienes promociones"
        emptyDescription="Crea una o acepta una sugerencia de Noah desde Alertas."
        emptyAction={{ label: 'Nueva promoción', onClick: () => setIsCreating(true) }}
        rowKey={(promotion) => promotion.id}
      />
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Nueva promoción" subtitle="Se guarda como borrador" maxWidth="sm">
        <form onSubmit={create} className="space-y-3 text-xs font-semibold text-[#111111]">
          <label className="block">Nombre<input autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={FIELD} /></label>
          <label className="block">Aplica a<input value={form.item} onChange={(event) => setForm({ ...form, item: event.target.value })} className={FIELD} /></label>
          <label className="block">Oferta<input value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} className={FIELD} /></label>
          <label className="block">Vigencia<input value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className={FIELD} /></label>
          <Button variant="primary" type="submit" className="w-full" disabled={!isComplete}>{isComplete ? 'Guardar borrador' : 'Completa todos los campos'}</Button>
        </form>
      </Modal>
    </div>
  );
};

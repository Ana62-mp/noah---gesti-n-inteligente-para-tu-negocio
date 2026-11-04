import React, { useState } from 'react';
import { Eye, RotateCcw, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { ROLE_LABELS, ROLE_SCOPE, getDefaultSections, getRolesForBusiness, isGrantableSection } from '../../shared/permissions/rolePermissions';
import { UserRole } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { Modal } from '../../shared/ui/Modal';
import { FilterBar } from '../../shared/ui/FilterBar';
import { FormModal } from '../../shared/ui/FormModal';
import { buildNavSections } from '../layout/sidebar/navigation.config';

export const TeamView: React.FC = () => {
  const { team, currentBusiness, activeModules, setMemberAccess, addMember, removeMember, viewAsMember, showToast, updateMember } = useApp();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const visibleTeam = team.filter(member => (!roleFilter || member.role === roleFilter) && member.name.toLowerCase().includes(query.trim().toLowerCase()));
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState((team.find(({ role }) => role !== 'owner') ?? team[0]).id);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const staffRoles = getRolesForBusiness(currentBusiness.type).filter((role) => role !== 'owner');
  const [newRole, setNewRole] = useState<UserRole>(staffRoles[0]);
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
  const selected = team.find(({ id }) => id === selectedId) ?? team[0];
  const isAdmin = selected.role === 'owner';

  const groups = buildNavSections(
    (activeModules as readonly string[]).filter(isGrantableSection),
    currentBusiness.type
  );

  const toggle = (section: string, label: string, isAllowed: boolean) => {
    setMemberAccess(selected.id, section, isAllowed);
    showToast(`${selected.name}: ${isAllowed ? 'ahora ve' : 'ya no ve'} ${label}`, 'info');
  };

  const resetToRole = () => {
    const defaults = getDefaultSections(selected.role);
    groups.flatMap(({ items }) => items).forEach(({ id }) => setMemberAccess(selected.id, id, defaults.includes(id)));
    showToast(`Permisos de ${selected.name} restablecidos`, 'info');
  };

  const confirmAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) return;
    addMember(newName.trim(), newRole);
    showToast(`${newName.trim()} se agregó al equipo`, 'success');
    setNewName('');
    setIsAdding(false);
  };

  const confirmRemoval = () => {
    removeMember(selected.id);
    showToast(`${selected.name} salió del equipo`, 'info');
    setSelectedId(team[0].id);
    setIsConfirmingRemoval(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-full lg:h-full">
      <section className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-3 flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#111111]">Personas ({team.length})</h2>
          <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setIsAdding(true)}>Agregar</Button>
        </div>
        <FilterBar search={{ value: query, onChange: setQuery, placeholder: 'Buscar persona?' }} fields={[{ key: 'role', label: 'Rol', type: 'select', options: [{ value: '', label: 'Todos' }, ...getRolesForBusiness(currentBusiness.type).map(role => ({ value: role, label: ROLE_LABELS[role] }))] }]} values={{ role: roleFilter }} onChange={(_, value) => setRoleFilter(value)} onReset={() => { setQuery(''); setRoleFilter(''); }} activeCount={[query, roleFilter].filter(Boolean).length} total={visibleTeam.length} totalLabel="personas" />
        {visibleTeam.length === 0 && <p className="p-3 text-xs text-[#6B6B6B]">No hay personas con estos filtros.</p>}
        <ul className="space-y-1 overflow-y-auto min-h-0">
          {visibleTeam.map((member) => (
            <li key={member.id}>
              <button
                onClick={() => setSelectedId(member.id)}
                aria-pressed={member.id === selected.id}
                className={`w-full text-left px-2.5 py-2 rounded-xl border transition-colors ${member.id === selected.id ? 'bg-[#FBF6E6] border-[#CF6811]/50' : 'border-transparent hover:bg-[#FAFAF8]'}`}
              >
                <span className="block text-xs font-bold text-[#111111] truncate">{member.name}</span>
                <span className="block text-[11px] text-[#6B6B6B]">
                  {member.role === 'owner' ? 'Administrador · acceso total' : `${ROLE_LABELS[member.role]} · ${member.sections.filter(isGrantableSection).length} ${member.sections.filter(isGrantableSection).length === 1 ? 'pantalla' : 'pantallas'}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-3 sm:p-4 flex flex-col gap-3 min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#111111]">Qué puede ver {selected.name}</h2>
            <p className="text-[11px] text-[#6B6B6B]">{ROLE_SCOPE[selected.role]}</p>
          </div>
          {!isAdmin && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Button variant="secondary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => viewAsMember(selected.id)}>Probar su vista</Button>
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>Editar</Button>
              <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={resetToRole}>Restablecer</Button>
              <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setIsConfirmingRemoval(true)}>Quitar</Button>
            </div>
          )}
        </div>

        {isAdmin ? (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FBF6E6] border border-[#EBD48F] text-xs text-[#421A05]">
            <ShieldCheck className="w-4 h-4 text-[#CF6811] shrink-0" />
            El administrador ve todo y es el único que entra a Equipo, Configuración y la vista móvil. Elige a otra persona para ajustar sus pantallas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto min-h-0">
            {groups.map(({ title, items }) => (
              <fieldset key={title} className="rounded-xl border border-[#E7E5E0] p-2.5">
                <legend className="px-1 text-[11px] font-bold uppercase tracking-wide text-[#8A7424]">{title}</legend>
                <div className="space-y-0.5">
                  {items.map(({ id, label, icon }) => {
                    const isOn = selected.sections.includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 min-h-9 px-1.5 rounded-lg hover:bg-[#FBF6E6] cursor-pointer text-xs font-semibold text-[#111111]">
                        <span className="text-[#CF6811]">{icon}</span>
                        <span className="flex-1 min-w-0 truncate">{label}</span>
                        <input type="checkbox" checked={isOn} onChange={(event) => toggle(id, label, event.target.checked)} aria-label={`${label} para ${selected.name}`} className="w-4 h-4 accent-[#CF6811]" />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}

        {!isAdmin && (
          <p className="text-[11px] text-[#6B6B6B]">
            <Badge variant="harvest" size="sm" className="mr-1.5">Prototipo</Badge>
            Los cambios se aplican al instante. En producción este control también se valida en el servidor.
          </p>
        )}
      </section>

      <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Agregar persona al equipo" maxWidth="sm">
        <form onSubmit={confirmAdd} className="space-y-3 text-xs font-semibold text-[#111111]">
          <label className="block">Nombre
            <input autoFocus value={newName} onChange={(event) => setNewName(event.target.value)} className="mt-1 w-full h-10 border border-[#E7E5E0] rounded-xl px-3 font-normal" />
          </label>
          <label className="block">Rol
            <select value={newRole} onChange={(event) => setNewRole(event.target.value as UserRole)} className="mt-1 w-full h-10 border border-[#E7E5E0] rounded-xl px-2 font-normal">
              {staffRoles.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
            </select>
          </label>
          <p className="font-normal text-[#6B6B6B]">{ROLE_SCOPE[newRole]}</p>
          <Button variant="primary" type="submit" className="w-full" disabled={!newName.trim()}>{newName.trim() ? 'Agregar' : 'Escribe el nombre'}</Button>
        </form>
      </Modal>

      <Modal isOpen={isConfirmingRemoval} onClose={() => setIsConfirmingRemoval(false)} title={`¿Quitar a ${selected.name}?`} subtitle="Dejará de tener acceso al negocio." maxWidth="sm">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setIsConfirmingRemoval(false)}>Cancelar</Button>
          <Button variant="primary" onClick={confirmRemoval}>Quitar del equipo</Button>
        </div>
      </Modal>

      <FormModal
        isOpen={isEditing}
        title="Editar persona"
        fields={[
          { key: 'name', label: 'Nombre', type: 'text', required: true },
          { key: 'role', label: 'Rol', type: 'select', required: true, options: staffRoles.map((role) => ({ value: role, label: ROLE_LABELS[role] })) },
        ]}
        initialValues={{ name: selected.name, role: selected.role }}
        submitLabel="Guardar cambios"
        onClose={() => setIsEditing(false)}
        onSubmit={(values) => {
          updateMember(selected.id, { name: String(values.name).trim(), role: String(values.role) as UserRole });
          showToast(`${String(values.name).trim()} se actualizó`, 'success');
          setIsEditing(false);
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getErrorMessage } from '../utils/errors';
import { FormField, FormValues } from '../forms/validators';
import { CollectionName } from '../services/apiService';
import { crud } from '../services/crudService';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { FormModal } from '../ui/FormModal';

interface EntityCrudOptions<T extends { id: string }> {
  collection: CollectionName;
  noun: string;
  fields: FormField[];
  emptyValues: () => FormValues;
  toValues: (item: T) => FormValues;
  fromValues: (values: FormValues, current?: T) => Partial<T>;
  newDefaults?: Partial<T>;
  nameOf: (item: Partial<T>) => string;
  deleteWarning?: string;
  onChanged: () => void;
}

// One place for the create, edit and delete flow so every module behaves the same way.
export const useEntityCrud = <T extends { id: string }>(options: EntityCrudOptions<T>) => {
  const { showToast } = useApp();
  const [editing, setEditing] = useState<T | 'new' | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  const save = async (values: FormValues) => {
    try {
      const data = options.fromValues(values, editing && editing !== 'new' ? editing : undefined);
      if (editing === 'new') {
        await crud.create<T>(options.collection, { ...options.newDefaults, ...data } as Omit<T, 'id'>);
        showToast(`${options.nameOf(data)} se agregó correctamente`, 'success');
      } else if (editing) {
        await crud.update<T>(options.collection, editing.id, data);
        showToast(`${options.nameOf(data)} se actualizó`, 'success');
      }
      setEditing(null);
      options.onChanged();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await crud.remove(options.collection, deleting.id);
      showToast(`${options.nameOf(deleting)} se eliminó`, 'info');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
    setDeleting(null);
    options.onChanged();
  };

  const modals = (
    <>
      <FormModal
        isOpen={editing !== null}
        title={editing === 'new' ? `Nuevo ${options.noun}` : `Editar ${options.noun}`}
        subtitle="Los campos con * son obligatorios"
        fields={options.fields}
        initialValues={editing && editing !== 'new' ? options.toValues(editing) : options.emptyValues()}
        submitLabel={editing === 'new' ? `Guardar ${options.noun}` : 'Guardar cambios'}
        onClose={() => setEditing(null)}
        onSubmit={save}
      />
      <ConfirmDialog
        isOpen={deleting !== null}
        title={`¿Eliminar este ${options.noun}?`}
        message={`${deleting ? options.nameOf(deleting) : ''}: ${options.deleteWarning ?? 'esta acción no se puede deshacer.'}`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );

  return { openNew: () => setEditing('new'), openEdit: (item: T) => setEditing(item), askDelete: setDeleting, modals };
};

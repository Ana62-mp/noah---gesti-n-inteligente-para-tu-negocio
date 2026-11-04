import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl bg-[#F8E4DD] border border-[#A43108]/30 p-3 text-xs text-[#7A2105]">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);

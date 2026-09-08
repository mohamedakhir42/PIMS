import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal';
import Button from './Button';

export interface ConfirmDialogProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirmer',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  loading = false,
}) => {
  const iconColors = {
    danger: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };
  
  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'primary' as const,
  };
  
  const handleConfirm = () => {
    onConfirm();
  };
  
  return (
    <Modal show={show} onHide={onHide} title={title} size="sm">
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${iconColors[variant]}`}>
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
      
      <div className="modal-footer mt-6 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={buttonVariants[variant]}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

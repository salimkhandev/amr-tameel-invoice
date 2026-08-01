'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-red-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    info: <AlertTriangle className="w-6 h-6 text-blue-500" />
  };

  const colors = {
    danger: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      confirmBtn: 'bg-red-600 hover:bg-red-700',
      cancelBtn: 'bg-gray-100 hover:bg-gray-200'
    },
    warning: {
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
      cancelBtn: 'bg-gray-100 hover:bg-gray-200'
    },
    info: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700',
      cancelBtn: 'bg-gray-100 hover:bg-gray-200'
    }
  };

  const colorScheme = colors[type];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-cairo">
      <div className={`bg-white w-full max-w-sm rounded-xl shadow-xl border-2 ${colorScheme.border} overflow-hidden`}>
        <div className={`p-4 ${colorScheme.bg}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex border-t border-gray-200">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 text-sm font-bold text-gray-700 ${colorScheme.cancelBtn} transition-colors`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 text-sm font-bold text-white ${colorScheme.confirmBtn} transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

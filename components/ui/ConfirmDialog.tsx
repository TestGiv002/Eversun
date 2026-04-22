'use client';

import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Warning, Info, CheckCircle, XCircle } from '@phosphor-icons/react';
import type { Variant } from '@/types/common';

interface ConfirmDialogProps {
  /** Indique si la boîte de dialogue est ouverte */
  isOpen: boolean;
  /** Fonction appelée lors de l'annulation */
  onClose: () => void;
  /** Fonction appelée lors de la confirmation (peut être async) */
  onConfirm: () => void | Promise<void>;
  /** Titre de la boîte de dialogue */
  title: string;
  /** Message de confirmation */
  message: string;
  /** Texte du bouton de confirmation */
  confirmText?: string;
  /** Texte du bouton d'annulation */
  cancelText?: string;
  /** Variante de style (influence la couleur et l'icône) */
  variant?: Extract<Variant, 'danger' | 'warning' | 'info'>;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          iconBorder: 'border-red-200 dark:border-red-700',
          buttonBg: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25',
          icon: <XCircle className="h-8 w-8" weight="fill" />,
        };
      case 'warning':
        return {
          iconBg: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
          iconBorder: 'border-amber-200 dark:border-amber-700',
          buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25',
          icon: <Warning className="h-8 w-8" weight="fill" />,
        };
      case 'info':
        return {
          iconBg: 'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900 dark:to-cyan-800',
          iconColor: 'text-teal-600 dark:text-teal-400',
          iconBorder: 'border-teal-200 dark:border-teal-700',
          buttonBg: 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/25',
          icon: <Info className="h-8 w-8" weight="fill" />,
        };
      default:
        return {
          iconBg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
          iconColor: 'text-gray-600 dark:text-gray-400',
          iconBorder: 'border-gray-200 dark:border-gray-600',
          buttonBg: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg',
          icon: <CheckCircle className="h-8 w-8" weight="fill" />,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center px-2">
        {/* Icon with elegant design */}
        <div
          className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full border-2 ${styles.iconBg} ${styles.iconBorder} mb-6 shadow-lg`}
        >
          <div className={styles.iconColor}>
            {styles.icon}
          </div>
        </div>

        {/* Title with better typography */}
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-3">
          {title}
        </h3>

        {/* Message with better spacing */}
        <p className="text-base text-gray-600 dark:text-gray-300 mb-8 leading-relaxed px-4">
          {message}
        </p>

        {/* Buttons with improved styling */}
        <div className="flex gap-3 justify-center px-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 font-medium"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isSubmitting}
            className={`${styles.buttonBg} px-6 py-2.5 font-medium text-white`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

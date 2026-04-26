'use client';

import { ReactNode } from 'react';
import {
  FileText,
  MagnifyingGlass,
  Warning,
  Plus,
  ArrowClockwise,
} from '@phosphor-icons/react';

interface EmptyStateProps {
  /** Type d'empty state */
  type: 'no-data' | 'no-results' | 'error' | 'loading';
  /** Titre principal */
  title: string;
  /** Description optionnelle */
  description?: string;
  /** Action optionnelle (bouton) */
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  /** Icône personnalisée optionnelle */
  customIcon?: ReactNode;
}

const emptyStateConfig = {
  'no-data': {
    icon: <FileText className="h-16 w-16 text-tertiary" weight="thin" />,
    defaultTitle: 'Aucune donnée disponible',
    defaultDescription: 'Commencez par ajouter votre premier dossier',
  },
  'no-results': {
    icon: <MagnifyingGlass className="h-16 w-16 text-tertiary" weight="thin" />,
    defaultTitle: 'Aucun résultat',
    defaultDescription: 'Essayez de modifier vos critères de recherche',
  },
  error: {
    icon: <Warning className="h-16 w-16 text-tertiary" weight="thin" />,
    defaultTitle: 'Une erreur est survenue',
    defaultDescription: "Une erreur inattendue s'est produite",
  },
  loading: {
    icon: (
      <ArrowClockwise
        className="h-16 w-16 text-amber-500 animate-spin"
        weight="bold"
      />
    ),
    defaultTitle: 'Chargement...',
    defaultDescription: 'Veuillez patienter pendant le chargement des données',
  },
};

export default function EmptyState({
  type,
  title,
  description,
  action,
  customIcon,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const icon = customIcon || config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-semibold text-primary mb-2">
        {displayTitle}
      </h3>
      <p className="text-tertiary mb-6 max-w-md">{displayDescription}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow hover:scale-[1.01] transition-all duration-200 font-medium"
        >
          {action.icon || <Plus className="h-5 w-5" weight="bold" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

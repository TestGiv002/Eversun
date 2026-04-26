'use client';

import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

/**
 * MODERN COMPONENTS EXAMPLES
 *
 * Ce fichier montre des exemples de composants modernisés
 * pour démontrer le design et les interactions
 */

// ============================================================================
// 1. KPI CARD MODERNE
// ============================================================================

interface ModernKPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
  trend?: number;
  description?: string;
}

const colorClasses = {
  cyan: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  violet:
    'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400',
  emerald:
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
};

export function ModernKPICard({
  title,
  value,
  icon,
  color,
  trend,
  description,
}: ModernKPICardProps) {
  return (
    <div className="group">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl p-6',
          'bg-white/80 dark:bg-slate-800/80',
          'backdrop-blur-md',
          'border border-slate-200/50 dark:border-slate-700/50',
          'shadow-base hover:shadow-lg',
          'transition-all duration-300',
          'hover:scale-[1.02]'
        )}
      >
        {/* Gradient bg on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, var(--color), transparent)`,
          }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
              {title}
            </p>
            <p
              className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 
                          dark:from-primary-300 dark:to-primary-400 bg-clip-text text-transparent"
            >
              {value}
            </p>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              'p-4 rounded-xl',
              'transition-all duration-300',
              'group-hover:scale-110 group-hover:rotate-6',
              colorClasses[color]
            )}
          >
            {icon}
          </div>
        </div>

        {/* Trend indicator */}
        {trend !== undefined && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              {trend > 0 ? (
                <span className="text-emerald-500 font-bold">↑ {trend}%</span>
              ) : (
                <span className="text-rose-500 font-bold">
                  ↓ {Math.abs(trend)}%
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                vs last month
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. STATUS BADGE MODERNE
// ============================================================================

type StatusType = 'success' | 'warning' | 'error' | 'pending';

interface ModernStatusBadgeProps {
  status: StatusType;
  label: string;
  icon?: React.ReactNode;
}

export function ModernStatusBadge({
  status,
  label,
  icon,
}: ModernStatusBadgeProps) {
  const statusConfig = {
    success: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-emerald-300/50 dark:border-emerald-700/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      defaultIcon: <CheckCircleIcon className="h-4 w-4" />,
    },
    warning: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-300/50 dark:border-amber-700/50',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      defaultIcon: <ExclamationCircleIcon className="h-4 w-4" />,
    },
    error: {
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      border: 'border-rose-300/50 dark:border-rose-700/50',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      defaultIcon: <XCircleIcon className="h-4 w-4" />,
    },
    pending: {
      bg: 'bg-slate-100 dark:bg-slate-800/50',
      border: 'border-slate-300/50 dark:border-slate-700/50',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-500 animate-pulse',
      defaultIcon: <ClockIcon className="h-4 w-4" />,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5',
        'rounded-lg border',
        'text-sm font-medium',
        'transition-all duration-200',
        'hover:shadow-base',
        config.bg,
        config.border,
        config.text
      )}
    >
      <div className={cn('h-2 w-2 rounded-full', config.dot)} />
      {icon || config.defaultIcon}
      <span>{label}</span>
    </div>
  );
}

// ============================================================================
// 3. MODERN TABLE ROW
// ============================================================================

export function ModernTableRow({
  cells,
  isHovered,
}: {
  cells: React.ReactNode[];
  isHovered?: boolean;
}) {
  return (
    <tr
      className={cn(
        'border-b border-slate-200 dark:border-slate-700',
        'transition-all duration-200',
        'group',
        // Striped effect
        'hover:bg-slate-50/50 dark:hover:bg-slate-900/30',
        isHovered && 'bg-primary-50/50 dark:bg-primary-900/20'
      )}
    >
      {cells.map((cell, idx) => (
        <td
          key={idx}
          className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300"
        >
          {cell}
        </td>
      ))}
    </tr>
  );
}

// ============================================================================
// 4. MODERN DIALOG/MODAL
// ============================================================================

export function ModernModal({
  isOpen,
  onClose,
  title,
  children,
  actions,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md 
                   animate-fade-in opacity-100"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        <div
          className={cn(
            'rounded-2xl',
            'bg-white/95 dark:bg-slate-800/95',
            'backdrop-blur-lg',
            'border border-slate-200/50 dark:border-slate-700/50',
            'shadow-2xl',
            'overflow-hidden'
          )}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {actions && (
            <div
              className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 
                           flex justify-end gap-3"
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. DEMO COMPONENT
// ============================================================================

export function ModernComponentsDemo() {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <div className="space-y-8 p-8">
      {/* Section Title */}
      <div>
        <h1
          className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 
                       dark:from-primary-300 dark:to-primary-400 bg-clip-text text-transparent"
        >
          Modern Design Components
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Exemples de composants modernisés avec Tailwind et animations
        </p>
      </div>

      {/* KPI Cards */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          KPI Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernKPICard
            title="Total Dossiers"
            value="248"
            icon={<CheckCircleIcon className="h-6 w-6" />}
            color="cyan"
            trend={12}
            description="DP + Consuel"
          />
          <ModernKPICard
            title="En Cours"
            value="52"
            icon={<ClockIcon className="h-6 w-6" />}
            color="violet"
            trend={-5}
            description="En attente de validation"
          />
          <ModernKPICard
            title="Accordés"
            value="186"
            icon={<CheckCircleIcon className="h-6 w-6" />}
            color="emerald"
            trend={8}
            description="Finalisés"
          />
          <ModernKPICard
            title="Refusés"
            value="10"
            icon={<XCircleIcon className="h-6 w-6" />}
            color="rose"
            trend={0}
            description="À retraiter"
          />
        </div>
      </section>

      {/* Status Badges */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Status Badges
        </h2>
        <div className="flex flex-wrap gap-4">
          <ModernStatusBadge status="success" label="Approuvé" />
          <ModernStatusBadge status="warning" label="En attente" />
          <ModernStatusBadge status="error" label="Refusé" />
          <ModernStatusBadge status="pending" label="En cours" />
        </div>
      </section>

      {/* Table Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Exemple de tableau
        </h2>
        <div
          className={cn(
            'rounded-2xl overflow-hidden',
            'bg-white/80 dark:bg-slate-800/80',
            'border border-slate-200/50 dark:border-slate-700/50',
            'shadow-base'
          )}
        >
          <table className="w-full">
            <thead
              className={cn(
                'border-b border-slate-200 dark:border-slate-700',
                'bg-slate-50/50 dark:bg-slate-900/30'
              )}
            >
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <ModernTableRow
                cells={[
                  'Jean Dupont',
                  <ModernStatusBadge
                    key="1"
                    status="success"
                    label="Accordé"
                  />,
                  '12 Avril 2026',
                ]}
              />
              <ModernTableRow
                cells={[
                  'Marie Martin',
                  <ModernStatusBadge
                    key="2"
                    status="pending"
                    label="En cours"
                  />,
                  '10 Avril 2026',
                ]}
              />
              <ModernTableRow
                cells={[
                  'Pierre Bernard',
                  <ModernStatusBadge
                    key="3"
                    status="warning"
                    label="En attente"
                  />,
                  '08 Avril 2026',
                ]}
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Example */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          Modal Moderne
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className={cn(
            'px-6 py-2.5 rounded-lg',
            'bg-gradient-to-r from-primary-500 to-primary-600',
            'hover:from-primary-600 hover:to-primary-700',
            'text-white font-semibold',
            'shadow-base hover:shadow-lg',
            'transition-all duration-300',
            'hover:scale-[1.02]'
          )}
        >
          Ouvrir Modal
        </button>

        <ModernModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Créer un nouveau dossier"
          actions={
            <>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 
                         hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 
                         text-white transition-colors"
              >
                Créer
              </button>
            </>
          }
        >
          <p className="text-slate-700 dark:text-slate-300">
            Remplissez les informations du nouveau dossier ci-dessous.
          </p>
        </ModernModal>
      </section>
    </div>
  );
}

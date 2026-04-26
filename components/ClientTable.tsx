'use client';

import { useState, useMemo, memo, lazy, Suspense, useCallback, useRef, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import {
  MagnifyingGlass,
  Pencil,
  ArrowSquareOut,
  X,
  Eye,
  EyeSlash,
  Calendar,
  Buildings,
  FileText,
  User,
  MapPin,
  Shield,
  Globe,
  Key,
  Check,
  WarningCircle,
  Lightning,
  CheckCircle,
  ChatCircle,
  Pen,
  Flag,
  Clock,
  House,
  Funnel,
  CaretDown,
  List,
} from '@phosphor-icons/react';
import { ClientRecord } from '@/types/client';
import {
  formatDateFR,
  getStatutBadgeColor,
  getFinancementBadgeColor,
  getRaccordementBadgeColor,
  getEtatActuelBadgeColor,
  getTypeConsuelBadgeColor,
  getPrestataireBadgeColor,
  getCauseNonPresenceBadgeColor,
} from '@/lib/clientTableUtils';
import PaginationControls from '@/components/PaginationControls';
import {
  useClientTableFilters,
  useClientTablePagination,
} from '@/hooks/useClientTable';
import DatePicker from '@/components/ui/DatePicker';
import FilterChips from '@/components/ui/FilterChips';

// Code splitting pour le modal lourd
const ClientModal = lazy(() => import('@/components/ClientModal'));

/**
 * Props pour le composant ClientTable
 */
interface ClientTableProps {
  /** Section actuelle (utilise string pour compatibilité avec le code existant) */
  section: string;
  /** Liste des clients à afficher */
  items: ClientRecord[];
  /** Callback pour l'édition d'un client */
  onEdit: (client: ClientRecord) => void;
  /** Callback pour la suppression d'un client */
  onDelete: (id: string) => void;
  /** Callback optionnel pour la sauvegarde directe depuis le tableau */
  onSave?: (client: ClientRecord) => void;
  /** Callback optionnel pour rafraîchir les données */
  onRefresh?: () => void;
}

function ClientTable({
  section,
  items,
  onEdit,
  onDelete,
  onSave,
  onRefresh,
}: ClientTableProps) {
  // Custom hooks for filters and pagination
  const {
    search,
    setSearch,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    showFilters,
    setShowFilters,
    filterStatus,
    setFilterStatus,
    filterVille,
    setFilterVille,
    filterPrestataire,
    setFilterPrestataire,
    filterFinancement,
    setFilterFinancement,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
    filteredItems,
    resetFilters,
  } = useClientTableFilters({ items, section });

  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    isPageTransitioning,
    setIsPageTransitioning,
    transitionDirection,
    setTransitionDirection,
    totalPages,
    handlePageChange,
  } = useClientTablePagination({ totalItems: filteredItems.length });

  // Client sélectionné pour la vue détaillée
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(
    null
  );
  // États pour la modal
  const [showPassword, setShowPassword] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const columns: Array<{ key: keyof ClientRecord; label: string }> = [];
  const isDp = section.startsWith('dp');
  const isDpAccordes = section === 'dp-accordes';
  const isDpRefuses = section === 'dp-refuses';
  const isDaact = section === 'daact';
  const isConsuelEnCours = section === 'consuel-en-cours';
  const isConsuelFinalise = section === 'consuel-finalise';
  const isConsuel = isConsuelEnCours || isConsuelFinalise;
  const isInstallation = section === 'installation';
  const isRaccordement = section === 'raccordement';
  const isRaccordementMes = section === 'raccordement-mes';

  if (isDp) {
    columns.push(
      { key: 'client', label: 'Client' },
      { key: 'dateEnvoi', label: "Date d'envoi" },
      { key: 'dateEstimative', label: 'Date estimative' },
      { key: 'financement', label: 'Financement' },
      { key: 'statut', label: 'Statut' },
      { key: 'noDp', label: 'N° DP' },
      { key: 'ville', label: 'Ville' }
    );
    // Ajouter Portail, Identifiant, Mot de passe seulement si ce n'est pas DP Accordés ou DP Refus
    if (!isDpAccordes && !isDpRefuses) {
      columns.push(
        { key: 'portail', label: 'Portail' },
        { key: 'identifiant', label: 'Identifiant' },
        { key: 'motDePasse', label: 'Mot de passe' }
      );
    }
  } else if (isDaact) {
    columns.push(
      { key: 'client', label: 'Client' },
      { key: 'noDp', label: 'Numéro DP' },
      { key: 'ville', label: 'Ville' },
      { key: 'statut', label: 'DAACT' }
    );
  } else if (isInstallation) {
    columns.push(
      { key: 'client', label: 'Client' },
      { key: 'statut', label: 'Statut' },
      { key: 'financement', label: 'Financement' },
      { key: 'pvChantier', label: 'PV Chantier' },
      { key: 'commentaires', label: 'Commentaires' },
      { key: 'dateEstimative', label: 'Date de pose' },
      { key: 'datePV', label: 'Date PV' }
    );
  } else if (isConsuelEnCours) {
    columns.push(
      { key: 'client', label: 'Client' },
      { key: 'pvChantierDate', label: 'PV Chantier' },
      { key: 'causeNonPresence', label: 'Cause de non présence Consuel' },
      { key: 'prestataire', label: 'Prestataire' },
      { key: 'etatActuel', label: 'Etat Actuel' },
      { key: 'typeConsuel', label: 'Type de consuel demandé' },
      { key: 'dateDerniereDemarche', label: 'Date dernière démarche' },
      { key: 'commentaires', label: 'Commentaires' },
      { key: 'dateEstimative', label: 'Date Estimatives' }
    );
  } else if (isConsuelFinalise) {
    columns.push(
      { key: 'client', label: 'Nom' },
      { key: 'pvChantierDate', label: 'PV Chantier' },
      { key: 'causeNonPresence', label: 'Cause de non présence Consuel' },
      { key: 'prestataire', label: 'Prestataire' },
      { key: 'etatActuel', label: 'Etat Actuel' },
      { key: 'typeConsuel', label: 'Type de consuel demandé' },
      { key: 'dateDerniereDemarche', label: 'Date dernière démarche' },
      { key: 'commentaires', label: 'Commentaires' },
      { key: 'dateEstimative', label: 'Date Estimatives' }
    );
  } else if (isRaccordement) {
    columns.push(
      { key: 'client', label: 'Client' },
      { key: 'prestataire', label: 'Prestataire' },
      { key: 'typeConsuel', label: 'Type de consuel demandé' },
      { key: 'raccordement', label: 'Raccordement' },
      { key: 'dateDerniereDemarche', label: 'Date dernière démarche' },
      { key: 'commentaires', label: 'Commentaires' },
      { key: 'dateEstimative', label: 'Date Estimatives' }
    );
  } else if (isRaccordementMes) {
    columns.push(
      { key: 'client', label: 'Client' },
      { key: 'prestataire', label: 'Prestataire' },
      { key: 'typeConsuel', label: 'Type de consuel demandé' },
      { key: 'dateDerniereDemarche', label: 'Date dernière démarche' },
      { key: 'numeroContrat', label: 'Numéro de contrat' },
      {
        key: 'dateMiseEnService',
        label: 'Date de Mise en service raccordement',
      }
    );
  }

  const paginated = filteredItems.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleClientClick = useCallback((client: ClientRecord) => {
    setSelectedClient(client);
  }, []);

  const closeClientDetails = useCallback(() => {
    setSelectedClient(null);
    setShowPassword(false);
  }, []);

  const handleRowClick = useCallback((item: ClientRecord) => {
    onEdit(item);
  }, [onEdit]);

  const handleSortClick = useCallback((key: string) => {
    setSortKey(key);
  }, []);

  // Debounced filter handlers
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSetFilterStatus = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setFilterStatus(value);
    }, 100);
  }, []);

  const debouncedSetFilterVille = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setFilterVille(value);
    }, 100);
  }, []);

  const debouncedSetFilterPrestataire = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setFilterPrestataire(value);
    }, 100);
  }, []);

  const debouncedSetFilterFinancement = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setFilterFinancement(value);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Build active filters list for FilterChips
  const activeFilters = [
    ...(filterStatus
      ? [{ key: 'status', label: 'Statut', value: filterStatus }]
      : []),
    ...(filterVille
      ? [{ key: 'ville', label: 'Ville', value: filterVille }]
      : []),
    ...(filterPrestataire
      ? [{ key: 'prestataire', label: 'Prestataire', value: filterPrestataire }]
      : []),
    ...(filterFinancement
      ? [{ key: 'financement', label: 'Financement', value: filterFinancement }]
      : []),
    ...(filterDateFrom
      ? [{ key: 'dateFrom', label: 'Date de', value: filterDateFrom }]
      : []),
    ...(filterDateTo
      ? [{ key: 'dateTo', label: 'Date à', value: filterDateTo }]
      : []),
  ];

  const handleRemoveFilter = (key: string) => {
    switch (key) {
      case 'status':
        setFilterStatus('');
        break;
      case 'ville':
        setFilterVille('');
        break;
      case 'prestataire':
        setFilterPrestataire('');
        break;
      case 'financement':
        setFilterFinancement('');
        break;
      case 'dateFrom':
        setFilterDateFrom('');
        break;
      case 'dateTo':
        setFilterDateTo('');
        break;
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto py-6">
        {/* Header du tableau - Responsive */}
        <div className="mb-6 flex flex-col gap-4">
          {/* Filter Panel */}
          {showFilters && (
            <div
              className="bg-primary rounded-lg border border-primary p-4 shadow-md animate-in slide-in-top duration-300"
              role="region"
              aria-label="Filtres du tableau"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1">
                    Statut
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrer par statut"
                    value={filterStatus}
                    onChange={(e) => debouncedSetFilterStatus(e.target.value)}
                    aria-label="Filtrer par statut"
                    className="w-full px-3 py-2 rounded-lg border border-primary bg-primary text-sm text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrer par ville"
                    value={filterVille}
                    onChange={(e) => debouncedSetFilterVille(e.target.value)}
                    aria-label="Filtrer par ville"
                    className="w-full px-3 py-2 rounded-lg border border-primary bg-primary text-sm text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1">
                    Prestataire
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrer par prestataire"
                    value={filterPrestataire}
                    onChange={(e) => debouncedSetFilterPrestataire(e.target.value)}
                    aria-label="Filtrer par prestataire"
                    className="w-full px-3 py-2 rounded-lg border border-primary bg-primary text-sm text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1">
                    Financement
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrer par financement"
                    value={filterFinancement}
                    onChange={(e) => debouncedSetFilterFinancement(e.target.value)}
                    aria-label="Filtrer par financement"
                    className="w-full px-3 py-2 rounded-lg border border-primary bg-primary text-sm text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1">
                    Date estimative (de)
                  </label>
                  <DatePicker
                    value={filterDateFrom}
                    onChange={setFilterDateFrom}
                    placeholderText="JJ/MM/AAAA"
                    className="h-10 px-3 py-2 text-sm shadow-none hover:shadow-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-1">
                    Date estimative (à)
                  </label>
                  <DatePicker
                    value={filterDateTo}
                    onChange={setFilterDateTo}
                    placeholderText="JJ/MM/AAAA"
                    className="h-10 px-3 py-2 text-sm shadow-none hover:shadow-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-primary">
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setFilterVille('');
                    setFilterPrestataire('');
                    setFilterFinancement('');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                  className="px-4 py-2 rounded-lg border border-primary text-secondary font-semibold hover:bg-secondary transition-all duration-200"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md hover:shadow transition-all duration-200"
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}

          {/* Active Filter Chips */}
          <FilterChips
            filters={activeFilters}
            onRemove={handleRemoveFilter}
            onResetAll={resetFilters}
          />

          <div className="flex items-center justify-between gap-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <List className="h-4 w-4" weight="bold" />
              </div>
              <label className="text-gray-900 dark:text-white font-semibold text-sm">
                Lignes par page
              </label>
            </div>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow-md font-medium"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau moderne - Responsive Design */}
        <div
          className={`rounded-xl shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl ${
            isPageTransitioning
              ? transitionDirection === 'right'
                ? 'opacity-0 transform translateX(-20px)'
                : 'opacity-0 transform translateX(20px)'
              : 'opacity-100 transform translateX(0)'
          }`}
        >
          {/* Desktop/Tablette Table - Horizontal scroll for all columns */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-gray-900 dark:text-gray-100">
              <caption className="sr-only">
                Tableau des dossiers clients, {filteredItems.length} resultats
              </caption>
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-600">
                  {columns.map((col, idx) => (
                    <th
                      key={col.key as string}
                      aria-sort={
                        sortKey === col.key
                          ? sortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                      className={`px-3 py-2 font-bold text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 whitespace-nowrap text-[10px] uppercase tracking-wider text-gray-700 dark:text-gray-200 group ${
                        idx === 0
                          ? 'sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-r'
                          : ''
                      }`}
                      onClick={() => setSortKey(col.key as string)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {col.label}
                        </span>
                        {sortKey === col.key && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {sortDir === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                        {sortKey !== col.key && (
                          <CaretDown
                            className="w-2.5 h-2.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            weight="bold"
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-8 text-center text-gray-500 dark:text-gray-400 text-xs"
                    >
                      Aucun résultat trouvé
                    </td>
                  </tr>
                )}
                {paginated.map((item, index) => (
                  <tr
                    key={item._id || item.id || index}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-200 group cursor-pointer ${
                      index % 2 === 0
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}
                    onClick={() => handleRowClick(item)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key as string}
                        className={`px-3 py-2 whitespace-nowrap text-xs ${
                          col.key === 'client'
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {col.key === 'client' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClientClick(item);
                            }}
                            className="text-left w-full font-semibold text-primary hover:text-amber-600 dark:hover:text-amber-400 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                            aria-label={`Voir le détail du dossier ${item.client || 'client'}`}
                          >
                            {(item[col.key] as string) || '-'}
                          </button>
                        ) : col.key === 'dateEnvoi' ||
                          col.key === 'dateEstimative' ||
                          col.key === 'dateDerniereDemarche' ||
                          col.key === 'dateMiseEnService' ||
                          col.key === 'datePV' ||
                          col.key === 'pvChantierDate' ? (
                          <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                            <Calendar
                              className="w-3 h-3 text-amber-500"
                              weight="fill"
                            />
                            {formatDateFR(item[col.key] as string)}
                          </span>
                        ) : col.key === 'pvChantier' &&
                          isInstallation &&
                          item.pvChantier ? (
                          <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md text-xs">
                            {item.pvChantier}
                          </span>
                        ) : col.key === 'pvChantier' && item.pvChantier ? (
                          <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                            <Calendar
                              className="w-3 h-3 text-amber-500"
                              weight="fill"
                            />
                            {formatDateFR(item[col.key] as string)}
                          </span>
                        ) : col.key === 'portail' &&
                          isDp &&
                          item.portail &&
                          item.portail.startsWith('http') ? (
                          <a
                            href={item.portail}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-xs shadow-md hover:shadow-lg transform hover:scale-105"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="w-3 h-3" weight="bold" />
                            Connexion
                            <ArrowSquareOut className="w-3 h-3" weight="bold" />
                          </a>
                        ) : col.key === 'identifiant' && item.identifiant ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-200 dark:border-blue-800 shadow-sm">
                            <Key className="w-3 h-3" weight="bold" />
                            {item.identifiant}
                          </span>
                        ) : col.key === 'motDePasse' && item.motDePasse ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-semibold text-xs border border-red-200 dark:border-red-800 shadow-sm">
                            <Key className="w-3 h-3" weight="bold" />
                            {item.motDePasse}
                          </span>
                        ) : col.key === 'statut' && item.statut ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs border shadow-sm ${getStatutBadgeColor(item.statut)}`}
                          >
                            {item.statut}
                          </span>
                        ) : col.key === 'financement' && item.financement ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs border shadow-sm ${getFinancementBadgeColor(item.financement)}`}
                          >
                            {item.financement}
                          </span>
                        ) : col.key === 'raccordement' && item.raccordement ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs border shadow-sm ${getRaccordementBadgeColor(item.raccordement)}`}
                          >
                            {item.raccordement}
                          </span>
                        ) : col.key === 'etatActuel' && item.etatActuel ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs border shadow-sm ${getEtatActuelBadgeColor(item.etatActuel)}`}
                          >
                            {item.etatActuel}
                          </span>
                        ) : col.key === 'typeConsuel' && item.typeConsuel ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs border shadow-sm ${getTypeConsuelBadgeColor(item.typeConsuel)}`}
                          >
                            {item.typeConsuel}
                          </span>
                        ) : col.key === 'prestataire' && item.prestataire ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs border shadow-sm ${getPrestataireBadgeColor(item.prestataire)}`}
                          >
                            <Buildings className="w-3 h-3 mr-1" weight="bold" />
                            {item.prestataire}
                          </span>
                        ) : col.key === 'causeNonPresence' &&
                          item.causeNonPresence ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-xs border shadow-sm ${getCauseNonPresenceBadgeColor(item.causeNonPresence)}`}
                          >
                            {item.causeNonPresence}
                          </span>
                        ) : col.key === 'commentaires' && item.commentaires ? (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <ChatCircle
                              className="w-3 h-3 text-amber-500"
                              weight="fill"
                            />
                            <span
                              className="max-w-xs truncate"
                              title={item.commentaires}
                            >
                              {item.commentaires}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-primary">
                            {(item[col.key] as string) || '-'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isPageTransitioning={isPageTransitioning}
          />
        </div>
      </div>

      {/* Modal Client Details */}
      <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
        <ClientModal
          selectedClient={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={onEdit}
          onDelete={onDelete}
          section={section}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      </Suspense>
    </>
  );
}

export default memo(ClientTable);

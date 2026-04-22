'use client';

import { useMemo, useState, useEffect } from 'react';
import ClientTable from '@/components/ClientTable';
import ClientGrid from '@/components/ClientGrid';
import ClientCalendar from '@/components/ClientCalendar';
import ClientForm from '@/components/ClientForm';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { GridSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { ClientRecord, Section } from '@/types/client';
import { toast, useToastStore } from '@/store/useToastStore';
import { useAppStore } from '@/store/useAppStore';
import { useUndoStore } from '@/store/useUndoStore';
import {
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Circle,
  Lightning,
  Flag,
  Table,
  GridFour,
  Calendar,
  ArrowClockwise,
  MagnifyingGlass,
  Buildings,
  MapPin,
  Clock,
  CheckSquare,
} from '@phosphor-icons/react';

interface ClientSectionProps {
  /** Section à afficher */
  section: Section;
}

export default function ClientSection({ section }: ClientSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('table');
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [displayedTab, setDisplayedTab] = useState<string>('table');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { setSectionCounts, addNotification } = useAppStore();
  const { pushUndoAction, undoLastAction } = useUndoStore();
  const { addToast } = useToastStore();

  // Expose loading state for parent component
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sectionLoading', { detail: { section, loading } }));
  }, [section, loading]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/clients?section=${section}&limit=100`)
      .then((res) => res.json())
      .then((response) => {
        // Gérer le nouveau format de réponse avec data et pagination
        const data = response.data || response;
        setClients(
          Array.isArray(data)
            ? data.map((item) => ({ ...item, id: item._id || item.id }))
            : []
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur de chargement:', err);
        setError('Erreur de chargement des données');
        setLoading(false);
      });
  }, [section]);

  // Fetch section counts from API
  const fetchSectionCounts = async () => {
    try {
      const res = await fetch('/api/clients/counts');
      const response = await res.json();
      if (response.counts) {
        setSectionCounts(response.counts);
      }
    } catch (error) {
      console.error('Error fetching section counts:', error);
    }
  };

  // Fetch counts on mount and when section changes
  useEffect(() => {
    fetchSectionCounts();
  }, [section]);

  // Vérifier les dates estimatives pour DP En Cours et déclencher des notifications
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dpEnCoursClients = clients.filter((c) => c.section === 'dp-en-cours' && c.dateEstimative);

    dpEnCoursClients.forEach((client) => {
      if (client.dateEstimative) {
        const estimatedDate = new Date(client.dateEstimative);
        estimatedDate.setHours(0, 0, 0, 0);

        const diffTime = estimatedDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Si la date estimative est demain (diffDays === 1)
        if (diffDays === 1) {
          const notificationMessage = `Accord tacite de ${client.client} - Date estimative: ${new Date(client.dateEstimative).toLocaleDateString('fr-FR')}`;
          addNotification(notificationMessage);
        }
      }
    });
  }, [clients, addNotification]);

  const sectionTitle = useMemo(() => {
    const titles: { [key in Section]: string } = {
      clients: 'Clients',
      'dp-en-cours': 'Déclaration Préalable – En cours',
      'dp-accordes': 'Déclaration Préalable – Accordés',
      'dp-refuses': 'Déclaration Préalable – Refus',
      'daact': 'Déclaration attestant l\'achèvement et la conformité des travaux',
      'consuel-en-cours': 'Consuel – En cours',
      'consuel-finalise': 'Consuel – Finalisé',
      raccordement: 'Raccordement',
      'raccordement-mes': 'Raccordement – Mise En Service',
    };
    return titles[section];
  }, [section]);

  const sectionIcon = useMemo(() => {
    const icons: { [key in Section]: React.ReactNode } = {
      clients: <FileText className="h-6 w-6" weight="bold" />,
      'dp-en-cours': <FileText className="h-6 w-6" weight="bold" />,
      'dp-accordes': <CheckCircle className="h-6 w-6" weight="bold" />,
      'dp-refuses': <XCircle className="h-6 w-6" weight="bold" />,
      'daact': <CheckSquare className="h-6 w-6" weight="bold" />,
      'consuel-en-cours': <Circle className="h-6 w-6" weight="bold" />,
      'consuel-finalise': <CheckCircle className="h-6 w-6" weight="bold" />,
      raccordement: <Lightning className="h-6 w-6" weight="bold" />,
      'raccordement-mes': <Flag className="h-6 w-6" weight="bold" />,
    };
    return icons[section];
  }, [section]);

  const sectionColor = useMemo(() => {
    const colors: { [key in Section]: string } = {
      clients: 'from-teal-500 to-cyan-500',
      'dp-en-cours': 'from-teal-500 to-cyan-500',
      'dp-accordes': 'from-emerald-500 to-green-500',
      'dp-refuses': 'from-red-500 to-rose-500',
      'daact': 'from-emerald-500 to-green-500',
      'consuel-en-cours': 'from-teal-500 to-cyan-500',
      'consuel-finalise': 'from-emerald-500 to-green-500',
      raccordement: 'from-teal-500 to-cyan-500',
      'raccordement-mes': 'from-emerald-500 to-green-500',
    };
    return colors[section];
  }, [section]);

  const sectionItems = useMemo(() => {
    let items = section === 'clients' ? clients : clients.filter((clientItem) => clientItem.section === section);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) =>
        Object.values(item).some(
          (value) =>
            value &&
            typeof value === 'string' &&
            value.toLowerCase().includes(query)
        )
      );
    }

    return items;
  }, [clients, section, searchQuery]);

  const totalDpEnCours = clients.filter(
    (c) => c.section === 'dp-en-cours'
  ).length;
  const totalDpAccordes = clients.filter(
    (c) => c.section === 'dp-accordes'
  ).length;
  const totalDpRefus = clients.filter((c) => c.section === 'dp-refuses').length;
  const totalConsuelEnCours = clients.filter(
    (c) => c.section === 'consuel-en-cours'
  ).length;
  const totalConsuelFinalise = clients.filter(
    (c) => c.section === 'consuel-finalise'
  ).length;
  const totalRaccordementEnCours = clients.filter(
    (c) => c.section === 'raccordement'
  ).length;
  const totalRaccordementFinalise = clients.filter(
    (c) => c.section === 'raccordement-mes'
  ).length;

  // Calculate status counts for the current section
  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    sectionItems.forEach((item) => {
      let key: string;
      if (section.startsWith('consuel')) {
        key = item.etatActuel || 'Non défini';
      } else if (section.startsWith('raccordement')) {
        key = item.raccordement || 'Non défini';
      } else {
        key = item.statut || 'Non défini';
      }
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const onSave = async (record: ClientRecord) => {
    // Si on change de section (ex : Accord favorable ou Refus), il faut créer dans la nouvelle collection et supprimer dans l'ancienne
    const toSave = { ...record };
    const oldSection = section;
    let newSection = record.section;
    if (section === 'dp-en-cours' && (record.statut === 'Accord favorable' || record.statut === 'Accord tacite')) {
      toSave.section = 'dp-accordes';
      newSection = 'dp-accordes';
    }
    if (section === 'dp-en-cours' && record.statut === 'Refus') {
      toSave.section = 'dp-refuses';
      newSection = 'dp-refuses';
    }
    // Logique Consuel: si "Consuel envoyé" ET "Consuel Visé", déplacer vers Consuel Finalisé
    if (section === 'consuel-en-cours' && record.causeNonPresence === 'Consuel envoyé' && record.etatActuel === 'Consuel Visé') {
      toSave.section = 'consuel-finalise';
      newSection = 'consuel-finalise';
    }
    // Cas déplacement de collection
    if (record._id && oldSection !== newSection) {
      // Optimistic UI: Update immediately
      const previousClients = [...clients];
      const optimisticRecord = { ...toSave, _id: record._id };
      setClients((prev) =>
        prev.map((item) => (item._id === record._id ? optimisticRecord : item))
      );
      
      // 1. Créer dans la nouvelle collection
      const { _id, id, ...toSend } = toSave;
      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend),
        });
        if (res.ok) {
          const saved = await res.json();
          // 2. Supprimer dans l'ancienne collection
          const deleteRes = await fetch(`/api/clients/${record._id}?section=${oldSection}`, {
            method: 'DELETE',
          });
          if (deleteRes.ok) {
            setClients((prev) =>
              prev.map((item) => (item._id === saved._id ? saved : item))
            );
            toast.success(`${record.client} a été déplacé vers ${newSection.replace('-', ' ').toUpperCase()}`);
          } else {
            // Revert on error
            setClients(previousClients);
            toast.error('Erreur lors de la suppression dans l\'ancienne section');
          }
        } else {
          // Revert on error
          setClients(previousClients);
          const error = await res.json();
          toast.error(`Impossible de mettre à jour ${record.client}: ${error.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        // Revert on error
        setClients(previousClients);
        console.error('Erreur lors de la mise à jour:', error);
        toast.error('Erreur de connexion au serveur');
      }
      return;
    }
    // Cas mise à jour simple - Optimistic UI
    if (record._id) {
      const previousClients = [...clients];
      const optimisticRecord = { ...toSave, _id: record._id };
      setClients((prev) =>
        prev.map((item) => (item._id === record._id ? optimisticRecord : item))
      );
      
      const { id, ...toSend } = toSave;
      try {
        const res = await fetch(`/api/clients/${record._id}?section=${section}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend),
        });
        if (res.ok) {
          const saved = await res.json();
          setClients((prev) =>
            prev.map((item) => (item._id === saved._id ? saved : item))
          );
          toast.success(`${record.client} a été mis à jour avec succès`);
          fetchSectionCounts(); // Refresh section counts
        } else {
          // Revert on error
          setClients(previousClients);
          const error = await res.json();
          toast.error(`Impossible de mettre à jour ${record.client}: ${error.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        // Revert on error
        setClients(previousClients);
        console.error('Erreur lors de la mise à jour:', error);
        toast.error('Erreur de connexion au serveur');
      }
    } else {
      // Cas création - Optimistic UI
      const previousClients = [...clients];
      const tempId = `temp-${Date.now()}`;
      const optimisticRecord = { ...toSave, _id: tempId };
      setClients((prev) => [...prev, optimisticRecord]);
      
      const { id, _id, ...toSend } = toSave;
      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSend),
        });
        if (res.ok) {
          const saved = await res.json();
          setClients((prev) =>
            prev.map((item) => (item._id === tempId ? saved : item))
          );
          toast.success(`${saved.client} a été créé avec succès`);
          fetchSectionCounts(); // Refresh section counts
        } else {
          // Revert on error
          setClients(previousClients);
          const error = await res.json();
          toast.error(`Impossible de créer le dossier: ${error.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        // Revert on error
        setClients(previousClients);
        console.error('Erreur lors de la création:', error);
        toast.error('Erreur de connexion au serveur');
      }
    }
  };

  const onDelete = async (_id: string) => {
    const client = clients.find((c) => c._id === _id);
    if (client) {
      // Store client for undo before deletion
      const clientCopy = { ...client };
      const section = client.section;
      
      // Optimistic UI: Remove from UI immediately
      const previousClients = [...clients];
      setClients((prev) => prev.filter((item) => item._id !== _id));
      
      try {
        const res = await fetch(
          `/api/clients/${_id}?section=${section}`,
          {
            method: 'DELETE',
          }
        );
        if (res.ok) {
          // Push undo action
          pushUndoAction({
            type: 'delete',
            data: {
              client: clientCopy,
              oldSection: section,
            },
            description: `Suppression de ${client.client}`,
          });

          toast.success(`${client.client} a été supprimé avec succès`, 5000);
          fetchSectionCounts(); // Refresh section counts
        } else {
          // Revert optimistic update on error
          setClients(previousClients);
          const error = await res.json();
          toast.error(`Impossible de supprimer ${client.client}: ${error.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        // Revert optimistic update on error
        setClients(previousClients);
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur de connexion au serveur');
      }
    }
  };

  const openAddForm = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const openEditForm = (client: ClientRecord) => {
    setEditingClient(client);
    setShowForm(true);
  };

  // Ajouter une fonction pour forcer le rechargement des données
  const forceRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients?limit=10000');
      const response = await res.json();

      // Gérer le nouveau format de réponse avec data et pagination
      const data = response.data || response;
      const processedData = Array.isArray(data)
        ? data.map((item) => ({ ...item, id: item._id || item.id }))
        : [];

      setClients(processedData);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      setError('Erreur lors du rafraîchissement des données');
    } finally {
      setLoading(false);
    }
  };

  // Animation de transition d'onglets
  useEffect(() => {
    if (activeTab !== displayedTab) {
      setIsTabTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayedTab(activeTab);
        setIsTabTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab, displayedTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header de section moderne */}
      {loading ? (
        <div className="space-y-6">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-8 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
          {displayedTab === 'table' ? <TableSkeleton rows={5} /> : <GridSkeleton items={8} />}
        </div>
      ) : (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-8 mb-6 shadow-md">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex items-start gap-5">
              <div
                className={`p-4 rounded-lg bg-gradient-to-br ${sectionColor} text-white shadow-md transform hover:scale-[1.01] transition-all duration-200`}
              >
                {sectionIcon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                  {sectionTitle}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <div className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg text-sm font-bold shadow-md">
                    {sectionItems.length}{' '}
                    {sectionItems.length === 1 ? 'dossier' : 'dossiers'}
                  </div>
                  {/* Statistiques par statut pour la section actuelle */}
                  {Object.entries(statusCounts).map(([statut, count]) => (
                    <div key={statut} className="px-3 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-white rounded-lg text-sm font-semibold shadow-md">
                      {count} {statut}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-72">
                <MagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" weight="bold" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={forceRefresh}
                  variant="outline"
                  loading={loading}
                  icon={<ArrowClockwise className="w-4 h-4" weight="bold" />}
                  title="Rafraîchir les données"
                  className="rounded-lg"
                >
                  Rafraîchir
                </Button>
                {section !== 'dp-accordes' && section !== 'dp-refuses' && section !== 'consuel-finalise' && section !== 'raccordement-mes' && (
                  <Button onClick={openAddForm} icon={<Plus className="w-4 h-4" weight="bold" />} className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    Nouveau dossier
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-6 shadow-md">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTabChange('table')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'table'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
            }`}
          >
            <Table className="h-4 w-4" weight="bold" />
            Tableau
          </button>
          <button
            onClick={() => handleTabChange('grid')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'grid'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
            }`}
          >
            <GridFour className="h-4 w-4" weight="bold" />
            Grille
          </button>
          {(section === 'dp-en-cours') && (
            <button
              onClick={() => handleTabChange('calendar')}
              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform scale-105'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
              }`}
            >
              <Calendar className="h-4 w-4" weight="bold" />
              Calendrier
            </button>
          )}
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div
        className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md transition-all duration-200 ${
          isTabTransitioning
            ? 'opacity-0 transform translateX(10px)'
            : 'opacity-100 transform translateX(0)'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 fade-in">
            <svg
              className="animate-spin h-12 w-12 text-amber-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 font-bold text-lg">
              Chargement des données...
            </p>
          </div>
        ) : error ? (
          <EmptyState
            type="error"
            title={error}
            description="Une erreur est survenue lors du chargement des données"
            action={{
              label: 'Réessayer',
              onClick: forceRefresh,
              icon: <ArrowClockwise className="h-5 w-5" weight="bold" />,
            }}
          />
        ) : sectionItems.length === 0 ? (
          <EmptyState
            type={searchQuery ? 'no-results' : 'no-data'}
            title={searchQuery ? 'Aucun résultat' : 'Aucun dossier'}
            description={
              searchQuery
                ? 'Aucun dossier ne correspond à votre recherche'
                : 'Commencez par ajouter votre premier dossier'
            }
            action={
              section !== 'dp-accordes' &&
              section !== 'dp-refuses' &&
              section !== 'consuel-finalise' &&
              section !== 'raccordement-mes'
                ? {
                    label: 'Nouveau dossier',
                    onClick: openAddForm,
                    icon: <Plus className="h-5 w-5" weight="bold" />,
                  }
                : undefined
            }
          />
        ) : (
          <div
            className={`transition-all duration-300 ${
              isTabTransitioning
                ? 'opacity-0 transform translateX(10px)'
                : 'opacity-100 transform translateX(0)'
            }`}
          >
            {displayedTab === 'table' && (
              <div className="slide-in">
                <ClientTable
                  section={section}
                  items={sectionItems}
                  onEdit={openEditForm}
                  onDelete={onDelete}
                  onSave={onSave}
                  onRefresh={forceRefresh}
                />
              </div>
            )}
            {displayedTab === 'grid' && (
              <div className="slide-in">
                <ClientGrid
                  section={section}
                  items={sectionItems}
                  onEdit={openEditForm}
                  onDelete={onDelete}
                />
              </div>
            )}
            {displayedTab === 'calendar' && (
              <div className="slide-in">
                <ClientCalendar
                  section={section}
                  items={sectionItems}
                  onEdit={openEditForm}
                />
              </div>
            )}
            {displayedTab === 'stats' && (
              <div className="slide-in">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Statistiques de la section
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total</span>
                        <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
                          <FileText className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {sectionItems.length}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dossiers</p>
                    </div>

                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Validés</span>
                        <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {
                          sectionItems.filter(
                            (c) =>
                              c.statut?.includes('Accord') ||
                              c.statut?.includes('Validé') ||
                              c.statut?.includes('Terminé') ||
                              c.statut?.includes('MES')
                          ).length
                        }
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dossiers terminés</p>
                    </div>

                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">En cours</span>
                        <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                          <Clock className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {
                          sectionItems.filter(
                            (c) =>
                              c.statut?.includes('En cours') ||
                              c.statut?.includes('Attente')
                          ).length
                        }
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">En traitement</p>
                    </div>

                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Refusés</span>
                        <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md">
                          <XCircle className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {
                          sectionItems.filter(
                            (c) =>
                              c.statut?.includes('Refus') ||
                              c.statut?.includes('Rejet')
                          ).length
                        }
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dossiers refusés</p>
                    </div>
                  </div>

                  {/* Statistiques par statut */}
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Répartition par statut
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(statusCounts).map(([statut, count]) => {
                        const percentage = sectionItems.length > 0 ? (count / sectionItems.length) * 100 : 0;
                        const colors = [
                          'from-indigo-500 to-purple-500',
                          'from-emerald-500 to-green-500',
                          'from-amber-500 to-orange-500',
                          'from-cyan-500 to-blue-500',
                          'from-pink-500 to-rose-500',
                        ];
                        const colorIndex = Object.keys(statusCounts).indexOf(statut) % colors.length;
                        
                        return (
                          <div key={statut}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{statut}</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full bg-gradient-to-r ${colors[colorIndex]} shadow-md transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Statistiques par prestataire */}
                  {sectionItems.some(c => c.prestataire) && (
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-md">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                        Répartition par prestataire
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(
                          sectionItems.reduce((acc, client) => {
                            if (client.prestataire) {
                              acc[client.prestataire] = (acc[client.prestataire] || 0) + 1;
                            }
                            return acc;
                          }, {} as Record<string, number>)
                        )
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([prestataire, count]) => {
                            const percentage = sectionItems.length > 0 ? (count / sectionItems.length) * 100 : 0;
                            const colors = [
                              'from-indigo-500 to-purple-500',
                              'from-emerald-500 to-green-500',
                              'from-amber-500 to-orange-500',
                              'from-cyan-500 to-blue-500',
                              'from-pink-500 to-rose-500',
                            ];
                            const colorIndex = Object.keys(statusCounts).indexOf(prestataire) % colors.length;
                            
                            return (
                              <div key={prestataire}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{prestataire}</span>
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">{count} ({percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-2 rounded-full bg-gradient-to-r ${colors[colorIndex]} shadow-md transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal du formulaire */}
      {showForm && (
        <ClientForm
          section={section}
          client={editingClient}
          onSave={onSave}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}

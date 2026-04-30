'use client';

import { useState, useEffect } from 'react';
import {
  User,
  CheckCircle,
  Clock,
  Buildings,
  Flag,
  MagnifyingGlass,
  X,
  TrendUp,
  Faders,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface ClientStage {
  section: string;
  statut?: string;
  date?: string;
  noDp?: string;
  financement?: string;
  typeConsuel?: string;
  clientId?: string;
}

interface AggregatedClient {
  name: string;
  stages: Record<string, ClientStage>;
  ville?: string;
  financement?: string;
  clientId?: string;
}

export default function ClientAggregationView() {
  const [clients, setClients] = useState<AggregatedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompleted, setFilterCompleted] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'excel' | 'csv' | 'json' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { setSectionCounts } = useAppStore();

  // Check for download parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const downloadParam = urlParams.get('download');
    if (downloadParam === 'excel' || downloadParam === 'csv' || downloadParam === 'json') {
      setDownloadFormat(downloadParam);
    }
  }, []);

  const handleDownload = async (format: 'excel' | 'csv' | 'json') => {
    setIsDownloading(true);

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement ${format.toUpperCase()}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      const fileExtensions: Record<string, string> = {
        excel: 'xlsx',
        csv: 'csv',
        json: 'json',
      };

      link.setAttribute('download', `clients_${timestamp}.${fileExtensions[format]}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Clear download format and update URL
      setDownloadFormat(null);
      const urlWithoutDownload = window.location.pathname + window.location.search.replace(/[?&]download=[^&]*/, '');
      window.history.replaceState({}, '', urlWithoutDownload);

    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      alert(`Erreur lors de l'export ${format.toUpperCase()}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const cancelDownload = () => {
    setDownloadFormat(null);
    const urlWithoutDownload = window.location.pathname + window.location.search.replace(/[?&]download=[^&]*/, '');
    window.history.replaceState({}, '', urlWithoutDownload);
  };

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

  useEffect(() => {
    fetchAllClients();
    fetchSectionCounts();
  }, []);

  // Rafraîchir les données quand l'utilisateur revient sur l'onglet
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAllClients();
        fetchSectionCounts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchAllClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients/sync');
      const response = await res.json();
      const data = response.data || response;

      if (Array.isArray(data)) {
        const aggregatedClients: AggregatedClient[] = data.map((item: any) => ({
          name: item.client,
          ville: item.ville,
          financement: item.financement,
          clientId: item.clientId,
          stages: item.stages || {},
        }));
        setClients(aggregatedClients);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifie si un stage est finalisé (vert)
  const isStageCompleted = (sectionKey: string, stage?: ClientStage) => {
    if (!stage) return false;
    
    const status = stage.statut?.toLowerCase() || '';
    
    // DP Accordés - toujours finalisé
    if (sectionKey === 'dp-accordes') return true;
    
    // Consuel Finalisé - toujours finalisé
    if (sectionKey === 'consuel-finalise') return true;
    
    // Raccordement MES - toujours finalisé
    if (sectionKey === 'raccordement-mes') return true;
    
    // DAACT - validé si statut contient validé/fait/ok/transmis
    if (sectionKey === 'daact') {
      if (status.includes('validé') || status.includes('fait') || status.includes('ok') || 
          status.includes('transmis')) return true;
    }
    
    // Raccordement - validé si statut contient service/transmis
    if (sectionKey === 'raccordement') {
      if (status.includes('service') || status.includes('mis en service')) return true;
    }
    
    return false;
  };

  // Vérifie si un stage est en cours/en attente (orange)
  const isStageInProgress = (sectionKey: string, stage?: ClientStage) => {
    if (!stage) return false;
    if (isStageCompleted(sectionKey, stage)) return false;
    
    const status = stage.statut?.toLowerCase() || '';
    
    // DP En Cours - ABF ou En cours d'instruction
    if (sectionKey === 'dp-en-cours') {
      if (status.includes('abf') || status.includes('instruction') || status.includes('cours')) return true;
    }
    
    // Consuel En Cours - Traitement en cours
    if (sectionKey === 'consuel-en-cours') {
      if (status.includes('traitement') || status.includes('cours') || status.includes('avis')) return true;
    }
    
    // DAACT - n'importe quel statut non validé = en cours
    if (sectionKey === 'daact' && stage.statut) return true;
    
    // Raccordement - Demande transmise = en cours
    if (sectionKey === 'raccordement') {
      if (status.includes('transmis') || status.includes('demande')) return true;
    }
    
    return false;
  };

  // Détermine le statut à afficher pour un stage
  const getStageStatus = (sectionKey: string, stage?: ClientStage): 'completed' | 'inprogress' | 'empty' => {
    if (!stage) return 'empty';
    if (isStageCompleted(sectionKey, stage)) return 'completed';
    if (isStageInProgress(sectionKey, stage)) return 'inprogress';
    return 'empty';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'inprogress':
        return 'bg-amber-500 text-white border-amber-600';
      default:
        return 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  // Calcule la progression réelle du client
  const getProgressForClient = (client: AggregatedClient) => {
    let completed = 0;
    let inProgress = 0;
    
    // Vérifier DP (en cours ou accordé)
    const dpStage = client.stages['dp-accordes'] || client.stages['dp-en-cours'];
    if (isStageCompleted('dp-accordes', client.stages['dp-accordes'])) completed++;
    else if (isStageInProgress('dp-en-cours', client.stages['dp-en-cours'])) inProgress++;
    
    // Vérifier DAACT
    if (isStageCompleted('daact', client.stages['daact'])) completed++;
    else if (isStageInProgress('daact', client.stages['daact'])) inProgress++;
    
    // Vérifier Consuel (en cours ou finalisé)
    if (isStageCompleted('consuel-finalise', client.stages['consuel-finalise'])) completed++;
    else if (isStageInProgress('consuel-en-cours', client.stages['consuel-en-cours'])) inProgress++;
    
    // Vérifier Raccordement (en cours ou MES)
    if (isStageCompleted('raccordement-mes', client.stages['raccordement-mes'])) completed++;
    else if (isStageInProgress('raccordement', client.stages['raccordement'])) inProgress++;
    
    const totalStages = 4; // 4 étapes majeures
    const progressValue = (completed * 100 + inProgress * 50) / totalStages; // 100% pour terminé, 50% pour en cours
    
    return { 
      completed, 
      inProgress,
      total: totalStages, 
      percentage: Math.round(progressValue)
    };
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.ville?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.clientId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterCompleted) {
      const progress = getProgressForClient(client);
      return progress.percentage === 100;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Download Modal */}
      {downloadFormat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Télécharger les données clients
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Voulez-vous télécharger tous les clients au format {downloadFormat.toUpperCase()} ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDownload}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  disabled={isDownloading}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDownload(downloadFormat)}
                  disabled={isDownloading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <CheckCircle weight="bold" className="w-4 h-4" />
                      Télécharger
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 p-2">
      {/* Compact Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
              <TrendUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Vue Clients
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Compact Filter */}
            <button
              onClick={() => setFilterCompleted(!filterCompleted)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                filterCompleted 
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
              )}
            >
              <Faders className="h-3.5 w-3.5" />
              {filterCompleted ? 'Tous' : 'Terminés'}
            </button>
            
            {/* Compact Search */}
            <div className="relative">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-40 sm:w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Legend */}
      <div className="flex items-center gap-4 text-xs px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle className="h-2 w-2 text-white" />
          </div>
          <span className="text-slate-600 dark:text-slate-400">Validé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center">
            <Clock className="h-2 w-2 text-white" />
          </div>
          <span className="text-slate-600 dark:text-slate-400">En cours</span>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map((client, index) => {
          const progress = getProgressForClient(client);
          
          return (
            <div
              key={`${client.name}-${index}`}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Client Header - Compact */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                        {client.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {client.ville && (
                          <span className="flex items-center gap-1 truncate">
                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                            {client.ville}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar - Compact */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-28">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          progress.percentage === 100 ? 'bg-emerald-500' : 'bg-primary-500'
                        )}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <span className={cn(
                      'text-xs font-bold whitespace-nowrap',
                      progress.percentage === 100 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'
                    )}>
                      {progress.percentage}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Stages Grid - 4 étapes compactes */}
              <div className="p-3">
                <div className="grid grid-cols-4 gap-2">
                  {/* DP */}
                  {(() => {
                    const finalStage = client.stages['dp-accordes'];
                    const inProgressStage = client.stages['dp-en-cours'];
                    const isCompleted = isStageCompleted('dp-accordes', finalStage);
                    const isInProgress = isStageInProgress('dp-en-cours', inProgressStage);
                    const stage = finalStage || inProgressStage;
                    const status = isCompleted ? 'completed' : isInProgress ? 'inprogress' : 'empty';
                    
                    return (
                      <div
                        className={cn(
                          'relative rounded-lg p-2 border-2 transition-all',
                          status === 'completed' && 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-500',
                          status === 'inprogress' && 'bg-amber-50 border-amber-500 dark:bg-amber-900/20 dark:border-amber-500',
                          status === 'empty' && 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                        )}
                      >
                        <div className="flex flex-col items-center text-center gap-0.5">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            status === 'completed' && 'bg-emerald-500 text-white',
                            status === 'inprogress' && 'bg-amber-500 text-white',
                            status === 'empty' && 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                          )}>
                            {status === 'completed' ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : status === 'inprogress' ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-current" />
                            )}
                          </div>
                          <span className={cn(
                            'text-[10px] font-bold leading-tight',
                            status === 'completed' && 'text-emerald-700 dark:text-emerald-400',
                            status === 'inprogress' && 'text-amber-700 dark:text-amber-400',
                            status === 'empty' && 'text-slate-400'
                          )}>DP</span>
                          {stage?.statut && status !== 'empty' && (
                            <span className="text-[8px] text-slate-500 truncate w-full px-0.5 leading-tight">{stage.statut}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* DAACT */}
                  {(() => {
                    const stage = client.stages['daact'];
                    const isCompleted = isStageCompleted('daact', stage);
                    const isInProgress = isStageInProgress('daact', stage);
                    const status = isCompleted ? 'completed' : isInProgress ? 'inprogress' : 'empty';
                    
                    return (
                      <div
                        className={cn(
                          'relative rounded-lg p-2 border-2 transition-all',
                          status === 'completed' && 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-500',
                          status === 'inprogress' && 'bg-amber-50 border-amber-500 dark:bg-amber-900/20 dark:border-amber-500',
                          status === 'empty' && 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                        )}
                      >
                        <div className="flex flex-col items-center text-center gap-0.5">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            status === 'completed' && 'bg-emerald-500 text-white',
                            status === 'inprogress' && 'bg-amber-500 text-white',
                            status === 'empty' && 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                          )}>
                            {status === 'completed' ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : status === 'inprogress' ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-current" />
                            )}
                          </div>
                          <span className={cn(
                            'text-[10px] font-bold leading-tight',
                            status === 'completed' && 'text-emerald-700 dark:text-emerald-400',
                            status === 'inprogress' && 'text-amber-700 dark:text-amber-400',
                            status === 'empty' && 'text-slate-400'
                          )}>DAACT</span>
                          {stage?.statut && status !== 'empty' && (
                            <span className="text-[8px] text-slate-500 truncate w-full px-0.5 leading-tight">{stage.statut}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Consuel */}
                  {(() => {
                    const finalStage = client.stages['consuel-finalise'];
                    const inProgressStage = client.stages['consuel-en-cours'];
                    const isCompleted = isStageCompleted('consuel-finalise', finalStage);
                    const isInProgress = isStageInProgress('consuel-en-cours', inProgressStage);
                    const stage = finalStage || inProgressStage;
                    const status = isCompleted ? 'completed' : isInProgress ? 'inprogress' : 'empty';
                    
                    return (
                      <div
                        className={cn(
                          'relative rounded-lg p-2 border-2 transition-all',
                          status === 'completed' && 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-500',
                          status === 'inprogress' && 'bg-amber-50 border-amber-500 dark:bg-amber-900/20 dark:border-amber-500',
                          status === 'empty' && 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                        )}
                      >
                        <div className="flex flex-col items-center text-center gap-0.5">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            status === 'completed' && 'bg-emerald-500 text-white',
                            status === 'inprogress' && 'bg-amber-500 text-white',
                            status === 'empty' && 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                          )}>
                            {status === 'completed' ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : status === 'inprogress' ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-current" />
                            )}
                          </div>
                          <span className={cn(
                            'text-[10px] font-bold leading-tight',
                            status === 'completed' && 'text-emerald-700 dark:text-emerald-400',
                            status === 'inprogress' && 'text-amber-700 dark:text-amber-400',
                            status === 'empty' && 'text-slate-400'
                          )}>Consuel</span>
                          {stage?.statut && status !== 'empty' && (
                            <span className="text-[8px] text-slate-500 truncate w-full px-0.5 leading-tight">{stage.statut}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Raccordement / MES */}
                  {(() => {
                    const finalStage = client.stages['raccordement-mes'];
                    const inProgressStage = client.stages['raccordement'];
                    const isCompleted = isStageCompleted('raccordement-mes', finalStage);
                    const isInProgress = isStageInProgress('raccordement', inProgressStage);
                    const stage = finalStage || inProgressStage;
                    const status = isCompleted ? 'completed' : isInProgress ? 'inprogress' : 'empty';
                    
                    return (
                      <div
                        className={cn(
                          'relative rounded-lg p-2 border-2 transition-all',
                          status === 'completed' && 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-500',
                          status === 'inprogress' && 'bg-amber-50 border-amber-500 dark:bg-amber-900/20 dark:border-amber-500',
                          status === 'empty' && 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                        )}
                      >
                        <div className="flex flex-col items-center text-center gap-0.5">
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center',
                            status === 'completed' && 'bg-emerald-500 text-white',
                            status === 'inprogress' && 'bg-amber-500 text-white',
                            status === 'empty' && 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                          )}>
                            {status === 'completed' ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : status === 'inprogress' ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border-2 border-current" />
                            )}
                          </div>
                          <span className={cn(
                            'text-[10px] font-bold leading-tight',
                            status === 'completed' && 'text-emerald-700 dark:text-emerald-400',
                            status === 'inprogress' && 'text-amber-700 dark:text-amber-400',
                            status === 'empty' && 'text-slate-400'
                          )}>{isCompleted ? 'MES' : 'Racc.'}</span>
                          {stage?.statut && status !== 'empty' && (
                            <span className="text-[8px] text-slate-500 truncate w-full px-0.5 leading-tight">{stage.statut}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State - Compact */}
      {filteredClients.length === 0 && (
        <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-700 mb-3">
            <User className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Aucun client trouvé
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Essayez de modifier votre recherche
          </p>
        </div>
      )}
    </div>
    </>
  );
}

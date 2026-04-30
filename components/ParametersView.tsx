'use client';

import { useState } from 'react';
import { Download, Upload, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ParametersView() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDownload = (format: 'excel' | 'csv' | 'json') => {
    // Rediriger vers la vue clients avec le paramètre de format
    window.location.href = `/dashboard?section=clients&download=${format}`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: result.message || 'Fichier importé avec succès!',
        });
        // Reset file input
        event.target.value = '';
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Erreur lors de l\'import du fichier',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'import du fichier',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Paramètres
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez l'import et l'export de vos données clients
          </p>
        </div>

        {/* Message d'alerte/succès */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" weight="fill" />
            ) : (
              <WarningCircle className="text-red-600 dark:text-red-400 flex-shrink-0" weight="fill" />
            )}
            <p
              className={`text-sm font-medium ${
                message.type === 'success'
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Télécharger les données
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Téléchargez vos données clients dans le format de votre choix
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleDownload('excel')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download weight="bold" className="w-4 h-4" />
                    Télécharger Excel
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownload('csv')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download weight="bold" className="w-4 h-4" />
                    Télécharger CSV
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownload('json')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <Download weight="bold" className="w-4 h-4" />
                    Télécharger JSON
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Importer des données
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Importez des données depuis un fichier Excel, CSV ou JSON
            </p>

            <div className="flex flex-col gap-4">
              <label className="relative block">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  accept=".xlsx,.xls,.csv,.json"
                  className="hidden"
                  aria-label="Uploader un fichier"
                />
                <div className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  onClick={(e) => {
                    if (isLoading) {
                      e.preventDefault();
                      return;
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Upload weight="bold" className="w-4 h-4" />
                      Sélectionner un fichier
                    </>
                  )}
                </div>
              </label>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formats supportés : Excel (.xlsx, .xls), CSV (.csv), JSON (.json)
              </p>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <span className="font-semibold">Conseil :</span> Les exports incluent tous vos clients avec leurs informations complètes.
            Les imports doivent respecter le même format que les exports.
          </p>
        </div>
      </div>
    </div>
  );
}

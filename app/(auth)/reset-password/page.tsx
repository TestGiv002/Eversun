'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Envelope,
  Lock,
  ArrowLeft,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Erreur lors de la reinitialisation');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-primary rounded-2xl shadow-md p-8 border border-primary">
          <div className="mb-6">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" weight="bold" />
              Retour a la connexion
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-xl mb-4 shadow-sm">
              <Lock className="w-7 h-7 text-white" weight="bold" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-1">
              Reinitialisation
            </h1>
            <p className="text-secondary">
              Definissez votre nouveau mot de passe
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Envelope className="h-4 w-4" weight="bold" />}
                required
              />
              <Input
                type="password"
                label="Nouveau mot de passe"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" weight="bold" />}
                required
              />
              <Input
                type="password"
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" weight="bold" />}
                required
              />

              {error && (
                <div className="border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <Warning className="w-4 h-4 flex-shrink-0" weight="bold" />
                  {error}
                </div>
              )}

              <Button type="submit" loading={isLoading} className="w-full">
                {isLoading
                  ? 'Reinitialisation en cours...'
                  : 'Reinitialiser le mot de passe'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-xl mb-4 shadow-sm">
                <CheckCircle className="w-7 h-7 text-white" weight="bold" />
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">
                Mot de passe reinitialise
              </h2>
              <p className="text-secondary">
                Redirection vers la page de connexion...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

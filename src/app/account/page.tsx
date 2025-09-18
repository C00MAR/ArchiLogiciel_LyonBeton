'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  avatarUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(1, 'Confirmez le nouveau mot de passe'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || '',
      avatarUrl: session?.user?.image || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }

      await update();
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du changement de mot de passe');
      }

      passwordForm.reset();
      setMessage({ type: 'success', text: 'Mot de passe changé avec succès' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/email/verification/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email');
      }

      setMessage({ type: 'success', text: 'Email de vérification envoyé' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Mon Compte</h1>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ borderBottom: '1px solid #ddd', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid #007bff' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
          }}
        >
          Profil
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            padding: '1rem 2rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'security' ? '2px solid #007bff' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'security' ? 'bold' : 'normal'
          }}
        >
          Sécurité
        </button>
      </div>

      {activeTab === 'profile' && (
        <div>
          <h2>Informations du profil</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="name">Nom</label>
              <input
                id="name"
                type="text"
                {...profileForm.register('name')}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginTop: '0.25rem'
                }}
              />
              {profileForm.formState.errors.name && (
                <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="avatarUrl">URL de l&apos;avatar (optionnel)</label>
              <input
                id="avatarUrl"
                type="url"
                {...profileForm.register('avatarUrl')}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginTop: '0.25rem'
                }}
              />
              {profileForm.formState.errors.avatarUrl && (
                <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {profileForm.formState.errors.avatarUrl.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div>
          <h2>Sécurité</h2>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Vérification de l&apos;email</h3>
            <p>Email: {session.user?.email}</p>
            <p>Statut: {session.user?.emailVerified ? 'Vérifié' : 'Non vérifié'}</p>
            {!session.user?.emailVerified && (
              <button
                type="button"
                onClick={resendVerificationEmail}
                disabled={isLoading}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Envoi...' : 'Re-envoyer email de vérification'}
              </button>
            )}
          </div>

          <div>
            <h3>Changer le mot de passe</h3>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register('currentPassword')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '0.25rem'
                  }}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register('newPassword')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '0.25rem'
                  }}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '0.25rem'
                  }}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

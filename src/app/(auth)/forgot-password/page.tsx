'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/password/reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json() as { message?: string; error?: string };

      if (response.ok) {
        setMessage(result.message ?? null);
      } else {
        setError(result.error ?? 'Une erreur est survenue');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Mot de passe oublié</h2>

      {message ? (
        <div>
          <p>{message}</p>
          <a href="/login">Retour à la connexion</a>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <p>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>

          {error && <div>{error}</div>}

          <div>
            <label htmlFor="email">Adresse email</label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="votre@email.com"
            />
            {errors.email && <p>{errors.email.message}</p>}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </button>

          <div>
            <a href="/login">Retour à la connexion</a>
          </div>
        </form>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';

const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('Token manquant ou invalide');
    }
  }, [token]);

  const confirmPasswordResetMutation = api.auth.confirmPasswordReset.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    },
    onError: (error) => {
      setError(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    if (!token) {
      setError('Token manquant');
      return;
    }

    setIsLoading(true);
    setError(null);

    confirmPasswordResetMutation.mutate({
      token,
      password: data.password,
    });
  };

  if (!token) {
    return (
      <div>
        <h2>Erreur</h2>
        <p>Token de réinitialisation manquant ou invalide.</p>
        <a href="/login">Retour à la connexion</a>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <h2>Mot de passe réinitialisé</h2>
        <p>Votre mot de passe a été mis à jour avec succès.</p>
        <p>Vous allez être redirigé vers la page de connexion...</p>
        <a href="/login">Se connecter maintenant</a>
      </div>
    );
  }

  return (
    <div>
      <h2>Nouveau mot de passe</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <div>{error}</div>}

        <div>
          <label htmlFor="password">Nouveau mot de passe</label>
          <input
            {...register('password')}
            type="password"
            id="password"
            placeholder="Nouveau mot de passe"
          />
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            placeholder="Confirmer le mot de passe"
          />
          {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>

        <div>
          <a href="/login">Retour à la connexion</a>
        </div>
      </form>

      <div>
        <h3>Exigences du mot de passe :</h3>
        <ul>
          <li>Au moins 8 caractères</li>
          <li>Au moins une lettre minuscule</li>
          <li>Au moins une lettre majuscule</li>
          <li>Au moins un chiffre</li>
          <li>Au moins un caractère spécial (@$!%*?&)</li>
        </ul>
      </div>
    </div>
  );
}
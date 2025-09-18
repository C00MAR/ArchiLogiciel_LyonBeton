'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      router.push('/auth/verify-email');
    },
    onError: (error) => {
      setServerError(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);
    registerMutation.mutate(data);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      await signIn(provider, {
        callbackUrl: '/account',
      });
    } catch {
      setServerError('Erreur de connexion');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {serverError && <div>{serverError}</div>}

        <div>
          <label htmlFor="name">Nom complet</label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder="Votre nom"
          />
          {errors.name && <p>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="votre@email.com"
          />
          {errors.email && <p>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            {...register('password')}
            type="password"
            id="password"
            placeholder="Mot de passe (8 caractères minimum)"
          />
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Création en cours...' : "S'inscrire"}
        </button>
      </form>

      <div>
        <span>ou</span>
      </div>

      <div>
        <button
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading}
        >
          Continuer avec Google
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn('github')}
          disabled={isLoading}
        >
          Continuer avec GitHub
        </button>
      </div>

      <div>
        <span>
          Déjà un compte ?{' '}
          <a href="/login">Se connecter</a>
        </span>
      </div>
    </div>
  );
}
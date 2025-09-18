'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          try {
            const response = await fetch('/api/auth/check-2fa', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: data.email, password: data.password }),
            });

            if (response.ok) {
              const userData = await response.json();
              if (userData.twoFactorRequired) {
                router.push(`/auth/verify-2fa?userId=${userData.userId}&callbackUrl=${encodeURIComponent(from ?? '/account')}`);
                return;
              }
            }
          } catch {
          }
        }

        setError('Email ou mot de passe incorrect');
      } else if (result?.ok) {
        router.push(from ?? '/account');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      await signIn(provider, {
        callbackUrl: from ?? '/account',
      });
    } catch {
      setError('Erreur de connexion');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Se connecter</h2>
      {from && (
        <p>Vous devez vous connecter pour accéder à cette page.</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        {error && <div>{error}</div>}

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
            placeholder="Mot de passe"
          />
          {errors.password && <p>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
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
        <a href="/forgot-password">Mot de passe oublié ?</a>
      </div>

      <div>
        <span>
          Pas encore de compte ?{' '}
          <a href="/register">S'inscrire</a>
        </span>
      </div>
    </div>
  );
}

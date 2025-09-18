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
        setError('Email ou mot de passe incorrect');
      } else if (result?.ok) {
        router.push(from || '/account');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
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

        <div>
          <a href="/forgot-password">Mot de passe oublié ?</a>
        </div>

        <div>
          <span>
            Pas encore de compte ?{' '}
            <a href="/register">S'inscrire</a>
          </span>
        </div>
      </form>
    </div>
  );
}

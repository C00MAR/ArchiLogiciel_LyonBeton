'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/auth/verify-email');
      } else {
        const errorData = await response.json() as { error?: string };
        setServerError(errorData.error ?? 'Une erreur est survenue');
      }
    } catch {
      setServerError('Erreur de connexion au serveur');
    } finally {
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

        <div>
          <span>
            Déjà un compte ?{' '}
            <a href="/auth/login">Se connecter</a>
          </span>
        </div>
      </form>
    </div>
  );
}
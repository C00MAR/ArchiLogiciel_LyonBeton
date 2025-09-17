'use client';

import { useRequireAuth } from '~/hooks/useRequireAuth';

export default function ProtectedExamplePage() {
  const { session, loading, authenticated } = useRequireAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div>
      <h1>Page protégée (côté client)</h1>
      <p>Cette page utilise le hook useRequireAuth</p>
      <p>Utilisateur connecté : {session?.user.name}</p>
    </div>
  );
}
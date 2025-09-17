import { redirect } from 'next/navigation';
import { auth } from '~/lib/auth';
import LogoutButton from '~/components/LogoutButton';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenue, {session.user.name} !</p>
      <p>Email: {session.user.email}</p>
      <p>Rôle: {session.user.role}</p>
      <p>Email vérifié: {session.user.emailVerified ? 'Oui' : 'Non'}</p>

      <LogoutButton>Se déconnecter</LogoutButton>
    </div>
  );
}
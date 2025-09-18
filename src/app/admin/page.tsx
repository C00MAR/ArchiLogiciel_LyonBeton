import { redirect } from 'next/navigation';
import { auth } from '~/lib/auth';

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div>
      <h1>Administration</h1>
      <p>Bienvenue dans l interface d administration, {session.user.name} !</p>
      <p>Votre rôle : {session.user.role}</p>
    </div>
  );
}

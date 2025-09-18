'use client';

import { signOut } from 'next-auth/react';

interface LogoutButtonProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function LogoutButton({
  children = 'Se déconnecter',
  className,
  disabled = false
}: LogoutButtonProps) {
  const handleLogout = () => {
    void signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleLogout}
      className={className}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '~/trpc/react';

const verifyCodeSchema = z.object({
  code: z.string().min(6, 'Code requis').max(6, 'Code invalide'),
});

const enableTwoFactorSchema = z.object({
  code: z.string().min(6, 'Code requis').max(6, 'Code invalide'),
  secret: z.string().min(1, 'Secret requis'),
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;
type EnableTwoFactorFormData = z.infer<typeof enableTwoFactorSchema>;

export default function TwoFactorPage() {
  const [step, setStep] = useState<'status' | 'setup' | 'disable' | 'regenerate'>('status');
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const { data: status, refetch: refetchStatus } = api.twoFactor.getStatus.useQuery(
    undefined,
    { enabled: sessionStatus === 'authenticated' }
  );

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: errorsVerify },
    reset: resetVerify,
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
  });

  const {
    register: registerEnable,
    handleSubmit: handleSubmitEnable,
    formState: { errors: errorsEnable },
    reset: resetEnable,
  } = useForm<EnableTwoFactorFormData>({
    resolver: zodResolver(enableTwoFactorSchema),
  });

  const generateSecretMutation = api.twoFactor.generateSecret.useMutation({
    onSuccess: (data) => {
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setStep('setup');
    },
  });

  const enableMutation = api.twoFactor.enable.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      refetchStatus();
      resetEnable();
    },
  });

  const disableMutation = api.twoFactor.disable.useMutation({
    onSuccess: () => {
      setStep('status');
      refetchStatus();
      resetVerify();
    },
  });

  const regenerateBackupCodesMutation = api.twoFactor.regenerateBackupCodes.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setStep('status');
      resetVerify();
    },
  });

  const handleSetup = () => {
    generateSecretMutation.mutate();
  };

  const handleEnable = (data: EnableTwoFactorFormData) => {
    enableMutation.mutate({
      code: data.code,
      secret: secret,
    });
  };

  const handleDisable = (data: VerifyCodeFormData) => {
    disableMutation.mutate(data);
  };

  const handleRegenerateBackupCodes = (data: VerifyCodeFormData) => {
    regenerateBackupCodesMutation.mutate(data);
  };

  const downloadBackupCodes = () => {
    const content = `Codes de secours Lyon Béton\nGénérés le: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nConservez ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes-lyon-beton.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (sessionStatus === 'loading') {
    return <div>Chargement...</div>;
  }

  if (sessionStatus === 'unauthenticated') {
    void router.push('/login');
    return <div>Redirection...</div>;
  }

  if (!status) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Authentification à deux facteurs (2FA)</h1>

      {showBackupCodes && (
        <div>
          <h2>⚠️ Codes de secours</h2>
          <p>Sauvegardez ces codes immédiatement. Ils vous permettront d'accéder à votre compte si vous perdez votre appareil d'authentification.</p>

          <div>
            {backupCodes.map((code, index) => (
              <div key={index}>{code}</div>
            ))}
          </div>

          <div>
            <button onClick={downloadBackupCodes}>
              📥 Télécharger en .txt
            </button>
            <button onClick={() => {
              setShowBackupCodes(false);
              setStep('status');
              void refetchStatus();
            }}>
              J'ai sauvegardé mes codes
            </button>
          </div>
        </div>
      )}

      {step === 'status' && (
        <div>
          <div>
            <h2>Statut: {status.enabled ? '✅ Activé' : '❌ Désactivé'}</h2>
            {status.enabled && (
              <p>Codes de secours restants: {status.backupCodesCount}</p>
            )}
          </div>

          {!status.enabled ? (
            <div>
              <p>L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.</p>
              <button
                onClick={handleSetup}
                disabled={generateSecretMutation.isPending}
              >
                {generateSecretMutation.isPending ? 'Génération...' : 'Activer 2FA'}
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setStep('disable')}
              >
                Désactiver 2FA
              </button>
              <button onClick={() => setStep('regenerate')}>
                Régénérer codes de secours
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'setup' && (
        <div>
          <h2>Configuration 2FA</h2>

          <div>
            <h3>1. Scannez le QR Code</h3>
            <p>Utilisez Google Authenticator, Authy, ou une autre app TOTP :</p>
            {qrCode && <img src={qrCode} alt="QR Code 2FA" />}
          </div>

          <div>
            <h3>2. Saisie manuelle (optionnel)</h3>
            <p>Clé secrète: <code>{secret}</code></p>
          </div>

          <div>
            <h3>3. Vérifiez avec un code</h3>
            <form onSubmit={handleSubmitEnable(handleEnable)}>
              <input type="hidden" {...registerEnable('secret')} value={secret} />

              <div>
                <label htmlFor="code">Code à 6 chiffres</label>
                <input
                  {...registerEnable('code')}
                  type="text"
                  id="code"
                  placeholder="123456"
                  maxLength={6}
                />
                {errorsEnable.code && <p>{errorsEnable.code.message}</p>}
              </div>

              <button
                type="submit"
                disabled={enableMutation.isPending}
              >
                {enableMutation.isPending ? 'Vérification...' : 'Activer 2FA'}
              </button>

              <button
                type="button"
                onClick={() => setStep('status')}
              >
                Annuler
              </button>
            </form>

            {enableMutation.error && (
              <div>
                {enableMutation.error.message}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'disable' && (
        <div>
          <h2>Désactiver 2FA</h2>
          <p>⚠️ Attention: Désactiver 2FA réduit la sécurité de votre compte.</p>

          <form onSubmit={handleSubmitVerify(handleDisable)}>
            <div>
              <label htmlFor="code">Code de vérification</label>
              <input
                {...registerVerify('code')}
                type="text"
                id="code"
                placeholder="123456"
                maxLength={6}
              />
              {errorsVerify.code && <p>{errorsVerify.code.message}</p>}
            </div>

            <button
              type="submit"
              disabled={disableMutation.isPending}
            >
              {disableMutation.isPending ? 'Désactivation...' : 'Désactiver 2FA'}
            </button>

            <button
              type="button"
              onClick={() => setStep('status')}
            >
              Annuler
            </button>
          </form>

          {disableMutation.error && (
            <div>
              {disableMutation.error.message}
            </div>
          )}
        </div>
      )}

      {step === 'regenerate' && (
        <div>
          <h2>Régénérer codes de secours</h2>
          <p>⚠️ Attention: Vos anciens codes de secours ne fonctionneront plus.</p>

          <form onSubmit={handleSubmitVerify(handleRegenerateBackupCodes)}>
            <div>
              <label htmlFor="code">Code de vérification</label>
              <input
                {...registerVerify('code')}
                type="text"
                id="code"
                placeholder="123456"
                maxLength={6}
              />
              {errorsVerify.code && <p>{errorsVerify.code.message}</p>}
            </div>

            <button
              type="submit"
              disabled={regenerateBackupCodesMutation.isPending}
            >
              {regenerateBackupCodesMutation.isPending ? 'Génération...' : 'Régénérer codes'}
            </button>

            <button
              type="button"
              onClick={() => setStep('status')}
            >
              Annuler
            </button>
          </form>

          {regenerateBackupCodesMutation.error && (
            <div>
              {regenerateBackupCodesMutation.error.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PasswordResetProps {
	resetUrl: string;
	userName: string;
}

export default function PasswordReset(props: PasswordResetProps) {
	const { resetUrl, userName } = props;

	const text = `
Bonjour ${userName},

Vous avez demandé à réinitialiser votre mot de passe. Pour créer un nouveau mot de passe, cliquez sur le lien ci-dessous :

${resetUrl}

Ce lien expirera dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe actuel restera inchangé.

Cordialement,
L'équipe
	`;

	const html = `
		<div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px;">
			<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(17, 24, 39, 0.08);">
				<div style="background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%); padding: 32px 20px; text-align: center;">
					<h1 style="color: #ffffff; margin: 0; font-size: 22px;">Réinitialisation du mot de passe</h1>
				</div>

				<div style="padding: 32px 24px; color: #111827;">
					<p style="margin: 0 0 16px 0;">Bonjour <strong>${userName}</strong>,</p>

					<p style="margin: 0 0 16px 0;">Vous avez demandé à réinitialiser votre mot de passe. Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>

					<p style="margin: 24px 0; text-align: center;">
						<a href="${resetUrl}" style="display: inline-block; padding: 12px 22px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Réinitialiser mon mot de passe</a>
					</p>

					<p style="margin: 0 0 8px 0;">Ou copiez ce lien dans votre navigateur :</p>
					<p style="margin: 0 0 16px 0; word-break: break-all; color: #dc2626;">${resetUrl}</p>

					<p style="margin: 0 0 8px 0;"><small>Ce lien expirera dans 1 heure.</small></p>

					<p style="margin: 0 0 16px 0;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe actuel restera inchangé.</p>

					<p style="margin: 0;">Cordialement,<br>L'équipe</p>
				</div>

				<div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
					<p style="margin: 0;">Cet email vous a été envoyé suite à une demande de réinitialisation.</p>
				</div>
			</div>
		</div>
	`;

	return { text, html };
} 
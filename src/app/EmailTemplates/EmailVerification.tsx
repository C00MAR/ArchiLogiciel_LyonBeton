type EmailVerificationProps = {
    userName: string;
    verificationUrl: string;
}

export default function EmailVerification(Props: EmailVerificationProps) {
    const { userName, verificationUrl } = Props;

    const emailContent = {
        text: `Bonjour ${userName}, Merci de vous être inscrit ! Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :${verificationUrl}Ce lien expirera dans 24 heures.Si vous n'avez pas créé de compte, vous pouvez ignorer cet email. Cordialement, L'équipe`,
        html: `<div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(17, 24, 39, 0.08);">
                <div style="background: linear-gradient(135deg, #346df1 0%, #4f80ff 100%); padding: 32px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Vérification de votre email</h1>
                </div>
                <div style="padding: 32px 24px; color: #111827;">
                    <p style="margin: 0 0 16px 0;">Bonjour <strong>${userName}</strong>,</p>
                    <p style="margin: 0 0 16px 0;">Merci de vous être inscrit ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
                    <p style="margin: 24px 0; text-align: center;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 22px; background-color: #346df1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Vérifier mon email</a>
                    </p>
                    <p style="margin: 0 0 8px 0;">Ou copiez ce lien dans votre navigateur :</p>
                    <p style="margin: 0 0 16px 0; word-break: break-all; color: #2563eb;">${verificationUrl}</p>
                    <p style="margin: 0 0 8px 0;"><small>Ce lien expirera dans 24 heures.</small></p>
                    <p style="margin: 0 0 16px 0;">Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
                    <p style="margin: 0;">Cordialement,<br /><strong>L'équipe</strong></p>
                </div>
                <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
                    <p style="margin: 0;">Cet email vous a été envoyé pour vérifier votre adresse</p>
                </div>
            </div>
        </div>`
    };

    return emailContent;
}
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    console.log('📧 Configuration email:', {
      host: process.env.EMAIL_SERVER_HOST || 'localhost',
      port: process.env.EMAIL_SERVER_PORT || '1025',
      from: process.env.EMAIL_FROM || 'noreply@localhost',
      to,
      subject
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'localhost',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '1025'),
      secure: false,
      ignoreTLS: true,
      auth: process.env.EMAIL_SERVER_USER ? {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      } : undefined,
    });

    console.log('🔗 Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie');

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@localhost',
      to,
      subject,
      text,
      html,
    });

    console.log('✅ Email envoyé avec succès:', {
      messageId: result.messageId,
      response: result.response
    });

  } catch (error) {
    console.error('❌ Erreur envoi email:', {
      error: error.message,
      code: error.code,
      command: error.command
    });
    throw new Error('Failed to send email');
  }
}

export function generateVerificationEmailTemplate(verificationUrl: string, userName: string) {
  const text = `
Bonjour ${userName},

Merci de vous être inscrit ! Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :

${verificationUrl}

Ce lien expirera dans 24 heures.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.

Cordialement,
L'équipe
  `;

  const html = `
    <div>
      <h2>Vérification de votre email</h2>

      <p>Bonjour ${userName},</p>

      <p>Merci de vous être inscrit ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>

      <p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007cba; color: white; text-decoration: none; border-radius: 5px;">
          Vérifier mon email
        </a>
      </p>

      <p>Ou copiez ce lien dans votre navigateur :</p>
      <p>${verificationUrl}</p>

      <p><small>Ce lien expirera dans 24 heures.</small></p>

      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>

      <p>Cordialement,<br>L'équipe</p>
    </div>
  `;

  return { text, html };
}
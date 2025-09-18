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
      host: process.env.EMAIL_SERVER_HOST ?? 'localhost',
      port: process.env.EMAIL_SERVER_PORT ?? '1025',
      from: process.env.EMAIL_FROM ?? 'noreply@localhost',
      to,
      subject
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST ?? 'localhost',
      port: parseInt(process.env.EMAIL_SERVER_PORT ?? '1025'),
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
      from: process.env.EMAIL_FROM ?? 'noreply@localhost',
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
    console.error('❌ Erreur envoi email:', error);
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

export function generateOrderConfirmationEmailTemplate(
  orderDetails: {
    id: string;
    total: number;
    items: Array<{
      title: string;
      subtitle: string;
      quantity: number;
      price: number;
    }>;
  },
  customerName: string
) {
  const totalInEuros = (orderDetails.total / 100).toFixed(2);

  const text = `
Bonjour ${customerName},

Merci pour votre commande ! Votre paiement a été confirmé.

Détails de votre commande #${orderDetails.id} :

${orderDetails.items.map(item =>
  `- ${item.title} (${item.subtitle}) x${item.quantity} = ${(item.price * item.quantity / 100).toFixed(2)}€`
).join('\n')}

Total : ${totalInEuros}€

Nous traiterons votre commande dans les plus brefs délais et vous recevrez un email de confirmation d'expédition.

Cordialement,
L'équipe Lyon Béton
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #346df1 0%, #4f80ff 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Confirmation de commande</h1>
      </div>

      <div style="padding: 40px 20px; background-color: white;">
        <p>Bonjour ${customerName},</p>

        <p>Merci pour votre commande ! Votre paiement a été confirmé avec succès.</p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Commande #${orderDetails.id}</h3>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd;">
                <th style="text-align: left; padding: 10px; color: #666;">Produit</th>
                <th style="text-align: right; padding: 10px; color: #666;">Quantité</th>
                <th style="text-align: right; padding: 10px; color: #666;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.items.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">
                    <strong>${item.title}</strong><br>
                    <small style="color: #666;">${item.subtitle}</small>
                  </td>
                  <td style="text-align: right; padding: 10px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 10px;">${(item.price * item.quantity / 100).toFixed(2)}€</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #ddd; font-weight: bold;">
                <td colspan="2" style="padding: 10px; text-align: right;">Total :</td>
                <td style="text-align: right; padding: 10px; font-size: 18px; color: #346df1;">${totalInEuros}€</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p>Nous traiterons votre commande dans les plus brefs délais et vous recevrez un email de confirmation d'expédition.</p>

        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

        <p>Cordialement,<br><strong>L'équipe Lyon Béton</strong></p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>Cet email a été envoyé suite à votre commande sur notre site.</p>
      </div>
    </div>
  `;

  return { text, html };
}

export function generatePaymentFailedEmailTemplate(
  orderDetails: {
    id?: string;
    total?: number;
    customerEmail: string;
  },
  customerName: string
) {
  const text = `
Bonjour ${customerName},

Nous vous informons qu'un problème est survenu lors du traitement de votre paiement.

${orderDetails.id ? `Commande concernée : #${orderDetails.id}` : ''}
${orderDetails.total ? `Montant : ${(orderDetails.total / 100).toFixed(2)}€` : ''}

Aucun montant n'a été débité de votre compte.

Vous pouvez réessayer votre commande à tout moment. Si le problème persiste, veuillez vérifier :
- Les informations de votre carte bancaire
- La limite de votre carte
- Contacter votre banque si nécessaire

N'hésitez pas à nous contacter si vous avez besoin d'aide.

Cordialement,
L'équipe Lyon Béton
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Problème de paiement</h1>
      </div>

      <div style="padding: 40px 20px; background-color: white;">
        <p>Bonjour ${customerName},</p>

        <p>Nous vous informons qu'un problème est survenu lors du traitement de votre paiement.</p>

        ${orderDetails.id || orderDetails.total ? `
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${orderDetails.id ? `<p><strong>Commande concernée :</strong> #${orderDetails.id}</p>` : ''}
          ${orderDetails.total ? `<p><strong>Montant :</strong> ${(orderDetails.total / 100).toFixed(2)}€</p>` : ''}
        </div>
        ` : ''}

        <p><strong>Aucun montant n'a été débité de votre compte.</strong></p>

        <p>Vous pouvez réessayer votre commande à tout moment. Si le problème persiste, veuillez vérifier :</p>
        <ul>
          <li>Les informations de votre carte bancaire</li>
          <li>La limite de votre carte</li>
          <li>Contacter votre banque si nécessaire</li>
        </ul>

        <p>N'hésitez pas à nous contacter si vous avez besoin d'aide.</p>

        <p>Cordialement,<br><strong>L'équipe Lyon Béton</strong></p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>Cet email a été envoyé suite à un problème de paiement sur notre site.</p>
      </div>
    </div>
  `;

  return { text, html };
}

export function generatePasswordResetEmailTemplate(resetUrl: string, userName: string) {
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
    <div>
      <h2>Réinitialisation de votre mot de passe</h2>

      <p>Bonjour ${userName},</p>

      <p>Vous avez demandé à réinitialiser votre mot de passe. Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>

      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">
          Réinitialiser mon mot de passe
        </a>
      </p>

      <p>Ou copiez ce lien dans votre navigateur :</p>
      <p>${resetUrl}</p>

      <p><small>Ce lien expirera dans 1 heure.</small></p>

      <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe actuel restera inchangé.</p>

      <p>Cordialement,<br>L'équipe</p>
    </div>
  `;

  return { text, html };
}

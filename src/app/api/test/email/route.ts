import { NextResponse } from 'next/server';
import { sendEmail } from '~/lib/email';

export async function GET() {
  try {
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test email from Next.js',
      text: 'Ceci est un email de test pour vérifier que MailDev fonctionne.',
      html: '<p>Ceci est un <strong>email de test</strong> pour vérifier que MailDev fonctionne.</p>'
    });

    return NextResponse.json(
      { message: 'Email de test envoyé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email de test', details: error.message },
      { status: 500 }
    );
  }
}
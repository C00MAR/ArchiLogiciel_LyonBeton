import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '~/lib/prisma';
import { sendEmail, generatePasswordResetEmailTemplate } from '~/lib/email';

const requestSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const { email } = requestSchema.parse(body);

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on renvoie toujours un succès
      // même si l'utilisateur n'existe pas
      return NextResponse.json(
        { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' },
        { status: 200 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Votre email doit être vérifié avant de pouvoir réinitialiser le mot de passe.' },
        { status: 400 }
      );
    }

    // Supprimer les anciens tokens de reset pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Générer un nouveau token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Enregistrer le token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    // Envoyer l'email
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const { text, html } = generatePasswordResetEmailTemplate(resetUrl, user.name);

    await sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      text,
      html,
    });

    return NextResponse.json(
      { message: 'Un email de réinitialisation a été envoyé.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
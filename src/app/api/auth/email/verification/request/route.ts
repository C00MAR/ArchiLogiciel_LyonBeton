import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '~/lib/prisma';
import { sendEmail, generateVerificationEmailTemplate } from '~/lib/email';

const requestSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const { email } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Aucun utilisateur trouvé avec cet email' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Cet email est déjà vérifié' },
        { status: 400 }
      );
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/auth/email/verification/verify?token=${token}`;

    const { text, html } = generateVerificationEmailTemplate(verificationUrl, user.name);

    await sendEmail({
      to: email,
      subject: 'Vérifiez votre adresse email',
      text,
      html,
    });

    return NextResponse.json(
      { message: 'Email de vérification envoyé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
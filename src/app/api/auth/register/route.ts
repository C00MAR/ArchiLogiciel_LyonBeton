import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '~/lib/prisma';
import { sendEmail, generateVerificationEmailTemplate } from '~/lib/email';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;

    const validatedData = registerSchema.parse(body);
    const { email, password, name } = validatedData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    try {
      const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/api/auth/email/verification/verify?token=${token}`;

      const { text, html } = generateVerificationEmailTemplate(verificationUrl, name);

      await sendEmail({
        to: email,
        subject: 'Vérifiez votre adresse email',
        text,
        html,
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', emailError);
    }

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès. Vérifiez votre boîte mail.' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '~/lib/prisma';

const confirmSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = confirmSchema.parse(body);

    // Trouver le token de réinitialisation
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier si le token n'a pas expiré
    if (resetToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 400 }
      );
    }

    // Hash du nouveau mot de passe
    const passwordHash = await hash(password, 12);

    // Mettre à jour le mot de passe et supprimer tous les tokens de reset
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return NextResponse.json(
      { message: 'Mot de passe mis à jour avec succès' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la confirmation de réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
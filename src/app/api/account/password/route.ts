import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hash, compare } from 'bcryptjs';
import { auth } from '~/lib/auth';
import { prisma } from '~/lib/prisma';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(1, 'Confirmez le nouveau mot de passe'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json() as unknown;
    const validatedData = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const isCurrentPasswordValid = await compare(
      validatedData.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Le mot de passe actuel est incorrect' },
        { status: 400 }
      );
    }

    if (validatedData.currentPassword === validatedData.newPassword) {
      return NextResponse.json(
        { message: 'Le nouveau mot de passe doit être différent de l\'actuel' },
        { status: 400 }
      );
    }

    const newPasswordHash = await hash(validatedData.newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      message: 'Mot de passe changé avec succès',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

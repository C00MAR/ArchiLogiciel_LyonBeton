import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '~/lib/auth';
import { prisma } from '~/lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  avatarUrl: z.string().url('URL invalide').optional().or(z.literal('')),
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
    const validatedData = updateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        image: validatedData.avatarUrl ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Données invalides', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

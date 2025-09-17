-- Migration pour ajouter les champs d'authentification au modèle User
-- Génération: npx prisma migrate dev --name add_user_auth_fields

-- Modifier la table User pour ajouter les champs nécessaires à l'authentification
ALTER TABLE "User"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'USER';

-- Vérifier que l'email reste unique (normalement déjà présent)
-- ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
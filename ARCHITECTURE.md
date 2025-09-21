# Architecture - Lyon Béton E-commerce Platform

## Contexte du projet

**Équipe :** Marc Moureau et Brévin Renaud  
**Durée :** 4,5 jours de développement intensif  
**Inspiration :** Site Lyon Béton (design primé par Awwwards)  
**Objectif :** Expérimentation de nouvelles technologies dans un cadre éducatif  
**Repository :** [GitHub - ArchiLogiciel_LyonBeton](https://github.com/C00MAR/ArchiLogiciel_LyonBeton)

Cette application e-commerce moderne a été développée avec le stack T3 (TypeScript, tRPC, et Next.js), en reprenant les visuels et assets du site Lyon Béton pour proposer une identité forte et un design élégant. Le projet a permis d'explorer de nouvelles technologies tout en produisant une application fonctionnelle et moderne.

## Stack technologique principal

### Frontend
- **Next.js 15.2.3** - Framework React avec App Router et optimisations Turbo
- **React 19.0.0** - Bibliothèque UI avec les dernières fonctionnalités
- **TypeScript 5.8.2** - Type safety stricte pour tout le codebase
- **SASS 1.92.1** - Preprocessing CSS avec compilation temps réel (choix par préférence équipe)
- **Geist Font** - Police système moderne pour l'interface

### Backend & API
- **tRPC 11.0.0** - API type-safe sans schéma avec inférence TypeScript
- **Next.js API Routes** - Endpoints REST pour les intégrations externes
- **Zod 3.24.2** - Validation de schémas et parsing type-safe
- **SuperJSON 2.2.1** - Sérialisation avancée pour tRPC

### Base de données
- **PostgreSQL** - Base de données relationnelle principale
- **Prisma 6.5.0** - ORM type-safe avec migrations automatiques
- **@prisma/client** - Client généré pour l'accès type-safe à la DB

### Authentification & Sécurité
- **NextAuth.js 5.0.0-beta.25** - Authentification complète avec session management
- **Speakeasy** - Authentification à deux facteurs (2FA)
- **Nodemailer** - Système d'email pour vérification et notifications
- **bcryptjs** - Hachage sécurisé des mots de passe

### Paiements & E-commerce
- **Stripe 18.5.0** - Traitement des paiements et gestion des abonnements
- **Cloudinary** - Gestion et optimisation des images produits

### Tests & Qualité
- **Vitest 3.2.4** - Framework de test moderne et rapide
- **Testing Library** - Tests d'intégration React
- **ESLint** - Linting avec configuration Next.js
- **Prettier** - Formatage automatique du code

### Outils de développement
- **T3 Stack** - Template de démarrage avec environnement pré-configuré
- **Claude Code, ChatGPT, Copilot** - Assistance IA pour résolution de problèmes

## Architecture des données

### Modèle de données Prisma

```prisma
// Utilisateurs et authentification
User (id, email, name, role, twoFactorEnabled, ...)
Account (OAuth providers)
Session (gestion des sessions)
PasswordResetToken (réinitialisation MDP)

// E-commerce
Product (id, title, description, price, stripeProductId, ...)
Price (gestion des prix Stripe)
Cart / CartItem (panier utilisateur)
Order / OrderItem (commandes et historique)

// Administration
AuditLog (logs d'actions admin avec traçabilité utilisateur)
```

### Choix architecturaux base de données

1. **PostgreSQL** : Robustesse, ACID compliance, et support JSON
2. **Prisma** : Clarté, fonctionnalités complètes (schema, migrations, dashboard admin)
3. **Relations explicites** : Toutes les relations définies avec contraintes FK
4. **Audit trail** : Système de logs pour traçabilité des actions administrateurs
5. **Migration versionnée** : Système Prisma pour déploiements sûrs

## Architecture API

### tRPC Routers

```typescript
appRouter {
  auth: authRouter,          // Authentification et 2FA
  account: accountRouter,    // Gestion compte utilisateur
  products: productsRouter,  // Catalogue produits
  cart: cartRouter,         // Panier d'achat
  orders: ordersRouter,     // Gestion commandes
  admin: adminRouter,       // Administration avec audit logs
  twoFactor: twoFactorRouter // Authentification 2FA
}
```

### Middlewares tRPC

1. **timingMiddleware** : Monitoring performance + délai artificiel en dev
2. **publicProcedure** : Accès public avec session optionnelle
3. **protectedProcedure** : Authentification requise
4. **adminProcedure** : Rôle ADMIN requis avec logging automatique

### API Routes Next.js

```
/api/
 auth/[...nextauth]     # NextAuth.js endpoints
 stripe/checkout        # Création session Stripe
 stripe/webhook         # Webhooks Stripe (gestion commandes)
 admin/upload           # Upload fichiers admin
 docs                   # Documentation API Swagger
 trpc/[trpc]           # Handler tRPC principal
```

## Architecture Frontend

### Structure des composants

```
src/app/
 _components/           # Composants réutilisables
    Header/           # Navigation principale
    Hero/             # Section hero (inspiration Lyon Béton)
    ProductSlider/    # Carrousel produits
    CardList/         # Liste de cartes
 (auth)/               # Route group authentification
 account/              # Gestion compte utilisateur avec 2FA
 admin/                # Interface administration avec dashboard
 checkout/             # Processus de commande complet
 EmailTemplates/       # Templates email React (Nodemailer)
```

### State Management

1. **tRPC + React Query** : State serveur avec cache automatique
2. **NextAuth Session** : État authentification global avec 2FA
3. **React Context** : Sessions et cart merge après login
4. **Local Component State** : État local avec React hooks

### Styling

1. **SASS Modules** : Styles composants avec scoping automatique
2. **CSS Variables** : Système de design cohérent inspiré Lyon Béton
3. **Responsive Design** : Mobile-first avec breakpoints SASS
4. **Typography System** : Hiérarchie typographique élégante

## Justifications des choix techniques

### 1. T3 Stack + TypeScript
**Motivation :** Familiarité avec React et recherche de type safety  
**Avantages :** 
- Évite nombreuses erreurs et facilite la collaboration
- Inférence complète TypeScript client-serveur
- Gain de temps considérable en équipe
- Autocomplétion et refactoring sûr

### 2. tRPC (Nouvelle technologie explorée)
**Motivation :** Expérimentation et découverte de nouveaux outils  
**Avantages :**
- Type Safety end-to-end sans désynchronisation schema
- Performance avec batch requests et streaming
- Excellente DX avec autocomplétion

### 3. Prisma + PostgreSQL
**Motivation :** Recherche d'outils complets pour le travail en équipe  
**Avantages :**
- Clarté et fonctionnalités intégrées (schema, seeding, migrations, dashboard)
- Types générés automatiquement pour type safety
- Facilite la collaboration avec des outils d'équipe

### 4. NextAuth.js 5.0 (Beta)
**Motivation :** Solution sécurisée bien intégrée à Next.js  
**Avantages :**
- Sécurité éprouvée avec session management
- Support 2FA intégré avec Speakeasy
- Facilite l'implémentation authentification complexe

### 5. Stripe Integration
**Motivation :** Solution complète et sécurisée pour e-commerce  
**Avantages :**
- API complète avec webhooks pour automatisation
- Dashboard intégré pour gestion commandes
- Documentation claire facilitant l'intégration
- Sécurité PCI DSS compliant

### 6. Cloudinary
**Motivation :** Optimisation des assets et allégement du projet  
**Avantages :**
- Gestion optimisée des médias avec API
- Temps de chargement réduits
- Performance globale améliorée

## Patterns de développement

### 1. Gestion des erreurs
- **tRPC** : Error boundaries avec codes d'erreur typés
- **Zod** : Validation input avec messages personnalisés
- **Global** : Error logging et monitoring

### 2. Sécurité implémentée
- **CSRF Protection** : NextAuth.js built-in
- **XSS Prevention** : Sanitization automatique React
- **SQL Injection** : Prisma parameterized queries
- **2FA** : Authentification deux facteurs avec Speakeasy
- **Audit Trail** : Logs complets des actions administrateurs

### 3. Email System
- **Nodemailer** : Envoi d'emails transactionnels
- **React Templates** : Templates email en JSX réutilisables
- **Vérification compte** : Workflow complet d'activation

## Performance & Optimisations

### 1. Build Optimizations
- **Turbo** : Build Next.js accéléré
- **SASS Watch** : Compilation CSS en temps réel
- **ESM** : Format ES modules pour tree-shaking optimal

### 2. Runtime Optimizations
- **React Query Cache** : Cache intelligent requêtes tRPC
- **Cloudinary** : Optimisation automatique images
- **Code Splitting** : Lazy loading automatique composants

### 3. Database Optimizations
- **Connection Pooling** : Prisma connection management
- **Query Optimization** : Relations eager/lazy selon contexte
- **Indexing Strategy** : Index sur recherche et jointures fréquentes

## Tests & Qualité

### Strategy implémentée
1. **Unit Tests** : Composants React isolés avec Testing Library
2. **Integration Tests** : tRPC procedures avec base de données test
3. **Component Testing** : Tests comportementaux avec jsdom
4. **Type Safety** : Validation compile-time avec TypeScript

### Configuration Vitest
- **Vitest** : Tests rapides avec HMR
- **Testing Library** : Tests centrés utilisateur
- **jsdom** : Environnement browser simulé
- **Coverage** : Reporting de couverture de code

## Défis techniques rencontrés et solutions

### 1. Nouvelles technologies
**Défis :**
- T3 Stack : Première utilisation, courbe d'apprentissage
- tRPC : Découverte de cette approche API
- NextAuth 5.0 beta : Version cutting-edge avec moins de documentation
- Stripe : Intégration système de paiement complexe

**Solutions adoptées :**
- **Préparation intensive** : Temps d'étude des documentations avant développement
- **IA Assistance** : Utilisation systématique de Claude Code, ChatGPT, et Copilot
- **Validation du code** : Compréhension systématique du code généré par IA
- **Approche itérative** : Tests fréquents et validation des intégrations

### 2. Gestion du temps (4,5 jours)
**Solutions :**
- Planification préalable et accord sur les technologies
- Réutilisation d'assets Lyon Béton pour accélérer le design
- Focus sur les fonctionnalités core avant les optimisations

## Administration et Monitoring

### Dashboard Admin implémenté
- **Interface complète** : Gestion produits, commandes, utilisateurs
- **Audit Logs** : Traçabilité complète des actions avec horodatage
- **Analytics** : Métriques de base sur les ventes et utilisateurs
- **Upload Manager** : Gestion des assets via Cloudinary

### Sécurité Admin
- **Rôles définis** : Séparation stricte USER/ADMIN
- **Actions loggées** : Toute action admin enregistrée avec utilisateur
- **Session sécurisée** : Gestion des sessions administrateur

## Déploiement & DevOps

### Scripts disponibles
```json
{
  "dev": "Next.js dev + SASS watch en parallèle",
  "build": "Production build avec type checking complet",
  "db:generate": "Génération client Prisma",
  "db:migrate": "Déploiement migrations avec rollback",
  "test": "Tests Vitest avec coverage",
  "lint": "ESLint + type checking global"
}
```

### Environment Variables
- **Type Safety** : Validation avec @t3-oss/env-nextjs
- **Runtime Validation** : Schémas Zod pour toutes les variables
- **Build Time** : Validation au build, échec si config invalide

## Retour d'expérience équipe

### Apprentissages techniques
- **Planification cruciale** : L'accord préalable sur les technologies s'est révélé essentiel
- **IA comme accélérateur** : Les outils IA sont devenus primordiaux pour résoudre rapidement les blocages
- **Importance de la compréhension** : Nécessité de toujours comprendre le code généré automatiquement
- **Type Safety** : La valeur de TypeScript s'est confirmée pour la collaboration

### Points positifs
- **Expérimentation réussie** : Intégration rapide de nouvelles technologies
- **Collaboration efficace** : Communication et partage de code facilités
- **Résultat concret** : Application fonctionnelle et moderne en temps record
- **Autonomie confirmée** : Capacité à produire quelque chose de qualitatif rapidement

### Défis surmontés
- **Courbe d'apprentissage** : Technologies nouvelles maîtrisées rapidement
- **Intégrations complexes** : Stripe, 2FA, système email intégrés avec succès
- **Contrainte temps** : 4,5 jours respectés malgré l'ampleur fonctionnelle

## Améliorations futures planifiées

### UX/UI Enhancement
- Interface plus immersive avec davantage d'animations
- Pages produits détaillées avec histoire et conception
- Pages institutionnelles (À propos, Contact)
- Système de déclinaisons produits (tailles, couleurs)

### Fonctionnalités avancées
- Suivi en temps réel des commandes pour utilisateurs
- Dashboard analytics avancé pour administrateurs
- Système de recommandations produits
- Programme de fidélité et codes promo

### Infrastructure
1. **Monitoring** : Intégration Sentry pour error tracking
2. **CDN** : CloudFront pour distribution globale des assets
3. **Cache Layer** : Redis pour sessions et cache applicatif
4. **Search** : Elasticsearch pour recherche produits avancée
5. **Analytics** : Google Analytics 4 avec tracking e-commerce
6. **PWA** : Service workers pour expérience offline-first
7. **Internationalization** : Support multi-langues avec next-intl

### Optimisations techniques
- Tests end-to-end avec Playwright
- Performance monitoring avec Web Vitals
- SEO optimization avec métadonnées dynamiques
- Security headers et CSP policies

## Conclusion

Ce projet de 4,5 jours a permis une expérimentation réussie de technologies modernes tout en produisant une application e-commerce complète et fonctionnelle. La liberté créative a facilité l'exploration d'outils qu'un cadre professionnel n'aurait pas permis, notamment l'utilisation de versions beta et l'assistance IA systématique.

L'architecture choisie avec le T3 Stack s'est révélée particulièrement efficace pour le développement rapide d'une application type-safe et robuste. L'investissement initial en planification et documentation s'est avéré crucial pour la réussite du projet dans des délais serrés.

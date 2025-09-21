# Tests Doc

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Test UI (Browser Interface)
```bash
npm run test:ui
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Configuration

### Vitest Config
- Environment: jsdom
- Setup files: test-setup.ts
- Global test utilities
- Path aliases (~/)

### Mock Strategy
- Next.js components (Link, Image)
- NextAuth.js (useSession, signIn, signOut)
- Next.js navigation (useRouter, usePathname)
- Database (Prisma)
- External services (Stripe, Cloudinary)

## CI/CD Integration

Tests run automatically on:
- Pre-commit hooks
- Pull request creation
- Main branch pushes
- Deployment pipeline

Minimum requirements:
- All tests must pass
- Coverage threshold maintained
- No test-related lint errors
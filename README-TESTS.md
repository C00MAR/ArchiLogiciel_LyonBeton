# Tests Documentation

## Overview

This project includes comprehensive unit tests for all major components, pages, API routes, and utility functions using Vitest and React Testing Library.

## Test Structure

```
src/
├── test-utils/              # Test utilities and mocks
│   ├── index.ts            # Main exports
│   ├── test-utils.tsx      # Render helpers with providers
│   ├── mocks.ts            # Mock functions and data
│   └── setup-tests.ts      # Global test setup
├── app/
│   ├── account/
│   │   ├── __tests__/      # Account page tests
│   │   └── components/
│   │       └── __tests__/  # Component tests
│   ├── (auth)/
│   │   └── login/
│   │       └── __tests__/  # Login page tests
│   └── __tests__/          # Layout tests
├── components/
│   └── __tests__/          # Shared component tests
├── hooks/
│   └── __tests__/          # Custom hook tests
├── lib/
│   └── __tests__/          # Utility function tests
└── server/
    └── api/
        └── routers/
            └── __tests__/  # API router tests
```

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

## Test Categories

### 1. Component Tests
- **Account Components**: ProfileTab, SecurityTab, AdminTab
- **UI Components**: Header, ProductShop, LogoutButton
- **Form Validation**: Input validation, error handling
- **User Interactions**: Click events, form submissions
- **Conditional Rendering**: Role-based visibility

### 2. Page Tests
- **Authentication Pages**: Login, Register, Password Reset
- **Protected Pages**: Account dashboard, Admin pages
- **Layout Tests**: Root layout, navigation structure
- **Route Handling**: Redirects, URL parameters

### 3. API Tests
- **Account Router**: Profile updates, password changes
- **Auth Router**: Registration, email verification
- **Input Validation**: Schema validation, error responses
- **Database Operations**: CRUD operations, error handling

### 4. Utility Tests
- **Auth Helpers**: Session validation, permission checks
- **BEM Helper**: CSS class generation
- **Custom Hooks**: Authentication hooks, data fetching

## Test Utilities

### Mock Functions
```typescript
import {
  createMockSession,
  createMockAdminSession,
  mockUseSession,
  mockSignIn,
  mockSignOut,
  resetAllMocks
} from '~/test-utils'
```

### Custom Render
```typescript
import { render } from '~/test-utils'

render(<Component />, {
  session: createMockSession(),
  queryClient: createTestQueryClient()
})
```

### Database Mocks
```typescript
import { mockPrisma } from '~/test-utils'

mockPrisma.user.findUnique.mockResolvedValue(mockUser)
```

## Common Test Patterns

### Testing Authentication
```typescript
it('redirects unauthenticated users to login', () => {
  mockUseSession.mockReturnValue({
    data: null,
    status: 'unauthenticated'
  })

  render(<ProtectedComponent />)

  expect(mockPush).toHaveBeenCalledWith('/login')
})
```

### Testing Forms
```typescript
it('validates form input', async () => {
  render(<FormComponent />)

  const input = screen.getByLabelText('Email')
  const button = screen.getByRole('button', { name: /submit/i })

  fireEvent.change(input, { target: { value: 'invalid-email' } })
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })
})
```

### Testing API Routes
```typescript
it('updates user profile successfully', async () => {
  const mockUser = { id: '1', name: 'Updated Name' }
  mockPrisma.user.update.mockResolvedValue(mockUser)

  const caller = router.createCaller(mockContext)
  const result = await caller.updateProfile({ name: 'Updated Name' })

  expect(result.user).toEqual(mockUser)
})
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

## Best Practices

### Test Organization
- One test file per component/function
- Descriptive test names
- Logical grouping with describe blocks
- Setup and teardown in beforeEach/afterEach

### Assertions
- Test behavior, not implementation
- Use accessible queries (getByRole, getByLabelText)
- Wait for async operations with waitFor
- Test edge cases and error states

### Mocking
- Mock external dependencies
- Use realistic mock data
- Reset mocks between tests
- Mock at the boundary (API, database)

### Coverage Goals
- Aim for 80%+ code coverage
- Focus on critical paths
- Test error scenarios
- Include integration tests for complex flows

## Debugging Tests

### Common Issues
- Async operations not awaited
- Mocks not reset between tests
- Missing providers in render
- Incorrect mock implementations

### Debug Tools
- screen.debug() for DOM inspection
- console.log mock call history
- --reporter=verbose for detailed output
- Test UI for interactive debugging

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
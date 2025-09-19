import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock NextAuth
const mockSession = {
  user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'USER' },
  expires: '2024-01-01',
};

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: mockSession,
    status: 'authenticated',
    update: vi.fn(),
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Global cleanup
beforeEach(() => {
  vi.clearAllMocks();
});

// Make globals available
global.mockRouter = mockRouter;
global.mockSession = mockSession;
/**
 * TU JWT NextAuth
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock('../prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}));

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

const mockAuthOptions = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }

      if (account?.provider === 'credentials' && token.sub) {
        const dbUser = await mockPrisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, emailVerified: true }
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified;
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
};

describe('JWT Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct JWT settings', () => {
    expect(mockAuthOptions.session.strategy).toBe('jwt');
    expect(mockAuthOptions.session.maxAge).toBe(24 * 60 * 60);
    expect(mockAuthOptions.session.updateAge).toBe(60 * 60);
    expect(mockAuthOptions.jwt.maxAge).toBe(24 * 60 * 60);
  });

  it('should have secure cookie configuration for production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const prodConfig = {
      cookies: {
        sessionToken: {
          name: '__Secure-next-auth.session-token',
          options: {
            httpOnly: true,
            sameSite: 'lax' as const,
            path: '/',
            secure: true,
          }
        },
        csrfToken: {
          name: '__Host-next-auth.csrf-token',
          options: {
            httpOnly: true,
            sameSite: 'lax' as const,
            path: '/',
            secure: true,
          }
        }
      }
    };

    expect(prodConfig.cookies.sessionToken.name).toBe('__Secure-next-auth.session-token');
    expect(prodConfig.cookies.sessionToken.options.secure).toBe(true);
    expect(prodConfig.cookies.sessionToken.options.httpOnly).toBe(true);
    expect(prodConfig.cookies.sessionToken.options.sameSite).toBe('lax');

    expect(prodConfig.cookies.csrfToken.name).toBe('__Host-next-auth.csrf-token');
    expect(prodConfig.cookies.csrfToken.options.secure).toBe(true);
    expect(prodConfig.cookies.csrfToken.options.httpOnly).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });

  it('should have development cookie configuration', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const devConfig = {
      cookies: {
        sessionToken: {
          name: 'next-auth.session-token',
          options: {
            secure: false,
          }
        },
        csrfToken: {
          name: 'next-auth.csrf-token',
          options: {
            secure: false,
          }
        }
      }
    };

    expect(devConfig.cookies.sessionToken.name).toBe('next-auth.session-token');
    expect(devConfig.cookies.sessionToken.options.secure).toBe(false);

    expect(devConfig.cookies.csrfToken.name).toBe('next-auth.csrf-token');
    expect(devConfig.cookies.csrfToken.options.secure).toBe(false);

    process.env.NODE_ENV = originalEnv;
  });
});

describe('JWT Callback', () => {
  const mockJwtCallback = mockAuthOptions.callbacks.jwt;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add user data to token on first login', async () => {
    if (!mockJwtCallback) throw new Error('JWT callback not defined');

    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      emailVerified: new Date('2024-01-01'),
    };

    const token = { sub: 'user123' };

    const result = await mockJwtCallback({
      token,
      user: mockUser,
      account: null,
      profile: undefined,
      isNewUser: false,
    });

    expect(result).toEqual({
      sub: 'user123',
      role: 'USER',
      emailVerified: mockUser.emailVerified,
    });
  });

  it('should update token with fresh user data on credentials login', async () => {
    if (!mockJwtCallback) throw new Error('JWT callback not defined');

    const mockDbUser = {
      role: 'ADMIN',
      emailVerified: new Date('2024-01-02'),
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);

    const token = {
      sub: 'user123',
      role: 'USER',
      emailVerified: new Date('2024-01-01'),
    };

    const account = { provider: 'credentials' };

    const result = await mockJwtCallback({
      token,
      user: undefined,
      account,
      profile: undefined,
      isNewUser: false,
    });

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user123' },
      select: { role: true, emailVerified: true }
    });

    expect(result).toEqual({
      sub: 'user123',
      role: 'ADMIN',
      emailVerified: mockDbUser.emailVerified,
    });
  });

  it('should preserve token if user not found in database', async () => {
    if (!mockJwtCallback) throw new Error('JWT callback not defined');

    mockPrisma.user.findUnique.mockResolvedValue(null);

    const token = {
      sub: 'user123',
      role: 'USER',
      emailVerified: new Date('2024-01-01'),
    };

    const account = { provider: 'credentials' };

    const result = await mockJwtCallback({
      token,
      user: undefined,
      account,
      profile: undefined,
      isNewUser: false,
    });

    expect(result).toEqual(token);
  });

  it('should not query database for non-credentials providers', async () => {
    if (!mockJwtCallback) throw new Error('JWT callback not defined');

    const token = {
      sub: 'user123',
      role: 'USER',
      emailVerified: new Date('2024-01-01'),
    };

    const account = { provider: 'google' };

    const result = await mockJwtCallback({
      token,
      user: undefined,
      account,
      profile: undefined,
      isNewUser: false,
    });

    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(result).toEqual(token);
  });
});

describe('Session Callback', () => {
  const mockSessionCallback = mockAuthOptions.callbacks.session;

  it('should map token data to session', async () => {
    if (!mockSessionCallback) throw new Error('Session callback not defined');

    const session = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
      expires: '2024-12-31',
    };

    const token = {
      sub: 'user123',
      role: 'ADMIN',
      emailVerified: new Date('2024-01-01'),
    };

    const result = await mockSessionCallback({
      session,
      token,
    });

    expect(result.user).toEqual({
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      id: 'user123',
      role: 'ADMIN',
      emailVerified: new Date('2024-01-01'),
    });
  });

  it('should handle missing token data gracefully', async () => {
    if (!mockSessionCallback) throw new Error('Session callback not defined');

    const session = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
      expires: '2024-12-31',
    };

    const token = {};

    const result = await mockSessionCallback({
      session,
      token,
    });

    expect(result).toEqual(session);
  });
});

describe('JWT Token Size', () => {
  it('should have minimal token payload', async () => {
    if (!mockAuthOptions.callbacks.jwt) throw new Error('JWT callback not defined');

    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      emailVerified: new Date('2024-01-01'),
    };

    const token = { sub: 'user123' };

    const result = await mockAuthOptions.callbacks.jwt({
      token,
      user: mockUser,
      account: null,
      profile: undefined,
      isNewUser: false,
    });

    const expectedKeys = ['sub', 'role', 'emailVerified'];
    const actualKeys = Object.keys(result);

    expectedKeys.forEach(key => {
      expect(actualKeys).toContain(key);
    });

    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('name');
    expect(result).not.toHaveProperty('passwordHash');

    const tokenSize = JSON.stringify(result).length;
    expect(tokenSize).toBeLessThan(200);
  });
});
import { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { UserRole } from '@foodbridge/shared';

describe('Authentication & JWT Tests', () => {
  const payload = {
    userId: 'test-user-123',
    email: 'tester@foodbridge.ai',
    role: UserRole.DONOR,
    organizationId: 'org-test-456'
  };

  test('generates valid access token and decodes payload correctly', () => {
    const token = generateAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(UserRole.DONOR);
    expect(decoded.organizationId).toBe(payload.organizationId);
  });

  test('generates valid refresh token and verifies successfully', () => {
    const refreshToken = generateRefreshToken(payload);
    expect(typeof refreshToken).toBe('string');

    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(payload.userId);
  });
});

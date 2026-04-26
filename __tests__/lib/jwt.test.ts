import { generateToken, verifyToken } from '@/lib/jwt';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';

describe('JWT Utilities', () => {
  const testPayload = { 
    userId: '123', 
    email: 'test@example.com',
    role: 'user'
  };

  describe('generateToken', () => {
    it('should generate a token for a valid payload', () => {
      const token = generateToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken({ userId: '1', email: 'test1@example.com', role: 'user' });
      const token2 = generateToken({ userId: '2', email: 'test2@example.com', role: 'user' });
      expect(token1).not.toBe(token2);
    });

    it('should throw error if JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => generateToken(testPayload)).toThrow('JWT_SECRET is not configured');
      
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      if (decoded) {
        expect(decoded.userId).toBe(testPayload.userId);
        expect(decoded.email).toBe(testPayload.email);
        expect(decoded.role).toBe(testPayload.role);
      }
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt';
      expect(() => verifyToken(malformedToken)).toThrow();
    });

    it('should throw error if JWT_SECRET is not set', () => {
      const token = generateToken(testPayload);
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => verifyToken(token)).toThrow('JWT_SECRET is not configured');
      
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('generateToken/verifyToken integration', () => {
    it('should maintain payload integrity through generate/verify cycle', () => {
      const payloads = [
        { userId: '1', email: 'test1@test.com', role: 'user' },
        { userId: '2', email: 'test2@test.com', role: 'admin' },
        { userId: '3', email: 'test3@test.com', role: 'moderator' },
      ];

      payloads.forEach(payload => {
        const token = generateToken(payload);
        const decoded = verifyToken(token);
        
        expect(decoded).not.toBeNull();
        if (decoded) {
          expect(decoded.userId).toBe(payload.userId);
          expect(decoded.email).toBe(payload.email);
          expect(decoded.role).toBe(payload.role);
        }
      });
    });
  });
});

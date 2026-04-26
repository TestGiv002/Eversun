import { encrypt, decrypt } from '@/lib/encryption';

describe('Encryption Utilities', () => {
  const testText = 'password123';
  
  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const encrypted = encrypt(testText);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testText);
      expect(typeof encrypted).toBe('string');
    });

    it('should return empty string for empty input', () => {
      const encrypted = encrypt('');
      expect(encrypted).toBe('');
    });

    it('should return empty string for undefined input', () => {
      const encrypted = encrypt(undefined as any);
      expect(encrypted).toBe('');
    });

    it('should produce different outputs for same input (due to random salt/IV)', () => {
      const encrypted1 = encrypt(testText);
      const encrypted2 = encrypt(testText);
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted string', () => {
      const encrypted = encrypt(testText);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(testText);
    });

    it('should return empty string for empty input', () => {
      const decrypted = decrypt('');
      expect(decrypted).toBe('');
    });

    it('should return empty string for undefined input', () => {
      const decrypted = decrypt(undefined as any);
      expect(decrypted).toBe('');
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const encrypted = encrypt(specialChars);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(specialChars);
    });

    it('should handle unicode characters', () => {
      const unicode = 'éàüöñ 你好 مرحبا';
      const encrypted = encrypt(unicode);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(unicode);
    });
  });

  describe('encrypt/decrypt integration', () => {
    it('should maintain data integrity through encrypt/decrypt cycle', () => {
      const testData = [
        '',
        'a',
        'password',
        'very long password with many characters 1234567890',
        '!@#$%^&*()',
      ];

      testData.forEach(text => {
        const encrypted = encrypt(text);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(text);
      });
    });
  });
});

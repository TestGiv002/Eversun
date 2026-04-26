import crypto from 'crypto';
import logger from '@/lib/logger';

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const TAG_POSITION = SALT_LENGTH + IV_LENGTH;
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH;

/**
 * Dériver une clé de chiffrement à partir d'un mot de passe et d'un sel
 */
function getKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha512');
}

/**
 * Chiffrer un texte
 */
export function encrypt(text: string): string {
  if (!text) return '';

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = getKey(salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  } catch (error) {
    logger.error({ error }, 'Erreur lors du chiffrement');
    throw new Error('Erreur lors du chiffrement');
  }
}

/**
 * Déchiffrer un texte
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return '';

  try {
    const buffer = Buffer.from(encryptedData, 'base64');

    // Validation de la longueur minimale du buffer
    const minExpectedLength = SALT_LENGTH + IV_LENGTH + TAG_LENGTH;
    if (buffer.length < minExpectedLength) {
      logger.warn(
        {
          error: 'Invalid buffer length - possibly old encryption format',
          bufferLength: buffer.length,
          minExpectedLength,
        },
        'Tentative de déchiffrement avec ancien format ou données corrompues'
      );

      // Si le buffer est trop court, retourner les données telles quelles
      // Cela peut arriver si les données sont en clair ou avec un ancien format
      return encryptedData;
    }

    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, TAG_POSITION);
    const tag = buffer.subarray(TAG_POSITION, ENCRYPTED_POSITION);
    const encrypted = buffer.subarray(ENCRYPTED_POSITION);

    // Validation de la longueur de l'IV
    if (iv.length !== IV_LENGTH) {
      logger.warn(
        {
          error: 'Invalid IV length - possibly old encryption format',
          ivLength: iv.length,
          expectedLength: IV_LENGTH,
        },
        'IV invalide, retour des données telles quelles'
      );
      return encryptedData;
    }

    // Validation de la longueur du tag
    if (tag.length !== TAG_LENGTH) {
      logger.warn(
        {
          error: 'Invalid tag length - possibly old encryption format',
          tagLength: tag.length,
          expectedLength: TAG_LENGTH,
        },
        'Tag invalide, retour des données telles quelles'
      );
      return encryptedData;
    }

    const key = getKey(salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (error) {
    logger.warn(
      { error },
      'Erreur lors du déchiffrement, retour des données telles quelles'
    );
    // En cas d'erreur, retourner les données telles quelles
    // Cela permet de ne pas perdre les données si le format a changé
    return encryptedData;
  }
}

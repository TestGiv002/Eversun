import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// Store simple en mémoire (en production, utiliser Redis ou similar)
const rateLimitStore = new Map<string, RateLimitStore>();

interface RateLimitOptions {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxRequests: number; // Nombre maximum de requêtes
}

/**
 * Middleware de rate limiting pour Next.js API routes
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Identifier l'utilisateur par IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    const record = rateLimitStore.get(ip);

    // Nettoyer les enregistrements expirés
    if (record && record.resetTime < now) {
      rateLimitStore.delete(ip);
    }

    const currentRecord = rateLimitStore.get(ip);

    if (!currentRecord) {
      // Premier enregistrement
      rateLimitStore.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null; // Continuer
    }

    if (currentRecord.count >= maxRequests) {
      // Limite dépassée
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil((currentRecord.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (currentRecord.resetTime - now) / 1000
            ).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(
              currentRecord.resetTime
            ).toISOString(),
          },
        }
      );
    }

    // Incrémenter le compteur
    currentRecord.count++;
    rateLimitStore.set(ip, currentRecord);

    return null; // Continuer
  };
}

/**
 * Nettoyer périodiquement le store (à appeler via un cron job ou interval)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Nettoyer le store toutes les 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

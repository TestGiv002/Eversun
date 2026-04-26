import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { User } from '@/lib/userModel';
import { verifyPassword } from '@/lib/password';
import { rateLimit } from '@/lib/rateLimit';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Rate limiting: 5 tentatives par 15 minutes
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
});

export async function POST(request: NextRequest) {
  // Appliquer le rate limiting
  const rateLimitResult = await loginRateLimit(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email et mot de passe requis.' },
      { status: 400 }
    );
  }
  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur non trouvé.' },
      { status: 404 }
    );
  }
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: 'Mot de passe incorrect.' },
      { status: 401 }
    );
  }

  // Générer un token JWT sécurisé
  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const response = NextResponse.json({
    success: true,
    user: { email: user.email, role: user.role },
  });
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
  });
  return response;
}

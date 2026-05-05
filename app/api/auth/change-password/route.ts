import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Vérification des données
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Récupérer le token depuis les cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Connexion à la base de données
    await connectToDatabase();

    // Récupérer l'utilisateur via mongoose
    const user = await mongoose.connection.db.collection('users').findOne({ 
      _id: new mongoose.Types.ObjectId(decoded.userId) 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(decoded.userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    return NextResponse.json(
      { message: 'Mot de passe changé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

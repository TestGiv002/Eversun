import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eversun';

async function getClient() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(MONGODB_URI);
  return mongoose.connection;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientName = searchParams.get('clientName');

    if (!clientName) {
      return NextResponse.json(
        { error: 'Nom du client manquant' },
        { status: 400 }
      );
    }

    const db = await getClient();
    const Client = db.models.Client;

    // Find client by name
    const client = await Client.findOne({ client: clientName });

    if (!client) {
      return NextResponse.json({
        success: true,
        files: [],
      });
    }

    // Return files with base64 data for download/viewing
    const files = (client.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      url: `data:${file.type};base64,${file.data}`,
      size: file.size,
      type: file.type,
      uploadedAt: file.uploadedAt,
    })) || [];

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers' },
      { status: 500 }
    );
  }
}

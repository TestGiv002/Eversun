import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
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

// Helper to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const clientName = formData.get('clientName') as string;
    const section = formData.get('section') as string;
    const files = formData.getAll('files') as File[];

    if (!clientName || !section || files.length === 0) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const db = await getClient();
    const Client = db.models.Client;

    // Find client by name and section
    const client = await Client.findOne({ 
      client: clientName,
      section: section 
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Convert files to base64 and add to client record
    const uploadedFiles = [];
    
    for (const file of files) {
      const base64Data = await fileToBase64(file);
      const fileRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        data: base64Data,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
      
      uploadedFiles.push(fileRecord);
    }

    // Add files to client record
    if (!client.files) {
      client.files = [];
    }
    client.files.push(...uploadedFiles);
    
    await client.save();

    return NextResponse.json({
      success: true,
      files: uploadedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des fichiers' },
      { status: 500 }
    );
  }
}

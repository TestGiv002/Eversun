import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ClientFile from '@/lib/clientFileModel';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eversun';

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(MONGODB_URI);
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

    await connectDB();

    // Find files by client name
    const files = await ClientFile.find({ clientName: clientName }).sort({ uploadedAt: -1 });

    // Return files with base64 data for download/viewing
    const formattedFiles = files.map((file) => ({
      id: file._id.toString(),
      section: file.section,
      name: file.fileName,
      url: `data:${file.fileType};base64,${file.fileData}`,
      size: file.fileSize,
      type: file.fileType,
      uploadedAt: file.uploadedAt,
    })) || [];

    return NextResponse.json({
      success: true,
      files: formattedFiles,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers' },
      { status: 500 }
    );
  }
}

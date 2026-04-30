import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import mongoose from 'mongoose';
import { ClientSchema } from '@/lib/clientModel';
import { clientCollectionName } from '@/lib/sectionConfig';

export async function GET() {
  try {
    await connectToDatabase();

    const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema, clientCollectionName);

    const clients = await Client.find({}).lean();

    return new Response(JSON.stringify(clients, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="clients.json"',
      },
    });
  } catch (error) {
    console.error('Error exporting clients to JSON:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export JSON' },
      { status: 500 }
    );
  }
}
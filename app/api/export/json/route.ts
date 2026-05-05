import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import mongoose from 'mongoose';
import { ClientSchema } from '@/lib/clientModel';
import { clientCollectionName } from '@/lib/sectionConfig';

// Mapping des sections aux patterns de filtrage
const sectionFilters: Record<string, string[]> = {
  'dp': ['dp-en-cours', 'dp-accordes', 'dp-refuses', 'daact'],
  'installation': ['installation'],
  'consuel': ['consuel-en-cours', 'consuel-finalise'],
  'raccordement': ['raccordement', 'raccordement-mes'],
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    await connectToDatabase();

    const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema, clientCollectionName);

    // Construire le filtre de requête
    let query = {};
    if (section && section !== 'all' && sectionFilters[section]) {
      query = { section: { $in: sectionFilters[section] } };
    }

    const clients = await Client.find(query).lean();

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
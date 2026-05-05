import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import mongoose from 'mongoose';
import { ClientSchema } from '@/lib/clientModel';
import { clientCollectionName } from '@/lib/sectionConfig';

function arrayToCsv(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0] || {});
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

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

    const csv = arrayToCsv(clients);

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="clients.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting clients to CSV:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export CSV' },
      { status: 500 }
    );
  }
}
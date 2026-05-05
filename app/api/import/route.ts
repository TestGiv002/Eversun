import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import mongoose from 'mongoose';
import { ClientSchema } from '@/lib/clientModel';
import { clientCollectionName } from '@/lib/sectionConfig';

async function parseText(text: string): Promise<any[]> {
  try {
    // Try parsing as JSON
    return JSON.parse(text);
  } catch {
    // If JSON parsing fails, try CSV
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV parsing (doesn't handle escaped quotes perfectly)
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (!allowedTypes.some(type => fileType.includes(type)) && 
        !fileName.endsWith('.csv') && 
        !fileName.endsWith('.json') && 
        !fileName.endsWith('.xlsx') && 
        !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez CSV, JSON ou Excel.' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const data = await parseText(text);

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Le fichier est vide ou invalide' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Use existing model or create new one (prevents "Cannot overwrite model" error)
    const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema, clientCollectionName);

    // Validate and import data
    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const record = data[i];

        if (!record.client) {
          errors.push(`Ligne ${i + 1}: Le champ 'client' est obligatoire`);
          continue;
        }

        // Check if client already exists
        const existingClient = await Client.findOne({
          client: record.client,
          section: record.section || 'default',
        });

        if (existingClient) {
          // Update existing client
          Object.assign(existingClient, record);
          await existingClient.save();
        } else {
          // Create new client
          await Client.create(record);
        }

        importedCount++;
      } catch (err: any) {
        errors.push(`Ligne ${i + 1}: ${err.message}`);
      }
    }

    const response: any = {
      message: `${importedCount} client(s) importé(s) avec succès`,
      importedCount,
    };

    if (errors.length > 0) {
      response.warnings = errors.slice(0, 10); // Limit warnings to first 10
      if (errors.length > 10) {
        response.warnings.push(`... et ${errors.length - 10} autres erreurs`);
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'import du fichier' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import mongoose from 'mongoose';
import { ClientSchema } from '@/lib/clientModel';
import { clientCollectionName } from '@/lib/sectionConfig';

async function createExcelBuffer(data: any[]): Promise<Buffer> {
  // Simple Excel generation using CSV format wrapped in Excel XML
  if (data.length === 0) {
    return Buffer.from('<?xml version="1.0" encoding="UTF-8"?><Workbook><Worksheet><Table></Table></Worksheet></Workbook>');
  }

  // For now, use CSV approach which Excel can open directly
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

  return Buffer.from(csvRows.join('\n'), 'utf-8');
}

export async function GET() {
  try {
    await connectToDatabase();

    const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema, clientCollectionName);

    const clients = await Client.find({}).lean();

    const buffer = await createExcelBuffer(clients);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="clients.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error exporting clients to Excel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export Excel' },
      { status: 500 }
    );
  }
}
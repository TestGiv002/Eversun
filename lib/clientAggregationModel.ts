import mongoose from 'mongoose';

export interface ClientStage {
  section: string;
  statut: string;
  date?: string;
  updatedAt: Date;
}

export const ClientAggregationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  ville: {
    type: String,
  },
  noDp: {
    type: String,
  },
  stages: {
    'dp-en-cours': {
      statut: String,
      date: String,
      updatedAt: Date,
    },
    'dp-accordes': {
      statut: String,
      date: String,
      updatedAt: Date,
    },
    'dp-refuses': {
      statut: String,
      date: String,
      updatedAt: Date,
    },
    'daact': {
      statut: String,
      date: String,
      updatedAt: Date,
    },
    'consuel-en-cours': {
      statut: String,
      date: String,
      updatedAt: Date,
    },
    'consuel-finalise': {
      statut: String,
      date: String,
      updatedAt: Date,
    },
    'raccordement': {
      statut: String,
      date: String,
      updatedAt: Date,
    },
    'raccordement-mes': {
      statut: String,
      date: String,
      updatedAt: Date,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export interface IClientAggregation extends mongoose.Document {
  name: string;
  ville?: string;
  noDp?: string;
  stages: Record<string, ClientStage>;
  updatedAt: Date;
}

export const ClientAggregationModel =
  mongoose.models.ClientAggregation ||
  mongoose.model<IClientAggregation>('ClientAggregation', ClientAggregationSchema);

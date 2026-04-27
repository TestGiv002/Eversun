import mongoose from 'mongoose';

const clientFileSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  },
  clientName: {
    type: String,
    required: true,
    index: true,
  },
  section: {
    type: String,
    required: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileData: {
    type: String, // base64 encoded
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for faster queries by client and section
clientFileSchema.index({ clientName: 1, section: 1 });

const ClientFile = mongoose.models.ClientFile || mongoose.model('ClientFile', clientFileSchema);

export default ClientFile;

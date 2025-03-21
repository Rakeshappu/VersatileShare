
import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['document', 'video', 'note', 'link'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Making it optional for all environments
  },
  fileUrl: String,
  fileSize: Number,
  fileName: String,
  link: String,
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    lastViewed: { type: Date, default: Date.now },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure we have a model or create one
export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);

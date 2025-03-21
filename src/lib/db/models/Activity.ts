
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['upload', 'download', 'view', 'like', 'comment', 'share'],
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

// Create index for faster queries
activitySchema.index({ userId: 1, timestamp: -1 });

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

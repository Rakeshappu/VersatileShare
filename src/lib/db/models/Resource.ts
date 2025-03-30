
import mongoose from 'mongoose';
import { User } from './User';

// Define the Resource schema
const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    required: true,
    enum: ['document', 'video', 'note', 'link'],
    default: 'document'
  },
  subject: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 0,
    max: 8
  },
  department: {
    type: String,
    required: false,
    default: 'Common'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: 0
  },
  link: {
    type: String,
    default: null
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date,
      default: Date.now
    },
    dailyViews: [{
      date: {
        type: Date
      },
      count: {
        type: Number,
        default: 0
      }
    }],
    studentFeedback: [{
      rating: Number,
      count: Number
    }]
  },
  category: {
    type: String,
    enum: ['study', 'placement', 'common'],
    default: 'study'
  },
  placementCategory: {
    type: String,
    enum: ['aptitude', 'interview', 'resume', 'companies', 'general'],
    default: null
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware
ResourceSchema.pre('save', function(next) {
  // Update the updatedAt field
  this.updatedAt = new Date();
  
  // If it's a placement resource, ensure semester is set to 0
  if (this.category === 'placement' && this.semester !== 0) {
    this.semester = 0;
  }
  
  next();
});

// Define a virtual for a user-friendly ID
ResourceSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Configure the schema to include virtuals when converting to JSON
ResourceSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

// Create the model
export const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);


import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function(this: any) {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: function(this: any) {
      return this.role === 'student';
    },
  },
  secretNumber: {
    type: String,
    required: function(this: any) {
      return this.role === 'faculty';
    },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  verificationOTP: String,
  verificationOTPExpiry: Date,
  verificationCode: String,
  verificationCodeExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);

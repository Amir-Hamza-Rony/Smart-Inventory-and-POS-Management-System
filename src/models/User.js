import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'MANAGER', 'CASHIER'],
    default: 'CASHIER',
  },
  phone: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = async function(password) {
  return bcrypt.hash(password, 12);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  paymentTerms: {
    type: Number,
    default: 30, // days
  },
  dueAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

supplierSchema.index({ name: 1 });
supplierSchema.index({ email: 1 });
supplierSchema.index({ company: 1 });

export default mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'settings',
  },
  storeName: {
    type: String,
    default: 'Smart POS',
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  receiptFooter: {
    type: String,
  },
}, {
  timestamps: true,
  _id: false,
});

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
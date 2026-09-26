import mongoose from 'mongoose';

const returnItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
  },
  saleNumber: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  reason: {
    type: String,
    trim: true,
  },
}, { _id: false });

const returnSchema = new mongoose.Schema({
  returnNumber: {
    type: String,
    required: true,
    unique: true,
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
  },
  saleNumber: {
    type: String,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  customerName: {
    type: String,
  },
  items: [returnItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  refundMethod: {
    type: String,
    enum: ['CASH', 'CARD', 'STORE_CREDIT', 'ORIGINAL'],
    default: 'CASH',
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'REJECTED'],
    default: 'PENDING',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

returnSchema.index({ saleId: 1 });
returnSchema.index({ createdAt: -1 });
returnSchema.index({ returnNumber: 1 });
returnSchema.index({ status: 1 });

export default mongoose.models.Return || mongoose.model('Return', returnSchema);
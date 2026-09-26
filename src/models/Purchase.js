import mongoose from 'mongoose';

const purchaseItemSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const purchaseSchema = new mongoose.Schema({
  purchaseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  supplierName: {
    type: String,
    required: true,
  },
  items: [purchaseItemSchema],
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
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['PENDING', 'RECEIVED', 'CANCELLED', 'PARTIAL'],
    default: 'PENDING',
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PARTIAL', 'PAID'],
    default: 'UNPAID',
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expectedDate: {
    type: Date,
  },
  receivedDate: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

purchaseSchema.index({ supplierId: 1 });
purchaseSchema.index({ createdAt: -1 });
purchaseSchema.index({ purchaseNumber: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ paymentStatus: 1 });

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
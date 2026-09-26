import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'LOW_STOCK', 'NEW_ORDER', 'PAYMENT_DUE', 'PURCHASE_RECEIVED', 'RETURN_REQUEST'],
    default: 'INFO',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  relatedEntity: {
    type: String,
    enum: ['PRODUCT', 'SALE', 'PURCHASE', 'SUPPLIER', 'RETURN', 'CUSTOMER'],
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  actionUrl: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ relatedEntity: 1, relatedEntityId: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
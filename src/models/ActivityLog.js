import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  entity: {
    type: String,
    required: true,
    trim: true,
  },
  entityId: {
    type: String,
  },
  entityName: {
    type: String,
    trim: true,
  },
  details: {
    type: String,
    trim: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ entity: 1, entityId: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
import mongoose from 'mongoose';

const slotLockSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Service'
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  fieldSlot: {
    type: Number,
    required: true
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  lockedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Document sẽ tự động bị xóa khi hết hạn
  }
});

// Tạo compound index để đảm bảo không có duplicate locks
slotLockSchema.index({ serviceId: 1, date: 1, time: 1, fieldSlot: 1 }, { unique: true });

export default mongoose.models.SlotLock || mongoose.model('SlotLock', slotLockSchema);
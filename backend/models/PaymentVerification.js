const mongoose = require('mongoose');

const paymentVerificationSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  easypaisaNumber: {
    type: String,
    required: true
  },
  receiptPath: {
    type: String,
    required: true
  },
  receiptOriginalName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

paymentVerificationSchema.index({ userEmail: 1, status: 1 });
paymentVerificationSchema.index({ transactionId: 1 });
paymentVerificationSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('PaymentVerification', paymentVerificationSchema);
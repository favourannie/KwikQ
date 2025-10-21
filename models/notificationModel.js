const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientType: {
    type: String,
    enum: ['admin', 'branch', 'customer'],
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientType'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('notifications', notificationSchema);

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['浇水', '施肥', '修剪', '换盆', '其他']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date,
    required: true
  },
  repeatDays: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['待处理', '已完成', '已过期', '已取消'],
    default: '待处理'
  },
  priority: {
    type: String,
    enum: ['低', '中', '高'],
    default: '中'
  },
  completedAt: {
    type: Date
  },
  notified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reminderSchema.index({ userId: 1, dueDate: 1 });
reminderSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);

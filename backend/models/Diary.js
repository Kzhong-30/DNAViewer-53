const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image'],
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const diarySchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  entries: {
    type: [diaryEntrySchema],
    required: true
  },
  growthStatus: {
    type: String,
    enum: ['发芽', '生长', '开花', '结果', '休眠'],
    default: '生长'
  },
  tags: {
    type: [String],
    default: []
  },
  weather: {
    type: String,
    default: ''
  },
  temperature: {
    type: Number
  },
  watering: {
    type: Boolean,
    default: false
  },
  fertilizing: {
    type: Boolean,
    default: false
  },
  pruning: {
    type: Boolean,
    default: false
  },
  repotting: {
    type: Boolean,
    default: false
  },
  fertilizerType: {
    type: String,
    default: ''
  },
  pesticideUsed: {
    type: Boolean,
    default: false
  },
  pesticideDetails: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

diarySchema.index({ plantId: 1, createdAt: -1 });

module.exports = mongoose.model('Diary', diarySchema);

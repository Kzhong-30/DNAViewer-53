const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  lightLevel: {
    type: String,
    required: true,
    enum: ['强光', '半阴', '散射', '全日照', '半日照']
  },
  waterFrequency: {
    type: Number,
    required: true,
    min: 1,
    max: 60
  },
  fertilizeFrequency: {
    type: Number,
    default: 30
  },
  pruneFrequency: {
    type: Number,
    default: 90
  },
  repotFrequency: {
    type: Number,
    default: 365
  },
  images: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['健康', '需关注', '生病', '死亡'],
    default: '健康'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plant', plantSchema);

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['成果分享', '病虫害求助', '种子交换', '幼苗交换', '经验交流']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isPinned: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['开放', '已解决', '已完成', '关闭'],
    default: '开放'
  }
}, {
  timestamps: true
});

postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);

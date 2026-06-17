const mongoose = require('mongoose');

const plantWikiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  commonNames: {
    type: [String],
    default: []
  },
  scientificName: {
    type: String,
    default: ''
  },
  family: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['观叶植物', '多肉植物', '花卉植物', '草本植物', '果树植物', '蔬菜植物', '蕨类植物', '水生植物']
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  lightRequirement: {
    type: String,
    required: true,
    enum: ['弱光', '散射光', '半日照', '全日照']
  },
  waterRequirement: {
    type: String,
    required: true,
    enum: ['少量', '适量', '充足']
  },
  waterFrequency: {
    type: Number,
    default: 7
  },
  temperatureRange: {
    min: { type: Number, default: 10 },
    max: { type: Number, default: 30 }
  },
  humidity: {
    type: String,
    enum: ['低', '中', '高'],
    default: '中'
  },
  soilType: {
    type: String,
    default: '通用营养土'
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
  difficulty: {
    type: String,
    required: true,
    enum: ['新手友好', '中等难度', '需要经验']
  },
  growthSpeed: {
    type: String,
    enum: ['缓慢', '中等', '快速'],
    default: '中等'
  },
  toxicity: {
    type: String,
    enum: ['无毒', '微毒', '有毒'],
    default: '无毒'
  },
  careGuide: {
    watering: { type: String, default: '' },
    lighting: { type: String, default: '' },
    fertilizing: { type: String, default: '' },
    pruning: { type: String, default: '' },
    repotting: { type: String, default: '' },
    pests: { type: String, default: '' },
    propagation: { type: String, default: '' }
  },
  seasonalTips: {
    spring: { type: String, default: '' },
    summer: { type: String, default: '' },
    autumn: { type: String, default: '' },
    winter: { type: String, default: '' }
  },
  tags: {
    type: [String],
    default: []
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

plantWikiSchema.index({ name: 1 });
plantWikiSchema.index({ category: 1 });
plantWikiSchema.index({ tags: 1 });

module.exports = mongoose.model('PlantWiki', plantWikiSchema);

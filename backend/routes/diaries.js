const express = require('express');
const Diary = require('../models/Diary');
const Plant = require('../models/Plant');
const auth = require('../middleware/auth');

const router = express.Router();

const validateEntries = (entries) => {
  if (!Array.isArray(entries) || entries.length < 1) {
    return 'entries 必须是数组且长度至少为 1';
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const index = i + 1;

    if (!entry.type || !['text', 'image'].includes(entry.type)) {
      return `第 ${index} 条 entry 的 type 只能是 'text' 或 'image'`;
    }

    if (entry.type === 'text') {
      if (!entry.content || !entry.content.trim()) {
        return `第 ${index} 条 entry 的 content 不能为空`;
      }
      if (entry.content.length > 10000) {
        return `第 ${index} 条 entry 的 content 长度不能超过 10000 字符`;
      }
    }

    if (entry.type === 'image') {
      if (!entry.content || !entry.content.startsWith('data:image/')) {
        return `第 ${index} 条 entry 的 content 必须是 base64 格式（以 data:image/ 开头）`;
      }
      if (entry.content.length > 7000000) {
        return `第 ${index} 条 entry 的 content 大小不能超过 5MB`;
      }
    }
  }

  return null;
};

router.get('/', auth, async (req, res) => {
  try {
    const { plantId, status } = req.query;
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);

    if (isNaN(page) || page < 1) page = 1;
    if (page > 100) page = 100;

    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 50) limit = 50;

    const filter = { userId: req.userId };

    if (plantId) filter.plantId = plantId;
    if (status) filter.growthStatus = status;

    const skip = (page - 1) * limit;

    const diaries = await Diary.find(filter)
      .populate('plantId', 'name species images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Diary.countDocuments(filter);

    res.json({ diaries, total, page, limit });
  } catch (error) {
    console.error('获取日记列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const diary = await Diary.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('plantId');

    if (!diary) {
      return res.status(404).json({ message: '日记不存在' });
    }

    res.json({ diary });
  } catch (error) {
    console.error('获取日记详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { plantId, entries } = req.body;

    const entriesError = validateEntries(entries);
    if (entriesError) {
      return res.status(400).json({ message: entriesError });
    }

    const plant = await Plant.findOne({ _id: plantId, userId: req.userId });
    if (!plant) {
      return res.status(400).json({ message: '植物不存在或无权访问' });
    }

    const diaryData = {
      ...req.body,
      userId: req.userId,
      plantId
    };

    const diary = new Diary(diaryData);
    await diary.save();
    await diary.populate('plantId', 'name species images');

    res.status(201).json({ diary });
  } catch (error) {
    console.error('创建日记错误:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const diary = await Diary.findOne({ _id: req.params.id, userId: req.userId });

    if (!diary) {
      return res.status(404).json({ message: '日记不存在' });
    }

    const { entries } = req.body;
    if (entries !== undefined) {
      const entriesError = validateEntries(entries);
      if (entriesError) {
        return res.status(400).json({ message: entriesError });
      }
    }

    if (req.body.plantId && req.body.plantId !== diary.plantId.toString()) {
      const plant = await Plant.findOne({ _id: req.body.plantId, userId: req.userId });
      if (!plant) {
        return res.status(400).json({ message: '植物不存在或无权访问' });
      }
    }

    const updates = [
      'plantId', 'title', 'entries', 'growthStatus', 'tags', 'weather',
      'temperature', 'watering', 'fertilizing', 'pruning', 'repotting',
      'fertilizerType', 'pesticideUsed', 'pesticideDetails'
    ];

    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        diary[field] = req.body[field];
      }
    });

    await diary.save();
    await diary.populate('plantId', 'name species images');

    res.json({ diary });
  } catch (error) {
    console.error('更新日记错误:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const diary = await Diary.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!diary) {
      return res.status(404).json({ message: '日记不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除日记错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;

const express = require('express');
const Diary = require('../models/Diary');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { plantId, growthStatus, search, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.userId };

    if (plantId) filter.plantId = plantId;
    if (growthStatus) filter.growthStatus = growthStatus;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    const diaries = await Diary.find(filter)
      .populate('plantId', 'name species images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Diary.countDocuments(filter);

    res.json({ diaries, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('获取日记列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const diary = await Diary.findOne({ _id: req.params.id, userId: req.userId })
      .populate('plantId', 'name species images');

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
    const diaryData = {
      ...req.body,
      userId: req.userId
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

    const updates = [
      'plantId', 'title', 'entries', 'growthStatus', 'tags',
      'weather', 'temperature', 'watering', 'fertilizing',
      'pruning', 'repotting', 'fertilizerType', 'pesticideUsed',
      'pesticideDetails'
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

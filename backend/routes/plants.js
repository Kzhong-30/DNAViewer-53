const express = require('express');
const Plant = require('../models/Plant');
const Reminder = require('../models/Reminder');
const auth = require('../middleware/auth');

const router = express.Router();

const generateReminders = async (plant) => {
  const reminders = [];
  const startDate = new Date(plant.purchaseDate);

  if (plant.waterFrequency) {
    reminders.push({
      userId: plant.userId,
      plantId: plant._id,
      type: '浇水',
      title: `给${plant.name}浇水`,
      description: `每${plant.waterFrequency}天浇水一次`,
      dueDate: new Date(startDate.getTime() + plant.waterFrequency * 24 * 60 * 60 * 1000),
      repeatDays: plant.waterFrequency,
      priority: '高'
    });
  }

  if (plant.fertilizeFrequency) {
    reminders.push({
      userId: plant.userId,
      plantId: plant._id,
      type: '施肥',
      title: `给${plant.name}施肥`,
      description: `每${plant.fertilizeFrequency}天施肥一次`,
      dueDate: new Date(startDate.getTime() + plant.fertilizeFrequency * 24 * 60 * 60 * 1000),
      repeatDays: plant.fertilizeFrequency,
      priority: '中'
    });
  }

  if (plant.pruneFrequency) {
    reminders.push({
      userId: plant.userId,
      plantId: plant._id,
      type: '修剪',
      title: `给${plant.name}修剪`,
      description: `每${plant.pruneFrequency}天修剪一次`,
      dueDate: new Date(startDate.getTime() + plant.pruneFrequency * 24 * 60 * 60 * 1000),
      repeatDays: plant.pruneFrequency,
      priority: '低'
    });
  }

  if (plant.repotFrequency) {
    reminders.push({
      userId: plant.userId,
      plantId: plant._id,
      type: '换盆',
      title: `给${plant.name}换盆`,
      description: `每${plant.repotFrequency}天换盆一次`,
      dueDate: new Date(startDate.getTime() + plant.repotFrequency * 24 * 60 * 60 * 1000),
      repeatDays: plant.repotFrequency,
      priority: '低'
    });
  }

  await Reminder.deleteMany({ plantId: plant._id });
  await Reminder.insertMany(reminders);
};

router.get('/', auth, async (req, res) => {
  try {
    const { status, location, search } = req.query;
    const filter = { userId: req.userId };

    if (status) filter.status = status;
    if (location) filter.location = location;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { species: { $regex: search, $options: 'i' } }
      ];
    }

    const plants = await Plant.find(filter).sort({ createdAt: -1 });
    const total = await Plant.countDocuments({ userId: req.userId });

    res.json({ plants, total });
  } catch (error) {
    console.error('获取植物列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.userId });

    if (!plant) {
      return res.status(404).json({ message: '植物不存在' });
    }

    res.json({ plant });
  } catch (error) {
    console.error('获取植物详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const plantData = {
      ...req.body,
      userId: req.userId
    };

    const plant = new Plant(plantData);
    await plant.save();
    await generateReminders(plant);

    res.status(201).json({ plant });
  } catch (error) {
    console.error('创建植物错误:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const plant = await Plant.findOne({ _id: req.params.id, userId: req.userId });

    if (!plant) {
      return res.status(404).json({ message: '植物不存在' });
    }

    const updates = [
      'name', 'species', 'purchaseDate', 'location', 'lightLevel',
      'waterFrequency', 'fertilizeFrequency', 'pruneFrequency',
      'repotFrequency', 'images', 'notes', 'status'
    ];

    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        plant[field] = req.body[field];
      }
    });

    await plant.save();
    await generateReminders(plant);

    res.json({ plant });
  } catch (error) {
    console.error('更新植物错误:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const plant = await Plant.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!plant) {
      return res.status(404).json({ message: '植物不存在' });
    }

    await Reminder.deleteMany({ plantId: req.params.id });

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除植物错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id/reminders', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({
      plantId: req.params.id,
      userId: req.userId
    }).sort({ dueDate: 1 });

    res.json({ reminders });
  } catch (error) {
    console.error('获取植物提醒错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;

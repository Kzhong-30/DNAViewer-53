const express = require('express');
const Reminder = require('../models/Reminder');
const Plant = require('../models/Plant');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status, type, plantId, startDate, endDate } = req.query;
    const filter = { userId: req.userId };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (plantId) filter.plantId = plantId;

    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    const now = new Date();
    await Reminder.updateMany(
      { userId: req.userId, dueDate: { $lt: now }, status: '待处理' },
      { status: '已过期' }
    );

    const reminders = await Reminder.find(filter)
      .populate('plantId', 'name species images')
      .sort({ dueDate: 1 });

    const stats = {
      pending: await Reminder.countDocuments({ userId: req.userId, status: '待处理' }),
      completed: await Reminder.countDocuments({ userId: req.userId, status: '已完成' }),
      expired: await Reminder.countDocuments({ userId: req.userId, status: '已过期' }),
      today: await Reminder.countDocuments({
        userId: req.userId,
        dueDate: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        },
        status: '待处理'
      }),
      week: await Reminder.countDocuments({
        userId: req.userId,
        dueDate: {
          $gte: now,
          $lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        },
        status: '待处理'
      })
    };

    res.json({ reminders, stats });
  } catch (error) {
    console.error('获取提醒列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.userId })
      .populate('plantId', 'name species images');

    if (!reminder) {
      return res.status(404).json({ message: '提醒不存在' });
    }

    res.json({ reminder });
  } catch (error) {
    console.error('获取提醒详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const reminderData = {
      ...req.body,
      userId: req.userId
    };

    const reminder = new Reminder(reminderData);
    await reminder.save();
    await reminder.populate('plantId', 'name species images');

    res.status(201).json({ reminder });
  } catch (error) {
    console.error('创建提醒错误:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.userId });

    if (!reminder) {
      return res.status(404).json({ message: '提醒不存在' });
    }

    const updates = [
      'plantId', 'type', 'title', 'description', 'dueDate',
      'repeatDays', 'status', 'priority'
    ];

    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        reminder[field] = req.body[field];
      }
    });

    await reminder.save();
    await reminder.populate('plantId', 'name species images');

    res.json({ reminder });
  } catch (error) {
    console.error('更新提醒错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.userId });

    if (!reminder) {
      return res.status(404).json({ message: '提醒不存在' });
    }

    reminder.status = '已完成';
    reminder.completedAt = new Date();

    if (reminder.repeatDays && reminder.repeatDays > 0) {
      const plant = reminder.plantId
        ? await Plant.findOne({ _id: reminder.plantId, userId: req.userId })
        : null;

      if (!plant || plant.status !== '死亡') {
        const nextReminder = new Reminder({
          userId: reminder.userId,
          plantId: reminder.plantId,
          type: reminder.type,
          title: reminder.title,
          description: reminder.description,
          dueDate: new Date(reminder.dueDate.getTime() + reminder.repeatDays * 24 * 60 * 60 * 1000),
          repeatDays: reminder.repeatDays,
          priority: reminder.priority
        });
        await nextReminder.save();
      }
    }

    await reminder.save();
    await reminder.populate('plantId', 'name species images');

    res.json({ reminder });
  } catch (error) {
    console.error('完成提醒错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!reminder) {
      return res.status(404).json({ message: '提醒不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除提醒错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;

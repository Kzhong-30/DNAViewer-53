const express = require('express');
const PlantWiki = require('../models/PlantWiki');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { commonNames: { $elemMatch: { $regex: search, $options: 'i' } } },
        { scientificName: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    const plants = await PlantWiki.find(filter)
      .sort({ viewCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await PlantWiki.countDocuments(filter);

    const categories = await PlantWiki.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({ plants, total, page: parseInt(page), limit: parseInt(limit), categories });
  } catch (error) {
    console.error('获取植物百科列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const plant = await PlantWiki.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({ message: '植物百科不存在' });
    }

    plant.viewCount = (plant.viewCount || 0) + 1;
    await plant.save();

    const relatedPlants = await PlantWiki.find({
      category: plant.category,
      _id: { $ne: plant._id }
    }).limit(6);

    res.json({ plant, relatedPlants });
  } catch (error) {
    console.error('获取植物百科详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const plantWiki = new PlantWiki(req.body);
    await plantWiki.save();

    res.status(201).json({ plant: plantWiki });
  } catch (error) {
    console.error('创建植物百科错误:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;

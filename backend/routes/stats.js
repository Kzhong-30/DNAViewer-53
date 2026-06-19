const express = require("express");
const router = express.Router();
const Plant = require("../models/Plant");
const Diary = require("../models/Diary");
const Reminder = require("../models/Reminder");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

router.get("/overview", auth, async function (req, res) {
  try {
    const uid = req.userId;
    const plants = await Plant.find({ userId: uid }).select("status species lightLevel location").lean();
    const totalPlants = plants.length;
    let healthy = 0, need = 0, sick = 0;
    const speciesMap = {}, lightMap = {}, locMap = {};
    for (let i = 0; i < plants.length; i++) {
      const p = plants[i];
      if (p.status === '健康') healthy++;
      else if (p.status === '需关注') need++;
      else if (p.status === '生病') sick++;
      if (p.species) speciesMap[p.species] = (speciesMap[p.species] || 0) + 1;
      if (p.lightLevel) lightMap[p.lightLevel] = (lightMap[p.lightLevel] || 0) + 1;
      if (p.location) locMap[p.location] = (locMap[p.location] || 0) + 1;
    }
    const speciesCount = Object.keys(speciesMap).map(function (k) { return { species: k, count: speciesMap[k] }; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 10);
    const lightLevelStats = Object.keys(lightMap).map(function (k) { return { level: k, count: lightMap[k] }; });
    const locationStats = Object.keys(locMap).map(function (k) { return { location: k, count: locMap[k] }; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 10);
    const diaries = await Diary.find({ userId: uid }).select("entries").lean();
    const totalDiaries = diaries.length;
    let totalImages = 0;
    for (let i = 0; i < diaries.length; i++) {
      const entries = diaries[i].entries || [];
      for (let j = 0; j < entries.length; j++) {
        if (entries[j].type === "image") totalImages++;
      }
    }
    const totalReminders = await Reminder.countDocuments({ userId: uid });
    const reminders = await Reminder.find({ userId: uid }).select("status").lean();
    let pending = 0, completed = 0;
    for (let i = 0; i < reminders.length; i++) {
      const r = reminders[i];
      if (r.status === '待处理') pending++;
      else if (r.status === '已完成') completed++;
    }
    const myPosts = await Post.countDocuments({ userId: uid });
    res.json({
      stats: {
        totalPlants: totalPlants,
        healthyPlants: healthy,
        needAttentionPlants: need,
        sickPlants: sick,
        totalDiaries: totalDiaries,
        totalImages: totalImages,
        totalReminders: totalReminders,
        pendingReminders: pending,
        completedReminders: completed,
        myPosts: myPosts,
        speciesDistribution: speciesCount,
        lightLevelDistribution: lightLevelStats,
        locationDistribution: locationStats
      }
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/calendar", auth, async function (req, res) {
  try {
    const uid = req.userId;
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const calendarData = {};

    const diaries = await Diary.find({
      userId: uid,
      createdAt: { $gte: sixtyDaysAgo }
    }).select("createdAt watering fertilizing pruning repotting").lean();

    for (let i = 0; i < diaries.length; i++) {
      const d = diaries[i];
      const dateStr = formatDate(new Date(d.createdAt));
      if (!calendarData[dateStr]) {
        calendarData[dateStr] = {
          diaries: 0,
          reminders: 0,
          activities: { watering: 0, fertilizing: 0, pruning: 0, repotting: 0 }
        };
      }
      calendarData[dateStr].diaries++;
      if (d.watering) calendarData[dateStr].activities.watering++;
      if (d.fertilizing) calendarData[dateStr].activities.fertilizing++;
      if (d.pruning) calendarData[dateStr].activities.pruning++;
      if (d.repotting) calendarData[dateStr].activities.repotting++;
    }

    const reminders = await Reminder.find({
      userId: uid,
      dueDate: { $gte: sixtyDaysAgo }
    }).select("dueDate").lean();

    for (let i = 0; i < reminders.length; i++) {
      const r = reminders[i];
      const dateStr = formatDate(new Date(r.dueDate));
      if (!calendarData[dateStr]) {
        calendarData[dateStr] = {
          diaries: 0,
          reminders: 0,
          activities: { watering: 0, fertilizing: 0, pruning: 0, repotting: 0 }
        };
      }
      calendarData[dateStr].reminders++;
    }

    res.json({ calendarData: calendarData });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/timeline", auth, async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const f = { userId: req.userId };
    if (req.query.plantId) f.plantId = req.query.plantId;
    const data = await Diary.find(f).populate("plantId", "name species images").sort({ createdAt: -1 }).limit(limit).lean();
    const timeline = data.map(function (d) {
      const images = [];
      const entries = d.entries || [];
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].type === "image") images.push(entries[i].content);
      }
      return {
        id: d._id,
        date: d.createdAt,
        plant: d.plantId,
        title: d.title,
        growthStatus: d.growthStatus,
        images: images,
        tags: d.tags || [],
        activities: { watering: d.watering, fertilizing: d.fertilizing, pruning: d.pruning, repotting: d.repotting }
      };
    });
    res.json({ timeline: timeline });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/activities", auth, async function (req, res) {
  try {
    const uid = req.userId;
    const summary = { watering: 0, fertilizing: 0, pruning: 0, repotting: 0 };

    const allDiaries = await Diary.find({ userId: uid }).select("watering fertilizing pruning repotting").lean();
    for (let i = 0; i < allDiaries.length; i++) {
      const d = allDiaries[i];
      if (d.watering) summary.watering++;
      if (d.fertilizing) summary.fertilizing++;
      if (d.pruning) summary.pruning++;
      if (d.repotting) summary.repotting++;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyMap = {};

    const recentDiaries = await Diary.find({
      userId: uid,
      createdAt: { $gte: thirtyDaysAgo }
    }).select("createdAt watering fertilizing pruning repotting").lean();

    for (let i = 0; i < recentDiaries.length; i++) {
      const d = recentDiaries[i];
      const dateStr = formatDate(new Date(d.createdAt));
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { watering: 0, fertilizing: 0, pruning: 0, repotting: 0 };
      }
      if (d.watering) dailyMap[dateStr].watering++;
      if (d.fertilizing) dailyMap[dateStr].fertilizing++;
      if (d.pruning) dailyMap[dateStr].pruning++;
      if (d.repotting) dailyMap[dateStr].repotting++;
    }

    const dailyActivities = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(date);
      const dayData = dailyMap[dateStr] || { watering: 0, fertilizing: 0, pruning: 0, repotting: 0 };
      dailyActivities.unshift({
        date: dateStr,
        watering: dayData.watering,
        fertilizing: dayData.fertilizing,
        pruning: dayData.pruning,
        repotting: dayData.repotting
      });
    }

    res.json({ summary: summary, dailyActivities: dailyActivities });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

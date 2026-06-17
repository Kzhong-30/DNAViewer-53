const express = require("express");
const router = express.Router();
const Plant = require("../models/Plant");
const Diary = require("../models/Diary");
const Reminder = require("../models/Reminder");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const healthyCode = [20581, 24247];
const needCode = [38656, 20851, 27880];
const sickCode = [29983, 30149];
const pendingCode = [24453, 22788, 29702];
const doneCode = [24050, 23436, 25104];

function matchCode(str, codes) {
  if (!str) return false;
  return str.length >= 2 && codes[0] === str.charCodeAt(0) && codes[1] === str.charCodeAt(1);
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
      if (matchCode(p.status, healthyCode)) healthy++;
      else if (matchCode(p.status, needCode)) need++;
      else if (matchCode(p.status, sickCode)) sick++;
      if (p.species) speciesMap[p.species] = (speciesMap[p.species] || 0) + 1;
      if (p.lightLevel) lightMap[p.lightLevel] = (lightMap[p.lightLevel] || 0) + 1;
      if (p.location) locMap[p.location] = (locMap[p.location] || 0) + 1;
    }
    const speciesCount = Object.keys(speciesMap).map(function (k) { return { species: k, count: speciesMap[k] }; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 10);
    const lightLevelStats = Object.keys(lightMap).map(function (k) { return { level: k, count: lightMap[k] }; });
    const locationStats = Object.keys(locMap).map(function (k) { return { location: k, count: locMap[k] }; }).sort(function (a, b) { return b.count - a.count; }).slice(0, 10);
    const totalDiaries = await Diary.countDocuments({ userId: uid });
    const totalReminders = await Reminder.countDocuments({ userId: uid });
    const reminders = await Reminder.find({ userId: uid }).select("status").lean();
    let pending = 0, completed = 0;
    for (let i = 0; i < reminders.length; i++) {
      const r = reminders[i];
      if (matchCode(r.status, pendingCode)) pending++;
      else if (matchCode(r.status, doneCode)) completed++;
    }
    const myPosts = await Post.countDocuments({ userId: uid });
    res.json({
      stats: {
        totalPlants: totalPlants,
        healthyPlants: healthy,
        needAttentionPlants: need,
        sickPlants: sick,
        totalDiaries: totalDiaries,
        totalImages: 0,
        totalReminders: totalReminders,
        pendingReminders: pending,
        completedReminders: completed,
        myPosts: myPosts
      },
      speciesCount: speciesCount,
      lightLevelStats: lightLevelStats,
      locationStats: locationStats
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/calendar", auth, function (req, res) {
  res.json({ calendarData: {} });
});

router.get("/timeline", auth, async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const f = { userId: req.userId };
    if (req.query.plantId) f.plantId = req.query.plantId;
    const data = await Diary.find(f).populate("plantId", "name species images").sort({ createdAt: -1 }).limit(limit).lean();
    const timeline = data.map(function (d) {
      return {
        id: d._id,
        date: d.createdAt,
        plant: d.plantId,
        title: d.title,
        growthStatus: d.growthStatus,
        images: [],
        tags: d.tags || [],
        activities: {}
      };
    });
    res.json({ timeline: timeline });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/activities", auth, function (req, res) {
  res.json({ summary: { watering: 0, fertilizing: 0, pruning: 0, repotting: 0 }, dailyActivities: [] });
});

module.exports = router;

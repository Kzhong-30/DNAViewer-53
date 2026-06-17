const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/plants');
const diaryRoutes = require('./routes/diaries');
const reminderRoutes = require('./routes/reminders');
const postRoutes = require('./routes/posts');
const wikiRoutes = require('./routes/wiki');
const recognitionRoutes = require('./routes/recognition');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));

app.get('/', (req, res) => {
  res.json({ message: '园艺种植记录 API 服务运行中' });
});

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/diaries', diaryRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/recognition', recognitionRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;

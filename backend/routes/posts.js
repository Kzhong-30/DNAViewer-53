const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { category, search, userId, page = 1, limit = 20, sort = 'latest' } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (userId) filter.userId = userId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { 'likes.length': -1, createdAt: -1 };
    if (sort === 'pinned') sortOption = { isPinned: -1, createdAt: -1 };

    const posts = await Post.find(filter)
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.json({ posts, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('获取帖子列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username avatar bio')
      .populate('comments.userId', 'username avatar');

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    res.json({ post });
  } catch (error) {
    console.error('获取帖子详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      userId: req.userId
    };

    const post = new Post(postData);
    await post.save();
    await post.populate('userId', 'username avatar');

    res.status(201).json({ post });
  } catch (error) {
    console.error('创建帖子错误:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: '无权修改此帖子' });
    }

    const updates = ['category', 'title', 'content', 'images', 'tags', 'location', 'status'];

    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();
    await post.populate('userId', 'username avatar');

    res.json({ post });
  } catch (error) {
    console.error('更新帖子错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: '无权删除此帖子' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除帖子错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    const likeIndex = post.likes.indexOf(req.userId);

    if (likeIndex === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate('userId', 'username avatar');

    res.json({ post });
  } catch (error) {
    console.error('点赞帖子错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    post.comments.push({
      userId: req.userId,
      content: content.trim()
    });

    await post.save();
    await post.populate('userId', 'username avatar');
    await post.populate('comments.userId', 'username avatar');

    res.json({ post });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    const commentIndex = post.comments.findIndex(c => c._id.toString() === req.params.commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ message: '评论不存在' });
    }

    const comment = post.comments[commentIndex];

    if (comment.userId.toString() !== req.userId && post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: '无权删除此评论' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();
    await post.populate('userId', 'username avatar');
    await post.populate('comments.userId', 'username avatar');

    res.json({ post });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;

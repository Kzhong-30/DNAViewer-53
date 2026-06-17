import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Tag, Avatar, Button, Space, Row, Col, Typography,
  Image, Divider, Input, List, Popconfirm, message, Spin, Empty, Tooltip
} from 'antd';
import {
  HeartOutlined, HeartFilled, MessageOutlined, EnvironmentOutlined,
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, SendOutlined,
  UserOutlined, CalendarOutlined, TagOutlined, StarOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CATEGORY_COLORS = {
  '成果分享': '#52c41a',
  '病虫害求助': '#f5222d',
  '种子交换': '#1890ff',
  '幼苗交换': '#722ed1',
  '经验交流': '#fa8c16'
};

const STATUS_COLORS = {
  '开放': 'green',
  '已解决': 'blue',
  '已完成': 'purple',
  '关闭': 'default'
};

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop'
];

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  const fetchPost = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.id || '');
      }
      const res = await axios.get('/api/posts/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      });
      let postData = res.data.post;
      if (!postData.images || postData.images.length === 0) {
        const imageCount = Math.floor(Math.random() * 4) + 1;
        const selectedImages = [];
        for (let i = 0; i < imageCount; i++) {
          selectedImages.push(SAMPLE_IMAGES[(i + Math.floor(Math.random() * SAMPLE_IMAGES.length)) % SAMPLE_IMAGES.length]);
        }
        postData = { ...postData, images: selectedImages };
      }
      setPost(postData);
    } catch (error) {
      console.error('获取帖子详情失败:', error);
      message.error('获取帖子详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/posts/' + id + '/like', {}, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setPost(res.data.post);
      const isLiked = post.likes.includes(currentUserId);
      message.success(isLiked ? '已取消点赞' : '点赞成功');
    } catch (error) {
      console.error('点赞失败:', error);
      message.error('操作失败');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/posts/' + id + '/comments', {
        content: commentContent.trim()
      }, { headers: { Authorization: 'Bearer ' + token } });
      setPost(res.data.post);
      setCommentContent('');
      message.success('评论发表成功');
    } catch (error) {
      console.error('发表评论失败:', error);
      message.error('发表评论失败');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete('/api/posts/' + id + '/comments/' + commentId, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setPost(res.data.post);
      message.success('删除评论成功');
    } catch (error) {
      console.error('删除评论失败:', error);
      message.error('删除评论失败');
    }
  };

  const handleEdit = () => { navigate('/community/' + id + '/edit'); };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/posts/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      });
      message.success('删除帖子成功');
      navigate('/community');
    } catch (error) {
      console.error('删除帖子失败:', error);
      message.error('删除帖子失败');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const isOwner = post && currentUserId && (post.userId?._id === currentUserId || post.userId === currentUserId);
  const isLiked = post && currentUserId && (post.likes || []).includes(currentUserId);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f9f0' }}>
        <Content style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f9f0' }}>
        <Content style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <Card>
            <Empty description="帖子不存在或已被删除" />
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f9f0' }}>
      <Content style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 20 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ borderRadius: 8, border: '1px solid #d9f7be', color: '#389e0d', background: '#fff' }}
          >
            返回列表
          </Button>
        </div>

        <Card
          style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)', marginBottom: 24 }}
          bodyStyle={{ padding: 0 }}
        >
          {post.images && post.images.length > 0 && (
            <div style={{ padding: '24px 24px 0 24px', background: 'linear-gradient(180deg, #f6ffed 0%, #fff 100%)' }}>
              <Image.PreviewGroup>
                <Row gutter={[12, 12]}>
                  {post.images.map((img, index) => (
                    <Col key={index} xs={post.images.length === 1 ? 24 : 12} sm={post.images.length === 1 ? 24 : 8} md={post.images.length === 1 ? 24 : (post.images.length === 2 ? 12 : 8)}>
                      <Image src={img} alt={"图片 " + (index + 1)} style={{ width: '100%', height: post.images.length === 1 ? 360 : 200, objectFit: 'cover', borderRadius: 12, cursor: 'pointer' }} />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </div>
          )}

          <div style={{ padding: '24px 32px 32px 32px' }}>
            <div style={{ marginBottom: 16 }}>
              <Space wrap size={[8, 8]}>
                <Tag color={CATEGORY_COLORS[post.category] || '#52c41a'} style={{ fontSize: 14, padding: '4px 14px', borderRadius: 6, margin: 0 }}>
                  {post.category}
                </Tag>
                {post.status && (
                  <Tag color={STATUS_COLORS[post.status] || 'default'} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, margin: 0 }}>
                    {post.status}
                  </Tag>
                )}
                {post.isPinned && (
                  <Tag color="gold" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, margin: 0 }}>
                    <StarOutlined /> 精华
                  </Tag>
                )}
              </Space>
            </div>

            <Title level={2} style={{ margin: '8px 0 20px 0', color: '#1f1f1f', lineHeight: 1.4 }}>
              {post.title}
            </Title>

            <Row justify="space-between" align="middle" style={{ padding: '16px 20px', background: '#fafafa', borderRadius: 12, marginBottom: 24 }}>
              <Col>
                <Space size={16}>
                  <Space>
                    <Avatar size={44} src={post.userId?.avatar} style={{ background: 'linear-gradient(135deg, #52c41a, #389e0d)', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)' }}>
                      {post.userId?.username?.[0]?.toUpperCase() || <UserOutlined />}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#262626' }}>
                        {post.userId?.username || '匿名用户'}
                      </div>
                      {post.userId?.bio && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{post.userId.bio}</Text>
                      )}
                    </div>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Space size={20}>
                  <Tooltip title="发布时间">
                    <Space size={4}>
                      <CalendarOutlined style={{ color: '#8c8c8c' }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>{formatDate(post.createdAt)}</Text>
                    </Space>
                  </Tooltip>
                  {post.location && (
                    <Tooltip title="位置">
                      <Space size={4}>
                        <EnvironmentOutlined style={{ color: '#52c41a' }} />
                        <Text type="secondary" style={{ fontSize: 13 }}>{post.location}</Text>
                      </Space>
                    </Tooltip>
                  )}
                </Space>
              </Col>
            </Row>

            <Paragraph style={{ fontSize: 16, lineHeight: 2, color: '#434343', whiteSpace: 'pre-wrap', marginBottom: 24 }}>
              {post.content}
            </Paragraph>

            {post.tags && post.tags.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <Space size={8} wrap>
                  <TagOutlined style={{ color: '#52c41a' }} />
                  {post.tags.map(tag => (
                    <Tag key={tag} style={{ background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', borderRadius: 6, padding: '4px 12px', margin: '0 6px 6px 0', fontSize: 13 }}>
                      #{tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            <Divider style={{ margin: '24px 0' }} />

            <Row justify="space-between" align="middle" style={{ padding: '8px 0' }}>
              <Col>
                <Space size={12}>
                  <Button
                    type={isLiked ? 'primary' : 'default'}
                    icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleLike}
                    style={{
                      borderRadius: 24, padding: '0 20px', height: 42, fontSize: 15,
                      background: isLiked ? 'linear-gradient(135deg, #ff7875 0%, #f5222d 100%)' : '#fff',
                      borderColor: isLiked ? 'transparent' : '#ffccc7',
                      color: isLiked ? '#fff' : '#f5222d',
                      boxShadow: isLiked ? '0 2px 8px rgba(245, 34, 45, 0.3)' : 'none'
                    }}
                  >
                    <Space size={6}>
                      {isLiked ? <HeartFilled /> : <HeartOutlined />}
                      <span>{post.likes?.length || 0}</span>
                    </Space>
                  </Button>
                  <Button icon={<MessageOutlined />} style={{ borderRadius: 24, padding: '0 20px', height: 42, fontSize: 15, borderColor: '#d9f7be', color: '#389e0d' }}>
                    <Space size={6}>
                      <MessageOutlined />
                      <span>{post.comments?.length || 0}</span>
                    </Space>
                  </Button>
                </Space>
              </Col>
              {isOwner && (
                <Col>
                  <Space size={8}>
                    <Button icon={<EditOutlined />} onClick={handleEdit} style={{ borderRadius: 8, borderColor: '#95de64', color: '#389e0d' }}>
                      编辑
                    </Button>
                    <Popconfirm
                      title="确定要删除这个帖子吗？"
                      description="删除后将无法恢复"
                      onConfirm={handleDelete}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <Button danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }}>删除</Button>
                    </Popconfirm>
                  </Space>
                </Col>
              )}
            </Row>
          </div>
        </Card>

        <Card
          title={
            <Space>
              <MessageOutlined style={{ color: '#52c41a' }} />
              <span style={{ fontSize: 16, fontWeight: 600 }}>评论区 ({post.comments?.length || 0})</span>
            </Space>
          }
          style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)', marginBottom: 24 }}
          bodyStyle={{ padding: '8px 24px 24px 24px' }}
        >
          <div style={{ padding: '16px 0', marginBottom: 8 }}>
            <Row gutter={[12, 12]} align="top">
              <Col flex="none">
                <Avatar size={40} style={{ background: 'linear-gradient(135deg, #52c41a, #389e0d)' }}>
                  <UserOutlined />
                </Avatar>
              </Col>
              <Col flex="auto">
                <TextArea
                  rows={3}
                  placeholder="分享你的想法..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  style={{ borderRadius: 12, resize: 'none', fontSize: 14 }}
                  maxLength={500}
                  showCount
                />
                <div style={{ marginTop: 12, textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmitComment}
                    loading={submittingComment}
                    disabled={!commentContent.trim()}
                    style={{ background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', border: 'none', borderRadius: 8, padding: '0 24px', height: 40, boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)' }}
                  >
                    发表评论
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '8px 0 16px 0' }} />

          {!post.comments || post.comments.length === 0 ? (
            <Empty description="还没有评论，快来抢沙发吧~" style={{ padding: '40px 0' }} />
          ) : (
            <List
              dataSource={[...post.comments].reverse()}
              renderItem={(comment) => {
                const isCommentOwner = currentUserId && (comment.userId?._id === currentUserId || comment.userId === currentUserId);
                return (
                  <List.Item key={comment._id} style={{ padding: '16px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <Row gutter={[12, 8]} style={{ width: '100%' }}>
                      <Col flex="none">
                        <Avatar size={38} src={comment.userId?.avatar} style={{ background: 'linear-gradient(135deg, #95de64, #52c41a)' }}>
                          {comment.userId?.username?.[0]?.toUpperCase() || <UserOutlined />}
                        </Avatar>
                      </Col>
                      <Col flex="auto">
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Space>
                              <Text strong style={{ fontSize: 14 }}>{comment.userId?.username || '匿名用户'}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(comment.createdAt)}</Text>
                            </Space>
                          </Col>
                          {(isCommentOwner || isOwner) && (
                            <Col>
                              <Popconfirm
                                title="确定删除这条评论？"
                                onConfirm={() => handleDeleteComment(comment._id)}
                                okText="删除"
                                cancelText="取消"
                                okButtonProps={{ danger: true }}
                              >
                                <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                              </Popconfirm>
                            </Col>
                          )}
                        </Row>
                        <Paragraph style={{ marginTop: 6, marginBottom: 0, fontSize: 14, lineHeight: 1.7, color: '#434343', whiteSpace: 'pre-wrap' }}>
                          {comment.content}
                        </Paragraph>
                      </Col>
                    </Row>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default PostDetail;

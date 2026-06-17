import React, { useState, useEffect } from 'react';
import {
  Layout,
  Input,
  Tabs,
  Select,
  Card,
  Tag,
  Avatar,
  Button,
  Pagination,
  Space,
  Row,
  Col,
  Typography,
  Empty,
  Spin,
  message,
  Image
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  EnvironmentOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Meta } = Card;

const CATEGORIES = ['成果分享', '病虫害求助', '种子交换', '幼苗交换', '经验交流'];

const CATEGORY_COLORS = {
  '成果分享': '#52c41a',
  '病虫害求助': '#f5222d',
  '种子交换': '#1890ff',
  '幼苗交换': '#722ed1',
  '经验交流': '#fa8c16'
};

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop'
];

const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', limit);
      params.append('sort', sort);

      const res = await axios.get(`/api/posts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedPosts = res.data.posts.map(post => {
        if (!post.images || post.images.length === 0) {
          const sampleIndex = Math.floor(Math.random() * SAMPLE_IMAGES.length);
          return { ...post, images: [SAMPLE_IMAGES[sampleIndex]] };
        }
        return post;
      });

      setPosts(fetchedPosts);
      setTotal(res.data.total);
    } catch (error) {
      console.error('获取帖子列表失败:', error);
      message.error('获取帖子列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category, search, page, sort]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (key) => {
    setCategory(key === 'all' ? '' : key);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  const handleCardClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  const handleCreatePost = () => {
    navigate('/community/new');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderSortIcon = () => {
    if (sort === 'popular') return <FireOutlined style={{ color: '#fa541c' }} />;
    if (sort === 'pinned') return <StarOutlined style={{ color: '#faad14' }} />;
    return <ClockCircleOutlined style={{ color: '#52c41a' }} />;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f9f0' }}>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={2} style={{ margin: 0, color: '#237804' }}>
                🌱 社区交流
              </Title>
              <Text type="secondary">分享种植经验，交流园艺心得</Text>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleCreatePost}
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
                }}
              >
                发布帖子
              </Button>
            </Col>
          </Row>
        </div>

        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
            border: 'none',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
          }}
          bodyStyle={{ padding: 20 }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Input.Search
                placeholder="搜索帖子标题、内容或标签..."
                enterButton={<SearchOutlined />}
                size="large"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onSearch={handleSearch}
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={sort}
                onChange={handleSortChange}
                prefix={renderSortIcon()}
                optionLabelProp="label"
              >
                <Option value="latest" label="最新">
                  <Space>
                    <ClockCircleOutlined style={{ color: '#52c41a' }} />
                    最新发布
                  </Space>
                </Option>
                <Option value="popular" label="最热">
                  <Space>
                    <FireOutlined style={{ color: '#fa541c' }} />
                    最热帖子
                  </Space>
                </Option>
                <Option value="pinned" label="精华">
                  <Space>
                    <StarOutlined style={{ color: '#faad14' }} />
                    精华帖子
                  </Space>
                </Option>
              </Select>
            </Col>
          </Row>

          <div style={{ marginTop: 20 }}>
            <Tabs
              defaultActiveKey="all"
              onChange={handleCategoryChange}
              size="large"
              tabBarStyle={{
                borderBottom: '2px solid #f6ffed',
                marginBottom: 0
              }}
              items={[
                {
                  key: 'all',
                  label: (
                    <span style={{ padding: '4px 8px' }}>
                      全部
                    </span>
                  )
                },
                ...CATEGORIES.map(cat => ({
                  key: cat,
                  label: (
                    <Space>
                      <Tag color={CATEGORY_COLORS[cat]} style={{ margin: 0 }}>
                        {cat}
                      </Tag>
                    </Space>
                  )
                }))
              ]}
            />
          </div>
        </Card>

        <Spin spinning={loading} size="large">
          {posts.length === 0 && !loading ? (
            <Card
              style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
              }}
            >
              <Empty
                description={
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                      暂无帖子
                    </div>
                    <Text type="secondary">快来发布第一篇帖子吧！</Text>
                  </div>
                }
                style={{ padding: '60px 0' }}
              />
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {posts.map(post => (
                <Col xs={24} sm={24} md={12} lg={12} xl={8} key={post._id}>
                  <Card
                    hoverable
                    onClick={() => handleCardClick(post._id)}
                    style={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.3s',
                      overflow: 'hidden',
                      height: '100%'
                    }}
                    styles={{ body: { padding: 0 } }}
                    cover={
                      post.images && post.images.length > 0 ? (
                        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                          <Image
                            src={post.images[0]}
                            alt={post.title}
                            preview={false}
                            style={{
                              width: '100%',
                              height: 180,
                              objectFit: 'cover'
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              zIndex: 1
                            }}
                          >
                            <Tag
                              color={CATEGORY_COLORS[post.category] || '#52c41a'}
                              style={{
                                margin: 0,
                                borderRadius: 6,
                                fontWeight: 500
                              }}
                            >
                              {post.category}
                            </Tag>
                          </div>
                          {post.isPinned && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                zIndex: 1
                              }}
                            >
                              <Tag color="gold" style={{ margin: 0, borderRadius: 6 }}>
                                <StarOutlined /> 精华
                              </Tag>
                            </div>
                          )}
                        </div>
                      ) : null
                    }
                  >
                    <div style={{ padding: 16 }}>
                      <Title
                        level={4}
                        ellipsis={{ rows: 1 }}
                        style={{
                          margin: '0 0 12px 0',
                          color: '#1f1f1f',
                          lineHeight: 1.4
                        }}
                      >
                        {post.title}
                      </Title>

                      <Text
                        type="secondary"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          marginBottom: 12,
                          minHeight: 44,
                          lineHeight: 1.6
                        }}
                      >
                        {truncateContent(post.content, 80)}
                      </Text>

                      {post.tags && post.tags.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          {post.tags.slice(0, 3).map(tag => (
                            <Tag
                              key={tag}
                              style={{
                                margin: '0 8px 4px 0',
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                color: '#389e0d',
                                borderRadius: 4
                              }}
                            >
                              #{tag}
                            </Tag>
                          ))}
                        </div>
                      )}

                      <div
                        style={{
                          borderTop: '1px solid #f0f0f0',
                          paddingTop: 12,
                          marginTop: 4
                        }}
                      >
                        <Row justify="space-between" align="middle">
                          <Col flex="auto">
                            <Space size={8}>
                              <Avatar
                                size={28}
                                src={post.userId?.avatar}
                                style={{
                                  background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                                  border: '2px solid #fff',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                                }}
                              >
                                {post.userId?.username?.[0]?.toUpperCase()}
                              </Avatar>
                              <Text
                                type="secondary"
                                style={{ fontSize: 13 }}
                                ellipsis
                              >
                                {post.userId?.username || '匿名用户'}
                              </Text>
                            </Space>
                          </Col>
                        </Row>

                        <Row
                          justify="space-between"
                          align="middle"
                          style={{ marginTop: 10 }}
                        >
                          <Col>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {formatDate(post.createdAt)}
                            </Text>
                          </Col>
                          <Col>
                            <Space size={16}>
                              <Space size={4}>
                                {post.likes && post.likes.length > 0 ? (
                                  <LikeFilled style={{ color: '#f5222d', fontSize: 14 }} />
                                ) : (
                                  <LikeOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                                )}
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  {post.likes?.length || 0}
                                </Text>
                              </Space>
                              <Space size={4}>
                                <MessageOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                  {post.comments?.length || 0}
                                </Text>
                              </Space>
                            </Space>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>

        {total > 0 && (
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Pagination
              current={page}
              total={total}
              pageSize={limit}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(t) => `共 ${t} 条帖子`}
              style={{
                padding: '16px 24px',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            />
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Community;

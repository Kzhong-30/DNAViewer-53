import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Row,
  Col,
  List,
  Tag,
  Typography,
  Select,
  Empty,
  Image,
  Avatar,
  Space,
  Pagination,
  message,
  Grid
} from 'antd';
import {
  LikeOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  EditOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { get } from '../../utils/api.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { useBreakpoint } = Grid;

const categoryConfig = {
  '全部': { value: 'all', color: 'default' },
  '成果分享': { value: '成果分享', color: 'green' },
  '病虫害求助': { value: '病虫害求助', color: 'red' },
  '种子交换': { value: '种子交换', color: 'blue' },
  '幼苗交换': { value: '幼苗交换', color: 'cyan' },
  '经验交流': { value: '经验交流', color: 'purple' }
};

const Community = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const screens = useBreakpoint();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (category !== 'all') params.category = category;
      if (searchText) params.search = searchText;
      const res = await get('/posts', params);
      const list = res?.posts || res?.data || res || [];
      setPosts(Array.isArray(list) ? list : []);
      setTotal(res?.total || list.length || 0);
    } catch (error) {
      message.error('获取帖子列表失败');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [category, page]);

  const handleSearch = (value) => {
    setSearchText(value);
    setPage(1);
    setTimeout(() => fetchPosts(), 0);
  };

  const getCategoryColor = (cat) => {
    const cfg = categoryConfig[cat];
    return cfg ? cfg.color : 'default';
  };

  const getUserAvatar = (user) => user?.avatar || undefined;
  const getUsername = (user) => user?.username || '匿名用户';

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>社区交流</Title>
        <Text type="secondary">与花友分享种植经验，互相帮助共同成长</Text>
      </div>

      <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={6} lg={5}>
            <Select
              size="large"
              value={category}
              onChange={(v) => { setCategory(v); setPage(1); }}
              style={{ width: '100%' }}
              options={Object.entries(categoryConfig).map(([key, cfg]) => ({ label: key, value: cfg.value }))}
            />
          </Col>
          <Col xs={24} sm={16} md={12} lg={14}>
            <Search
              placeholder="搜索帖子标题、内容或标签"
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} md={6} lg={5}>
            <Space style={screens.xs ? { width: '100%' } : { float: 'right' }}>
              <Button type="primary" size="large" icon={<EditOutlined />} onClick={() => navigate('/community/new')} style={{ height: 40, borderRadius: 8, width: screens.xs ? '100%' : 'auto' }}>
                发帖
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <List
          loading={loading}
          dataSource={posts}
          locale={{ emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<div><div style={{ marginBottom: 8 }}>暂无帖子</div><Button type="primary" size="small" icon={<EditOutlined />} onClick={() => navigate('/community/new')}>发布第一篇帖子</Button></div>} />
          )}}
          renderItem={(post) => (
            <List.Item style={{ padding: '20px 0', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }} onClick={() => navigate('/community/' + (post._id || post.id))}>
              <Row gutter={16} style={{ width: '100%' }}>
                <Col flex="56px" style={{ flexShrink: 0 }}>
                  <Avatar size={48} src={getUserAvatar(post.userId)} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                </Col>
                <Col flex="auto" style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 14, marginRight: 8 }}>{getUsername(post.userId)}</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginRight: 12 }}>{post.createdAt ? dayjs(post.createdAt).fromNow() : ''}</Text>
                    <Tag color={getCategoryColor(post.category)} style={{ margin: 0 }}>{post.category || '其他'}</Tag>
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); navigate('/community/' + (post._id || post.id)); }} style={{ marginBottom: 8 }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', color: '#262626' }}>{post.title}</Title>
                    <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 12, color: '#595959' }}>{post.content}</Paragraph>
                  </div>
                  {post.images && post.images.length > 0 && (
                    <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
                      {post.images.slice(0, 3).map((img, idx) => (
                        <Col span={8} key={idx} style={{ maxWidth: 140 }}>
                          <div style={{ aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden', background: '#f5f5f5' }}>
                            <Image src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} preview={{ src: img }} onClick={(e) => e.stopPropagation()} />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Space size={4}><LikeOutlined style={{ color: '#8c8c8c', fontSize: 14 }} /><Text type="secondary" style={{ fontSize: 13 }}>{post.likes?.length || 0}</Text></Space>
                    <Space size={4}><MessageOutlined style={{ color: '#8c8c8c', fontSize: 14 }} /><Text type="secondary" style={{ fontSize: 13 }}>{post.comments?.length || 0}</Text></Space>
                    {post.location && <Space size={4}><EnvironmentOutlined style={{ color: '#8c8c8c', fontSize: 14 }} /><Text type="secondary" style={{ fontSize: 13 }}>{post.location}</Text></Space>}
                    {post.tags && post.tags.length > 0 && <Space size={4} wrap>{post.tags.slice(0, 3).map((tag, i) => <Tag key={i} color="geekblue" style={{ fontSize: 12, margin: 0 }}>#{tag}</Tag>)}</Space>}
                  </div>
                </Col>
              </Row>
            </List.Item>
          )}
        />
        {total > 0 && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Pagination current={page} total={total} pageSize={pageSize} onChange={setPage} showSizeChanger={false} showTotal={(t) => '共 ' + t + ' 条帖子'} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Input,
  Select,
  Card,
  Tag,
  Row,
  Col,
  Pagination,
  Spin,
  Empty,
  Button,
  Space,
  Typography,
  List,
  Badge
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  SunOutlined,
  DropletOutlined,
  BulbOutlined,
  FilterOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Meta } = Card;

const difficultyColors = {
  '新手友好': 'green',
  '中等难度': 'orange',
  '需要经验': 'red'
};

const lightIcons = {
  '弱光': <SunOutlined style={{ color: '#8c8c8c' }} />,
  '散射光': <SunOutlined style={{ color: '#faad14' }} />,
  '半日照': <SunOutlined style={{ color: '#fa8c16' }} />,
  '全日照': <SunOutlined style={{ color: '#f5222d' }} />
};

const waterIcons = {
  '少量': <DropletOutlined style={{ color: '#91d5ff' }} />,
  '适量': <DropletOutlined style={{ color: '#40a9ff' }} />,
  '充足': <DropletOutlined style={{ color: '#1890ff' }} />
};

const Wiki = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit };
      if (search) params.search = search;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;

      const res = await axios.get('/api/wiki', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setPlants(res.data.plants || []);
      setCategories(res.data.categories || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('获取植物百科列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, [page, category, difficulty]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
    setTimeout(() => fetchPlants(), 300);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setCategory(cat);
    setPage(1);
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setSelectedCategory('');
    setPage(1);
  };

  const handleCardClick = (id) => {
    navigate(`/wiki/${id}`);
  };

  const handleAddToMyPlants = (e, plant) => {
    e.stopPropagation();
    navigate(`/plants/add?wikiId=${plant._id}`);
  };

  return (
    <Layout style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <Sider
        width={260}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          padding: '20px 16px',
          overflow: 'auto',
          height: 'calc(100vh - 64px)'
        }}
        collapsible={false}
      >
        <div style={{ marginBottom: 20 }}>
          <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#52c41a' }} />
            分类筛选
          </Title>
          <List
            size="small"
            dataSource={[{ _id: '', count: total }, ...categories]}
            renderItem={(item) => (
              <List.Item
                key={item._id || 'all'}
                onClick={() => handleCategoryClick(item._id || '')}
                style={{
                  cursor: 'pointer',
                  padding: '10px 12px',
                  borderRadius: 8,
                  marginBottom: 4,
                  background: selectedCategory === (item._id || '') ? '#f6ffed' : 'transparent',
                  border: selectedCategory === (item._id || '') ? '1px solid #b7eb8f' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text strong={selectedCategory === (item._id || '')}>
                    {item._id || '全部植物'}
                  </Text>
                  <Badge
                    count={item.count}
                    style={{
                      backgroundColor: selectedCategory === (item._id || '') ? '#52c41a' : '#f0f0f0',
                      color: selectedCategory === (item._id || '') ? '#fff' : '#666'
                    }}
                  />
                </Space>
              </List.Item>
            )}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <Title level={5} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BulbOutlined style={{ color: '#faad14' }} />
            难度说明
          </Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {Object.keys(difficultyColors).map((d) => (
              <Tag
                key={d}
                color={difficultyColors[d]}
                style={{ margin: 0, padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
                onClick={() => handleDifficultyChange(difficulty === d ? '' : d)}
              >
                {d}
              </Tag>
            ))}
          </Space>
        </div>

        {(category || difficulty || search) && (
          <Button
            block
            onClick={handleReset}
            style={{ borderRadius: 8 }}
          >
            重置筛选条件
          </Button>
        )}
      </Sider>

      <Content style={{ padding: '24px', overflow: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={24} md={12} lg={10} xl={8}>
              <Input
                size="large"
                placeholder="搜索植物名称、学名、俗称或标签..."
                prefix={<SearchOutlined />}
                allowClear
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={24} md={12} lg={8} xl={6}>
              <Select
                size="large"
                placeholder="选择难度等级"
                allowClear
                value={difficulty || undefined}
                onChange={handleDifficultyChange}
                style={{ width: '100%', borderRadius: 8 }}
              >
                {Object.keys(difficultyColors).map((d) => (
                  <Option key={d} value={d}>
                    <Tag color={difficultyColors[d]}>{d}</Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
              <Space>
                <Text type="secondary">
                  共 <Text strong style={{ color: '#52c41a' }}>{total}</Text> 种植物
                </Text>
              </Space>
            </Col>
          </Row>
        </div>

        <Spin spinning={loading} tip="加载中...">
          {plants.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无符合条件的植物"
              style={{ padding: '100px 0' }}
            />
          ) : (
            <>
              <Row gutter={[20, 20]}>
                {plants.map((plant) => (
                  <Col xs={24} sm={12} md={12} lg={8} xl={6} key={plant._id}>
                    <Card
                      hoverable
                      onClick={() => handleCardClick(plant._id)}
                      style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid #f0f0f0'
                      }}
                      cover={
                        <div
                          style={{
                            height: 200,
                            background: `linear-gradient(135deg, #d9f7be 0%, #95de64 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {plant.image ? (
                            <img
                              src={plant.image}
                              alt={plant.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', color: '#fff' }}>
                              <div style={{ fontSize: 48, marginBottom: 8 }}>🌿</div>
                              <Text style={{ color: '#fff', fontSize: 16 }}>{plant.name}</Text>
                            </div>
                          )}
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              background: 'rgba(0,0,0,0.5)',
                              color: '#fff',
                              padding: '4px 10px',
                              borderRadius: 12,
                              fontSize: 12,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <EyeOutlined /> {plant.viewCount || 0}
                          </div>
                          <Tag
                            color="blue"
                            style={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              margin: 0
                            }}
                          >
                            {plant.category}
                          </Tag>
                        </div>
                      }
                      actions={[
                        <Button
                          type="link"
                          icon={<ArrowRightOutlined />}
                          onClick={(e) => handleAddToMyPlants(e, plant)}
                          style={{ color: '#52c41a' }}
                        >
                          添加到我的植物
                        </Button>
                      ]}
                    >
                      <Meta
                        title={
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Title level={5} style={{ margin: 0 }}>{plant.name}</Title>
                            </div>
                            {plant.scientificName && (
                              <Text italic type="secondary" style={{ fontSize: 12 }}>
                                {plant.scientificName}
                              </Text>
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <Space wrap style={{ marginBottom: 12 }}>
                              {plant.difficulty && (
                                <Tag color={difficultyColors[plant.difficulty]}>
                                  {plant.difficulty}
                                </Tag>
                              )}
                              {plant.tags?.slice(0, 2).map((tag) => (
                                <Tag key={tag} color="geekblue">
                                  {tag}
                                </Tag>
                              ))}
                            </Space>

                            <Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{ marginBottom: 12, color: '#595959', fontSize: 13 }}
                            >
                              {plant.description}
                            </Paragraph>

                            <Row gutter={8}>
                              <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                  {lightIcons[plant.lightRequirement]}
                                  <Text type="secondary">{plant.lightRequirement}</Text>
                                </div>
                              </Col>
                              <Col span={12}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                  {waterIcons[plant.waterRequirement]}
                                  <Text type="secondary">{plant.waterRequirement}</Text>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>

              {total > limit && (
                <div style={{ marginTop: 32, textAlign: 'center' }}>
                  <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
                    onChange={setPage}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(t) => `共 ${t} 条记录`}
                  />
                </div>
              )}
            </>
          )}
        </Spin>
      </Content>
    </Layout>
  );
};

export default Wiki;

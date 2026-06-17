import React, { useState, useEffect } from 'react';
import {
  Card,
  Tag,
  Row,
  Col,
  Spin,
  Button,
  Space,
  Typography,
  Descriptions,
  Empty,
  Divider,
  Progress,
  Statistic
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SunOutlined,
  DropletOutlined,
  ThermometerOutlined,
  CloudOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ScissorOutlined,
  ThunderboltOutlined,
  BugOutlined,
  BranchesOutlined,
  CalendarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const difficultyColors = {
  '新手友好': 'green',
  '中等难度': 'orange',
  '需要经验': 'red'
};

const toxicityColors = {
  '无毒': 'green',
  '微毒': 'orange',
  '有毒': 'red'
};

const growthColors = {
  '缓慢': '#8c8c8c',
  '中等': '#faad14',
  '快速': '#52c41a'
};

const WikiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plant, setPlant] = useState(null);
  const [relatedPlants, setRelatedPlants] = useState([]);

  const fetchPlantDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/wiki/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setPlant(res.data.plant);
      setRelatedPlants(res.data.relatedPlants || []);
    } catch (error) {
      console.error('获取植物百科详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlantDetail();
    }
  }, [id]);

  const handleAddToMyPlants = () => {
    navigate('/plants/add?wikiId=' + id);
  };

  const handleBack = () => {
    navigate('/wiki');
  };

  const handleRelatedClick = (pid) => {
    navigate('/wiki/' + pid);
  };

  const careGuideItems = [
    { key: 'watering', label: '浇水', icon: 'droplet', color: '#1890ff' },
    { key: 'lighting', label: '光照', icon: 'sun', color: '#faad14' },
    { key: 'fertilizing', label: '施肥', icon: 'experiment', color: '#722ed1' },
    { key: 'pruning', label: '修剪', icon: 'scissor', color: '#52c41a' },
    { key: 'repotting', label: '换盆', icon: 'thunderbolt', color: '#eb2f96' },
    { key: 'pests', label: '病虫害', icon: 'bug', color: '#f5222d' },
    { key: 'propagation', label: '繁殖', icon: 'branches', color: '#13c2c2' }
  ];

  const getIcon = (iconName) => {
    const icons = {
      droplet: <DropletOutlined />,
      sun: <SunOutlined />,
      experiment: <ExperimentOutlined />,
      scissor: <ScissorOutlined />,
      thunderbolt: <ThunderboltOutlined />,
      bug: <BugOutlined />,
      branches: <BranchesOutlined />
    };
    return icons[iconName] || <CheckCircleOutlined />;
  };

  const seasonItems = [
    { key: 'spring', label: '春季', icon: '🌸', color: '#f759ab' },
    { key: 'summer', label: '夏季', icon: '☀️', color: '#fa8c16' },
    { key: 'autumn', label: '秋季', icon: '🍂', color: '#d48806' },
    { key: 'winter', label: '冬季', icon: '❄️', color: '#1890ff' }
  ];

  const renderProgress = (label, value, icon, color) => {
    const percentMap = {
      '弱光': 25, '散射光': 50, '半日照': 75, '全日照': 100,
      '少量': 25, '适量': 50, '充足': 100,
      '低': 33, '中': 66, '高': 100,
      '缓慢': 33, '中等': 66, '快速': 100
    };
    const percent = percentMap[value] || 50;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Space>
            <span style={{ color }}>{icon}</span>
            <Text strong>{label}</Text>
          </Space>
          <Tag color={color} style={{ margin: 0 }}>{value}</Tag>
        </div>
        <Progress percent={percent} showInfo={false} strokeColor={color} />
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!plant) {
    return (
      <div style={{ padding: 100 }}>
        <Empty description="未找到该植物百科信息" />
        <Button onClick={handleBack} icon={<ArrowLeftOutlined />} style={{ marginTop: 20 }}>
          返回列表
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginRight: 16, borderRadius: 8 }}>
          返回列表
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddToMyPlants}
          style={{ borderRadius: 8, background: '#52c41a', borderColor: '#52c41a' }}
        >
          添加到我的植物
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Card
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div
              style={{
                height: 400,
                background: 'linear-gradient(135deg, #d9f7be 0%, #95de64 100%)',
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <div style={{ fontSize: 120, marginBottom: 16 }}>🌿</div>
                  <Title level={2} style={{ color: '#fff', margin: 0 }}>{plant.name}</Title>
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <EyeOutlined />
                <Text style={{ color: '#fff' }}>{plant.viewCount || 0} 次浏览</Text>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <Title level={2} style={{ marginBottom: 4 }}>{plant.name}</Title>
                {plant.scientificName && (
                  <Text italic type="secondary" style={{ fontSize: 16 }}>
                    {plant.scientificName}
                  </Text>
                )}
              </div>
              <Space wrap style={{ marginBottom: 16 }}>
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                  {plant.category}
                </Tag>
                {plant.difficulty && (
                  <Tag color={difficultyColors[plant.difficulty]} style={{ fontSize: 14, padding: '4px 12px' }}>
                    {plant.difficulty}
                  </Tag>
                )}
                {plant.toxicity && (
                  <Tag color={toxicityColors[plant.toxicity]} style={{ fontSize: 14, padding: '4px 12px' }}>
                    {plant.toxicity}
                  </Tag>
                )}
                {plant.tags && plant.tags.length > 0 && plant.tags.map((tag) => (
                  <Tag key={tag} color="geekblue" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {tag}
                  </Tag>
                ))}
              </Space>
              <Paragraph style={{ fontSize: 14, lineHeight: 1.8, color: '#595959' }}>
                {plant.description}
              </Paragraph>
              {plant.commonNames && plant.commonNames.length > 0 && (
                <div>
                  <Text type="secondary">俗称：</Text>
                  <Text>{plant.commonNames.join('、')}</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <span>基本信息</span>
              </Space>
            }
            style={{ marginBottom: 24, borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 2 }} size="middle">
              <Descriptions.Item label="学名">
                {plant.scientificName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="科属">
                {plant.family || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="分类">
                <Tag color="blue">{plant.category}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Tag color={difficultyColors[plant.difficulty]}>{plant.difficulty}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="毒性">
                <Tag color={toxicityColors[plant.toxicity]}>{plant.toxicity}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="生长速度">
                <span style={{ color: growthColors[plant.growthSpeed] }}>
                  <RocketOutlined /> {plant.growthSpeed}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="浇水频率">
                {plant.waterFrequency ? '每 ' + plant.waterFrequency + ' 天' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="土壤类型">
                {plant.soilType || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={
              <Space>
                <ExperimentOutlined style={{ color: '#722ed1' }} />
                <span>养护需求</span>
              </Space>
            }
            style={{ marginBottom: 24, borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                {renderProgress('光照需求', plant.lightRequirement, <SunOutlined />, '#faad14')}
                {renderProgress('浇水需求', plant.waterRequirement, <DropletOutlined />, '#1890ff')}
              </Col>
              <Col xs={24} sm={12}>
                {renderProgress('湿度要求', plant.humidity, <CloudOutlined />, '#13c2c2')}
                {renderProgress('生长速度', plant.growthSpeed, <RocketOutlined />, growthColors[plant.growthSpeed])}
              </Col>
            </Row>
            <Divider style={{ margin: '16px 0' }} />
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ borderRadius: 12, background: '#fff7e6', border: 'none' }}>
                  <Statistic
                    title={
                      <Space>
                        <ThermometerOutlined style={{ color: '#fa8c16' }} />
                        温度范围
                      </Space>
                    }
                    value={(plant.temperatureRange?.min || 10) + '°C ~ ' + (plant.temperatureRange?.max || 30) + '°C'}
                    valueStyle={{ fontSize: 18, color: '#d46b08' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card size="small" style={{ borderRadius: 12, background: '#e6f7ff', border: 'none' }}>
                  <Statistic
                    title={
                      <Space>
                        <DropletOutlined style={{ color: '#1890ff' }} />
                        浇水周期
                      </Space>
                    }
                    value={(plant.waterFrequency || 7) + ' 天/次'}
                    valueStyle={{ fontSize: 18, color: '#096dd9' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>养护指南</span>
          </Space>
        }
        style={{ marginBottom: 24, borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      >
        <Row gutter={[16, 16]}>
          {careGuideItems.map((item) => (
            <Col xs={24} sm={12} md={8} key={item.key}>
              <Card
                size="small"
                style={{
                  borderRadius: 12,
                  borderLeft: '4px solid ' + item.color,
                  height: '100%'
                }}
                title={
                  <Space>
                    <span style={{ color: item.color }}>{getIcon(item.icon)}</span>
                    <Text strong>{item.label}</Text>
                  </Space>
                }
              >
                <Paragraph
                  style={{ margin: 0, fontSize: 13, color: '#595959', lineHeight: 1.7 }}
                  ellipsis={{ rows: 4, expandable: true, symbol: '展开' }}
                >
                  {(plant.careGuide && plant.careGuide[item.key]) || '暂无详细说明'}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: '#eb2f96' }} />
            <span>四季养护要点</span>
          </Space>
        }
        style={{ marginBottom: 24, borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      >
        <Row gutter={[16, 16]}>
          {seasonItems.map((item) => (
            <Col xs={24} sm={12} key={item.key}>
              <Card
                size="small"
                style={{
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, ' + item.color + '10 0%, ' + item.color + '05 100%)',
                  border: '1px solid ' + item.color + '30'
                }}
                title={
                  <Space>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <Text strong style={{ color: item.color }}>{item.label}</Text>
                  </Space>
                }
              >
                <Paragraph
                  style={{ margin: 0, fontSize: 13, color: '#595959', lineHeight: 1.7 }}
                  ellipsis={{ rows: 3, expandable: true, symbol: '查看更多' }}
                >
                  {(plant.seasonalTips && plant.seasonalTips[item.key]) || '暂无相关建议'}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {relatedPlants.length > 0 && (
        <Card
          title={
            <Space>
              <BranchesOutlined style={{ color: '#13c2c2' }} />
              <span>相关植物推荐</span>
            </Space>
          }
          style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          <Row gutter={[16, 16]}>
            {relatedPlants.map((rp) => (
              <Col xs={12} sm={8} md={6} lg={4} key={rp._id}>
                <Card
                  hoverable
                  onClick={() => handleRelatedClick(rp._id)}
                  style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
                  cover={
                    <div
                      style={{
                        height: 120,
                        background: 'linear-gradient(135deg, #d9f7be 0%, #95de64 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {rp.image ? (
                        <img
                          src={rp.image}
                          alt={rp.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ fontSize: 40 }}>🌿</div>
                      )}
                    </div>
                  }
                  bodyStyle={{ padding: 12 }}
                >
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>{rp.name}</Text>
                  <Tag color={difficultyColors[rp.difficulty]} style={{ margin: 0, fontSize: 11 }}>
                    {rp.difficulty}
                  </Tag>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default WikiDetail;

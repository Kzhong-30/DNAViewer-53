import React, { useState } from 'react';
import {
  Upload,
  Button,
  message,
  Typography,
  Card,
  Row,
  Col,
  Descriptions,
  Progress,
  Skeleton,
  Alert,
  Tag,
  Space,
  Image,
  Grid
} from 'antd';
import {
  InboxOutlined,
  DropletOutlined,
  SunOutlined,
  ExperimentOutlined,
  ScissorOutlined,
  ThunderboltOutlined,
  BranchOutlined,
  BugOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  BulbOutlined,
  SpringOutlined,
  SummerOutlined,
  FallOutlined,
  WinterOutlined
} from '@ant-design/icons';
import { post } from '../utils/api.js';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Meta } = Card;
const { useBreakpoint } = Grid;

const careCardColors = {
  watering: { bg: '#e6f4ff', border: '#91caff', icon: '#1677ff' },
  lighting: { bg: '#fff7e6', border: '#ffd591', icon: '#fa8c16' },
  fertilizing: { bg: '#f6ffed', border: '#b7eb8f', icon: '#52c41a' },
  pruning: { bg: '#f9f0ff', border: '#d3adf7', icon: '#722ed1' },
  repotting: { bg: '#e6fffb', border: '#87e8de', icon: '#13c2c2' },
  propagation: { bg: '#fff0f6', border: '#ffadd2', icon: '#eb2f96' },
  pests: { bg: '#fff1f0', border: '#ffa39e', icon: '#f5222d' }
};

const careCardIcons = {
  watering: <DropletOutlined />,
  lighting: <SunOutlined />,
  fertilizing: <ExperimentOutlined />,
  pruning: <ScissorOutlined />,
  repotting: <ThunderboltOutlined />,
  propagation: <BranchOutlined />,
  pests: <BugOutlined />
};

const seasonalConfig = {
  spring: { icon: <SpringOutlined />, title: '春季养护', bg: '#f0fff4', border: '#95de64', color: '#389e0d' },
  summer: { icon: <SummerOutlined />, title: '夏季养护', bg: '#fffbe6', border: '#ffd666', color: '#d48806' },
  autumn: { icon: <FallOutlined />, title: '秋季养护', bg: '#fff2e8', border: '#ff9c6e', color: '#d4380d' },
  winter: { icon: <WinterOutlined />, title: '冬季养护', bg: '#e6f4ff', border: '#69c0ff', color: '#0958d9' }
};

const Recognition = () => {
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [careCards, setCareCards] = useState([]);
  const [tips, setTips] = useState([]);
  const screens = useBreakpoint();

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 <= 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageBase64(e.target.result);
      setResult(null);
      setAlternatives([]);
      setCareCards([]);
      setTips([]);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleIdentify = async () => {
    if (!imageBase64) {
      message.warning('请先上传图片');
      return;
    }
    setLoading(true);
    setProgress(0);
    setResult(null);
    setAlternatives([]);
    setCareCards([]);
    setTips([]);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const res = await post('/recognition/identify', { image: imageBase64 });
      clearInterval(progressTimer);
      setProgress(100);
      setResult(res.result || null);
      setAlternatives(res.alternatives || []);
      setCareCards(res.careCards || []);
      setTips(res.tips || []);
    } catch (error) {
      clearInterval(progressTimer);
      message.error('识别失败，请稍后重试');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === '新手友好') return 'green';
    if (diff === '中等难度') return 'orange';
    return 'red';
  };

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>植物识别</Title>
        <Text type="secondary">上传植物照片，AI 智能识别品种并提供养护指南</Text>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}>
            <div style={{ marginBottom: 16 }}>
              <Dragger
                beforeUpload={beforeUpload}
                accept="image/*"
                multiple={false}
                showUploadList={false}
                style={{ background: '#fafafa' }}
              >
                {imageBase64 ? (
                  <div style={{ padding: 20 }}>
                    <Image
                      src={imageBase64}
                      alt="上传预览"
                      style={{ maxHeight: 280, borderRadius: 8, objectFit: 'contain' }}
                      preview={false}
                    />
                    <div style={{ marginTop: 12 }}>
                      <Text type="secondary">点击或拖拽更换图片</Text>
                    </div>
                  </div>
                ) : (
                  <p className="ant-upload-drag-icon" style={{ marginBottom: 16 }}>
                    <InboxOutlined style={{ color: '#1890ff', fontSize: 48 }} />
                  </p>
                )}
                {!imageBase64 && (
                  <>
                    <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                      点击或拖拽图片到此处上传
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#999', marginBottom: 0 }}>
                      支持单张图片上传，格式为 JPG/PNG，大小不超过 5MB
                    </p>
                  </>
                )}
              </Dragger>
            </div>

            {loading && (
              <div style={{ marginBottom: 16 }}>
                <Progress percent={Math.round(progress)} status="active" />
                <Skeleton paragraph={{ rows: 2 }} active />
              </div>
            )}

            <Button
              type="primary"
              size="large"
              block
              disabled={!imageBase64}
              loading={loading}
              onClick={handleIdentify}
              style={{ height: 44, borderRadius: 8, fontSize: 15 }}
            >
              开始识别
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          {loading && (
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          )}

          {!loading && result && (
            <div>
              <Card
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
                title={
                  <Space>
                    <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    <span style={{ fontSize: 16 }}>{result.name}</span>
                    <Tag color={getDifficultyColor(result.difficulty)} style={{ marginLeft: 8 }}>{result.difficulty}</Tag>
                  </Space>
                }
                extra={
                  <Space direction="vertical" style={{ width: 200 }}>
                    <div style={{ fontSize: 12, color: '#999', textAlign: 'right' }}>置信度</div>
                    <Progress
                      percent={result.confidence}
                      size="small"
                      strokeColor={result.confidence > 90 ? '#52c41a' : result.confidence > 70 ? '#faad14' : '#f5222d'}
                    />
                  </Space>
                }
              >
                <Descriptions column={screens.xs ? 1 : 2} bordered size="middle">
                  <Descriptions.Item label="学名"><Text type="secondary" italic>{result.scientificName || '-'}</Text></Descriptions.Item>
                  <Descriptions.Item label="分类"><Tag color="blue">{result.category || '-'}</Tag></Descriptions.Item>
                  <Descriptions.Item label="养护难度"><Tag color={getDifficultyColor(result.difficulty)}>{result.difficulty || '-'}</Tag></Descriptions.Item>
                  <Descriptions.Item label="光照需求"><Space><SunOutlined style={{ color: '#faad14' }} />{result.lightRequirement || '-'}</Space></Descriptions.Item>
                  <Descriptions.Item label="浇水频率"><Space><DropletOutlined style={{ color: '#1890ff' }} />{result.waterFrequency ? '每 ' + result.waterFrequency + ' 天' : '-'}</Space></Descriptions.Item>
                  <Descriptions.Item label="毒性">{result.toxicity || '-'}</Descriptions.Item>
                  {result.commonNames && result.commonNames.length > 0 && (
                    <Descriptions.Item label="别名" span={screens.xs ? 1 : 2}>
                      <Space wrap>
                        {result.commonNames.map((n, i) => <Tag key={i} color="geekblue">{n}</Tag>)}
                      </Space>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="简介" span={screens.xs ? 1 : 2}>
                    <Paragraph style={{ marginBottom: 0 }}>{result.description}</Paragraph>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
                title={<Space><CalendarOutlined style={{ color: '#722ed1' }} /><span>养护指南</span></Space>}
              >
                <Row gutter={[12, 12]}>
                  {careCards.map((card, idx) => {
                    const colors = careCardColors[card.key] || careCardColors.watering;
                    return (
                      <Col xs={24} sm={12} md={8} key={idx}>
                        <Card
                          style={{
                            borderRadius: 10,
                            border: `1px solid ${colors.border}`,
                            background: colors.bg,
                            height: '100%'
                          }}
                          bodyStyle={{ padding: 16 }}
                        >
                          <Meta
                            avatar={
                              <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                                color: colors.icon
                              }}>
                                {careCardIcons[card.key] || <BulbOutlined />}
                              </div>
                            }
                            title={<Text strong style={{ color: colors.icon }}>{card.title}</Text>}
                            style={{ marginBottom: 12 }}
                          />
                          <Paragraph style={{ marginBottom: 0, fontSize: 13, color: '#333' }}>
                            {card.content}
                          </Paragraph>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>

              {alternatives && alternatives.length > 0 && (
                <Card
                  style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
                  title={<Space><BulbOutlined style={{ color: '#fa8c16' }} /><span>相似植物</span></Space>}
                >
                  <Row gutter={[12, 12]}>
                    {alternatives.map((alt, idx) => (
                      <Col xs={24} sm={12} md={8} key={idx}>
                        <Card
                          hoverable
                          style={{ borderRadius: 10, border: '1px solid #f0f0f0', height: '100%' }}
                          bodyStyle={{ padding: 16 }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <Text strong style={{ fontSize: 15 }}>{alt.name}</Text>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Tag color="blue" style={{ margin: 0 }}>{alt.category}</Tag>
                          </div>
                          <Progress
                            percent={alt.confidence}
                            size="small"
                            format={(p) => p + '%'}
                          />
                          {alt.scientificName && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#999', fontStyle: 'italic' }}>
                              {alt.scientificName}
                            </div>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              )}

              {result.seasonalTips && (
                <Card
                  style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
                  title={<Space><CalendarOutlined style={{ color: '#13c2c2' }} /><span>四季养护要点</span></Space>}
                >
                  <Row gutter={[12, 12]}>
                    {Object.entries(result.seasonalTips).map(([key, value]) => {
                      const cfg = seasonalConfig[key] || seasonalConfig.spring;
                      return (
                        <Col xs={24} sm={12} md={6} key={key}>
                          <Card
                            style={{
                              borderRadius: 10,
                              border: `1px solid ${cfg.border}`,
                              background: cfg.bg,
                              height: '100%'
                            }}
                            bodyStyle={{ padding: 16 }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                                color: cfg.color,
                                marginRight: 8
                              }}>
                                {cfg.icon}
                              </div>
                              <Text strong style={{ color: cfg.color, fontSize: 14 }}>{cfg.title}</Text>
                            </div>
                            <Paragraph style={{ marginBottom: 0, fontSize: 13, color: '#333' }}>{value}</Paragraph>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Card>
              )}

              {tips && tips.length > 0 && (
                <Card
                  style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  title={<Space><BulbOutlined style={{ color: '#faad14' }} /><span>养护小贴士</span></Space>}
                  bodyStyle={{ padding: 0 }}
                >
                  {tips.map((tip, idx) => (
                    <Alert
                      key={idx}
                      message={tip}
                      type={idx === 0 ? 'success' : idx === 1 ? 'info' : idx === 2 ? 'warning' : 'info'}
                      showIcon
                      style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: idx === 0 ? 'none' : '1px solid #f0f0f0' }}
                      icon={<BulbOutlined />}
                    />
                  ))}
                </Card>
              )}
            </div>
          )}

          {!loading && !result && (
            <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: 60 }}>
                <EnvironmentOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
                <div style={{ fontSize: 16, color: '#999', marginBottom: 8 }}>上传植物照片后点击"开始识别"</div>
                <div style={{ fontSize: 13, color: '#bfbfbf' }}>AI 将为您识别植物品种并提供专业养护建议</div>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Recognition;

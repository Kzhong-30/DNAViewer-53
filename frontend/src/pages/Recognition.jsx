import React, { useState } from 'react';
import {
  Upload,
  Card,
  Row,
  Col,
  Progress,
  Descriptions,
  Divider,
  Button,
  Tag,
  List,
  Alert,
  Spin,
  Skeleton,
  Typography,
  Space,
  message,
} from 'antd';
import {
  InboxOutlined,
  CameraOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  DropboxOutlined,
  ThunderboltOutlined,
  BugOutlined,
  TeamOutlined,
  ScissorOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  StarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const getDifficultyColor = (difficulty) => {
  if (difficulty === '新手友好') return 'green';
  if (difficulty === '中等难度') return 'orange';
  return 'red';
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 90) return '#52c41a';
  if (confidence >= 70) return '#1890ff';
  if (confidence >= 50) return '#faad14';
  return '#ff4d4f';
};

const careGuideIcons = {
  watering: <DropboxOutlined style={{ color: '#1890ff', fontSize: 20 }} />,
  lighting: <BulbOutlined style={{ color: '#faad14', fontSize: 20 }} />,
  fertilizing: <ThunderboltOutlined style={{ color: '#722ed1', fontSize: 20 }} />,
  pruning: <ScissorOutlined style={{ color: '#eb2f96', fontSize: 20 }} />,
  propagation: <TeamOutlined style={{ color: '#13c2c2', fontSize: 20 }} />,
  pests: <BugOutlined style={{ color: '#fa8c16', fontSize: 20 }} />,
};

const careGuideLabels = {
  watering: '浇水建议',
  lighting: '光照要求',
  fertilizing: '施肥技巧',
  pruning: '修剪方法',
  propagation: '繁殖方式',
  pests: '病虫害防治',
};

const Recognition = () => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [tips, setTips] = useState([]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFile = async (file) => {
    try {
      const base64 = await fileToBase64(file);
      setImageBase64(base64);
      setImageUrl(URL.createObjectURL(file));
      await handleIdentify(base64);
    } catch (error) {
      message.error('图片处理失败');
    }
    return false;
  };

  const handleIdentify = async (base64) => {
    setLoading(true);
    setProgress(0);
    setResult(null);
    setAlternatives([]);
    setTips([]);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/recognition/identify',
        { image: base64 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setResult(response.data.result);
        setAlternatives(response.data.alternatives);
        setTips(response.data.tips);
        setLoading(false);
        message.success('识别成功！');
      }, 300);
    } catch (error) {
      clearInterval(progressInterval);
      setLoading(false);
      message.error(error.response?.data?.message || '识别失败，请重试');
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setImageBase64(null);
    setResult(null);
    setAlternatives([]);
    setTips([]);
    setProgress(0);
  };

  const handleAddToMyPlants = () => {
    if (result) {
      navigate('/plants/new', {
        state: {
          prefill: {
            name: result.name,
            species: result.scientificName,
            category: result.category,
            notes: result.description,
          },
        },
      });
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: handleFile,
    customRequest: () => {},
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <Title level={2} style={{ color: '#237804', marginBottom: 8 }}>
          <CameraOutlined style={{ marginRight: 8 }} />
          AI 植物识别
        </Title>
        <Text type="secondary">
          上传植物照片，AI 将快速识别植物种类并提供详细养护指南
        </Text>
      </div>

      {!imageUrl && (
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Dragger {...uploadProps} style={{ borderRadius: 16 }}>
            <div
              style={{
                padding: '60px 20px',
                background: 'linear-gradient(135deg, #d9f7be 0%, #95de64 50%, #52c41a 100%)',
                borderRadius: 16,
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: '#fff', fontSize: 80 }} />
              </p>
              <p
                className="ant-upload-text"
                style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginTop: 16 }}
              >
                点击或拖拽植物照片到此区域
              </p>
              <p
                className="ant-upload-hint"
                style={{ color: 'rgba(255,255,255,0.9)', marginTop: 12 }}
              >
                支持 JPG、PNG、WEBP 格式，建议使用清晰的叶片或花朵特写照片
              </p>
              <Button
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                style={{
                  marginTop: 24,
                  background: '#fff',
                  color: '#52c41a',
                  borderColor: '#fff',
                  fontWeight: 600,
                  borderRadius: 24,
                  padding: '0 32px',
                  height: 44,
                }}
              >
                选择照片
              </Button>
            </div>
          </Dragger>
        </Card>
      )}

      {loading && (
        <Card
          style={{
            borderRadius: 16,
            marginTop: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Row gutter={24} align="middle">
            <Col xs={24} md={10}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="upload"
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    maxHeight: 300,
                    objectFit: 'cover',
                  }}
                />
              )}
            </Col>
            <Col xs={24} md={14}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin size="large" tip="正在识别中..." style={{ marginBottom: 24 }}>
                  <div style={{ padding: 24 }} />
                </Spin>
                <div style={{ marginTop: 32 }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                    分析进度: {Math.round(progress)}%
                  </Text>
                  <Progress
                    percent={Math.round(progress)}
                    strokeColor={{
                      '0%': '#95de64',
                      '100%': '#52c41a',
                    }}
                    showInfo={false}
                    size="default"
                  />
                </div>
                <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 24 }} />
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {result && !loading && (
        <>
          <Card
            style={{
              borderRadius: 16,
              marginTop: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span style={{ color: '#237804' }}>识别结果</span>
              </Space>
            }
            extra={
              <Button onClick={handleReset} type="text" style={{ color: '#52c41a' }}>
                重新识别
              </Button>
            }
          >
            <Row gutter={24}>
              <Col xs={24} md={10}>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="upload"
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      maxHeight: 350,
                      objectFit: 'cover',
                      marginBottom: 16,
                    }}
                  />
                )}
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleAddToMyPlants}
                    style={{
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      border: 'none',
                      borderRadius: 24,
                      padding: '0 32px',
                      height: 44,
                      fontWeight: 600,
                      marginTop: 8,
                    }}
                  >
                    加入我的植物
                  </Button>
                </div>
              </Col>
              <Col xs={24} md={14}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={3} style={{ margin: 0, color: '#237804' }}>
                    {result.name}
                    <Tag
                      color="green"
                      style={{ marginLeft: 12, fontSize: 14 }}
                    >
                      {result.category}
                    </Tag>
                    {result.toxicity && (
                      <Tag
                        color={result.toxicity === '无毒' ? 'green' : 'orange'}
                        style={{ fontSize: 14 }}
                      >
                        {result.toxicity}
                      </Tag>
                    )}
                  </Title>
                  {result.commonNames && result.commonNames.length > 0 && (
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      别名：{result.commonNames.join('、')}
                    </Text>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <Row align="middle" gutter={16}>
                    <Col>
                      <Text strong style={{ fontSize: 16 }}>
                        置信度
                      </Text>
                    </Col>
                    <Col flex="auto">
                      <Progress
                        percent={result.confidence}
                        strokeColor={getConfidenceColor(result.confidence)}
                        size="default"
                      />
                    </Col>
                  </Row>
                </div>

                <Descriptions column={2} size="middle" bordered>
                  <Descriptions.Item label="学名" span={2}>
                    <Text italic style={{ color: '#595959' }}>
                      {result.scientificName}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="光照需求">
                    <Tag color="gold">{result.lightRequirement}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="浇水频率">
                    <Tag color="blue">每 {result.waterFrequency} 天</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="养护难度" span={2}>
                    <Tag color={getDifficultyColor(result.difficulty)}>
                      {result.difficulty}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left" style={{ color: '#237804' }}>
                  植物简介
                </Divider>
                <Paragraph style={{ color: '#595959', lineHeight: 1.8 }}>
                  {result.description}
                </Paragraph>
              </Col>
            </Row>
          </Card>

          <Card
            style={{
              borderRadius: 16,
              marginTop: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            title={
              <Space>
                <HeartOutlined style={{ color: '#eb2f96' }} />
                <span style={{ color: '#237804' }}>养护建议</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              {result.careGuide &&
                Object.entries(result.careGuide).map(([key, value]) => (
                  <Col xs={24} sm={12} lg={8} key={key}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: 12,
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        height: '100%',
                      }}
                    >
                      <Space direction="vertical" size={8}>
                        <Space>
                          {careGuideIcons[key]}
                          <Text strong style={{ color: '#389e0d' }}>
                            {careGuideLabels[key]}
                          </Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
                          {value}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                ))}
            </Row>

            {result.seasonalTips && (
              <>
                <Divider orientation="left" style={{ color: '#237804', marginTop: 24 }}>
                  <StarOutlined style={{ marginRight: 8 }} />
                  四季养护要点
                </Divider>
                <Row gutter={16}>
                  {Object.entries(result.seasonalTips).map(([season, value]) => {
                    const seasonMap = {
                      spring: { label: '春季', emoji: '🌸', color: 'pink' },
                      summer: { label: '夏季', emoji: '☀️', color: 'orange' },
                      autumn: { label: '秋季', emoji: '🍂', color: 'gold' },
                      winter: { label: '冬季', emoji: '❄️', color: 'cyan' },
                    };
                    const info = seasonMap[season] || { label: season, emoji: '📅', color: 'blue' };
                    return (
                      <Col xs={24} sm={12} lg={6} key={season}>
                        <Card
                          size="small"
                          style={{
                            borderRadius: 12,
                            height: '100%',
                          }}
                        >
                          <Space direction="vertical" size={8}>
                            <Tag color={info.color} style={{ fontSize: 14 }}>
                              {info.emoji} {info.label}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>
                              {value}
                            </Text>
                          </Space>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </>
            )}
          </Card>

          <Card
            style={{
              borderRadius: 16,
              marginTop: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            title={
              <Space>
                <EnvironmentOutlined style={{ color: '#13c2c2' }} />
                <span style={{ color: '#237804' }}>相似植物</span>
              </Space>
            }
          >
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={alternatives}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    style={{ borderRadius: 12 }}
                    bodyStyle={{ padding: 16 }}
                    actions={[
                      <Text type="secondary" key="confidence">
                        匹配度
                      </Text>,
                    ]}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Title level={5} style={{ marginBottom: 8, color: '#237804' }}>
                        {item.name}
                      </Title>
                      <Tag color="geekblue" style={{ marginBottom: 12 }}>
                        {item.category}
                      </Tag>
                      <Progress
                        type="dashboard"
                        percent={item.confidence}
                        size={80}
                        strokeColor={getConfidenceColor(item.confidence)}
                        format={(p) => `${p}%`}
                      />
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>

          {tips && tips.length > 0 && (
            <Card
              style={{
                borderRadius: 16,
                marginTop: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  <span style={{ color: '#237804' }}>新手小贴士</span>
                </Space>
              }
            >
              <List
                dataSource={tips}
                renderItem={(tip, index) => (
                  <List.Item key={index}>
                    <Alert
                      message={tip}
                      type="info"
                      showIcon
                      icon={<BulbOutlined />}
                      style={{
                        width: '100%',
                        background: '#e6fffb',
                        border: '1px solid #87e8de',
                        borderRadius: 8,
                      }}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 24 }}>
            <Space size="large">
              <Button
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleAddToMyPlants}
                style={{
                  borderColor: '#52c41a',
                  color: '#52c41a',
                  borderRadius: 24,
                  height: 44,
                  padding: '0 28px',
                }}
              >
                加入我的植物
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                onClick={handleReset}
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none',
                  borderRadius: 24,
                  height: 44,
                  padding: '0 28px',
                }}
              >
                识别其他植物
              </Button>
            </Space>
          </div>
        </>
      )}
    </div>
  );
};

export default Recognition;

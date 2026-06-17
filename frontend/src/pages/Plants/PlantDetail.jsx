import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Image,
  Descriptions,
  Button,
  List,
  Tag,
  Timeline,
  Statistic,
  Card,
  Typography,
  Space,
  Spin,
  message,
  Modal,
  Tooltip,
  Empty,
  Grid
} from 'antd';
import {
  EditOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined,
  BellOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SunOutlined,
  DropletOutlined,
  ExperimentOutlined,
  ScissorOutlined,
  ThunderboltOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { get, del } from '../../utils/api.js';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const statusMap = {
  '健康': { color: 'green' },
  '需关注': { color: 'orange' },
  '生病': { color: 'red' },
  '死亡': { color: 'default' }
};

const PlantDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [plant, setPlant] = useState(null);
  const [diaries, setDiaries] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);

  const screens = useBreakpoint();

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [plantRes, diariesRes, remindersRes] = await Promise.all([
        get('/plants/' + id),
        get('/plants/' + id + '/diaries'),
        get('/plants/' + id + '/reminders')
      ]);
      setPlant(plantRes?.data || plantRes?.plant || plantRes);
      setDiaries(diariesRes?.data || diariesRes?.diaries || diariesRes || []);
      const reminderList = remindersRes?.data || remindersRes?.reminders || remindersRes || [];
      const sorted = [...reminderList].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setReminders(sorted);
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleDelete = async () => {
    try {
      await del('/plants/' + id);
      message.success('删除成功');
      navigate('/plants');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setDeleteModal(false);
    }
  };

  const getStatusColor = (status) => statusMap[status]?.color || 'blue';

  const getReminderColor = (reminder) => {
    const now = dayjs();
    const due = dayjs(reminder.dueDate);
    if (reminder.status === '已完成') return 'green';
    if (reminder.status === '已过期' || due.isBefore(now, 'day')) return 'red';
    return 'blue';
  };

  const getReminderIcon = (type) => {
    const icons = {
      '浇水': <DropletOutlined />,
      '施肥': <ExperimentOutlined />,
      '修剪': <ScissorOutlined />,
      '换盆': <ThunderboltOutlined />
    };
    return icons[type] || <BellOutlined />;
  };

  const getGrowthTagColor = (status) => {
    const map = { '发芽': 'cyan', '生长': 'blue', '开花': 'magenta', '结果': 'orange', '休眠': 'default' };
    return map[status] || 'blue';
  };

  const calcHealthDays = () => {
    if (!plant?.purchaseDate) return 0;
    return dayjs().diff(dayjs(plant.purchaseDate), 'day');
  };

  const images = plant?.images || [];
  const imageGridCols = [0, 1, 2, 3, 4, 5].map(idx => images[idx] || null);

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/plants')}>返回</Button>
          <Title level={3} style={{ margin: 0 }}>
            {plant?.name || '植物详情'}
            {plant?.status && <Tag color={getStatusColor(plant.status)} style={{ marginLeft: 12 }}>{plant.status}</Tag>}
          </Title>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} type="primary" onClick={() => navigate('/plants/' + id + '/edit')}>编辑</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => setDeleteModal(true)}>删除</Button>
        </Space>
      </div>

      <Spin spinning={loading} tip="加载中...">
        {plant && (
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={16}>
              <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
                title={<Space><SunOutlined style={{ color: '#faad14' }} /><span>植物照片</span></Space>}>
                {images.length > 0 ? (
                  <Image.PreviewGroup items={images.filter(Boolean)}>
                    <Row gutter={[12, 12]}>
                      {imageGridCols.map((img, idx) => (
                        <Col xs={8} sm={8} md={8} key={idx}>
                          <div style={{
                            aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden',
                            background: img ? 'transparent' : 'linear-gradient(135deg, #d9f7be 0%, #95de64 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 100
                          }}>
                            {img ? (
                              <Image src={img} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} preview={true} />
                            ) : (
                              <Text type="secondary" style={{ fontSize: 12 }}>暂无照片</Text>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                ) : (
                  <Empty description="暂无植物照片" />
                )}
              </Card>

              <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
                title={<Space><EnvironmentOutlined style={{ color: '#52c41a' }} /><span>基础信息</span></Space>}>
                <Descriptions column={screens.xs ? 1 : 2} bordered size="middle">
                  <Descriptions.Item label="名称">{plant.name}</Descriptions.Item>
                  <Descriptions.Item label="品种">{plant.species || '-'}</Descriptions.Item>
                  <Descriptions.Item label="购买日期">
                    <Space><CalendarOutlined />{plant.purchaseDate ? dayjs(plant.purchaseDate).format('YYYY-MM-DD') : '-'}</Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="放置位置">{plant.location || '-'}</Descriptions.Item>
                  <Descriptions.Item label="光照等级"><Space><SunOutlined />{plant.lightLevel || '-'}</Space></Descriptions.Item>
                  <Descriptions.Item label="浇水频率"><Space><DropletOutlined />{plant.waterFrequency ? plant.waterFrequency + ' 天' : '-'}</Space></Descriptions.Item>
                  <Descriptions.Item label="施肥频率"><Space><ExperimentOutlined />{plant.fertilizeFrequency ? plant.fertilizeFrequency + ' 天' : '-'}</Space></Descriptions.Item>
                  <Descriptions.Item label="修剪频率"><Space><ScissorOutlined />{plant.pruneFrequency ? plant.pruneFrequency + ' 天' : '-'}</Space></Descriptions.Item>
                  <Descriptions.Item label="换盆频率"><Space><ThunderboltOutlined />{plant.repotFrequency ? plant.repotFrequency + ' 天' : '-'}</Space></Descriptions.Item>
                  <Descriptions.Item label="健康状态"><Tag color={getStatusColor(plant.status)}>{plant.status || '-'}</Tag></Descriptions.Item>
                  {plant.notes && (
                    <Descriptions.Item label="备注" span={screens.xs ? 1 : 2}>
                      <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{plant.notes}</Paragraph>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space><FileTextOutlined style={{ color: '#722ed1' }} /><span>生长日记</span></Space>
                    <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => navigate('/diaries/new?plantId=' + id)}>写日记</Button>
                  </div>
                }>
                {diaries.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={diaries}
                    renderItem={(item) => (
                      <List.Item
                        style={{ cursor: 'pointer', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
                        onClick={() => navigate('/diaries/' + item._id)}
                        actions={[
                          <Button type="text" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); navigate('/diaries/' + item._id); }}>详情</Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            item.entries && item.entries.find(e => e.type === 'image') ? (
                              <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                                <Image src={item.entries.find(e => e.type === 'image').content} alt="" width={56} height={56} style={{ objectFit: 'cover' }} preview={false} />
                              </div>
                            ) : (
                              <div style={{ width: 56, height: 56, borderRadius: 8, background: 'linear-gradient(135deg, #f5d0fe 0%, #d946ef 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FileTextOutlined style={{ fontSize: 24, color: '#fff' }} />
                              </div>
                            )
                          }
                          title={
                            <Space>
                              <Text strong style={{ fontSize: 15 }}>{item.title}</Text>
                              {item.growthStatus && <Tag color={getGrowthTagColor(item.growthStatus)}>{item.growthStatus}</Tag>}
                            </Space>
                          }
                          description={
                            <div>
                              <Space style={{ marginBottom: 4 }}>
                                <Text type="secondary"><CalendarOutlined style={{ marginRight: 4 }} />{item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD') : '-'}</Text>
                              </Space>
                              <Space wrap>
                                {item.watering && <Tag icon={<DropletOutlined />} color="blue">浇水</Tag>}
                                {item.fertilizing && <Tag icon={<ExperimentOutlined />} color="purple">施肥</Tag>}
                                {item.pruning && <Tag icon={<ScissorOutlined />} color="green">修剪</Tag>}
                                {item.repotting && <Tag icon={<ThunderboltOutlined />} color="magenta">换盆</Tag>}
                              </Space>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description={
                    <div>
                      <div style={{ marginBottom: 12 }}>还没有日记记录</div>
                      <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => navigate('/diaries/new?plantId=' + id)}>记录第一篇日记</Button>
                    </div>
                  } />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                <Col span={8}>
                  <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                    <Statistic title={<Space><FileTextOutlined />日记数</Space>} value={diaries.length} valueStyle={{ fontSize: 24, color: '#722ed1' }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                    <Statistic title={<Space><BellOutlined />提醒数</Space>} value={reminders.length} valueStyle={{ fontSize: 24, color: '#1890ff' }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                    <Statistic title={<Space><HeartOutlined />健康天数</Space>} value={calcHealthDays()} suffix="天" valueStyle={{ fontSize: 24, color: '#52c41a' }} />
                  </Card>
                </Col>
              </Row>

              <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                title={<Space><BellOutlined style={{ color: '#1890ff' }} /><span>养护提醒</span></Space>}>
                {reminders.length > 0 ? (
                  <Timeline
                    items={reminders.map((r) => ({
                      color: getReminderColor(r),
                      dot: getReminderIcon(r.type),
                      children: (
                        <div style={{ padding: '4px 0' }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>{r.title}</div>
                          <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{r.type} · {dayjs(r.dueDate).format('YYYY-MM-DD')}</div>
                          {r.description && <Paragraph style={{ marginBottom: 4, fontSize: 13 }}>{r.description}</Paragraph>}
                          <Space size={4}>
                            <Tag color={r.priority === '高' ? 'red' : r.priority === '中' ? 'orange' : 'blue'}>{r.priority}优先级</Tag>
                            <Tag color={r.status === '已完成' ? 'green' : r.status === '已过期' ? 'red' : 'blue'}>{r.status}</Tag>
                          </Space>
                        </div>
                      )
                    }))}
                  />
                ) : (
                  <Empty description="暂无养护提醒" />
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Spin>

      <Modal title="确认删除" open={deleteModal} onOk={handleDelete} onCancel={() => setDeleteModal(false)}
        okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
        <p>确定要删除这株植物吗？相关的日记记录和提醒也将受到影响。</p>
      </Modal>
    </div>
  );
};

export default PlantDetail;

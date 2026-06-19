import React, { useState, useEffect } from 'react';
import {
  Breadcrumb, Card, Typography, Tag, Space, Button, Row, Col,
  Descriptions, Divider, Image, Spin, message, Modal
} from 'antd';
import {
  EditOutlined, DeleteOutlined, ArrowLeftOutlined, HomeOutlined,
  CalendarOutlined, CloudOutlined, ExperimentOutlined, ScissorOutlined,
  ThunderboltOutlined, DashboardOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { get, del } from '../../utils/api.js';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const growthStatusColor = { '发芽': 'cyan', '生长': 'blue', '开花': 'magenta', '结果': 'orange', '休眠': 'default' };

const DiaryDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [diary, setDiary] = useState(null);
  const [plant, setPlant] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await get('/diaries/' + id);
      const data = res?.data || res?.diary || res;
      setDiary(data);
      if (data?.plantId) {
        try {
          const plantRes = await get('/plants/' + data.plantId);
          setPlant(plantRes?.data || plantRes?.plant || plantRes);
        } catch (e) { console.error(e); }
      }
    } catch (error) {
      message.error('获取日记详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async () => {
    try {
      await del('/diaries/' + id);
      message.success('删除成功');
      navigate('/diaries');
    } catch (error) {
      message.error('删除失败');
    } finally { setDeleteModal(false); }
  };

  const hasAct = diary && (diary.watering || diary.fertilizing || diary.pruning || diary.repotting);
  const hasWeather = diary && (diary.weather || (diary.temperature !== undefined && diary.temperature !== null));

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <Link to="/dashboard"><HomeOutlined /></Link> },
        { title: <Link to="/diaries">生长日记</Link> },
        { title: diary?.title || '详情' }
      ]} />
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/diaries')}>返回列表</Button>
        <Space>
          <Button icon={<EditOutlined />} type="primary" onClick={() => navigate('/diaries/' + id + '/edit')}>编辑</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => setDeleteModal(true)}>删除</Button>
        </Space>
      </div>
      <Spin spinning={loading}>
        {diary && (
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ marginBottom: 24 }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
                <Col>
                  <Space wrap>
                    <Title level={3} style={{ margin: 0 }}>{diary.title}</Title>
                    {diary.growthStatus && <Tag color={growthStatusColor[diary.growthStatus] || 'blue'}>{diary.growthStatus}</Tag>}
                  </Space>
                </Col>
              </Row>
              <Space wrap size={16}>
                <Space size={4}>
                  <CalendarOutlined style={{ color: '#1890ff' }} />
                  <Text type="secondary">{diary.createdAt ? dayjs(diary.createdAt).format('YYYY-MM-DD HH:mm') : '-'}</Text>
                </Space>
                {plant && (
                  <Space size={4}>
                    <Text type="secondary">植物：</Text>
                    <Link to={'/plants/' + plant._id}>
                      <Text strong style={{ color: '#52c41a' }}>{plant.name}</Text>
                    </Link>
                  </Space>
                )}
                {hasWeather && (
                  <Space wrap>
                    {diary.weather && <Tag icon={<CloudOutlined />} color="geekblue">{diary.weather}</Tag>}
                    {diary.temperature !== undefined && diary.temperature !== null && (
                      <Tag icon={<DashboardOutlined />} color="orange">{diary.temperature}°C</Tag>
                    )}
                  </Space>
                )}
                <Space size={4} wrap>
                  {diary.watering && <Tag icon={<CloudOutlined />} color="blue">浇水</Tag>}
                  {diary.fertilizing && <Tag icon={<ExperimentOutlined />} color="purple">施肥</Tag>}
                  {diary.pruning && <Tag icon={<ScissorOutlined />} color="green">修剪</Tag>}
                  {diary.repotting && <Tag icon={<ThunderboltOutlined />} color="magenta">换盆</Tag>}
                </Space>
                {diary.tags && diary.tags.length > 0 && (
                  <Space wrap>
                    {diary.tags.map((t, i) => <Tag key={i}>#{t}</Tag>)}
                  </Space>
                )}
              </Space>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {diary.entries && diary.entries.map((entry, idx) => (
                entry.type === 'text' ? (
                  <Card key={idx} size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
                    <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.8 }}>{entry.content}</Paragraph>
                  </Card>
                ) : (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <Image src={entry.content} alt="" style={{ maxWidth: '100%', maxHeight: 600, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </div>
                )
              ))}
            </div>
            {(hasAct || diary.fertilizerType || diary.pesticideUsed) && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: 16 }}>养护活动详情</Title>
                <Descriptions bordered size="middle" column={2} style={{ marginBottom: 24 }}>
                  {diary.watering && <Descriptions.Item label={<Space><CloudOutlined />浇水</Space>}>已完成</Descriptions.Item>}
                  {diary.fertilizing && <Descriptions.Item label={<Space><ExperimentOutlined />施肥</Space>}>已完成</Descriptions.Item>}
                  {diary.pruning && <Descriptions.Item label={<Space><ScissorOutlined />修剪</Space>}>已完成</Descriptions.Item>}
                  {diary.repotting && <Descriptions.Item label={<Space><ThunderboltOutlined />换盆</Space>}>已完成</Descriptions.Item>}
                  {diary.fertilizerType && <Descriptions.Item label="肥料类型">{diary.fertilizerType}</Descriptions.Item>}
                  <Descriptions.Item label="使用农药">
                    <Tag color={diary.pesticideUsed ? 'red' : 'green'}>{diary.pesticideUsed ? '是' : '否'}</Tag>
                  </Descriptions.Item>
                  {diary.pesticideUsed && diary.pesticideDetails && (
                    <Descriptions.Item label="用药详情" span={2}>{diary.pesticideDetails}</Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
            {hasWeather && (
              <Row gutter={16}>
                {diary.weather && (
                  <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 8, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                      <CloudOutlined style={{ fontSize: 28, color: '#1677ff', marginBottom: 8 }} />
                      <div><Text type="secondary">天气</Text></div>
                      <div style={{ fontSize: 18, fontWeight: 600 }}>{diary.weather}</div>
                    </Card>
                  </Col>
                )}
                {diary.temperature !== undefined && diary.temperature !== null && (
                  <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 8, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                      <DashboardOutlined style={{ fontSize: 28, color: '#fa8c16', marginBottom: 8 }} />
                      <div><Text type="secondary">温度</Text></div>
                      <div style={{ fontSize: 18, fontWeight: 600 }}>{diary.temperature}°C</div>
                    </Card>
                  </Col>
                )}
              </Row>
            )}
          </Card>
        )}
      </Spin>
      <Modal title="确认删除" open={deleteModal} onOk={handleDelete} onCancel={() => setDeleteModal(false)}
        okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
        <p>确定要删除这篇日记吗？此操作无法撤销。</p>
      </Modal>
    </div>
  );
};

export default DiaryDetail;

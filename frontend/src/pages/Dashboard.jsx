import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Calendar,
  Badge,
  Timeline,
  Typography,
  Tag,
  Spin,
  Tooltip,
  Avatar,
  Space,
  Divider,
  List,
  Empty
} from 'antd';
import {
  EnvironmentOutlined,
  HeartOutlined,
  FileTextOutlined,
  BellOutlined,
  SunOutlined,
  DropletOutlined,
  ExperimentOutlined,
  ScissorOutlined,
  ThunderboltOutlined,
  CameraOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { get } from '../../utils/api.js';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState({});
  const [activities, setActivities] = useState({ summary: {}, dailyActivities: [] });
  const [timeline, setTimeline] = useState([]);
  const [calendarData, setCalendarData] = useState({});

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [overviewRes, activitiesRes, timelineRes, calendarRes] = await Promise.all([
        get('/stats/overview'),
        get('/stats/activities', { days: 30 }),
        get('/stats/timeline'),
        get('/stats/calendar', { year, month })
      ]);

      setOverview(overviewRes.stats || {});
      setActivities(activitiesRes || { summary: {}, dailyActivities: [] });
      setTimeline(timelineRes.timeline || []);
      setCalendarData(calendarRes.calendarData || {});
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const statCards = [
    {
      title: '植物总数',
      value: overview.totalPlants || 0,
      icon: <EnvironmentOutlined style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      iconBg: 'rgba(255,255,255,0.2)'
    },
    {
      title: '健康植物',
      value: overview.healthyPlants || 0,
      icon: <HeartOutlined style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      suffix: overview.needAttentionPlants || overview.sickPlants ? (
        <Tag color="orange" style={{ marginLeft: 8 }}>
          {(overview.needAttentionPlants || 0) + (overview.sickPlants || 0)} 需关注
        </Tag>
      ) : null
    },
    {
      title: '日记总数',
      value: overview.totalDiaries || 0,
      icon: <FileTextOutlined style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      iconBg: 'rgba(255,255,255,0.2)'
    },
    {
      title: '待办提醒',
      value: overview.pendingReminders || 0,
      icon: <BellOutlined style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      suffix: overview.completedReminders ? (
        <Tag color="green" style={{ marginLeft: 8 }}>
          已完成 {overview.completedReminders}
        </Tag>
      ) : null
    }
  ];

  const getSpeciesPieOption = () => {
    const data = (overview.speciesCount || []).map(item => ({
      value: item.count,
      name: item.name
    }));
    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left', textStyle: { fontSize: 12 } },
      series: [{
        name: '品种分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: data.length > 0 ? data : [{ value: 1, name: '暂无数据' }],
        color: ['#52c41a', '#1890ff', '#722ed1', '#eb2f96', '#fa8c16', '#13c2c2', '#f5222d']
      }]
    };
  };

  const getActivitiesLineOption = () => {
    const daily = activities.dailyActivities || [];
    const dates = daily.map(d => d.date ? d.date.slice(5) : '');
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['浇水', '施肥', '修剪', '换盆'], top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: dates, axisLabel: { fontSize: 10, rotate: 45 } },
      yAxis: { type: 'value' },
      series: [
        { name: '浇水', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: daily.map(d => d.watering || 0), itemStyle: { color: '#1890ff' }, areaStyle: { color: 'rgba(24,144,255,0.1)' } },
        { name: '施肥', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: daily.map(d => d.fertilizing || 0), itemStyle: { color: '#722ed1' }, areaStyle: { color: 'rgba(114,46,209,0.1)' } },
        { name: '修剪', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: daily.map(d => d.pruning || 0), itemStyle: { color: '#52c41a' }, areaStyle: { color: 'rgba(82,196,26,0.1)' } },
        { name: '换盆', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: daily.map(d => d.repotting || 0), itemStyle: { color: '#eb2f96' }, areaStyle: { color: 'rgba(235,47,150,0.1)' } }
      ]
    };
  };

  const getLightBarOption = () => {
    const data = overview.lightLevelStats || [];
    const categories = ['弱光', '散射光', '半日照', '全日照'];
    const values = categories.map(cat => {
      const found = data.find(d => d._id === cat);
      return found ? found.count : 0;
    });
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: { type: 'category', data: categories, axisLabel: { fontSize: 12 } },
      yAxis: { type: 'value' },
      series: [{
        name: '植物数量',
        type: 'bar',
        data: values,
        barWidth: '50%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#faad14' }, { offset: 1, color: '#fff7e6' }] }
        },
        label: { show: true, position: 'top', fontSize: 12 }
      }]
    };
  };

  const dateCellRender = (value) => {
    const dateStr = dayjs(value).format('YYYY-MM-DD');
    const data = calendarData[dateStr] || { reminders: [], diaries: [] };
    const listData = [];
    (data.reminders || []).forEach(r => listData.push({ type: 'reminder', content: r.title || '待办', status: r.status }));
    (data.diaries || []).forEach(d => listData.push({ type: 'diary', content: d.title || '日记' }));
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.slice(0, 3).map((item, idx) => (
          <li key={idx} style={{ fontSize: 11, lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Badge status={item.type === 'reminder' ? (item.status === 'completed' ? 'success' : 'warning') : 'processing'} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const getTimelineColor = (status) => {
    const colors = { healthy: 'green', growing: 'blue', needAttention: 'orange', sick: 'red' };
    return colors[status] || 'blue';
  };

  const getTimelineDot = (item) => {
    const dotIcons = { watering: <DropletOutlined />, fertilizing: <ExperimentOutlined />, pruning: <ScissorOutlined />, repotting: <ThunderboltOutlined /> };
    if (item.activities && item.activities.length > 0) {
      return dotIcons[item.activities[0]] || <CheckCircleOutlined />;
    }
    return <CheckCircleOutlined />;
  };

  const getActivityConfig = (act) => {
    const actMap = {
      watering: { icon: <DropletOutlined />, text: '浇水', color: '#1890ff' },
      fertilizing: { icon: <ExperimentOutlined />, text: '施肥', color: '#722ed1' },
      pruning: { icon: <ScissorOutlined />, text: '修剪', color: '#52c41a' },
      repotting: { icon: <ThunderboltOutlined />, text: '换盆', color: '#eb2f96' }
    };
    return actMap[act] || { icon: <InfoCircleOutlined />, text: act, color: '#999' };
  };

  const getGrowthStatusText = (status) => {
    const map = { healthy: '健康', growing: '生长中', needAttention: '需关注', sick: '生病' };
    return map[status] || status;
  };

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>数据统计看板</Title>
        <Text type="secondary">{dayjs().format('YYYY年MM月DD日 dddd')} · 您的植物养护数据概览</Text>
      </div>

      <Spin spinning={loading} tip="加载中...">
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          {statCards.map((card, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <Card style={{ borderRadius: 16, border: 'none', overflow: 'hidden', background: card.gradient, color: '#fff' }} bodyStyle={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{card.title}</Text>
                    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8 }}>
                      <span style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>{card.value}</span>
                      {card.suffix}
                    </div>
                  </div>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={8}>
            <Card title={<Space><EnvironmentOutlined style={{ color: '#52c41a' }} /><span>品种分布</span></Space>} style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
              <ReactECharts option={getSpeciesPieOption()} style={{ height: 320 }} opts={{ renderer: 'svg' }} />
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card title={<Space><CalendarOutlined style={{ color: '#1890ff' }} /><span>近30天养护活动</span>{activities.summary && <Space style={{ marginLeft: 16 }}><Tag icon={<DropletOutlined />} color="blue">浇水 {activities.summary.watering || 0}</Tag><Tag icon={<ExperimentOutlined />} color="purple">施肥 {activities.summary.fertilizing || 0}</Tag><Tag icon={<ScissorOutlined />} color="green">修剪 {activities.summary.pruning || 0}</Tag><Tag icon={<ThunderboltOutlined />} color="magenta">换盆 {activities.summary.repotting || 0}</Tag></Space>}</Space>} style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
              <ReactECharts option={getActivitiesLineOption()} style={{ height: 320 }} opts={{ renderer: 'svg' }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={10}>
            <Card title={<Space><SunOutlined style={{ color: '#faad14' }} /><span>光照需求分布</span></Space>} style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
              <ReactECharts option={getLightBarOption()} style={{ height: 320 }} opts={{ renderer: 'svg' }} />
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card title={<Space><CalendarOutlined style={{ color: '#722ed1' }} /><span>养护日历</span></Space>} style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}>
              <Calendar dateCellRender={dateCellRender} fullscreen={false} />
            </Card>
          </Col>
        </Row>

        <Card title={<Space><CameraOutlined style={{ color: '#eb2f96' }} /><span>生长时间轴</span></Space>} style={{ borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          {timeline.length === 0 ? (
            <Empty description="暂无生长记录" style={{ padding: 40 }} />
          ) : (
            <Timeline
              mode="left"
              items={timeline.slice(0, 10).map((item, idx) => ({
                color: getTimelineColor(item.growthStatus),
                dot: getTimelineDot(item),
                label: <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.date).format('YYYY-MM-DD')}</Text>,
                children: (
                  <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
                    <Row gutter={16}>
                      {item.images && item.images.length > 0 && (
                        <Col span={6}>
                          <div style={{ width: 80, height: 80, borderRadius: 12, background: 'linear-gradient(135deg, #d9f7be 0%, #95de64 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="font-size:32px">🌱</span>'; }} />
                          </div>
                        </Col>
                      )}
                      <Col span={item.images && item.images.length > 0 ? 18 : 24}>
                        <div style={{ marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 15 }}>{item.plant}</Text>
                          {item.growthStatus && <Tag color={getTimelineColor(item.growthStatus)} style={{ marginLeft: 8 }}>{getGrowthStatusText(item.growthStatus)}</Tag>}
                        </div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>{item.title || ''}</Text>
                        {item.activities && item.activities.length > 0 && (
                          <Space wrap>
                            {item.activities.map((act, aIdx) => {
                              const config = getActivityConfig(act);
                              return <Tag key={aIdx} style={{ borderColor: config.color, color: config.color, padding: '2px 8px' }}>{config.icon} {config.text}</Tag>;
                            })}
                          </Space>
                        )}
                      </Col>
                    </Row>
                  </Card>
                )
              }))}
            />
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default Dashboard;

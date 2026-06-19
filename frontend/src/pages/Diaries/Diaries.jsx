import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Row,
  Col,
  Tag,
  Space,
  message,
  Typography,
  Select,
  Empty,
  Image,
  Pagination,
  Popconfirm,
  Tooltip,
  Card,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
  AppleOutlined,
  CloudOutlined,
  ExperimentOutlined,
  ScissorOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, del } from '../../utils/api.js';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

const growthStatusColor = {
  '发芽': 'cyan', '生长': 'blue', '开花': 'magenta', '结果': 'orange', '休眠': 'default'
};

const growthStatusOptions = [
  { value: 'all', label: '全部状态' },
  { value: '发芽', label: '发芽' },
  { value: '生长', label: '生长' },
  { value: '开花', label: '开花' },
  { value: '结果', label: '结果' },
  { value: '休眠', label: '休眠' }
];

const activityConfig = {
  watering: { icon: <CloudOutlined />, text: '浇水', color: 'blue' },
  fertilizing: { icon: <ExperimentOutlined />, text: '施肥', color: 'purple' },
  pruning: { icon: <ScissorOutlined />, text: '修剪', color: 'green' },
  repotting: { icon: <ThunderboltOutlined />, text: '换盆', color: 'magenta' }
};

const Diaries = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [diaries, setDiaries] = useState([]);
  const [plants, setPlants] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [plantFilter, setPlantFilter] = useState(searchParams.get('plantId') || 'all');
  const [growthStatusFilter, setGrowthStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPlants = async () => {
    try {
      const res = await get('/plants');
      const data = res?.data || res?.plants || res || [];
      setPlants(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  const fetchDiaries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (plantFilter && plantFilter !== 'all') params.plantId = plantFilter;
      if (growthStatusFilter && growthStatusFilter !== 'all') params.growthStatus = growthStatusFilter;
      const res = await get('/diaries', params);
      const data = res?.data || res?.diaries || res || [];
      setDiaries(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('获取日记列表失败');
      setDiaries([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPlants(); }, []);
  useEffect(() => { fetchDiaries(); }, [plantFilter, growthStatusFilter]);

  const plantNameMap = {};
  plants.forEach(p => { plantNameMap[p._id] = p.name; });

  const filteredDiaries = diaries.filter(d => {
    if (!searchText) return true;
    if (growthStatusFilter !== 'all' && d.growthStatus !== growthStatusFilter) return false;
    const kw = searchText.toLowerCase();
    return (
      (d.title && d.title.toLowerCase().includes(kw)) ||
      (plantNameMap[d.plantId] && plantNameMap[d.plantId].toLowerCase().includes(kw)) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(kw)))
    );
  });

  const sorted = [...filteredDiaries].sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
  const total = sorted.length;
  const startIdx = (page - 1) * pageSize;
  const paged = sorted.slice(startIdx, startIdx + pageSize);

  const handleDelete = async (id) => {
    try {
      await del('/diaries/' + id);
      message.success('删除成功');
      fetchDiaries();
    } catch (error) { message.error('删除失败'); }
  };

  const getCover = (entry) => {
    if (!entry?.entries || !Array.isArray(entry.entries)) return null;
    const img = entry.entries.find(e => e.type === 'image');
    return img ? img.content : null;
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>生长日记</Title>
        <div style={{ color: '#999', fontSize: 14 }}>记录植物成长的每一个瞬间</div>
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} bodyStyle={{ padding: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={10} lg={8}>
            <Search
              placeholder="搜索标题、植物名称、标签"
              allowClear size="large" value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
              onSearch={(v) => { setSearchText(v); setPage(1); }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              size="large" value={plantFilter}
              onChange={(v) => { setPlantFilter(v); setPage(1); }}
              style={{ width: '100%' }} placeholder="筛选植物"
              options={[{ value: 'all', label: '全部植物' }, ...plants.map(p => ({ value: p._id, label: p.name }))]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              size="large" value={growthStatusFilter}
              onChange={(v) => { setGrowthStatusFilter(v); setPage(1); }}
              style={{ width: '100%' }} placeholder="生长状态"
              options={growthStatusOptions}
            />
          </Col>
          <Col xs={24} sm={24} md={8} lg={6}>
            <div style={{ textAlign: 'right' }}>
              <Button
                type="primary" size="large" icon={<PlusOutlined />}
                onClick={() => navigate('/diaries/new' + (plantFilter && plantFilter !== 'all' ? '?plantId=' + plantFilter : ''))}
                style={{ height: 40, borderRadius: 8 }}
              >写日记</Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {paged.length > 0 ? (
          <>
            {paged.map(item => {
              const cover = getCover(item);
              return (
                <Card key={item._id} style={{ borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}
                  bodyStyle={{ padding: 16 }} onClick={() => navigate('/diaries/' + item._id)} hoverable>
                  <Row gutter={16}>
                    {cover && (
                      <Col xs={24} sm={6} md={4}>
                        <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 8, overflow: 'hidden' }}>
                          <Image src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} preview={false} />
                        </div>
                      </Col>
                    )}
                    <Col xs={24} sm={cover ? 18 : 24} md={cover ? 20 : 24}>
                      <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                        <Col xs={24} md={20}>
                          <Space wrap>
                            <Text strong style={{ fontSize: 16 }}>{item.title}</Text>
                            {item.growthStatus && <Tag color={growthStatusColor[item.growthStatus] || 'blue'}>{item.growthStatus}</Tag>}
                          </Space>
                        </Col>
                        <Col xs={24} md={4} style={{ textAlign: 'right' }}>
                          <Space onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="详情"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => navigate('/diaries/' + item._id)} /></Tooltip>
                            <Tooltip title="编辑"><Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#1890ff' }} onClick={() => navigate('/diaries/' + item._id + '/edit')} /></Tooltip>
                            <Popconfirm title="确定要删除这篇日记吗？" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(item._id)}>
                              <Tooltip title="删除"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Tooltip>
                            </Popconfirm>
                          </Space>
                        </Col>
                      </Row>
                      <Space wrap style={{ marginBottom: 8 }}>
                        <Space size={4}><AppleOutlined style={{ color: '#52c41a' }} /><Text type="secondary">{plantNameMap[item.plantId] || '未知植物'}</Text></Space>
                        <Space size={4}><CalendarOutlined style={{ color: '#1890ff' }} /><Text type="secondary">{item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD') : '-'}</Text></Space>
                        <Space size={4} wrap>
                          {item.watering && <Tag icon={activityConfig.watering.icon} color={activityConfig.watering.color} style={{ margin: 0 }}>{activityConfig.watering.text}</Tag>}
                          {item.fertilizing && <Tag icon={activityConfig.fertilizing.icon} color={activityConfig.fertilizing.color} style={{ margin: 0 }}>{activityConfig.fertilizing.text}</Tag>}
                          {item.pruning && <Tag icon={activityConfig.pruning.icon} color={activityConfig.pruning.color} style={{ margin: 0 }}>{activityConfig.pruning.text}</Tag>}
                          {item.repotting && <Tag icon={activityConfig.repotting.icon} color={activityConfig.repotting.color} style={{ margin: 0 }}>{activityConfig.repotting.text}</Tag>}
                        </Space>
                      </Space>
                      {item.tags && item.tags.length > 0 && (
                        <Space wrap style={{ marginTop: 4 }}>
                          {item.tags.map((t, i) => <Tag key={i} style={{ margin: 0 }}>#{t}</Tag>)}
                        </Space>
                      )}
                    </Col>
                  </Row>
                </Card>
              );
            })}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Pagination
                current={page} pageSize={pageSize} total={total}
                showSizeChanger showQuickJumper showTotal={(t) => '共 ' + t + ' 篇日记'}
                onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
                onShowSizeChange={(p, ps) => { setPage(1); setPageSize(ps); }}
              />
            </div>
          </>
        ) : (
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
              <div>
                <div style={{ marginBottom: 12 }}>暂无日记记录</div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/diaries/new')}>写下第一篇日记</Button>
              </div>
            } />
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default Diaries;

import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Typography,
  Select,
  Empty,
  Image,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  FlowerOutlined,
  EnvironmentOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { get, del } from '../../utils/api.js';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const statusMap = {
  '健康': { text: '健康', color: 'green' },
  '需关注': { text: '需关注', color: 'orange' },
  '生病': { text: '生病', color: 'red' },
  '死亡': { text: '死亡', color: 'default' }
};

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: '健康', label: '健康' },
  { value: '需关注', label: '需关注' },
  { value: '生病', label: '生病' },
  { value: '死亡', label: '死亡' }
];

const Plants = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const res = await get('/plants');
      const data = res?.data || res?.plants || res || [];
      const list = Array.isArray(data) ? data : [];
      setPlants(list);
      setFilteredPlants(list);
    } catch (error) {
      message.error('获取植物列表失败');
      setPlants([]);
      setFilteredPlants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    let result = [...plants];
    if (searchText) {
      const keyword = searchText.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(keyword)) ||
        (p.species && p.species.toLowerCase().includes(keyword)) ||
        (p.location && p.location.toLowerCase().includes(keyword))
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    setFilteredPlants(result);
  }, [searchText, statusFilter, plants]);

  const handleDelete = async (id) => {
    try {
      await del('/plants/' + id);
      message.success('删除成功');
      fetchPlants();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const getStatusTag = (status) => {
    const cfg = statusMap[status] || { text: status || '未知', color: 'blue' };
    return <Tag color={cfg.color}>{cfg.text}</Tag>;
  };

  const columns = [
    {
      title: '植物',
      key: 'plant',
      render: (_, record) => (
        <Space>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #d9f7be 0%, #95de64 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {record.images && record.images.length > 0 ? (
              <Image
                src={record.images[0]}
                alt={record.name}
                width={48}
                height={48}
                style={{ objectFit: 'cover' }}
                preview={false}
              />
            ) : (
              <FlowerOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{record.name || '未命名'}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.species || '-'}</div>
          </div>
        </Space>
      )
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      render: (text) => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: '#52c41a', fontSize: 12 }} />
          <span>{text || '-'}</span>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '购买日期',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 140,
      render: (date) => (
        <Space size={4}>
          <CalendarOutlined style={{ color: '#1890ff', fontSize: 12 }} />
          <span style={{ fontSize: 13 }}>{date ? dayjs(date).format('YYYY-MM-DD') : '-'}</span>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate('/plants/' + record._id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              style={{ color: '#1890ff' }}
              onClick={() => navigate('/plants/' + record._id + '/edit')}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这株植物吗？"
            description="删除后将无法恢复相关数据"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>植物档案</Title>
        <div style={{ color: '#999', fontSize: 14 }}>管理您的所有植物信息</div>
      </div>

      <div style={{
        background: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={10} lg={8}>
            <Search
              placeholder="搜索植物名称、品种、位置"
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              size="large"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: '100%' }}
              prefixIcon={<FilterOutlined />}
              options={statusOptions}
            />
          </Col>
          <Col xs={24} sm={24} md={8} lg={11}>
            <Space style={{ float: 'right' }}>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate('/plants/new')}
                style={{ height: 40, borderRadius: 8 }}
              >
                新增植物
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredPlants}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => '共 ' + total + ' 株植物'
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>暂无植物档案</div>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => navigate('/plants/new')}
                    >
                      添加第一株植物
                    </Button>
                  </div>
                }
              />
            )
          }}
        />
      </div>
    </div>
  );
};

export default Plants;

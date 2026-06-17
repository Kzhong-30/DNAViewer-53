import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  List,
  Tag,
  Badge,
  Button,
  Select,
  DatePicker,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Tooltip,
  Empty,
  message,
  Popconfirm,
  Divider,
  Timeline,
  Dropdown,
  Menu,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const TYPE_ICONS = {
  '浇水': '💧',
  '施肥': '🌱',
  '修剪': '✂️',
  '换盆': '🪴',
  '其他': '📝',
};

const TYPE_COLORS = {
  '浇水': 'blue',
  '施肥': 'green',
  '修剪': 'orange',
  '换盆': 'purple',
  '其他': 'default',
};

const STATUS_COLORS = {
  '待处理': 'blue',
  '已完成': 'success',
  '已过期': 'error',
  '已取消': 'default',
};

const PRIORITY_COLORS = {
  '低': 'default',
  '中': 'blue',
  '高': 'red',
};

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchData = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `请求失败: ${response.status}`);
  }
  return response.json();
};

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    expired: 0,
    today: 0,
    week: 0,
  });
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [form] = Form.useForm();

  const [filters, setFilters] = useState({
    status: null,
    type: null,
    plantId: null,
    dateRange: null,
  });
  const [sortOrder, setSortOrder] = useState('asc');

  const loadReminders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.plantId) params.append('plantId', filters.plantId);
      if (filters.dateRange && filters.dateRange[0]) {
        params.append('startDate', filters.dateRange[0].toISOString());
      }
      if (filters.dateRange && filters.dateRange[1]) {
        params.append('endDate', filters.dateRange[1].toISOString());
      }

      const url = `${API_BASE}/reminders${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await fetchData(url);

      let sorted = [...data.reminders];
      if (sortOrder === 'asc') {
        sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      } else {
        sorted.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
      }

      setReminders(sorted);
      setStats(data.stats);
    } catch (error) {
      message.error(error.message || '加载提醒失败');
    } finally {
      setLoading(false);
    }
  };

  const loadPlants = async () => {
    try {
      const data = await fetchData(`${API_BASE}/plants`);
      setPlants(data.plants || []);
    } catch (error) {
      console.error('加载植物列表失败:', error);
    }
  };

  useEffect(() => {
    loadReminders();
    loadPlants();
  }, [filters, sortOrder]);

  const handleComplete = async (id) => {
    try {
      await fetchData(`${API_BASE}/reminders/${id}/complete`, {
        method: 'PUT',
      });
      message.success('已标记完成');
      loadReminders();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetchData(`${API_BASE}/reminders/${id}`, {
        method: 'DELETE',
      });
      message.success('删除成功');
      loadReminders();
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const handleAdd = () => {
    setEditingReminder(null);
    form.resetFields();
    form.setFieldsValue({
      type: '浇水',
      priority: '中',
      repeatDays: 0,
      dueDate: dayjs(),
    });
    setModalVisible(true);
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    form.setFieldsValue({
      plantId: reminder.plantId?._id,
      type: reminder.type,
      title: reminder.title,
      description: reminder.description,
      dueDate: dayjs(reminder.dueDate),
      repeatDays: reminder.repeatDays,
      priority: reminder.priority,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dueDate: values.dueDate.toDate(),
      };

      if (editingReminder) {
        await fetchData(`${API_BASE}/reminders/${editingReminder._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        message.success('更新成功');
      } else {
        await fetchData(`${API_BASE}/reminders`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        message.success('创建成功');
      }

      setModalVisible(false);
      loadReminders();
    } catch (error) {
      if (error.errorFields) return;
      message.error(error.message || '保存失败');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: null,
      type: null,
      plantId: null,
      dateRange: null,
    });
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const getDueDateTag = (dueDate) => {
    const now = dayjs();
    const due = dayjs(dueDate);
    const diffDays = due.diff(now, 'day');

    if (diffDays < 0) {
      return <Tag color="error">已过期 {Math.abs(diffDays)} 天</Tag>;
    }
    if (diffDays === 0) {
      return <Tag color="orange">今天到期</Tag>;
    }
    if (diffDays === 1) {
      return <Tag color="warning">明天到期</Tag>;
    }
    if (diffDays <= 7) {
      return <Tag color="blue">{diffDays} 天后</Tag>;
    }
    return <Tag>{due.format('MM月DD日')}</Tag>;
  };

  const getTimelineColor = (reminder) => {
    if (reminder.status === '已完成') return 'green';
    if (reminder.status === '已过期') return 'red';
    if (reminder.priority === '高') return 'red';
    if (dayjs(reminder.dueDate).diff(dayjs(), 'day') <= 1) return 'orange';
    return 'blue';
  };

  const statCards = [
    {
      title: '今日待办',
      value: stats.today,
      icon: <ClockCircleOutlined />,
      color: 'orange',
      onClick: () => handleFilterChange('status', '待处理'),
    },
    {
      title: '本周待办',
      value: stats.week,
      icon: <CalendarOutlined />,
      color: 'blue',
      onClick: () => handleFilterChange('status', '待处理'),
    },
    {
      title: '待处理',
      value: stats.pending,
      icon: <ExclamationCircleOutlined />,
      color: 'processing',
      onClick: () => handleFilterChange('status', '待处理'),
    },
    {
      title: '已完成',
      value: stats.completed,
      icon: <CheckOutlined />,
      color: 'success',
      onClick: () => handleFilterChange('status', '已完成'),
    },
    {
      title: '已过期',
      value: stats.expired,
      icon: <ClockCircleOutlined />,
      color: 'error',
      onClick: () => handleFilterChange('status', '已过期'),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28, color: '#1f1f1f' }}>
              🌿 智能养护提醒
            </h1>
            <p style={{ margin: '8px 0 0', color: '#666' }}>
              让每一株植物都得到精心照料
            </p>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadReminders}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              新建提醒
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statCards.map((stat, index) => (
            <Col xs={12} sm={8} md={24 / 5} key={index}>
              <Card
                hoverable
                onClick={stat.onClick}
                style={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      fontSize: 32,
                      marginRight: 16,
                      color:
                        stat.color === 'processing'
                          ? '#1890ff'
                          : stat.color === 'success'
                          ? '#52c41a'
                          : stat.color === 'error'
                          ? '#ff4d4f'
                          : stat.color === 'orange'
                          ? '#fa8c16'
                          : '#1890ff',
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#666',
                        marginBottom: 4,
                      }}
                    >
                      {stat.title}
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 600,
                        color: '#1f1f1f',
                        lineHeight: 1.2,
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          style={{
            borderRadius: 12,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: 24,
          }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Space wrap size="middle">
            <Space>
              <FilterOutlined style={{ color: '#888' }} />
              <span style={{ color: '#666' }}>筛选:</span>
            </Space>

            <Select
              placeholder="状态"
              allowClear
              style={{ width: 120 }}
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
            >
              <Option value="待处理">待处理</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已过期">已过期</Option>
              <Option value="已取消">已取消</Option>
            </Select>

            <Select
              placeholder="类型"
              allowClear
              style={{ width: 120 }}
              value={filters.type}
              onChange={(v) => handleFilterChange('type', v)}
            >
              <Option value="浇水">💧 浇水</Option>
              <Option value="施肥">🌱 施肥</Option>
              <Option value="修剪">✂️ 修剪</Option>
              <Option value="换盆">🪴 换盆</Option>
              <Option value="其他">📝 其他</Option>
            </Select>

            <Select
              placeholder="关联植物"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: 180 }}
              value={filters.plantId}
              onChange={(v) => handleFilterChange('plantId', v)}
            >
              {plants.map((plant) => (
                <Option key={plant._id} value={plant._id}>
                  {plant.name}
                </Option>
              ))}
            </Select>

            <RangePicker
              value={filters.dateRange}
              onChange={(v) => handleFilterChange('dateRange', v)}
              style={{ width: 280 }}
            />

            <Button onClick={resetFilters}>重置</Button>

            <Divider type="vertical" />

            <Tooltip title={sortOrder === 'asc' ? '正序排列' : '倒序排列'}>
              <Button icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />} onClick={toggleSort}>
                按时间{sortOrder === 'asc' ? '升序' : '降序'}
              </Button>
            </Tooltip>
          </Space>
        </Card>

        <Card
          style={{
            borderRadius: 12,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>提醒列表</span>
              <Tag color="blue">{reminders.length} 条</Tag>
            </div>
          }
        >
          {reminders.length === 0 ? (
            <Empty
              description={
                <div style={{ padding: '20px 0' }}>
                  <div style={{ fontSize: 16, marginBottom: 8 }}>暂无提醒</div>
                  <div style={{ fontSize: 13, color: '#999' }}>
                    点击"新建提醒"按钮创建你的第一条养护提醒
                  </div>
                </div>
              }
              style={{ padding: '60px 0' }}
            />
          ) : (
            <Timeline
              mode="left"
              items={reminders.map((reminder) => ({
                color: getTimelineColor(reminder),
                dot: (
                  <div
                    style={{
                      fontSize: 18,
                      marginTop: 2,
                    }}
                  >
                    {TYPE_ICONS[reminder.type] || '📝'}
                  </div>
                ),
                label: (
                  <div style={{ textAlign: 'right', paddingRight: 12 }}>
                    <div style={{ fontWeight: 500, color: '#333' }}>
                      {dayjs(reminder.dueDate).format('MM-DD')}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {dayjs(reminder.dueDate).format('HH:mm')}
                    </div>
                    {reminder.status === '已完成' && reminder.completedAt && (
                      <div style={{ fontSize: 11, color: '#52c41a', marginTop: 4 }}>
                        完成于 {dayjs(reminder.completedAt).format('MM-DD')}
                      </div>
                    )}
                  </div>
                ),
                children: (
                  <Card
                    size="small"
                    style={{
                      borderRadius: 8,
                      border: reminder.status === '已过期'
                        ? '1px solid #ffccc7'
                        : reminder.status === '已完成'
                        ? '1px solid #b7eb8f'
                        : '1px solid #f0f0f0',
                      background: reminder.status === '已完成'
                        ? '#f6ffed'
                        : reminder.status === '已过期'
                        ? '#fff2f0'
                        : '#fff',
                      opacity: reminder.status === '已完成' ? 0.85 : 1,
                    }}
                    bodyStyle={{ padding: '12px 16px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 16,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: reminder.status === '已完成' ? '#888' : '#1f1f1f',
                              textDecoration: reminder.status === '已完成' ? 'line-through' : 'none',
                            }}
                          >
                            {reminder.title}
                          </span>
                          <Tag color={TYPE_COLORS[reminder.type]}>
                            {TYPE_ICONS[reminder.type]} {reminder.type}
                          </Tag>
                          <Tag color={STATUS_COLORS[reminder.status]}>
                            {reminder.status}
                          </Tag>
                          <Tag color={PRIORITY_COLORS[reminder.priority]}>
                            {reminder.priority}优先级
                          </Tag>
                          {reminder.repeatDays > 0 && (
                            <Tag icon={<ReloadOutlined />} color="purple">
                              每 {reminder.repeatDays} 天
                            </Tag>
                          )}
                        </div>

                        {reminder.description && (
                          <p
                            style={{
                              margin: '0 0 8px',
                              color: '#666',
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            {reminder.description}
                          </p>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            flexWrap: 'wrap',
                            fontSize: 12,
                            color: '#888',
                          }}
                        >
                          {reminder.plantId && (
                            <span>
                              🌿 <strong>{reminder.plantId.name}</strong>
                              {reminder.plantId.species && (
                                <span style={{ color: '#aaa' }}>
                                  {' '}
                                  · {reminder.plantId.species}
                                </span>
                              )}
                            </span>
                          )}
                          <span>🕒 {dayjs(reminder.dueDate).format('YYYY-MM-DD HH:mm')}</span>
                          {getDueDateTag(reminder.dueDate)}
                        </div>
                      </div>

                      <Space>
                        {reminder.status !== '已完成' && reminder.status !== '已取消' && (
                          <Tooltip title="标记完成">
                            <Button
                              type="primary"
                              shape="circle"
                              icon={<CheckOutlined />}
                              size="small"
                              style={{ background: '#52c41a', borderColor: '#52c41a' }}
                              onClick={() => handleComplete(reminder._id)}
                            />
                          </Tooltip>
                        )}
                        <Tooltip title="编辑">
                          <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(reminder)}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="确认删除此提醒？"
                          description="删除后不可恢复"
                          onConfirm={() => handleDelete(reminder._id)}
                          okText="删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                        >
                          <Tooltip title="删除">
                            <Button
                              shape="circle"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    </div>
                  </Card>
                ),
              }))}
            />
          )}
        </Card>

        <Modal
          title={
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {editingReminder ? '✏️ 编辑提醒' : '➕ 新建提醒'}
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={560}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginTop: 16 }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label="提醒标题"
                  rules={[{ required: true, message: '请输入提醒标题' }]}
                >
                  <Input placeholder="例如：给绿萝浇水" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="plantId"
                  label="关联植物"
                  rules={[{ required: true, message: '请选择关联植物' }]}
                >
                  <Select placeholder="选择植物" showSearch optionFilterProp="children" size="large">
                    {plants.map((plant) => (
                      <Option key={plant._id} value={plant._id}>
                        {plant.name} ({plant.species})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="提醒类型"
                  rules={[{ required: true, message: '请选择类型' }]}
                >
                  <Select placeholder="选择类型" size="large">
                    <Option value="浇水">💧 浇水</Option>
                    <Option value="施肥">🌱 施肥</Option>
                    <Option value="修剪">✂️ 修剪</Option>
                    <Option value="换盆">🪴 换盆</Option>
                    <Option value="其他">📝 其他</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="到期时间"
                  rules={[{ required: true, message: '请选择到期时间' }]}
                >
                  <DatePicker
                    showTime={{ defaultValue: dayjs('09:00', 'HH:mm') }}
                    style={{ width: '100%' }}
                    size="large"
                    format="YYYY-MM-DD HH:mm"
                    placeholder="选择日期时间"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="优先级"
                  rules={[{ required: true, message: '请选择优先级' }]}
                >
                  <Select placeholder="选择优先级" size="large">
                    <Option value="低">🟢 低</Option>
                    <Option value="中">🔵 中</Option>
                    <Option value="高">🔴 高</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="repeatDays"
                  label="重复周期（天）"
                  tooltip="设置后，完成提醒时会自动创建下一次提醒，0表示不重复"
                  rules={[{ required: true, message: '请输入重复周期' }]}
                >
                  <InputNumber
                    min={0}
                    max={365}
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="0 = 不重复"
                    addonAfter="天"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="description" label="备注说明">
                  <TextArea
                    rows={3}
                    placeholder="添加一些备注信息，例如使用什么肥料、浇多少水等..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button size="large" onClick={() => setModalVisible(false)}>
                  取消
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  {editingReminder ? '保存修改' : '创建提醒'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Reminders;

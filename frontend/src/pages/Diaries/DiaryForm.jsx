import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
  Typography,
  Space,
  Spin,
  Upload,
  Checkbox,
  Switch,
  Tag,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  FileTextOutlined,
  CameraOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  InboxOutlined,
  ExperimentOutlined,
  ScissorOutlined,
  ThunderboltOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { get, post, put } from '../../utils/api.js';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const growthStatusOptions = [
  { value: '发芽', label: '发芽' },
  { value: '生长', label: '生长' },
  { value: '开花', label: '开花' },
  { value: '结果', label: '结果' },
  { value: '休眠', label: '休眠' }
];

const activityOptions = [
  { label: '浇水', value: 'watering' },
  { label: '施肥', value: 'fertilizing' },
  { label: '修剪', value: 'pruning' },
  { label: '换盆', value: 'repotting' }
];

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const DiaryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [plants, setPlants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pesticideUsed, setPesticideUsed] = useState(false);
  const isEdit = !!id;

  const fetchPlants = async () => {
    try {
      const res = await get('/plants');
      const data = res?.data || res?.plants || res || [];
      setPlants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDiary = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await get('/diaries/' + id);
      const data = res?.data || res?.diary || res;
      if (data) {
        form.setFieldsValue({
          plantId: data.plantId,
          title: data.title,
          growthStatus: data.growthStatus,
          weather: data.weather,
          temperature: data.temperature,
          fertilizerType: data.fertilizerType,
          pesticideDetails: data.pesticideDetails
        });
        if (data.tags) setTags(data.tags);
        if (data.entries) setEntries(data.entries.map((e, i) => ({ ...e, _key: i })));
        const acts = [];
        if (data.watering) acts.push('watering');
        if (data.fertilizing) acts.push('fertilizing');
        if (data.pruning) acts.push('pruning');
        if (data.repotting) acts.push('repotting');
        setActivities(acts);
        setPesticideUsed(!!data.pesticideUsed);
      }
    } catch (error) {
      message.error('获取日记信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    if (id) {
      fetchDiary();
    } else {
      const plantId = searchParams.get('plantId');
      if (plantId) form.setFieldsValue({ plantId });
    }
  }, [id]);

  const addTextEntry = () => {
    setEntries([...entries, { type: 'text', content: '', _key: Date.now() }]);
  };

  const addImageEntry = () => {
    setEntries([...entries, { type: 'image', content: '', _key: Date.now() }]);
  };

  const updateEntry = (key, content) => {
    setEntries(entries.map(e => e._key === key ? { ...e, content } : e));
  };

  const removeEntry = (key) => {
    setEntries(entries.filter(e => e._key !== key));
  };

  const moveEntry = (key, dir) => {
    const idx = entries.findIndex(e => e._key === key);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= entries.length) return;
    const newEntries = [...entries];
    [newEntries[idx], newEntries[newIdx]] = [newEntries[newIdx], newEntries[idx]];
    setEntries(newEntries);
  };

  const handleTagInputConfirm = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
    }
    setTagInput('');
  };

  const handleTagClose = (removedTag) => {
    setTags(tags.filter(t => t !== removedTag));
  };

  const handleSubmit = async (values) => {
    if (entries.length === 0) {
      message.warning('请至少添加一个日记内容');
      return;
    }
    if (!values.plantId) {
      message.warning('请选择关联植物');
      return;
    }
    setSubmitLoading(true);
    try {
      const payload = {
        ...values,
        tags,
        entries: entries.map(({ type, content }) => ({ type, content })),
        watering: activities.includes('watering'),
        fertilizing: activities.includes('fertilizing'),
        pruning: activities.includes('pruning'),
        repotting: activities.includes('repotting'),
        pesticideUsed
      };
      if (isEdit) {
        await put('/diaries/' + id, payload);
        message.success('日记更新成功');
      } else {
        await post('/diaries', payload);
        message.success('日记创建成功');
      }
      navigate('/diaries');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/diaries')}>返回</Button>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? '编辑日记' : '写日记'}</Title>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="plantId" label="关联植物" rules={[{ required: true, message: '请选择植物' }]}>
                  <Select placeholder="请选择关联的植物" size="large" showSearch optionFilterProp="label"
                    options={plants.map(p => ({ value: p._id, label: p.name }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="title" label="日记标题" rules={[{ required: true, message: '请输入标题' }]}>
                  <Input placeholder="请输入日记标题" size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item name="growthStatus" label="生长状态">
                  <Select placeholder="选择生长状态" size="large" options={growthStatusOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="weather" label="天气">
                  <Input placeholder="如：晴、多云、雨" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="temperature" label="温度（°C）">
                  <InputNumber style={{ width: '100%' }} size="large" placeholder="温度" min={-50} max={60} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="标签">
              <Space wrap size={4}>
                {tags.map((tag, idx) => (
                  <Tag key={idx} closable onClose={(e) => { e.preventDefault(); handleTagClose(tag); }}>{tag}</Tag>
                ))}
                <Input size="small" style={{ width: 120 }} placeholder="回车添加" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)} onPressEnter={handleTagInputConfirm} onBlur={handleTagInputConfirm} />
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
          title={<Space><FileTextOutlined style={{ color: '#722ed1' }} /><span>日记内容</span></Space>}
          extra={<Space>
            <Button icon={<FileTextOutlined />} onClick={addTextEntry}>添加文字段落</Button>
            <Button type="primary" icon={<CameraOutlined />} onClick={addImageEntry}>添加图片</Button>
          </Space>}>
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <FileTextOutlined style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }} />
              <div>点击上方按钮添加日记内容</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {entries.map((entry, idx) => (
                <Card key={entry._key} size="small" style={{ borderRadius: 8 }}
                  title={<Space>
                    <Text strong>{idx + 1}</Text>
                    {entry.type === 'text' ? <Tag icon={<FileTextOutlined />} color="blue">文字</Tag> : <Tag icon={<CameraOutlined />} color="magenta">图片</Tag>}
                  </Space>}
                  extra={<Space size={4}>
                    <Button type="text" size="small" icon={<ArrowUpOutlined />} disabled={idx === 0} onClick={() => moveEntry(entry._key, -1)} />
                    <Button type="text" size="small" icon={<ArrowDownOutlined />} disabled={idx === entries.length - 1} onClick={() => moveEntry(entry._key, 1)} />
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => removeEntry(entry._key)} />
                  </Space>}>
                  {entry.type === 'text' ? (
                    <TextArea rows={4} value={entry.content} maxLength={10000} showCount
                      placeholder="记录植物的状态、心情、发现..." onChange={(e) => updateEntry(entry._key, e.target.value)} />
                  ) : (
                    entry.content ? (
                      <div style={{ textAlign: 'center' }}>
                        <img src={entry.content} alt="" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }} />
                        <Button type="link" danger onClick={() => updateEntry(entry._key, '')} style={{ marginTop: 8 }}>删除图片</Button>
                      </div>
                    ) : (
                      <Dragger multiple={false} accept="image/*" showUploadList={false} beforeUpload={() => false}
                        customRequest={async ({ file }) => {
                          if (file.size > 5 * 1024 * 1024) { message.error('图片大小不能超过 5MB'); return; }
                          try {
                            const base64 = await fileToBase64(file);
                            updateEntry(entry._key, base64);
                            message.success('图片上传成功');
                          } catch (e) { message.error('图片上传失败'); }
                        }} style={{ padding: '20px' }}>
                        <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 40, color: '#1677ff' }} /></p>
                        <p className="ant-upload-text">点击或拖拽上传图片（最大5MB）</p>
                      </Dragger>
                    )
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          title={<Space><ExperimentOutlined style={{ color: '#722ed1' }} /><span>养护活动记录</span></Space>}>
          <Form form={form} layout="vertical">
            <Form.Item label="本次进行的养护活动">
              <Checkbox.Group options={activityOptions} value={activities} onChange={(vals) => setActivities(vals)} />
            </Form.Item>
            {activities.includes('fertilizing') && (
              <Form.Item name="fertilizerType" label="肥料类型">
                <Input placeholder="如：复合肥、有机肥、营养液等" />
              </Form.Item>
            )}
            <Form.Item label="是否使用农药">
              <Switch checked={pesticideUsed} onChange={setPesticideUsed} />
            </Form.Item>
            {pesticideUsed && (
              <Form.Item name="pesticideDetails" label="用药详情">
                <TextArea rows={3} placeholder="请记录使用的农药名称、浓度、用量等信息" maxLength={2000} showCount />
              </Form.Item>
            )}
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Space size="middle">
                <Button size="large" onClick={() => navigate('/diaries')}>取消</Button>
                <Button type="primary" size="large" icon={<SaveOutlined />} loading={submitLoading} onClick={() => form.submit()}>
                  {isEdit ? '保存修改' : '发布日记'}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default DiaryForm;

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Upload,
  Button,
  Card,
  Row,
  Col,
  message,
  Typography,
  Space,
  Spin
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, put } from '../../utils/api.js';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const lightLevelOptions = [
  { value: '强光', label: '强光' },
  { value: '半阴', label: '半阴' },
  { value: '散射', label: '散射' },
  { value: '全日照', label: '全日照' },
  { value: '半日照', label: '半日照' }
];

const statusOptions = [
  { value: '健康', label: '健康' },
  { value: '需关注', label: '需关注' },
  { value: '生病', label: '生病' },
  { value: '死亡', label: '死亡' }
];

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const PlantForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const isEdit = !!id;

  const fetchPlant = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await get('/plants/' + id);
      const data = res?.data || res?.plant || res;
      if (data) {
        const formData = { ...data };
        if (data.purchaseDate) {
          formData.purchaseDate = dayjs(data.purchaseDate);
        }
        form.setFieldsValue(formData);
        if (data.images && Array.isArray(data.images)) {
          const images = data.images.map((url, index) => ({
            uid: '-1-' + index,
            name: 'image-' + index,
            status: 'done',
            url: url
          }));
          setFileList(images);
        }
      }
    } catch (error) {
      message.error('获取植物信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlant();
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      const images = [];
      for (const file of fileList) {
        if (file.url && !file.originFileObj) {
          images.push(file.url);
        } else if (file.originFileObj) {
          const base64 = await fileToBase64(file.originFileObj);
          images.push(base64);
        }
      }
      const payload = {
        ...values,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : undefined,
        images
      };
      if (isEdit) {
        await put('/plants/' + id, payload);
        message.success('植物信息更新成功');
      } else {
        await post('/plants', payload);
        message.success('植物创建成功');
      }
      navigate('/plants');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const draggerProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    showUploadList: { showPreviewIcon: true, showRemoveIcon: true },
    fileList,
    beforeUpload: () => false,
    customRequest: async ({ file, onSuccess }) => {
      setTimeout(() => onSuccess(), 0);
    },
    onChange: ({ file, fileList: newFileList }) => {
      if (file.status === 'uploading' && file.originFileObj) {
        fileToBase64(file.originFileObj).then(base64 => {
          const updatedFile = { ...file, url: base64, status: 'done' };
          const updatedList = newFileList.map(f => f.uid === file.uid ? updatedFile : f);
          setFileList(updatedList);
        });
      } else {
        setFileList(newFileList);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/plants')}>返回</Button>
          <Title level={3} style={{ margin: 0 }}>{isEdit ? '编辑植物' : '新增植物'}</Title>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: '健康',
              waterFrequency: 7,
              fertilizeFrequency: 30,
              pruneFrequency: 90,
              repotFrequency: 365
            }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="植物名称" rules={[{ required: true, message: '请输入植物名称' }]}>
                  <Input placeholder="请输入植物名称" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="species" label="品种" rules={[{ required: true, message: '请输入品种' }]}>
                  <Input placeholder="请输入品种，如：多肉、绿萝等" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="purchaseDate" label="购买日期" rules={[{ required: true, message: '请选择购买日期' }]}>
                  <DatePicker style={{ width: '100%' }} size="large" placeholder="选择购买日期" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="location" label="放置位置">
                  <Input placeholder="如：客厅阳台、卧室窗台等" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item name="lightLevel" label="光照等级" rules={[{ required: true, message: '请选择光照等级' }]}>
                  <Select placeholder="请选择光照等级" size="large" options={lightLevelOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="status" label="健康状态" rules={[{ required: true, message: '请选择状态' }]}>
                  <Select placeholder="请选择状态" size="large" options={statusOptions} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={12} md={6}>
                <Form.Item name="waterFrequency" label="浇水频率（天）" rules={[{ required: true, message: '请输入浇水频率' }]}>
                  <InputNumber style={{ width: '100%' }} size="large" min={1} max={60} placeholder="天数" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="fertilizeFrequency" label="施肥频率（天）">
                  <InputNumber style={{ width: '100%' }} size="large" min={1} max={365} placeholder="天数" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="pruneFrequency" label="修剪频率（天）">
                  <InputNumber style={{ width: '100%' }} size="large" min={1} max={365} placeholder="天数" />
                </Form.Item>
              </Col>
              <Col xs={12} md={6}>
                <Form.Item name="repotFrequency" label="换盆频率（天）">
                  <InputNumber style={{ width: '100%' }} size="large" min={1} max={3650} placeholder="天数" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="images" label="植物照片">
              <Dragger {...draggerProps} style={{ padding: '20px' }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 48, color: '#1677ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此处上传</p>
                <p className="ant-upload-hint">支持多张图片上传，用于记录植物成长过程</p>
              </Dragger>
            </Form.Item>

            <Form.Item name="notes" label="备注">
              <TextArea rows={4} placeholder="记录植物的特点、养护心得等" maxLength={2000} showCount />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space size="middle">
                <Button size="large" onClick={() => navigate('/plants')}>取消</Button>
                <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit" loading={submitLoading}>
                  {isEdit ? '保存修改' : '创建植物'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default PlantForm;

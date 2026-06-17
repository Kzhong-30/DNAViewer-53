import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Form, Input, Select, Button, Space, Row, Col, Typography,
  Image, Upload, Tag, message, Spin, Tooltip, Divider
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined, PictureOutlined,
  EnvironmentOutlined, SendOutlined, SaveOutlined, CloseOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CATEGORIES = ['成果分享', '病虫害求助', '种子交换', '幼苗交换', '经验交流'];

const CATEGORY_DESC = {
  '成果分享': '展示你的种植成果，分享丰收的喜悦',
  '病虫害求助': '遇到病虫害问题？在这里寻求帮助',
  '种子交换': '交换多余的种子，发现新品种',
  '幼苗交换': '与其他园艺爱好者交换幼苗',
  '经验交流': '分享种植技巧和心得体会'
};

const SAMPLE_IMAGE_OPTIONS = [
  { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', name: '菜园全景' },
  { url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=400&fit=crop', name: '新鲜蔬菜' },
  { url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=400&fit=crop', name: '绿色盆栽' },
  { url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&h=400&fit=crop', name: '番茄丰收' },
  { url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop', name: '多肉植物' },
  { url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=400&fit=crop', name: '花园一角' },
  { url: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&h=400&fit=crop', name: '香草植物' },
  { url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop', name: '阳台菜园' }
];

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSampleImages, setShowSampleImages] = useState(false);
  const isEditMode = Boolean(id);

  const fetchPost = async () => {
    if (!isEditMode) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/posts/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      });
      const post = res.data.post;
      form.setFieldsValue({
        title: post.title,
        category: post.category,
        content: post.content,
        location: post.location || '',
        status: post.status || '开放'
      });
      setSelectedCategory(post.category);
      setImages(post.images || []);
      setTags(post.tags || []);
    } catch (error) {
      console.error('获取帖子详情失败:', error);
      message.error('获取帖子详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleTagInputConfirm = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag) && tags.length < 10) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagInputConfirm();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleTagClose = (removedTag) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleAddSampleImage = (url) => {
    if (!images.includes(url) && images.length < 9) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleCustomUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (images.length < 9) {
        setImages([...images, e.target.result]);
      } else {
        message.warning('最多只能上传9张图片');
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleSubmit = async (values) => {
    if (images.length === 0) {
      message.warning('请至少添加一张图片');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const postData = { ...values, images, tags };
      let res;
      if (isEditMode) {
        res = await axios.put('/api/posts/' + id, postData, {
          headers: { Authorization: 'Bearer ' + token }
        });
        message.success('帖子更新成功');
      } else {
        res = await axios.post('/api/posts', postData, {
          headers: { Authorization: 'Bearer ' + token }
        });
        message.success('帖子发布成功');
      }
      const postId = res.data.post._id;
      setTimeout(() => { navigate('/community/' + postId); }, 500);
    } catch (error) {
      console.error(isEditMode ? '更新帖子失败:' : '发布帖子失败:', error);
      message.error(error.response?.data?.message || (isEditMode ? '更新失败' : '发布失败'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f9f0' }}>
        <Content style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f9f0' }}>
      <Content style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 20 }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ borderRadius: 8, border: '1px solid #d9f7be', color: '#389e0d', background: '#fff' }}
            >
              返回
            </Button>
          </Space>
        </div>

        <Card
          style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)' }}
          bodyStyle={{ padding: '32px 40px' }}
          title={
            <div>
              <Title level={3} style={{ margin: 0, color: '#237804' }}>
                {isEditMode ? '编辑帖子' : '发布新帖'}
              </Title>
              <Text type="secondary">
                {isEditMode ? '修改你的帖子内容' : '分享你的种植经验和心得'}
              </Text>
            </div>
          }
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: '开放' }} requiredMark="optional">
            <Form.Item
              name="category"
              label={<Space><span style={{ fontWeight: 600, fontSize: 15 }}>选择分类</span><Text type="danger">*</Text></Space>}
              rules={[{ required: true, message: '请选择帖子分类' }]}
            >
              <Select
                size="large"
                placeholder="请选择帖子分类"
                onChange={(val) => setSelectedCategory(val)}
                style={{ borderRadius: 10 }}
              >
                {CATEGORIES.map(cat => (
                  <Option key={cat} value={cat}>
                    <div style={{ padding: '4px 0' }}>
                      <div style={{ fontWeight: 500 }}>{cat}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{CATEGORY_DESC[cat]}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedCategory && (
              <div style={{ padding: '12px 16px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 10, marginBottom: 24 }}>
                <Space>
                  <InfoCircleOutlined style={{ color: '#52c41a' }} />
                  <Text style={{ color: '#389e0d', fontSize: 13 }}>{CATEGORY_DESC[selectedCategory]}</Text>
                </Space>
              </div>
            )}

            <Form.Item
              name="title"
              label={<Space><span style={{ fontWeight: 600, fontSize: 15 }}>帖子标题</span><Text type="danger">*</Text></Space>}
              rules={[{ required: true, message: '请输入帖子标题' }, { min: 5, message: '标题至少5个字符' }, { max: 100, message: '标题不能超过100个字符' }]}
            >
              <Input size="large" placeholder="一个吸引人的标题..." maxLength={100} showCount style={{ borderRadius: 10, fontSize: 15 }} />
            </Form.Item>

            <Form.Item
              label={<Space><span style={{ fontWeight: 600, fontSize: 15 }}>上传图片</span><Text type="danger">*</Text>
                <Tooltip title="最多上传9张图片，可以选择示例图片或本地上传">
                  <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
                </Tooltip>
              </Space>}
              required
            >
              <div>
                <Row gutter={[12, 12]} style={{ marginBottom: images.length > 0 ? 16 : 0 }}>
                  {images.map((img, index) => (
                    <Col key={index} xs={12} sm={8} md={6}>
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid #f0f0f0' }}>
                        <Image src={img} alt={'图片 ' + (index + 1)} preview={false} width="100%" height={140} style={{ objectFit: 'cover' }} />
                        <Button danger icon={<DeleteOutlined />} onClick={() => handleRemoveImage(index)} type="primary"
                          style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, padding: 0, borderRadius: '50%', minWidth: 28 }} />
                        <div style={{
                          position: 'absolute', top: 6, left: 6, background: 'rgba(82, 196, 26, 0.9)',
                          color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500
                        }}>{index + 1}</div>
                      </div>
                    </Col>
                  ))}
                  {images.length < 9 && (
                    <Col xs={12} sm={8} md={6}>
                      <Upload accept="image/*" multiple showUploadList={false} beforeUpload={handleCustomUpload}>
                        <div style={{
                          height: 140, border: '2px dashed #95de64', borderRadius: 12, display: 'flex',
                          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', background: '#f6ffed', color: '#52c41a'
                        }}>
                          <PlusOutlined style={{ fontSize: 28, marginBottom: 4 }} />
                          <Text style={{ color: '#52c41a', fontSize: 13 }}>上传图片</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>({images.length}/9)</Text>
                        </div>
                      </Upload>
                    </Col>
                  )}
                </Row>
                <div style={{ marginTop: 8 }}>
                  <Button type="link" icon={<PictureOutlined />} onClick={() => setShowSampleImages(!showSampleImages)}
                    style={{ padding: 0, color: '#52c41a', fontSize: 13 }}>
                    {showSampleImages ? '收起示例图片' : '使用示例图片'}
                  </Button>
                </div>
                {showSampleImages && (
                  <div style={{ marginTop: 12, padding: 16, background: '#fafafa', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                      点击选择示例图片（可多选）：
                    </Text>
                    <Row gutter={[10, 10]}>
                      {SAMPLE_IMAGE_OPTIONS.map((option, index) => {
                        const isSelected = images.includes(option.url);
                        return (
                          <Col key={index} xs={12} sm={8} md={6}>
                            <div onClick={() => {
                              if (isSelected) {
                                const idx = images.indexOf(option.url);
                                if (idx > -1) handleRemoveImage(idx);
                              } else {
                                handleAddSampleImage(option.url);
                              }
                            }} style={{
                              position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                              border: isSelected ? '3px solid #52c41a' : '2px solid transparent'
                            }}>
                              <Image src={option.url} alt={option.name} preview={false} width="100%" height={100} style={{ objectFit: 'cover' }} />
                              <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 8px',
                                background: 'rgba(0, 0, 0, 0.6)', color: '#fff', fontSize: 11
                              }}>{option.name}</div>
                              {isSelected && (
                                <div style={{
                                  position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%',
                                  background: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14
                                }}>✓</div>
                              )}
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="content"
              label={<Space><span style={{ fontWeight: 600, fontSize: 15 }}>帖子内容</span><Text type="danger">*</Text></Space>}
              rules={[{ required: true, message: '请输入帖子内容' }, { min: 20, message: '内容至少20个字符' }]}
            >
              <TextArea rows={10} placeholder="详细描述你想分享的内容..." maxLength={5000} showCount
                style={{ borderRadius: 10, fontSize: 14, lineHeight: 1.8, resize: 'vertical' }} />
            </Form.Item>

            <Form.Item label={<Space><span style={{ fontWeight: 600, fontSize: 15 }}>添加标签</span>
              <Tooltip title="添加标签可以让更多人找到你的帖子（最多10个）">
                <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
              </Tooltip>
            </Space>}>
              <div>
                <div style={{
                  padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: 10, minHeight: 48,
                  display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center'
                }}>
                  {tags.map(tag => (
                    <Tag key={tag} closable onClose={(e) => { e.preventDefault(); handleTagClose(tag); }}
                      style={{
                        background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d',
                        borderRadius: 6, padding: '4px 10px', fontSize: 13, margin: 0
                      }}>#{tag}</Tag>
                  ))}
                  <Input
                    value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown} onBlur={handleTagInputConfirm}
                    onPressEnter={handleTagInputConfirm}
                    placeholder={tags.length < 10 ? '输入标签后按回车添加...' : '已达最大标签数'}
                    disabled={tags.length >= 10} bordered={false}
                    style={{ flex: 1, minWidth: 120, fontSize: 14, padding: 0 }}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                  已添加 {tags.length}/10 个标签
                </Text>
              </div>
            </Form.Item>

            <Form.Item name="location" label={<Space><span style={{ fontWeight: 600, fontSize: 15 }}><EnvironmentOutlined style={{ color: '#52c41a' }} /> 位置信息</span></Space>}>
              <Input size="large" placeholder="例如：北京市朝阳区 或 我的阳台花园"
                style={{ borderRadius: 10 }} prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />} />
            </Form.Item>

            {isEditMode && (
              <Form.Item name="status" label={<Space><span style={{ fontWeight: 600, fontSize: 15 }}>帖子状态</span></Space>}>
                <Select size="large" style={{ borderRadius: 10, width: '100%' }}>
                  <Option value="开放">开放 - 持续讨论中</Option>
                  <Option value="已解决">已解决 - 问题已解决</Option>
                  <Option value="已完成">已完成 - 活动已结束</Option>
                  <Option value="关闭">关闭 - 不再接受回复</Option>
                </Select>
              </Form.Item>
            )}

            <Divider style={{ margin: '24px 0' }} />

            <Form.Item style={{ marginBottom: 0 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}
                    style={{ borderRadius: 8, height: 44, padding: '0 24px' }}>取消</Button>
                </Col>
                <Col>
                  <Space size={12}>
                    <Button icon={<SaveOutlined />} type="primary" htmlType="submit" loading={submitting}
                      disabled={images.length === 0}
                      style={{
                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', border: 'none',
                        borderRadius: 8, height: 44, padding: '0 32px', fontSize: 15,
                        boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
                      }}>
                      <Space>
                        {isEditMode ? <SaveOutlined /> : <SendOutlined />}
                        <span>{isEditMode ? '保存修改' : '发布帖子'}</span>
                      </Space>
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default PostForm;

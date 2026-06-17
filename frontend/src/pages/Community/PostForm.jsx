import React, { useState } from "react";
import { Form, Input, Button, Select, Upload, Card, Typography, Space, Row, Col, message, Tag } from "antd";
import { ArrowLeftOutlined, PlusOutlined, SendOutlined, EnvironmentOutlined, TagsOutlined } from "@ant-design/icons";
const categoryOptions = [
  { value: "成果分享", label: "分享成果" },
  { value: "病虫害求助", label: "求助诊断" },
  { value: "种子交换", label: "种子交换" },
  { value: "幼苗交换", label: "幼苗交换" },
  { value: "经验交流", label: "经验交流" }
];
const statusOptions = [{ value: "开放", label: "公开" }, { value: "关闭", label: "草稿" }];
const PostForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value) && tags.length < 10) {
        setTags([...tags, value]);
        setTagInput("");
      }
    }
  };
  const removeTag = (removedTag) => setTags(tags.filter(tag => tag !== removedTag));
  const beforeUpload = (file) => {
    if (!file.type.startsWith("image/")) { message.error("只能上传图片文件！"); return false; }
    if (file.size / 1024 / 1024 > 5) { message.error("每张图片大小不能超过 5MB！"); return false; }
    const reader = new FileReader();
    reader.onload = (e) => { if (images.length < 9) setImages([...images, e.target.result]); };
    reader.readAsDataURL(file);
    return false;
  };
  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));
  const onFinish = async (values) => {
    if (!images.length && !values.content?.trim()) { message.warning("请填写内容或上传图片"); return; }
    setLoading(true);
    try {
      await post("/posts", { ...values, tags, images, status: values.status || "开放" });
      message.success("发布成功");
      navigate("/community");
    } catch (error) { message.error("发布失败，请稍后重试"); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 16 }}>返回</Button>
        <Title level={3} style={{ margin: 0 }}>发布新帖</Title>
      </div>
      <Row justify="center">
        <Col xs={24} lg={20} xl={16}>
          <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 24 }}>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "开放" }}>
              <Form.Item label="帖子分类" name="category" rules={[{ required: true, message: "请选择帖子分类" }]}>
                <Select size="large" placeholder="请选择分类" options={categoryOptions} />
              </Form.Item>
              <Form.Item label="标题" name="title" rules={[{ required: true, message: "请输入帖子标题" }, { max: 100, message: "标题不能超过100个字符" }]}>
                <Input size="large" placeholder="请输入帖子标题（不超过100字）" maxLength={100} showCount />
              </Form.Item>
              <Form.Item label="内容" name="content" rules={[{ required: true, message: "请输入帖子内容" }, { max: 5000, message: "内容不能超过5000个字符" }]}>
                <TextArea rows={10} placeholder="分享您的种植经验、问题或想法..." maxLength={5000} showCount style={{ resize: "vertical" }} />
              </Form.Item>
              <Form.Item label="上传图片（最多9张）">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {images.map((img, index) => (
                    <div key={index} style={{ position: "relative", width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: "1px solid #f0f0f0" }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <Button type="text" danger size="small" style={{ position: "absolute", top: 0, right: 0, padding: "0 4px", height: 24, minWidth: "auto" }} onClick={() => removeImage(index)}>×</Button>
                    </div>
                  ))}
                  {images.length < 9 && (
                    <Upload beforeUpload={beforeUpload} accept="image/*" multiple showUploadList={false}>
                      <div style={{ width: 100, height: 100, borderRadius: 8, border: "1px dashed #d9d9d9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#fafafa" }}>
                        <PlusOutlined style={{ fontSize: 24, color: "#8c8c8c", marginBottom: 4 }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>添加图片</Text>
                      </div>
                    </Upload>
                  )}
                </div>
              </Form.Item>
              <Form.Item label="标签（回车添加，最多10个）">
                <div style={{ marginBottom: 8 }}>
                  <Space size={[8, 8]} wrap>
                    {tags.map((tag, index) => <Tag key={index} closable color="geekblue" onClose={(e) => { e.preventDefault(); removeTag(tag); }} style={{ fontSize: 13, padding: "2px 8px" }}>{tag}</Tag>)}
                  </Space>
                </div>
                <Input size="large" prefix={<TagsOutlined style={{ color: "#bfbfbf" }} />} placeholder="输入标签后按回车添加" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagInputKeyDown} disabled={tags.length >= 10} />
              </Form.Item>
              <Form.Item label="位置（选填）" name="location">
                <Input size="large" prefix={<EnvironmentOutlined style={{ color: "#bfbfbf" }} />} placeholder="例如：北京·朝阳" />
              </Form.Item>
              <Form.Item label="发布状态" name="status">
                <Select size="large" options={statusOptions} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                <Space size={12}>
                  <Button type="primary" size="large" htmlType="submit" icon={<SendOutlined />} loading={loading} style={{ height: 44, borderRadius: 8, padding: "0 24px" }}>发布帖子</Button>
                  <Button size="large" onClick={() => navigate(-1)} style={{ height: 44, borderRadius: 8, padding: "0 24px" }}>取消</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default PostForm;

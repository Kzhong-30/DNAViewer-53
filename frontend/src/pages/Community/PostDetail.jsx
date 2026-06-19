import React, { useState, useEffect } from "react";
import { Card, Typography, Avatar, Tag, Button, Space, Row, Col, Image, Breadcrumb, Form, Input, List, Popconfirm, message, Empty, Skeleton } from "antd";
import { HomeOutlined, LikeOutlined, LikeFilled, ShareAltOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, TagsOutlined, SendOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { get, post, del } from "../../utils/api.js";
dayjs.extend(relativeTime);
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const categoryTagColors = { "成果分享": "green", "病虫害求助": "red", "种子交换": "blue", "幼苗交换": "cyan", "经验交流": "purple" };
const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [form] = Form.useForm();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id;
  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await get(`/posts/${id}`);
      setPost(data);
      setLikeCount(data.likes?.length || 0);
      setLiked(data.likes?.includes(currentUserId) || false);
    } catch (err) { message.error("加载帖子失败"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchPost(); }, [id]);
  const handleLike = async () => {
    try {
      const data = await post(`/posts/${id}/like`);
      setLiked(data.liked);
      setLikeCount(data.count || 0);
      message.success(data.liked ? "点赞成功" : "取消点赞");
    } catch (err) { message.error("操作失败"); }
  };
  const handleShare = () => {
    if (navigator.share) { navigator.share({ title: post.title, url: window.location.href }); }
    else { navigator.clipboard.writeText(window.location.href); message.success("链接已复制到剪贴板"); }
  };
  const handleDeletePost = async () => {
    try {
      await del(`/posts/${id}`);
      message.success("帖子已删除");
      navigate("/community");
    } catch (err) { message.error("删除失败"); }
  };
  const handleSubmitComment = async (values) => {
    if (!values.content?.trim()) return;
    try {
      setSubmittingComment(true);
      await post(`/posts/${id}/comments`, { content: values.content });
      message.success("评论发布成功");
      form.resetFields();
      fetchPost();
    } catch (err) { message.error("评论失败"); }
    finally { setSubmittingComment(false); }
  };
  const handleDeleteComment = async (commentId) => {
    try {
      await del(`/posts/${id}/comments/${commentId}`);
      message.success("评论已删除");
      fetchPost();
    } catch (err) { message.error("删除失败"); }
  };
  if (loading) return <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 10 }} /></div>;
  if (!post) return <div style={{ padding: 24, textAlign: "center" }}><Empty description="帖子不存在" /><Button onClick={() => navigate("/community")}>返回列表</Button></div>;
  const isOwnPost = currentUserId && post.author?._id === currentUserId;
  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      <Row justify="center">
        <Col xs={24} lg={20} xl={16}>
          <div style={{ marginBottom: 16 }}>
            <Breadcrumb style={{ marginBottom: 16 }}>
              <Breadcrumb.Item><Link to="/"><HomeOutlined /> 首页</Link></Breadcrumb.Item>
              <Breadcrumb.Item><Link to="/community">社区交流</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{post.title?.slice(0, 15)}...</Breadcrumb.Item>
            </Breadcrumb>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          </div>
          <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f0f0f0" }}>
              <Avatar size={48} src={post.author?.avatar} style={{ backgroundColor: "#1890ff", marginRight: 12 }}>{post.author?.username?.[0]?.toUpperCase() || "U"}</Avatar>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 15 }}>{post.author?.username || "匿名用户"}</Text>
                  <Tag color={categoryTagColors[post.category] || "default"} style={{ margin: 0 }}>{post.category}</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")} · {dayjs(post.createdAt).fromNow()}</Text>
              </div>
              {isOwnPost && (
                <Space>
                  <Button icon={<EditOutlined />} size="small">编辑</Button>
                  <Popconfirm title="确定删除这篇帖子吗？" onConfirm={handleDeletePost} okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
                    <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
                  </Popconfirm>
                </Space>
              )}
            </div>
            <Title level={2} style={{ marginTop: 0, marginBottom: 16 }}>{post.title}</Title>
            {post.images?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <Image.PreviewGroup>
                  <Row gutter={[12, 12]}>
                    {post.images.map((img, idx) => (
                      <Col xs={24} sm={12} md={8} key={idx}>
                        <Image src={img} alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8 }} />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </div>
            )}
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap", marginBottom: 20 }}>{post.content}</Paragraph>
            {(post.location || post.tags?.length) && (
              <div style={{ marginBottom: 20, padding: 16, background: "#fafafa", borderRadius: 8 }}>
                {post.location && <div style={{ marginBottom: 8 }}><EnvironmentOutlined style={{ color: "#1890ff", marginRight: 6 }} /><Text type="secondary">位置：{post.location}</Text></div>}
                {post.tags?.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <TagsOutlined style={{ color: "#1890ff" }} />
                    {post.tags.map((tag, idx) => <Tag key={idx} color="geekblue" style={{ margin: 0 }}>{tag}</Tag>)}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", marginBottom: 24 }}>
              <Space size="middle">
                <Button icon={liked ? <LikeFilled style={{ color: "#ff4d4f" }} /> : <LikeOutlined />} onClick={handleLike} type={liked ? "primary" : "default"} danger={liked}>
                  {likeCount > 0 ? likeCount : "点赞"}
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={handleShare}>分享</Button>
              </Space>
            </div>
            <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>评论 ({post.comments?.length || 0})</Title>
            {post.comments?.length > 0 ? (
              <List
                dataSource={post.comments}
                renderItem={(comment) => {
                  const isOwnComment = currentUserId && (comment.author?._id === currentUserId || isOwnPost);
                  return (
                    <List.Item key={comment._id} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", gap: 12, width: "100%" }}>
                        <Avatar src={comment.author?.avatar} style={{ backgroundColor: "#52c41a" }}>{comment.author?.username?.[0]?.toUpperCase() || "U"}</Avatar>
                        <div style={{ flex: 1 }}>
                          <Text strong>{comment.author?.username || "匿名用户"}</Text>
                          <Paragraph style={{ marginBottom: 8 }}>{comment.content}</Paragraph>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm")} · {dayjs(comment.createdAt).fromNow()}</Text>
                            {isOwnComment && (
                              <Popconfirm title="确定删除这条评论吗？" onConfirm={() => handleDeleteComment(comment._id)} okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
                                <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ padding: 0 }}>删除</Button>
                              </Popconfirm>
                            )}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="暂无评论，快来抢沙发吧！" style={{ padding: "40px 0" }} />
            )}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Avatar src={currentUser?.avatar} style={{ backgroundColor: "#722ed1" }}>{currentUser?.username?.[0]?.toUpperCase() || "U"}</Avatar>
                <div style={{ flex: 1 }}>
                  <Form form={form} onFinish={handleSubmitComment} layout="vertical">
                    <Form.Item name="content" rules={[{ required: true, message: "请输入评论内容" }]} style={{ marginBottom: 12 }}>
                      <TextArea rows={4} placeholder="写下你的评论..." maxLength={1000} showCount />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button htmlType="submit" type="primary" icon={<SendOutlined />} loading={submittingComment}>发表评论</Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default PostDetail;

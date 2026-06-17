import React, { useState, useEffect } from "react";
import { Card, Typography, Input, Select, Row, Col, Tag, Pagination, Empty, Skeleton, Button } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { get } from "../../utils/api.js";
const { Title } = Typography;
const { Option } = Select;
const difficultyColors = { "新手友好": "green", "中等难度": "orange", "需要经验": "red", "中等": "orange", "困难": "red" };
const categoryOptions = ["观叶植物", "多肉植物", "花卉植物", "草本植物", "果树植物", "蔬菜植物", "蕨类植物", "水生植物"];
const difficultyOptions = ["新手友好", "中等难度", "需要经验"];
const Wiki = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const fetchPlants = async () => {
    try {
      setLoading(true);
      const params = { page, pageSize };
      if (search) params.search = search;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      const data = await get("/wiki", params);
      setPlants(data.data || data.plants || []);
      setTotal(data.total || 0);
    } catch (err) { setPlants([]); setTotal(0); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchPlants(); }, [page, category, difficulty]);
  const handleSearch = (value) => { setSearch(value); setPage(1); };
  const handleCategoryChange = (value) => { setCategory(value || ""); setPage(1); };
  const handleDifficultyChange = (value) => { setDifficulty(value || ""); setPage(1); };
  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>🌿 植物百科</Title>
          <Card style={{ borderRadius: 12, marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12} lg={14}>
                <Input.Search size="large" placeholder="搜索植物名称、学名或别名..." allowClear enterButton={<SearchOutlined />} onSearch={handleSearch} style={{ width: "100%" }} />
              </Col>
              <Col xs={24} md={6} lg={5}>
                <Select size="large" placeholder="分类筛选" allowClear style={{ width: "100%" }} onChange={handleCategoryChange}>
                  {categoryOptions.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                </Select>
              </Col>
              <Col xs={24} md={6} lg={5}>
                <Select size="large" placeholder="难度筛选" allowClear style={{ width: "100%" }} onChange={handleDifficultyChange}>
                  {difficultyOptions.map(diff => <Option key={diff} value={diff}>{diff}</Option>)}
                </Select>
              </Col>
            </Row>
          </Card>
        </div>
        {loading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Col xs={12} sm={12} md={8} lg={6} xl={6} key={i}>
                <Card style={{ borderRadius: 12 }}>
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : plants.length === 0 ? (
          <Empty description="没有找到符合条件的植物" style={{ padding: "80px 0" }}>
            <Button type="primary" onClick={() => { setSearch(""); setCategory(""); setDifficulty(""); setPage(1); }}>清除筛选</Button>
          </Empty>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {plants.map((plant) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={6} key={plant._id || plant.id}>
                  <Card
                    hoverable
                    style={{ borderRadius: 12, overflow: "hidden" }}
                    bodyStyle={{ padding: 0 }}
                    onClick={() => navigate(`/wiki/${plant._id || plant.id}`)}
                    cover={<div style={{ height: 180, overflow: "hidden", background: "#f0f0f0" }}><img src={plant.image || plant.coverImage || "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop"} alt={plant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                  >
                    <div style={{ padding: 16 }}>
                      <Card.Meta
                        title={<div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{plant.name}</div>}
                        description={
                          <div style={{ color: "#8c8c8c", fontSize: 13, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 38 }}>
                            {plant.description || plant.brief || "暂无描述"}
                          </div>
                        }
                      />
                      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                        <Tag color={difficultyColors[plant.difficulty] || "default"} style={{ margin: 0, fontSize: 11 }}>{plant.difficulty || "新手友好"}</Tag>
                        <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>{plant.category || "观叶植物"}</Tag>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            {total > pageSize && (
              <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
                <Pagination current={page} pageSize={pageSize} total={total} showSizeChanger={false} showQuickJumper showTotal={(t) => `共 ${t} 株植物`} onChange={(p) => setPage(p)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Wiki;

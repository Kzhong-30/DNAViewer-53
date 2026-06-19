import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Image, Tag, Descriptions, Tabs, Collapse, Breadcrumb, Button, Empty, Skeleton, Space } from "antd";
import { HomeOutlined, ArrowLeftOutlined, CheckCircleOutlined, CloudOutlined, SunOutlined, ThunderboltOutlined, FallOutlined, RiseOutlined, HeartOutlined, BugOutlined, ScissorOutlined, AppleOutlined, EnvironmentOutlined, CalendarOutlined, CoffeeOutlined, FireOutlined } from "@ant-design/icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import { get } from "../../utils/api.js";
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const difficultyColors = { "新手友好": "green", "中等难度": "orange", "需要经验": "red", "中等": "orange", "困难": "red" };
const careGuideIcons = [
  { key: "浇水", icon: <CloudOutlined />, color: "#1890ff", bg: "#e6f7ff", border: "#91d5ff" },
  { key: "光照", icon: <SunOutlined />, color: "#fa8c16", bg: "#fff7e6", border: "#ffd591" },
  { key: "施肥", icon: <AppleOutlined />, color: "#52c41a", bg: "#f6ffed", border: "#b7eb8f" },
  { key: "修剪", icon: <ScissorOutlined />, color: "#722ed1", bg: "#f9f0ff", border: "#d3adf7" },
  { key: "换盆", icon: <RiseOutlined />, color: "#13c2c2", bg: "#e6fffb", border: "#87e8de" },
  { key: "繁殖", icon: <HeartOutlined />, color: "#eb2f96", bg: "#fff0f6", border: "#ffadd2" },
  { key: "病虫害", icon: <BugOutlined />, color: "#f5222d", bg: "#fff1f0", border: "#ffa39e" }
];
const seasonalConfig = [
  { key: "spring", label: "春季", icon: <AppleOutlined />, bg: "#f6ffed", border: "#b7eb8f", title: "春季养护" },
  { key: "summer", label: "夏季", icon: <SunOutlined />, bg: "#fff7e6", border: "#ffd591", title: "夏季养护" },
  { key: "autumn", label: "秋季", icon: <CoffeeOutlined />, bg: "#fff2e8", border: "#ffbb96", title: "秋季养护" },
  { key: "winter", label: "冬季", icon: <CloudOutlined />, bg: "#e6f7ff", border: "#91d5ff", title: "冬季养护" }
];
const WikiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        setLoading(true);
        const data = await get(`/wiki/${id}`);
        setPlant(data.data || data.plant || data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchPlant();
  }, [id]);
  if (loading) return <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 12 }} /></div>;
  if (!plant) return <div style={{ padding: 24, textAlign: "center" }}><Empty description="植物信息不存在" /><Button onClick={() => navigate("/wiki")}>返回列表</Button></div>;
  const careGuide = plant.careGuide || [
    { title: "浇水", content: "保持土壤微湿但不积水，夏季每2-3天浇水一次，冬季每周浇水一次，避免叶片沾水导致腐烂。" },
    { title: "光照", content: "喜欢明亮的散射光，避免直射阳光暴晒，每天保证4-6小时的光照时间。" },
    { title: "施肥", content: "生长季节每月施一次稀释的液肥，休眠期停止施肥，使用氮磷钾平衡的复合肥。" },
    { title: "修剪", content: "及时修剪黄叶和徒长枝，促进分枝和开花，修剪后注意通风防止感染。" },
    { title: "换盆", content: "每1-2年春季换盆一次，选择比原盆稍大的容器，使用排水良好的新土壤。" },
    { title: "繁殖", content: "春秋季可通过扦插繁殖，选择健康的枝条，晾干切口后插入疏松基质约2周生根。" },
    { title: "病虫害", content: "注意观察叶片，发现蚜虫或红蜘蛛立即用肥皂水喷洒或使用杀虫剂，保持良好通风。" }
  ];
  const seasonalTips = plant.seasonalTips || {
    spring: "气温回升，开始进入生长旺季，增加浇水频率，每半月施一次薄肥，可进行换盆和繁殖。",
    summer: "高温期注意遮阴降温，保持通风，早晚浇水避免中午高温，注意防治红蜘蛛等虫害。",
    autumn: "减少浇水频率，增加光照，为越冬做准备，可进行一次修剪，清理枯叶。",
    winter: "保持室温不低于10°C，减少浇水，停止施肥，远离暖气出风口，保证充足光照。"
  };
  const pname = plant.name || "这种植物";
  const faqs = plant.faqs || [
    { q: `${pname}多久浇一次水？`, a: "一般情况下，夏季2-3天浇一次，冬季每周一次。具体频率需根据环境温度、湿度和土壤情况调整，保持土壤微湿即可。" },
    { q: `${pname}叶子发黄怎么办？`, a: "叶子发黄可能是浇水过多、光照不足或缺乏养分导致的。建议检查土壤湿度，调整浇水量，将植物移至光照充足处，必要时补充复合肥。" },
    { q: `${pname}可以养在室内吗？`, a: "可以的，它很适合室内养护。只需放置在有明亮散射光的位置，如窗边，避免直射阳光即可健康生长。" },
    { q: `${pname}如何繁殖？`, a: "最常用的方法是枝条扦插。选取健康的半木质化枝条，保留2-3个节，晾干切口后插入疏松湿润的基质，约2周即可生根。" },
    { q: `${pname}需要什么土壤？`, a: "喜欢疏松透气、排水良好且富含有机质的微酸性土壤。可用泥炭土、珍珠岩、园土按2:1:1的比例混合配制。" },
    { q: `${pname}多久施一次肥？`, a: "生长旺季（春秋）每半个月施一次稀释的液肥，夏冬休眠期停止施肥。建议使用氮磷钾比例均衡的复合肥。" },
    { q: `${pname}的适宜温度是多少？`, a: "最适宜的生长温度为15-28°C。夏季高温需遮阴降温，冬季需保持室温在10°C以上以免冻伤。" },
    { q: `${pname}需要修剪吗？`, a: "需要定期修剪。及时剪除黄叶、枯叶和徒长枝可以保持株型美观，促进分枝，让植物更加茂盛。" },
    { q: `${pname}容易生虫吗？`, a: "养护得当不易生虫。常见的虫害有蚜虫、红蜘蛛，发现后可用肥皂水喷洒或用杀虫剂处理，平时保持通风可预防。" },
    { q: `${pname}换盆时需要注意什么？`, a: "换盆最佳时间是春季。选择比原盆稍大的花盆，底部铺排水层，换盆后浇透水，放置在阴凉处缓苗一周。" }
  ];
  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> 首页</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/wiki">植物百科</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{plant.name}</Breadcrumb.Item>
          </Breadcrumb>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回列表</Button>
        </div>
        <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 24, marginBottom: 24 }}>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <div style={{ position: "sticky", top: 24 }}>
                <Image
                  width="100%"
                  src={plant.image || plant.coverImage || "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=500&fit=crop"}
                  alt={plant.name}
                  style={{ borderRadius: 12, maxHeight: 450, objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 16 }}>
                <Title level={2} style={{ margin: "0 0 8px 0" }}>{plant.name}</Title>
                {plant.commonNames && plant.commonNames.length > 0 && <Text italic style={{ color: "#8c8c8c", fontSize: 14, display: "block", marginBottom: 4 }}>别名：{(Array.isArray(plant.commonNames) ? plant.commonNames.join("、") : plant.commonNames)}</Text>}
                {plant.scientificName && <Text style={{ color: "#8c8c8c", fontSize: 14, fontStyle: "italic" }}>学名：{plant.scientificName}</Text>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <Space size={[8, 8]} wrap>
                  <Tag color="blue" style={{ fontSize: 13, padding: "2px 10px" }}>{plant.category || "观叶植物"}</Tag>
                  <Tag color={difficultyColors[plant.difficulty] || "default"} style={{ fontSize: 13, padding: "2px 10px" }}>{plant.difficulty || "新手友好"}</Tag>
                  <Tag icon={<CheckCircleOutlined />} color="green" style={{ fontSize: 13, padding: "2px 10px" }}>适合室内养护</Tag>
                </Space>
              </div>
            </Col>
          </Row>
          <Row gutter={32} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Descriptions title={<span style={{ fontSize: 16, fontWeight: 600 }}>📖 植物描述</span>} column={1} bordered size="default" style={{ marginBottom: 0 }}>
                <Descriptions.Item label="描述">
                  <Paragraph style={{ margin: 0, lineHeight: 1.8 }}>
                    {plant.description || `${pname}是一种非常受欢迎的室内观赏植物，因其优雅的株型和易于养护的特点而深受花友喜爱。它不仅能美化环境，还具有净化空气的功能，可以吸收室内有害气体，释放氧气，是您家居装饰的理想选择。${pname}的养护相对简单，即使是新手也能轻松驾驭，只要掌握好浇水、光照和施肥的要点，它就能茁壮成长，为您的生活带来一抹清新的绿色。`}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <Descriptions title={<span style={{ fontSize: 16, fontWeight: 600 }}>🌱 基础养护信息</span>} column={1} bordered size="default">
                <Descriptions.Item label={<span><SunOutlined style={{ color: "#fa8c16" }} /> 光照需求</span>}>{plant.lightNeed || "明亮散射光，避免直射"}</Descriptions.Item>
                <Descriptions.Item label={<span><CloudOutlined style={{ color: "#1890ff" }} /> 浇水频率</span>}>{plant.waterFreq || "夏季2-3天/次，冬季1周/次"}</Descriptions.Item>
                <Descriptions.Item label={<span><EnvironmentOutlined style={{ color: "#52c41a" }} /> 温度范围</span>}>{plant.tempRange || "15°C ~ 28°C"}</Descriptions.Item>
                <Descriptions.Item label={<span><ThunderboltOutlined style={{ color: "#722ed1" }} /> 空气湿度</span>}>{plant.humidity || "50% ~ 70%"}</Descriptions.Item>
                <Descriptions.Item label={<span><AppleOutlined style={{ color: "#eb2f96" }} /> 土壤要求</span>}>{plant.soil || "疏松透气、排水良好的微酸性土壤"}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>
        <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 0 }}>
          <Tabs defaultActiveKey="1" size="large" style={{ padding: "0 24px" }} tabBarStyle={{ borderBottom: "1px solid #f0f0f0", paddingTop: 16 }}>
            <TabPane tab={<span style={{ fontSize: 15, padding: "8px 4px" }}>🌿 养护指南</span>} key="1" style={{ padding: "16px 0 24px 0" }}>
              <Row gutter={[16, 16]}>
                {careGuide.map((item, idx) => {
                  const iconCfg = careGuideIcons[idx] || careGuideIcons[0];
                  return (
                    <Col xs={24} sm={12} md={8} lg={8} key={idx}>
                      <Card
                        size="small"
                        style={{ borderRadius: 8, border: `1px solid ${iconCfg.border}`, background: iconCfg.bg, height: "100%" }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 20, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <span style={{ fontSize: 20, color: iconCfg.color }}>{iconCfg.icon}</span>
                          </div>
                          <Text strong style={{ fontSize: 15, color: "#333" }}>{item.title || iconCfg.key}</Text>
                        </div>
                        <Paragraph style={{ margin: 0, lineHeight: 1.7, color: "#555", fontSize: 13 }}>{item.content}</Paragraph>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </TabPane>
            <TabPane tab={<span style={{ fontSize: 15, padding: "8px 4px" }}>🍂 四季要点</span>} key="2" style={{ padding: "16px 0 24px 0" }}>
              <Row gutter={[16, 16]}>
                {seasonalConfig.map((season, idx) => (
                  <Col xs={24} sm={12} md={12} lg={12} key={idx}>
                    <Card
                      style={{ borderRadius: 10, border: `1px solid ${season.border}`, background: season.bg, height: "100%" }}
                      bodyStyle={{ padding: 20 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 22, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                          <span style={{ fontSize: 22 }}>{season.icon}</span>
                        </div>
                        <div>
                          <Text strong style={{ fontSize: 16, color: "#333", display: "block" }}>{season.title}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>{season.label}</Text>
                        </div>
                      </div>
                      <Paragraph style={{ margin: 0, lineHeight: 1.8, color: "#555", fontSize: 14 }}>{seasonalTips[season.key] || `请根据${season.label}特点合理养护。`}</Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>
            <TabPane tab={<span style={{ fontSize: 15, padding: "8px 4px" }}>❓ 常见问题</span>} key="3" style={{ padding: "16px 0 24px 0" }}>
              <Collapse
                accordion
                bordered={false}
                expandIconPosition="end"
                style={{ background: "#fff" }}
              >
                {faqs.map((faq, idx) => (
                  <Panel
                    key={idx}
                    header={<span style={{ fontSize: 14, fontWeight: 500, padding: "4px 0" }}>Q{idx + 1}. {faq.q}</span>}
                    style={{ borderBottom: "1px solid #f0f0f0", marginBottom: 0, borderRadius: 0 }}
                  >
                    <Paragraph style={{ margin: 0, padding: "8px 0 16px 0", lineHeight: 1.8, color: "#666" }}>
                      A: {faq.a}
                    </Paragraph>
                  </Panel>
                ))}
              </Collapse>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};
export default WikiDetail;

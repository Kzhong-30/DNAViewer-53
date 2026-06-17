const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const mockPlantDatabase = [
  {
    name: '绿萝',
    commonNames: ['黄金葛', '魔鬼藤'],
    scientificName: 'Epipremnum aureum',
    category: '观叶植物',
    confidence: 95,
    description: '绿萝是天南星科麒麟叶属的多年生常绿藤本植物，生命力强，是最常见的室内观叶植物之一。',
    lightRequirement: '散射光',
    waterRequirement: '适量',
    waterFrequency: 5,
    difficulty: '新手友好',
    toxicity: '微毒',
    careGuide: {
      watering: '保持土壤湿润但不积水，夏季可增加浇水频率，冬季减少浇水。',
      lighting: '喜散射光，避免阳光直射，耐阴性强。',
      fertilizing: '生长季节每月施一次稀薄液肥。',
      pruning: '定期修剪过长的藤蔓，促进分枝。',
      propagation: '扦插繁殖，剪取健康茎段插入水中或土中即可生根。',
      pests: '注意防治红蜘蛛和介壳虫。'
    },
    seasonalTips: {
      spring: '春季是生长旺季，可适当增加浇水和施肥。',
      summer: '夏季注意遮阴和增加空气湿度。',
      autumn: '秋季可进行换盆和修剪。',
      winter: '冬季减少浇水，保持室温在10°C以上。'
    }
  },
  {
    name: '多肉（景天科）',
    commonNames: ['肉肉', '多肉植物'],
    scientificName: 'Crassulaceae',
    category: '多肉植物',
    confidence: 88,
    description: '景天科多肉植物种类繁多，叶片肥厚多汁，造型可爱，是最受欢迎的多肉品种之一。',
    lightRequirement: '全日照',
    waterRequirement: '少量',
    waterFrequency: 10,
    difficulty: '新手友好',
    toxicity: '无毒',
    careGuide: {
      watering: '遵循"干透浇透"原则，避免积水导致烂根。',
      lighting: '喜充足阳光，光照不足会导致徒长。',
      fertilizing: '生长季节每月施一次稀薄多肉专用肥。',
      pruning: '可适当摘除底部老叶，保持株型美观。',
      propagation: '叶插或砍头繁殖，叶片平放在土表即可生根。',
      pests: '注意防治介壳虫和根粉蚧。'
    },
    seasonalTips: {
      spring: '春季是生长旺季，可增加浇水和光照。',
      summer: '夏季高温休眠，减少浇水，注意通风遮阴。',
      autumn: '秋季生长期，可适当施肥促进生长。',
      winter: '冬季保暖，减少浇水，保持土壤干燥。'
    }
  },
  {
    name: '发财树',
    commonNames: ['马拉巴栗', '瓜栗'],
    scientificName: 'Pachira aquatica',
    category: '观叶植物',
    confidence: 92,
    description: '发财树是木棉科瓜栗属的常绿乔木，寓意招财进宝，是办公室和家庭常见的绿植。',
    lightRequirement: '半日照',
    waterRequirement: '少量',
    waterFrequency: 7,
    difficulty: '新手友好',
    toxicity: '无毒',
    careGuide: {
      watering: '宁干勿湿，浇水过多容易烂根。',
      lighting: '喜明亮光线，耐阴性较强，避免强光直射。',
      fertilizing: '生长季节每月施一次复合肥。',
      pruning: '可修剪造型，促进侧枝生长。',
      propagation: '扦插繁殖，春季剪取健康枝条扦插。',
      pests: '注意防治红蜘蛛和蚜虫。'
    },
    seasonalTips: {
      spring: '春季换盆最佳时期，可进行修剪造型。',
      summer: '夏季避免强光直射，注意通风。',
      autumn: '秋季适当增加光照，促进植株健壮。',
      winter: '冬季保暖，温度不低于5°C，减少浇水。'
    }
  },
  {
    name: '吊兰',
    commonNames: ['垂盆草', '挂兰'],
    scientificName: 'Chlorophytum comosum',
    category: '观叶植物',
    confidence: 90,
    description: '吊兰是天门冬科吊兰属的多年生草本植物，具有很强的空气净化能力，适合悬挂种植。',
    lightRequirement: '散射光',
    waterRequirement: '适量',
    waterFrequency: 4,
    difficulty: '新手友好',
    toxicity: '无毒',
    careGuide: {
      watering: '保持土壤湿润，夏季多浇水并喷水增湿。',
      lighting: '喜明亮散射光，避免强光直射。',
      fertilizing: '生长季节每两周施一次稀薄液肥。',
      pruning: '及时剪除枯叶和花茎，促进新叶生长。',
      propagation: '分株或剪取匍匐茎上的小植株栽植。',
      pests: '注意防治蚜虫和红蜘蛛。'
    },
    seasonalTips: {
      spring: '春季分株繁殖最佳时期。',
      summer: '夏季注意遮阴和增加空气湿度。',
      autumn: '秋季可进行换盆和修剪。',
      winter: '冬季减少浇水，保持室温不低于5°C。'
    }
  },
  {
    name: '月季花',
    commonNames: ['月月红', '玫瑰'],
    scientificName: 'Rosa chinensis',
    category: '花卉植物',
    confidence: 85,
    description: '月季花是蔷薇科蔷薇属的常绿或半常绿灌木，花期长，花色丰富，是最受欢迎的观赏花卉之一。',
    lightRequirement: '全日照',
    waterRequirement: '充足',
    waterFrequency: 3,
    difficulty: '中等难度',
    toxicity: '无毒',
    careGuide: {
      watering: '生长期保持土壤湿润，避免积水。',
      lighting: '喜充足阳光，每天至少6小时光照。',
      fertilizing: '花期前增加磷钾肥，花后追施复合肥。',
      pruning: '花后及时修剪残花，冬季重剪整形。',
      propagation: '扦插或嫁接繁殖，春秋季扦插成活率高。',
      pests: '注意防治白粉病、黑斑病和蚜虫。'
    },
    seasonalTips: {
      spring: '春季萌发前修剪，施足底肥。',
      summer: '夏季注意浇水和通风，及时防治病虫害。',
      autumn: '秋季是第二个花期，加强水肥管理。',
      winter: '冬季落叶后重剪，北方地区需防寒。'
    }
  },
  {
    name: '君子兰',
    commonNames: ['大花君子兰'],
    scientificName: 'Clivia miniata',
    category: '观叶植物',
    confidence: 87,
    description: '君子兰是石蒜科君子兰属的多年生草本植物，叶片宽厚有光泽，开花艳丽，是高档室内观赏植物。',
    lightRequirement: '散射光',
    waterRequirement: '适量',
    waterFrequency: 7,
    difficulty: '中等难度',
    toxicity: '微毒',
    careGuide: {
      watering: '保持盆土湿润偏干，避免积水烂根。',
      lighting: '喜明亮散射光，避免强光直射。',
      fertilizing: '生长季节每月施一次稀薄液肥，花前增施磷钾肥。',
      pruning: '及时摘除黄叶和残花。',
      propagation: '分株繁殖，春季换盆时进行。',
      pests: '注意防治根腐病和介壳虫。'
    },
    seasonalTips: {
      spring: '春季花后换盆，可进行分株繁殖。',
      summer: '夏季高温休眠，减少浇水，注意通风遮阴。',
      autumn: '秋季恢复生长，增加光照和水肥。',
      winter: '冬季需低温春化才能开花，保持室温10-15°C。'
    }
  },
  {
    name: '仙人掌',
    commonNames: ['仙巴掌', '霸王树'],
    scientificName: 'Opuntia dillenii',
    category: '多肉植物',
    confidence: 93,
    description: '仙人掌是仙人掌科仙人掌属的多年生肉质植物，耐旱性极强，适合新手养殖。',
    lightRequirement: '全日照',
    waterRequirement: '少量',
    waterFrequency: 15,
    difficulty: '新手友好',
    toxicity: '无毒',
    careGuide: {
      watering: '宁干勿湿，冬季完全停止浇水。',
      lighting: '喜充足阳光，光照越足生长越好。',
      fertilizing: '生长季节每月施一次稀薄仙人掌专用肥。',
      pruning: '一般不需修剪，可摘除老弱茎片。',
      propagation: '扦插繁殖，切取健康茎片晾干伤口后插入土中。',
      pests: '注意防治红蜘蛛和介壳虫。'
    },
    seasonalTips: {
      spring: '春季恢复浇水，可进行换盆和扦插。',
      summer: '夏季是生长旺季，可正常浇水和施肥。',
      autumn: '秋季逐渐减少浇水。',
      winter: '冬季完全断水，保持室温不低于5°C。'
    }
  },
  {
    name: '薄荷',
    commonNames: ['野薄荷', '夜息香'],
    scientificName: 'Mentha haplocalyx',
    category: '草本植物',
    confidence: 89,
    description: '薄荷是唇形科薄荷属的多年生草本植物，具有清凉香气，可食用、可药用、可观赏。',
    lightRequirement: '半日照',
    waterRequirement: '充足',
    waterFrequency: 2,
    difficulty: '新手友好',
    toxicity: '无毒',
    careGuide: {
      watering: '喜湿润，保持土壤不干燥。',
      lighting: '喜充足光照，也耐半阴。',
      fertilizing: '生长季节每月施一次氮肥为主的肥料。',
      pruning: '经常采摘嫩梢，促进分枝，防止开花。',
      propagation: '分株或扦插繁殖，极易成活。',
      pests: '注意防治蚜虫和白粉病。'
    },
    seasonalTips: {
      spring: '春季分株或扦插繁殖。',
      summer: '夏季生长旺盛，经常采摘浇水。',
      autumn: '秋季可继续采收，注意防寒。',
      winter: '冬季地上部分枯萎，来年春季重新萌发。'
    }
  }
];

router.post('/identify', auth, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: '请上传照片' });
    }

    const randomIndex = Math.floor(Math.random() * mockPlantDatabase.length);
    const identifiedPlant = mockPlantDatabase[randomIndex];

    const randomConfidence = Math.floor(Math.random() * 15) + 80;

    const alternatives = mockPlantDatabase
      .filter((_, index) => index !== randomIndex)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(plant => ({
        name: plant.name,
        confidence: Math.floor(Math.random() * 20) + 50,
        category: plant.category
      }));

    setTimeout(() => {
      res.json({
        success: true,
        result: {
          ...identifiedPlant,
          confidence: randomConfidence
        },
        alternatives,
        tips: [
          '建议将植物放置在通风良好的位置',
          '新购植物建议先隔离观察一周',
          '浇水前先用手指检查土壤湿度',
          '定期检查叶片背面是否有病虫害'
        ]
      });
    }, 1500);
  } catch (error) {
    console.error('植物识别错误:', error);
    res.status(500).json({ message: '识别失败，请稍后重试' });
  }
});

module.exports = router;

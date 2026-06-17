const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const PlantWiki = require('../models/PlantWiki');

const plantsData = [
  {
    name: '绿萝',
    commonNames: ['魔鬼藤', '黄金葛'],
    scientificName: 'Epipremnum aureum',
    family: '天南星科',
    category: '观叶植物',
    description: '绿萝是常见的室内观叶植物，叶片翠绿有光泽，生命力顽强，能有效净化空气中的甲醛、苯等有害物质，是新手入门的绝佳选择。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '散射光',
    waterRequirement: '适量',
    waterFrequency: 7,
    temperatureRange: { min: 15, max: 28 },
    humidity: '中',
    soilType: '通用营养土',
    fertilizeFrequency: 30,
    pruneFrequency: 90,
    repotFrequency: 365,
    difficulty: '新手友好',
    growthSpeed: '快速',
    toxicity: '微毒',
    careGuide: {
      watering: '保持盆土微湿，夏季3-5天浇一次，冬季7-10天浇一次，避免积水导致烂根。',
      lighting: '喜散射光，可放置在明亮的窗边，避免阳光直射导致叶片发黄。',
      fertilizing: '生长季节每月施一次稀薄的液体复合肥，冬季停止施肥。',
      pruning: '定期修剪过长的枝条，促进分枝，保持株型美观。',
      repotting: '每年春季换盆一次，选用排水良好的土壤。',
      pests: '常见虫害有红蜘蛛和介壳虫，可用肥皂水擦拭或喷洒杀虫剂。',
      propagation: '扦插繁殖容易成活，剪取带气根的枝条插入水中或土中即可。'
    },
    seasonalTips: {
      spring: '春季是生长旺季，增加浇水频率，每月施一次肥，可进行扦插繁殖。',
      summer: '夏季注意遮阴，避免强光暴晒，增加浇水次数，保持空气湿度。',
      autumn: '秋季逐渐减少浇水，减少施肥次数，注意温度变化。',
      winter: '冬季注意保暖，温度不低于10℃，减少浇水，停止施肥。'
    },
    tags: ['净化空气', '好养', '室内植物', '新手推荐'],
    viewCount: 0
  },
  {
    name: '多肉',
    commonNames: ['肉肉', '多肉植物'],
    scientificName: 'Succulent',
    family: '景天科',
    category: '多肉植物',
    description: '多肉植物叶片肥厚多汁，能储存大量水分，造型可爱，品种繁多，是近年来非常流行的观赏植物。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '全日照',
    waterRequirement: '少量',
    waterFrequency: 14,
    temperatureRange: { min: 5, max: 30 },
    humidity: '低',
    soilType: '多肉专用土',
    fertilizeFrequency: 60,
    pruneFrequency: 180,
    repotFrequency: 540,
    difficulty: '新手友好',
    growthSpeed: '缓慢',
    toxicity: '无毒',
    careGuide: {
      watering: '宁干勿湿，盆土完全干透后再浇水，夏季高温和冬季低温时断水。',
      lighting: '喜充足阳光，每天至少4小时光照，光照不足会徒长。',
      fertilizing: '生长季节每2个月施一次稀薄的多肉专用肥。',
      pruning: '及时摘除干枯的老叶，保持通风。',
      repotting: '每1-2年换盆一次，换盆时修剪老根。',
      pests: '常见虫害有介壳虫和根粉蚧，可用酒精擦拭或换土。',
      propagation: '叶插繁殖，将健康叶片平放在土面上即可生根发芽。'
    },
    seasonalTips: {
      spring: '春季是生长旺季，逐渐增加浇水，可进行换盆和叶插繁殖。',
      summer: '夏季高温期休眠，遮阴通风，断水或少量浇水，避免闷热潮湿。',
      autumn: '秋季恢复生长，增加光照和浇水，开始施肥。',
      winter: '冬季注意保暖，温度不低于5℃，断水保持干燥。'
    },
    tags: ['可爱', '耐旱', '懒人植物', '品种多'],
    viewCount: 0
  },
  {
    name: '发财树',
    commonNames: ['马拉巴栗', '瓜栗'],
    scientificName: 'Pachira aquatica',
    family: '锦葵科',
    category: '观叶植物',
    description: '发财树寓意吉祥，树干粗壮，叶片翠绿有光泽，是办公室和家庭常见的风水植物，有招财进宝的美好寓意。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '散射光',
    waterRequirement: '少量',
    waterFrequency: 14,
    temperatureRange: { min: 15, max: 30 },
    humidity: '中',
    soilType: '通用营养土',
    fertilizeFrequency: 30,
    pruneFrequency: 180,
    repotFrequency: 730,
    difficulty: '新手友好',
    growthSpeed: '中等',
    toxicity: '无毒',
    careGuide: {
      watering: '耐旱怕涝，盆土干透再浇，宁干勿湿，避免积水烂根。',
      lighting: '喜散射光，也耐阴，避免阳光直射导致叶片灼伤。',
      fertilizing: '生长季节每月施一次复合肥，促进叶片生长。',
      pruning: '春季可修剪过高的枝条，促进侧枝生长，保持株型。',
      repotting: '每2年换盆一次，换盆时修剪烂根。',
      pests: '常见虫害有红蜘蛛和介壳虫，注意通风预防。',
      propagation: '枝条扦插繁殖，选取健壮枝条插入湿润沙土中。'
    },
    seasonalTips: {
      spring: '春季换盆修剪，增加浇水和施肥。',
      summer: '夏季遮阴，增加浇水频率，保持通风。',
      autumn: '秋季逐渐减少浇水，减少施肥。',
      winter: '冬季保暖，温度不低于10℃，减少浇水，停止施肥。'
    },
    tags: ['风水植物', '好养', '寓意好', '办公室植物'],
    viewCount: 0
  },
  {
    name: '吊兰',
    commonNames: ['挂兰', '钓兰'],
    scientificName: 'Chlorophytum comosum',
    family: '天门冬科',
    category: '观叶植物',
    description: '吊兰叶片细长柔软，会从叶腋抽出匍匐茎，顶端长出小植株，悬挂栽培非常美观，净化空气能力强。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '半日照',
    waterRequirement: '充足',
    waterFrequency: 5,
    temperatureRange: { min: 10, max: 28 },
    humidity: '中',
    soilType: '通用营养土',
    fertilizeFrequency: 30,
    pruneFrequency: 90,
    repotFrequency: 365,
    difficulty: '新手友好',
    growthSpeed: '快速',
    toxicity: '无毒',
    careGuide: {
      watering: '喜湿润，生长期保持盆土湿润，夏季经常向叶面喷水。',
      lighting: '喜半阴环境，避免强光直射，也耐较暗环境。',
      fertilizing: '生长季节每月施1-2次稀薄液肥。',
      pruning: '及时剪除黄叶和过长的匍匐茎，保持美观。',
      repotting: '每年春季换盆，分株繁殖。',
      pests: '病害较少，偶有介壳虫，可用湿布擦除。',
      propagation: '分株或剪下匍匐茎上的小植株直接栽种。'
    },
    seasonalTips: {
      spring: '春季换盆分株，增加浇水和施肥。',
      summer: '夏季遮阴，增加浇水，经常喷雾增湿。',
      autumn: '秋季减少施肥，控制浇水。',
      winter: '冬季保暖，温度不低于5℃，减少浇水。'
    },
    tags: ['净化空气', '悬挂植物', '好养', '新手推荐'],
    viewCount: 0
  },
  {
    name: '月季',
    commonNames: ['月月红', '长春花'],
    scientificName: 'Rosa chinensis',
    family: '蔷薇科',
    category: '花卉植物',
    description: '月季被称为花中皇后，四季开花，花色丰富，花型优美，香气浓郁，是非常受欢迎的观赏花卉。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '全日照',
    waterRequirement: '充足',
    waterFrequency: 3,
    temperatureRange: { min: 5, max: 30 },
    humidity: '中',
    soilType: '腐殖土',
    fertilizeFrequency: 15,
    pruneFrequency: 60,
    repotFrequency: 365,
    difficulty: '中等难度',
    growthSpeed: '中等',
    toxicity: '无毒',
    careGuide: {
      watering: '生长期保持土壤湿润，夏季早晚各浇一次，避免积水。',
      lighting: '喜充足阳光，每天至少6小时光照，光照不足开花少。',
      fertilizing: '喜肥，花期前后每10-15天施一次磷钾肥。',
      pruning: '花后及时修剪残花，冬季重剪促进来年开花。',
      repotting: '每年冬季或早春换盆，修剪老根。',
      pests: '常见病虫害有白粉病、黑斑病、蚜虫、红蜘蛛，定期喷药预防。',
      propagation: '扦插繁殖，春秋季剪取健壮枝条插入沙土中。'
    },
    seasonalTips: {
      spring: '春季修剪施肥，促进新芽萌发，开始开花。',
      summer: '夏季遮阴降温，增加浇水，注意防治病虫害。',
      autumn: '秋季继续开花，花后修剪，施秋肥。',
      winter: '冬季落叶后重剪，施冬肥，减少浇水。'
    },
    tags: ['开花植物', '芳香', '花中皇后', '花色丰富'],
    viewCount: 0
  },
  {
    name: '君子兰',
    commonNames: ['大花君子兰', '剑叶石蒜'],
    scientificName: 'Clivia miniata',
    family: '石蒜科',
    category: '花卉植物',
    description: '君子兰叶片宽厚浓绿，排列整齐，花大色艳，花期长，是高贵典雅的观赏植物，寓意君子之风。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '散射光',
    waterRequirement: '适量',
    waterFrequency: 10,
    temperatureRange: { min: 10, max: 25 },
    humidity: '中',
    soilType: '腐叶土',
    fertilizeFrequency: 30,
    pruneFrequency: 180,
    repotFrequency: 730,
    difficulty: '中等难度',
    growthSpeed: '缓慢',
    toxicity: '微毒',
    careGuide: {
      watering: '保持盆土微湿，避免积水烂根，浇水时避免浇入心叶。',
      lighting: '喜散射光，避免强光直射，夏季遮阴，冬季增加光照。',
      fertilizing: '生长期每月施一次稀薄液肥，花期前后施磷钾肥。',
      pruning: '及时摘除黄叶和残花，保持株型整洁。',
      repotting: '每2年换盆一次，花后或秋季进行。',
      pests: '常见病害有根腐病，虫害有介壳虫，注意通风和排水。',
      propagation: '分株繁殖，春季换盆时将母株旁的小苗分开栽种。'
    },
    seasonalTips: {
      spring: '春季花期后换盆分株，施基肥。',
      summer: '夏季遮阴降温，控制浇水，停止施肥。',
      autumn: '秋季增加光照，恢复施肥，促进花芽分化。',
      winter: '冬季低温春化，温度保持5-10℃一个月，然后升温促进开花。'
    },
    tags: ['高贵典雅', '观花观叶', '寓意好', '花期长'],
    viewCount: 0
  },
  {
    name: '仙人掌',
    commonNames: ['仙巴掌', '霸王树'],
    scientificName: 'Opuntia dillenii',
    family: '仙人掌科',
    category: '多肉植物',
    description: '仙人掌形态奇特，全身带刺，非常耐旱，生命力极强，有的品种还会开出美丽的花朵。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '全日照',
    waterRequirement: '少量',
    waterFrequency: 21,
    temperatureRange: { min: 5, max: 35 },
    humidity: '低',
    soilType: '仙人掌专用土',
    fertilizeFrequency: 90,
    pruneFrequency: 365,
    repotFrequency: 730,
    difficulty: '新手友好',
    growthSpeed: '缓慢',
    toxicity: '无毒',
    careGuide: {
      watering: '极度耐旱，盆土完全干透后再浇，冬季断水。',
      lighting: '喜充足阳光，越晒长势越好，开花越多。',
      fertilizing: '每季度施一次仙人掌专用肥，生长季节可适当增加。',
      pruning: '很少需要修剪，如植株过大可切取分枝繁殖。',
      repotting: '每2-3年换盆一次，操作时注意避免被刺扎伤。',
      pests: '虫害较少，偶有介壳虫和根粉蚧。',
      propagation: '切取健壮的茎节，晾干伤口后插入沙土中即可生根。'
    },
    seasonalTips: {
      spring: '春季恢复生长，逐渐增加浇水，开始施肥。',
      summer: '夏季是生长旺季，充足光照，正常浇水，注意通风。',
      autumn: '秋季减少浇水，准备越冬。',
      winter: '冬季断水，保持干燥，温度不低于0℃即可安全越冬。'
    },
    tags: ['超级耐旱', '懒人植物', '形态奇特', '开花惊艳'],
    viewCount: 0
  },
  {
    name: '薄荷',
    commonNames: ['银丹草', '薄荷草'],
    scientificName: 'Mentha haplocalyx',
    family: '唇形科',
    category: '草本植物',
    description: '薄荷气味清香，叶片翠绿，生长迅速，既可观赏又可食用泡茶，还能驱蚊驱虫，是非常实用的家庭植物。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '半日照',
    waterRequirement: '充足',
    waterFrequency: 2,
    temperatureRange: { min: 10, max: 30 },
    humidity: '高',
    soilType: '通用营养土',
    fertilizeFrequency: 30,
    pruneFrequency: 30,
    repotFrequency: 365,
    difficulty: '新手友好',
    growthSpeed: '快速',
    toxicity: '无毒',
    careGuide: {
      watering: '喜湿润，怕干旱，经常保持土壤湿润，夏季每天浇水。',
      lighting: '喜半阴到全日照，光照充足香气更浓。',
      fertilizing: '生长期每月施一次氮肥，促进叶片生长。',
      pruning: '经常修剪打顶，促进分枝，越剪越茂盛。',
      repotting: '每年换盆或分株，薄荷生长快容易爆盆。',
      pests: '虫害较少，偶有蚜虫，可用肥皂水喷洒。',
      propagation: '扦插极易成活，剪取枝条插入水中或土中几天就生根。'
    },
    seasonalTips: {
      spring: '春季分株换盆，开始旺盛生长。',
      summer: '夏季勤浇水勤修剪，可经常采收叶片使用。',
      autumn: '秋季继续生长，减少施肥。',
      winter: '冬季地上部分枯萎，根际可安全越冬，来年重新萌发。'
    },
    tags: ['食用香草', '驱蚊', '清香', '好养易活'],
    viewCount: 0
  },
  {
    name: '龟背竹',
    commonNames: ['蓬莱蕉', '铁丝兰'],
    scientificName: 'Monstera deliciosa',
    family: '天南星科',
    category: '观叶植物',
    description: '龟背竹叶片巨大，有独特的孔洞和裂纹，形似龟背，是非常流行的网红植物，能营造热带风情。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '散射光',
    waterRequirement: '适量',
    waterFrequency: 7,
    temperatureRange: { min: 15, max: 30 },
    humidity: '高',
    soilType: '通用营养土',
    fertilizeFrequency: 30,
    pruneFrequency: 180,
    repotFrequency: 540,
    difficulty: '中等难度',
    growthSpeed: '中等',
    toxicity: '微毒',
    careGuide: {
      watering: '保持盆土微湿，避免积水，经常向叶面喷水增湿。',
      lighting: '喜明亮散射光，避免强光直射，也耐较阴环境。',
      fertilizing: '生长季节每月施一次复合肥，促进叶片长大。',
      pruning: '修剪过密或发黄的老叶，设立支柱支撑植株。',
      repotting: '每1-2年换盆，植株较大时可只换表层土。',
      pests: '常见虫害有介壳虫和红蜘蛛，注意通风和增加湿度。',
      propagation: '扦插繁殖，剪取带气根的茎段插入土中。'
    },
    seasonalTips: {
      spring: '春季换盆，设立支柱，开始施肥。',
      summer: '夏季遮阴，增加浇水和喷雾，保持高湿度。',
      autumn: '秋季减少浇水，减少施肥。',
      winter: '冬季保暖，温度不低于10℃，减少浇水，停止施肥。'
    },
    tags: ['网红植物', '热带风情', '大叶片', '室内装饰'],
    viewCount: 0
  },
  {
    name: '芦荟',
    commonNames: ['库拉索芦荟', '真芦荟'],
    scientificName: 'Aloe vera',
    family: '百合科',
    category: '多肉植物',
    description: '芦荟叶片肥厚多汁，内含丰富的芦荟胶，具有美容、药用、食用等多种价值，也是净化空气的能手。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '全日照',
    waterRequirement: '少量',
    waterFrequency: 14,
    temperatureRange: { min: 5, max: 30 },
    humidity: '低',
    soilType: '多肉专用土',
    fertilizeFrequency: 60,
    pruneFrequency: 180,
    repotFrequency: 730,
    difficulty: '新手友好',
    growthSpeed: '中等',
    toxicity: '微毒',
    careGuide: {
      watering: '耐旱怕涝，盆土干透再浇，宁干勿湿，冬季断水。',
      lighting: '喜充足阳光，光照充足叶片肥厚饱满。',
      fertilizing: '每2个月施一次稀薄液肥，生长期可适当增加。',
      pruning: '采收下部成熟的叶片，促进顶部继续生长。',
      repotting: '每2年换盆，同时分株繁殖。',
      pests: '病虫害较少，偶有根腐病和介壳虫。',
      propagation: '分株繁殖，将母株旁的小苗分离栽种。'
    },
    seasonalTips: {
      spring: '春季换盆分株，开始浇水施肥。',
      summer: '夏季充足光照，正常浇水，注意通风。',
      autumn: '秋季减少浇水，准备越冬。',
      winter: '冬季保暖，温度不低于5℃，断水保持干燥。'
    },
    tags: ['多用途', '美容护肤', '净化空气', '药用价值'],
    viewCount: 0
  },
  {
    name: '茉莉花',
    commonNames: ['茉莉', '香魂'],
    scientificName: 'Jasminum sambac',
    family: '木犀科',
    category: '花卉植物',
    description: '茉莉花洁白如玉，香气浓郁，花期长，是著名的香料植物，花朵可用来泡茶，深受人们喜爱。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '全日照',
    waterRequirement: '充足',
    waterFrequency: 3,
    temperatureRange: { min: 10, max: 35 },
    humidity: '高',
    soilType: '腐殖土',
    fertilizeFrequency: 15,
    pruneFrequency: 60,
    repotFrequency: 730,
    difficulty: '中等难度',
    growthSpeed: '中等',
    toxicity: '无毒',
    careGuide: {
      watering: '喜湿润，生长期保持盆土湿润，夏季早晚浇水。',
      lighting: '喜充足阳光，越晒开花越多，香气越浓。',
      fertilizing: '喜肥，花期前后每10天施一次磷钾肥。',
      pruning: '花后及时修剪，促进新枝萌发，来年开花更多。',
      repotting: '每2年换盆一次，春季进行。',
      pests: '常见虫害有红蜘蛛和介壳虫，病害有白粉病。',
      propagation: '扦插繁殖，剪取健壮枝条插入沙土中。'
    },
    seasonalTips: {
      spring: '春季修剪施肥，促进新芽萌发。',
      summer: '夏季是盛花期，充足水肥，采收花朵。',
      autumn: '秋季继续开花，花后修剪，减少施肥。',
      winter: '冬季保暖，温度不低于10℃，减少浇水，停止施肥。'
    },
    tags: ['芳香花卉', '可泡茶', '洁白美丽', '花期长'],
    viewCount: 0
  },
  {
    name: '铜钱草',
    commonNames: ['积雪草', '香菇草'],
    scientificName: 'Hydrocotyle vulgaris',
    family: '伞形科',
    category: '水生植物',
    description: '铜钱草叶片圆润形似铜钱，翠绿可爱，寓意财源滚滚，可水培也可土培，生长迅速极易爆盆。',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600'],
    lightRequirement: '半日照',
    waterRequirement: '充足',
    waterFrequency: 2,
    temperatureRange: { min: 10, max: 30 },
    humidity: '高',
    soilType: '水培或保水土',
    fertilizeFrequency: 30,
    pruneFrequency: 60,
    repotFrequency: 365,
    difficulty: '新手友好',
    growthSpeed: '快速',
    toxicity: '无毒',
    careGuide: {
      watering: '水培每周换水，土培保持土壤湿润，绝对不能缺水。',
      lighting: '喜半阴到全日照，避免强光暴晒，光照不足会徒长。',
      fertilizing: '水培每月滴几滴营养液，土培每月施一次稀薄液肥。',
      pruning: '定期修剪过密的叶片，保持通风美观。',
      repotting: '每年分株或换盆，铜钱草容易爆盆。',
      pests: '病虫害较少，偶有黄叶，及时剪除即可。',
      propagation: '分株或枝条扦插，极易成活。'
    },
    seasonalTips: {
      spring: '春季分株换盆，开始旺盛生长。',
      summer: '夏季勤换水或勤浇水，遮阴避免暴晒。',
      autumn: '秋季继续生长，减少施肥。',
      winter: '冬季保暖，温度不低于5℃，减少换水或浇水频率。'
    },
    tags: ['寓意招财', '水培植物', '极易成活', '可爱圆润'],
    viewCount: 0
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB 连接成功');

    await User.deleteMany({});
    await PlantWiki.deleteMany({});

    const hashedPassword = await bcrypt.hash('garden123456', 10);
    const user = new User({
      email: 'gardener@example.com',
      password: 'garden123456',
      username: '园丁小王',
      avatar: ''
    });
    await user.save();
    console.log(`用户 ${user.username} 已创建`);

    const plants = await PlantWiki.insertMany(plantsData);
    console.log(`插入 ${plants.length} 条植物百科`);

    console.log('种子数据填充完成');
    process.exit(0);
  } catch (error) {
    console.error('种子数据填充失败:', error);
    process.exit(1);
  }
}

seed();

/**
 * Mock — 服务目录模块（catalog-service）
 *
 * 对齐 API v1.0：
 * - GET /api/v1/categories            → 服务分类列表
 * - GET /api/v1/items?categoryId=&page=&size=  → 服务列表（分页）
 * - GET /api/v1/items/{id}            → 服务详情
 * - GET /api/v1/items?keyword=        → 搜索
 *
 * 核心变化：每个服务挂多个规格(specs)，价格在规格上
 */
import Mock from 'mockjs'

// ========== 服务分类 ==========
const categories = [
  { categoryId: 1, name: '专业护理', icon: 'https://cdn.nursing.com/icons/category/nurse.png', sortOrder: 1, status: 1 },
  { categoryId: 2, name: '康复理疗', icon: 'https://cdn.nursing.com/icons/category/rehab.png', sortOrder: 2, status: 1 },
  { categoryId: 3, name: '中医养生', icon: 'https://cdn.nursing.com/icons/category/tcm.png', sortOrder: 3, status: 1 },
  { categoryId: 4, name: '专项护理', icon: 'https://cdn.nursing.com/icons/category/special.png', sortOrder: 4, status: 1 },
  { categoryId: 5, name: '心理慰藉', icon: 'https://cdn.nursing.com/icons/category/psych.png', sortOrder: 5, status: 1 },
]

// 辅助：给服务生成规格
function makeSpecs(basePrice, itemId) {
  const specId = (id) => itemId * 100 + id
  return [
    { specId: specId(1), name: '单次服务', price: basePrice, originalPrice: Math.round(basePrice * 1.2), duration: 60, status: 1 },
    { specId: specId(2), name: '3次套餐', price: Math.round(basePrice * 2.7), originalPrice: Math.round(basePrice * 3.2), duration: 60, status: 1 },
    { specId: specId(3), name: '5次套餐', price: Math.round(basePrice * 4.3), originalPrice: Math.round(basePrice * 5.2), duration: 60, status: 1 },
  ]
}

// ========== 服务项目 ==========
const serviceItems = [
  {
    itemId: 101, categoryId: 1, categoryName: '专业护理',
    name: '上门输液护理',
    description: '由持证执业护士上门，为您提供专业的**静脉输液护理**服务。\n\n### 服务流程\n1. 核对医嘱与药品\n2. 评估患者状况\n3. 规范输液操作\n4. 观察反应并记录\n\n### 适用人群\n需长期或临时输液的患者',
    coverImage: 'https://cdn.nursing.com/items/101.jpg',
    images: ['https://cdn.nursing.com/items/101-1.jpg', 'https://cdn.nursing.com/items/101-2.jpg'],
    status: 1, sortOrder: 1,
  },
  {
    itemId: 102, categoryId: 1, categoryName: '专业护理',
    name: '压疮护理',
    description: '针对长期卧床老人的**压疮预防与护理**，包括定期翻身、皮肤清洁、敷药换药。\n\n### 服务内容\n- 压疮风险评估\n- 创面清洁与换药\n- 减压措施指导\n- 营养支持建议',
    coverImage: 'https://cdn.nursing.com/items/102.jpg',
    images: ['https://cdn.nursing.com/items/102-1.jpg'],
    status: 1, sortOrder: 2,
  },
  {
    itemId: 103, categoryId: 1, categoryName: '专业护理',
    name: '日常起居照料',
    description: '协助老人完成起床、洗漱、穿衣、饮食等日常生活起居，确保生活舒适整洁。',
    coverImage: 'https://cdn.nursing.com/items/103.jpg',
    images: [],
    status: 1, sortOrder: 3,
  },
  {
    itemId: 201, categoryId: 2, categoryName: '康复理疗',
    name: '康复运动指导',
    description: '专业康复师根据老人身体状况制定运动方案，一对一指导康复训练。',
    coverImage: 'https://cdn.nursing.com/items/201.jpg',
    images: ['https://cdn.nursing.com/items/201-1.jpg', 'https://cdn.nursing.com/items/201-2.jpg'],
    status: 1, sortOrder: 1,
  },
  {
    itemId: 202, categoryId: 2, categoryName: '康复理疗',
    name: '术后康复护理',
    description: '针对术后恢复期老人的全方位护理，包括切口护理、功能锻炼、营养指导。',
    coverImage: 'https://cdn.nursing.com/items/202.jpg',
    images: [],
    status: 1, sortOrder: 2,
  },
  {
    itemId: 203, categoryId: 2, categoryName: '康复理疗',
    name: '推拿按摩',
    description: '专业推拿师上门提供全身或局部推拿按摩，缓解肌肉酸痛、改善血液循环。',
    coverImage: 'https://cdn.nursing.com/items/203.jpg',
    images: [],
    status: 1, sortOrder: 3,
  },
  {
    itemId: 301, categoryId: 3, categoryName: '中医养生',
    name: '艾灸调理',
    description: '传统艾灸疗法，温经通络，调理脏腑，适用于老年人常见慢性病辅助治疗。',
    coverImage: 'https://cdn.nursing.com/items/301.jpg',
    images: [],
    status: 1, sortOrder: 1,
  },
  {
    itemId: 302, categoryId: 3, categoryName: '中医养生',
    name: '拔罐刮痧',
    description: '中医传统疗法拔罐与刮痧，祛风散寒、活血通络，缓解各种酸痛不适。',
    coverImage: 'https://cdn.nursing.com/items/302.jpg',
    images: [],
    status: 1, sortOrder: 2,
  },
  {
    itemId: 401, categoryId: 4, categoryName: '专项护理',
    name: '静脉采血',
    description: '专业护士上门进行静脉采血，规范操作、安全无菌，免去老人往返医院奔波。',
    coverImage: 'https://cdn.nursing.com/items/401.jpg',
    images: [],
    status: 1, sortOrder: 1,
  },
  {
    itemId: 402, categoryId: 4, categoryName: '专项护理',
    name: 'PICC维护',
    description: '专业护士对PICC置管进行定期维护护理，包括冲管、更换敷料、观察评估。',
    coverImage: 'https://cdn.nursing.com/items/402.jpg',
    images: [],
    status: 1, sortOrder: 2,
  },
  {
    itemId: 403, categoryId: 4, categoryName: '专项护理',
    name: '鼻饲护理',
    description: '为需要鼻饲的老人提供专业鼻饲操作及管道维护，确保营养安全摄入。',
    coverImage: 'https://cdn.nursing.com/items/403.jpg',
    images: [],
    status: 1, sortOrder: 3,
  },
  {
    itemId: 501, categoryId: 5, categoryName: '心理慰藉',
    name: '心理陪伴聊天',
    description: '专业心理咨询师上门陪伴聊天，缓解老人孤独感、焦虑情绪，提供心理支持。',
    coverImage: 'https://cdn.nursing.com/items/501.jpg',
    images: [],
    status: 1, sortOrder: 1,
  },
]

// 基础价格表（itemId → 最低单价）
const basePrices = {
  101: 150, 102: 180, 103: 120,
  201: 220, 202: 300, 203: 168,
  301: 128, 302: 98,
  401: 80,  402: 260, 403: 160,
  501: 150,
}

// 为每个服务生成 specs 和 minPrice
serviceItems.forEach((item) => {
  const bp = basePrices[item.itemId] || 150
  item.specs = makeSpecs(bp, item.itemId)
  item.minPrice = Math.min(...item.specs.map((s) => s.price))
  item.createTime = '2026-07-01T10:00:00+08:00'
})

export function getMockServiceItem(itemId) {
  return serviceItems.find((item) => item.itemId === Number(itemId) && item.status === 1) || null
}

export function getMockServiceSpec(itemId, specId) {
  const item = getMockServiceItem(itemId)
  return item?.specs.find((spec) => spec.specId === Number(specId) && spec.status === 1) || null
}

// ========== 工具函数 ==========
function getQueryParam(url, param) {
  const regex = new RegExp(`[?&]${param}=([^&]*)`)
  const match = url.match(regex)
  return match ? decodeURIComponent(match[1]) : null
}

/** 构建服务列表项（含 minPrice 和第一个规格） */
function buildListItem(item) {
  return {
    id: item.itemId,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    name: item.name,
    description: item.description,
    coverImage: item.coverImage,
    sortOrder: item.sortOrder,
    status: item.status,
    minPrice: item.minPrice,
    specs: item.specs.filter((s) => s.status === 1).map((spec) => ({
      ...spec,
      id: spec.specId,
      serviceItemId: item.itemId,
      specId: undefined,
    })),
  }
}

/** 构建服务详情 */
function buildDetail(item) {
  return {
    id: item.itemId,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    name: item.name,
    description: item.description,
    coverImage: item.coverImage,
    images: item.images,
    sortOrder: item.sortOrder,
    status: item.status,
    specs: item.specs.filter((s) => s.status === 1).map((spec) => ({
      ...spec,
      id: spec.specId,
      serviceItemId: item.itemId,
      specId: undefined,
    })),
    minPrice: item.minPrice,
    createTime: item.createTime,
  }
}

// ========== 接口 Mock ==========

// 1. 服务分类列表
Mock.mock(/\/api\/v1\/categories$/, 'get', () => {
  return {
    code: 0,
    message: 'success',
    data: categories.filter((c) => c.status === 1).map((category) => ({
      ...category,
      parentId: 0,
    })),
  }
})

// 2. 服务项目列表 + 搜索（同一端点 /api/v1/items，通过参数区分）
Mock.mock(/\/api\/v1\/items(\?|$)/, 'get', (options) => {
  const url = options.url
  const categoryId = getQueryParam(url, 'categoryId')
  const keyword = getQueryParam(url, 'keyword')
  const cursor = getQueryParam(url, 'cursor')
  const size = getQueryParam(url, 'size') || '20'

  let list = serviceItems.filter((s) => s.status === 1)

  // 分类筛选
  if (categoryId) {
    const catId = parseInt(categoryId)
    // 检查分类是否存在
    if (!categories.find((c) => c.categoryId === catId)) {
      return { code: 1005, message: '分类不存在', data: null }
    }
    list = list.filter((s) => s.categoryId === catId)
  }

  // 关键词搜索
  if (keyword) {
    if (!keyword.trim()) {
      return { code: 1000, message: '关键词不能为空', data: null }
    }
    const kw = keyword.toLowerCase()
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(kw) ||
        (s.description && s.description.toLowerCase().includes(kw))
    )
  }

  // 按 sortOrder 排序
  list.sort((a, b) => a.sortOrder - b.sortOrder)

  const offset = cursor?.startsWith('cursor_') ? Number(cursor.slice(7)) || 0 : 0
  const pageSize = Math.min(parseInt(size) || 20, 50)
  const pageList = list.slice(offset, offset + pageSize).map(buildListItem)
  const nextOffset = offset + pageList.length
  const hasNext = nextOffset < list.length

  return {
    code: 0,
    message: 'success',
    data: {
      list: pageList,
      size: pageSize,
      hasNext,
      nextCursor: hasNext ? `cursor_${nextOffset}` : null,
    },
  }
})

// 3. 服务详情（需要精确匹配 /api/v1/items/{id}，不跟列表/搜索冲突）
Mock.mock(/\/api\/v1\/items\/\d+$/, 'get', (options) => {
  const idMatch = options.url.match(/\/api\/v1\/items\/(\d+)/)
  const itemId = idMatch ? parseInt(idMatch[1]) : null

  if (!itemId) {
    return { code: 1000, message: '参数错误', data: null }
  }

  const item = serviceItems.find((s) => s.itemId === itemId && s.status === 1)
  if (!item) {
    return { code: 1005, message: '服务项目不存在', data: null }
  }

  return {
    code: 0,
    message: 'success',
    data: buildDetail(item),
  }
})

console.log('[Mock] 服务目录模块已加载 (catalog-service v1.0)')

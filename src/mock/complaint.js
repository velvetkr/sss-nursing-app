/**
 * Mock — 投诉模块（feedback-service）
 *
 * 对齐 API v1.0：
 * - POST /api/v1/complaints          → 提交投诉
 * - GET  /api/v1/complaints          → 投诉列表
 * - GET  /api/v1/complaints/{id}/tracks → 投诉处理记录
 */
import Mock from 'mockjs'

const Random = Mock.Random

// ========== 投诉类型 ==========
const COMPLAINT_TYPES = {
  1: '服务质量',
  2: '服务态度',
  3: '乱收费',
  4: '其他',
}

const COMPLAINT_STATUS = {
  0: '待处理',
  1: '处理中',
  2: '已处理',
  3: '已关闭',
}

// ========== 模拟数据 ==========
const complaints = [
  {
    complaintId: 40001,
    orderId: 20000,
    userId: 10001,
    type: 1,
    typeText: '服务质量',
    status: 2,
    statusText: '已处理',
    content: '护士上门时间比预约晚了将近一小时，而且操作不太规范。',
    images: [],
    createTime: '2026-07-04T14:00:00+08:00',
    tracks: [
      { trackId: 1, operator: '客服小王', content: '已收到投诉，正在核实情况', createTime: '2026-07-04T14:30:00+08:00' },
      { trackId: 2, operator: '客服小王', content: '已联系护士核实，确认迟到属实，向您致歉。已安排补偿方案', createTime: '2026-07-04T16:00:00+08:00' },
    ],
  },
  {
    complaintId: 40002,
    orderId: 20000,
    userId: 10001,
    type: 3,
    typeText: '乱收费',
    status: 1,
    statusText: '处理中',
    content: '预约时说好150元一次，但上门后要求额外收取材料费，未提前告知。',
    images: [],
    createTime: '2026-07-06T10:00:00+08:00',
    tracks: [
      { trackId: 1, operator: '客服小李', content: '投诉已受理，正在核实收费明细', createTime: '2026-07-06T10:30:00+08:00' },
    ],
  },
]

let nextComplaintId = 40003
let nextTrackId = 3
const submittedKeys = new Set() // 幂等键集合

// ========== 工具 ==========
function getQueryParam(url, param) {
  const regex = new RegExp(`[?&]${param}=([^&]*)`)
  const match = url.match(regex)
  return match ? decodeURIComponent(match[1]) : null
}

// ========== 接口 Mock ==========

// 1. 提交投诉
Mock.mock(/\/api\/v1\/complaints$/, 'post', (options) => {
  const body = JSON.parse(options.body)

  if (!body.orderId || !body.type) {
    return { code: 1000, message: '订单ID和投诉类型为必填', data: null }
  }

  // 幂等校验（从 Header 获取，简化处理）
  const idempotentKey = body.orderId + '_' + body.type
  if (submittedKeys.has(idempotentKey)) {
    return { code: 1006, message: '请勿重复提交投诉', data: null }
  }
  submittedKeys.add(idempotentKey)

  const complaintId = nextComplaintId++
  complaints.unshift({
    complaintId,
    orderId: body.orderId,
    userId: 10001,
    type: body.type,
    typeText: COMPLAINT_TYPES[body.type] || '其他',
    status: 0,
    statusText: '待处理',
    content: body.content || '',
    images: body.images || [],
    createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    tracks: [],
  })

  console.log(`[Mock] 投诉已提交: complaintId=${complaintId}`)

  return {
    code: 0,
    message: '投诉提交成功，我们将在24小时内处理',
    data: { complaintId },
  }
})

// 2. 投诉列表
Mock.mock(/\/api\/v1\/complaints\?/, 'get', (options) => {
  const url = options.url
  const page = parseInt(getQueryParam(url, 'page') || '1')
  const size = Math.min(parseInt(getQueryParam(url, 'size') || '20'), 50)

  const list = [...complaints].sort(
    (a, b) => new Date(b.createTime) - new Date(a.createTime)
  )

  const start = (page - 1) * size
  const paged = list.slice(start, start + size).map((c) => ({
    complaintId: c.complaintId,
    type: c.type,
    typeText: c.typeText,
    status: c.status,
    statusText: c.statusText,
    content: c.content,
    createTime: c.createTime,
  }))

  return {
    code: 0,
    message: 'success',
    data: { list: paged, total: list.length, page, size },
  }
})

// 3. 投诉处理记录
Mock.mock(/\/api\/v1\/complaints\/\d+\/tracks/, 'get', (options) => {
  const idMatch = options.url.match(/\/api\/v1\/complaints\/(\d+)\/tracks/)
  const complaintId = idMatch ? parseInt(idMatch[1]) : null
  const complaint = complaints.find((c) => c.complaintId === complaintId)

  if (!complaint) {
    return { code: 1005, message: '投诉记录不存在', data: null }
  }

  return {
    code: 0,
    message: 'success',
    data: {
      complaintId: complaint.complaintId,
      status: complaint.status,
      statusText: COMPLAINT_STATUS[complaint.status] || '未知',
      tracks: complaint.tracks,
    },
  }
})

console.log('[Mock] 投诉模块已加载 (feedback-service / complaints)')

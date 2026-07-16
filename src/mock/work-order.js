/**
 * Mock — 护理工作单模块（work-order-service）
 *
 * 对齐 API v1.0：
 * - 任务列表 /api/v1/work-orders
 * - 今日任务 /api/v1/work-orders/today
 * - 任务详情 /api/v1/work-orders/:assignmentId
 * - 接受派单 /api/v1/work-orders/:assignmentId/accept
 * - 拒绝派单 /api/v1/work-orders/:assignmentId/reject
 * - 确认出发 /api/v1/work-orders/:assignmentId/depart
 * - 签到 /api/v1/work-orders/:assignmentId/checkin
 * - 开始服务 /api/v1/work-orders/:assignmentId/start
 * - 结束服务 /api/v1/work-orders/:assignmentId/finish
 */
import Mock from 'mockjs'

const Random = Mock.Random

// ========== 模拟工作单数据 ==========
const workOrders = new Map()

// 预设测试订单数据
const testOrders = [
  {
    assignmentId: 60001,
    orderId: 30001,
    orderNo: 'ORD202607150001',
    merchantId: 20001,
    merchantName: '温馨护理中心',
    caregiverId: 50002,
    status: 'WAITING_ACCEPT',
    serviceItem: '老人日常护理',
    serviceSpec: '2小时/次',
    serviceDate: '2026-07-15',
    serviceTimeSlot: 'MORNING',
    serviceAddress: '北京市朝阳区建国路88号',
    serviceAddressDetail: '阳光小区3号楼501室',
    contactName: '王先生',
    contactPhone: '13900139000',
    lat: 39.9087,
    lng: 116.4665,
    servicePrice: 18000,
    assignedAt: '2026-07-15T08:00:00+08:00',
    acceptDeadline: '2026-07-15T08:10:00+08:00',
    rejectReason: null,
    serviceRecord: null,
    createTime: '2026-07-15T07:50:00+08:00',
  },
  {
    assignmentId: 60002,
    orderId: 30002,
    orderNo: 'ORD202607150002',
    merchantId: 20001,
    merchantName: '温馨护理中心',
    caregiverId: 50002,
    status: 'DEPARTED',
    serviceItem: '康复训练',
    serviceSpec: '1.5小时/次',
    serviceDate: '2026-07-15',
    serviceTimeSlot: 'AFTERNOON',
    serviceAddress: '北京市海淀区中关村大街1号',
    serviceAddressDetail: '科技大厦1201室',
    contactName: '李女士',
    contactPhone: '13900139001',
    lat: 39.9834,
    lng: 116.3078,
    servicePrice: 22000,
    assignedAt: '2026-07-15T09:00:00+08:00',
    acceptDeadline: '2026-07-15T09:10:00+08:00',
    departedAt: '2026-07-15T10:30:00+08:00',
    rejectReason: null,
    serviceRecord: null,
    createTime: '2026-07-15T08:30:00+08:00',
  },
  {
    assignmentId: 60003,
    orderId: 30003,
    orderNo: 'ORD202607150003',
    merchantId: 20001,
    merchantName: '温馨护理中心',
    caregiverId: 50002,
    status: 'IN_SERVICE',
    serviceItem: '伤口护理',
    serviceSpec: '1小时/次',
    serviceDate: '2026-07-15',
    serviceTimeSlot: 'EVENING',
    serviceAddress: '北京市东城区东直门外大街',
    serviceAddressDetail: '东方花园小区8号楼203室',
    contactName: '张先生',
    contactPhone: '13900139002',
    lat: 39.9456,
    lng: 116.4321,
    servicePrice: 25000,
    assignedAt: '2026-07-15T11:00:00+08:00',
    acceptDeadline: '2026-07-15T11:10:00+08:00',
    departedAt: '2026-07-15T13:00:00+08:00',
    arrivedAt: '2026-07-15T13:45:00+08:00',
    serviceStartedAt: '2026-07-15T14:00:00+08:00',
    rejectReason: null,
    serviceRecord: null,
    createTime: '2026-07-15T10:30:00+08:00',
  },
]

testOrders.forEach(order => workOrders.set(order.assignmentId, order))

// ========== 1. 获取任务列表 ==========
Mock.mock(/\/api\/v1\/work-orders(\?|$)/, 'get', (options) => {
  console.log(`[Mock] 获取任务列表`)

  const url = options.url
  const params = new URLSearchParams(url.split('?')[1] || '')
  const status = params.get('status')
  const page = parseInt(params.get('page') || '1')
  const size = parseInt(params.get('size') || '20')

  let filteredOrders = Array.from(workOrders.values())
  if (status) {
    filteredOrders = filteredOrders.filter(o => o.status === status)
  }

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredOrders,
      total: filteredOrders.length,
      page,
      size,
    },
  }
})

// ========== 2. 获取今日任务 ==========
Mock.mock(/\/api\/v1\/work-orders\/today/, 'get', () => {
  console.log(`[Mock] 获取今日任务`)

  const today = new Date().toISOString().split('T')[0]
  const todayOrders = Array.from(workOrders.values()).filter(
    o => o.serviceDate === today || o.serviceDate === '2026-07-15'
  )

  return {
    code: 0,
    message: 'success',
    data: {
      list: todayOrders,
    },
  }
})

// ========== 3. 获取任务详情 ==========
Mock.mock(/\/api\/v1\/work-orders\/\d+$/, 'get', (options) => {
  const assignmentId = parseInt(options.url.match(/\/api\/v1\/work-orders\/(\d+)/)[1])
  console.log(`[Mock] 获取任务详情 → 派单ID: ${assignmentId}`)

  const order = workOrders.get(assignmentId)
  if (!order) {
    return { code: 2004, message: '派单不存在', data: null }
  }

  return {
    code: 0,
    message: 'success',
    data: order,
  }
})

// ========== 4. 接受派单 ==========
Mock.mock(/\/api\/v1\/work-orders\/\d+\/accept/, 'post', (options) => {
  const assignmentId = parseInt(options.url.match(/\/api\/v1\/work-orders\/(\d+)/)[1])
  console.log(`[Mock] 接受派单 → 派单ID: ${assignmentId}`)

  const order = workOrders.get(assignmentId)
  if (!order) {
    return { code: 2004, message: '派单不存在', data: null }
  }

  order.status = 'ACCEPTED'
  order.acceptedAt = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  workOrders.set(assignmentId, order)

  return {
    code: 0,
    message: '接单成功',
    data: {
      assignmentId,
      status: order.status,
      acceptedAt: order.acceptedAt,
    },
  }
})

// ========== 5. 拒绝派单 ==========
Mock.mock(/\/api\/v1\/work-orders\/\d+\/reject/, 'post', (options) => {
  const assignmentId = parseInt(options.url.match(/\/api\/v1\/work-orders\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  console.log(`[Mock] 拒绝派单 → 派单ID: ${assignmentId}，原因: ${body.rejectReason}`)

  const order = workOrders.get(assignmentId)
  if (!order) {
    return { code: 2004, message: '派单不存在', data: null }
  }

  order.status = 'REJECTED'
  order.rejectReason = body.rejectReason
  order.rejectedAt = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  workOrders.set(assignmentId, order)

  return {
    code: 0,
    message: '拒绝成功',
    data: {
      assignmentId,
      status: order.status,
      rejectReason: order.rejectReason,
    },
  }
})

// ========== 6. 确认出发 ==========
Mock.mock(/\/api\/v1\/work-orders\/\d+\/depart/, 'post', (options) => {
  const assignmentId = parseInt(options.url.match(/\/api\/v1\/work-orders\/(\d+)/)[1])
  console.log(`[Mock] 确认出发 → 派单ID: ${assignmentId}`)

  const order = workOrders.get(assignmentId)
  if (!order) {
    return { code: 2004, message: '派单不存在', data: null }
  }

  order.status = 'DEPARTED'
  order.departedAt = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  workOrders.set(assignmentId, order)

  return {
    code: 0,
    message: '出发确认成功',
    data: {
      assignmentId,
      status: order.status,
      departedAt: order.departedAt,
    },
  }
})

// ========== 7. 签到（到达） ==========
Mock.mock(/\/api\/v1\/work-orders\/\d+\/checkin/, 'post', (options) => {
  const assignmentId = parseInt(options.url.match(/\/api\/v1\/work-orders\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  console.log(`[Mock] 签到 → 派单ID: ${assignmentId}，位置: (${body.latitude}, ${body.longitude})`)

  const order = workOrders.get(assignmentId)
  if (!order) {
    return { code: 2004, message: '派单不存在', data: null }
  }

  order.status = 'ARRIVED'
  order.arrivedAt = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  order.checkinData = {
    latitude: body.latitude,
    longitude: body.longitude,
    distance: body.distance || 150,
    address: body.address || '签到地址',
    checkinStatus: 'SUCCESS',
  }
  workOrders.set(assignmentId, order)

  return {
    code: 0,
    message: '签到成功',
    data: {
      assignmentId,
      status: order.status,
      checkinData: order.checkinData,
    },
  }
})

// ========== 8. 开始服务 ==========
Mock.mock(/\/api\/v1\/work-orders\/\d+\/start/, 'post', (options) => {
  const assignmentId = parseInt(options.url.match(/\/api\/v1\/work-orders\/(\d+)/)[1])
  console.log(`[Mock] 开始服务 → 派单ID: ${assignmentId}`)

  const order = workOrders.get(assignmentId)
  if (!order) {
    return { code: 2004, message: '派单不存在', data: null }
  }

  order.status = 'IN_SERVICE'
  order.serviceStartedAt = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  workOrders.set(assignmentId, order)

  return {
    code: 0,
    message: '服务已开始',
    data: {
      assignmentId,
      status: order.status,
      serviceStartedAt: order.serviceStartedAt,
    },
  }
})

// ========== 9. 结束服务 ==========
Mock.mock(/\/api\/v1\/work-orders\/\d+\/finish/, 'post', (options) => {
  const assignmentId = parseInt(options.url.match(/\/api\/v1\/work-orders\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  console.log(`[Mock] 结束服务 → 派单ID: ${assignmentId}`)

  const order = workOrders.get(assignmentId)
  if (!order) {
    return { code: 2004, message: '派单不存在', data: null }
  }

  order.status = 'WAITING_CONFIRM'
  order.serviceFinishedAt = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  order.serviceRecord = {
    serviceItems: body.serviceItems || [],
    serviceNote: body.serviceNote || '',
    images: body.images || [],
    abnormalSituation: body.abnormalSituation || null,
  }
  workOrders.set(assignmentId, order)

  return {
    code: 0,
    message: '服务已完成，等待顾客确认',
    data: {
      assignmentId,
      status: order.status,
      serviceFinishedAt: order.serviceFinishedAt,
    },
  }
})

export default {
  workOrders,
}
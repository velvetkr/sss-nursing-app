/**
 * Mock — 订单模块（order-service）
 *
 * 对齐 API v1.0：
 * - POST /api/v1/orders/prepay-token     → 获取下单幂等令牌
 * - POST /api/v1/orders                  → 创建订单
 * - GET  /api/v1/orders                  → 订单列表
 * - GET  /api/v1/orders/{id}             → 订单详情
 * - POST /api/v1/orders/{id}/cancel      → 取消订单
 * - POST /api/v1/orders/{id}/pay         → 发起支付
 * - POST /api/v1/orders/pay/callback     → 支付宝回调（前端不直接调用）
 */
import Mock from 'mockjs'

const Random = Mock.Random

// ========== 订单状态 ==========
const STATUS = {
  0: '待支付',
  1: '待服务',
  2: '已完成',
  3: '已取消',
  4: '退款中',
  5: '已退款',
}

// ========== 模拟数据 ==========
const orders = []
const prepayTokens = new Map() // prepayToken → { expireTime }
let nextOrderId = 20001

// 生成订单号
function generateOrderNo() {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  return date + String(nextOrderId)
}

// 预设几条历史订单
const presetOrders = [
  { orderId: 20000, orderNo: '2026070120000', serviceItemName: '静脉采血', specName: '单次服务',
    specPrice: 80, totalAmount: 80, status: 2,
    receiverName: '张三', receiverPhone: '13800138000', addressDetail: '北京市朝阳区建国路88号6栋301',
    serviceDate: '2026-07-02', serviceTimeSlot: 'MORNING',
    createTime: '2026-07-01T10:00:00+08:00',
    operationLogs: [
      { action: 'create', fromStatus: null, toStatus: 0, remark: '用户创建订单', createTime: '2026-07-01T10:00:00+08:00' },
      { action: 'pay', fromStatus: 0, toStatus: 1, remark: '支付宝支付成功', createTime: '2026-07-01T10:05:00+08:00' },
      { action: 'complete', fromStatus: 1, toStatus: 2, remark: '服务完成', createTime: '2026-07-02T10:00:00+08:00' },
    ],
  },
  { orderId: 19999, orderNo: '2026070119999', serviceItemName: '艾灸调理', specName: '5次套餐',
    specPrice: 550, totalAmount: 550, status: 1,
    receiverName: '张三', receiverPhone: '13800138000', addressDetail: '北京市朝阳区建国路88号6栋301',
    serviceDate: '2026-07-08', serviceTimeSlot: 'AFTERNOON',
    createTime: '2026-07-01T15:00:00+08:00',
    operationLogs: [
      { action: 'create', fromStatus: null, toStatus: 0, remark: '用户创建订单', createTime: '2026-07-01T15:00:00+08:00' },
      { action: 'pay', fromStatus: 0, toStatus: 1, remark: '支付宝支付成功', createTime: '2026-07-01T15:03:00+08:00' },
    ],
  },
]
presetOrders.forEach((o) => orders.push(o))

// ========== 接口 Mock ==========

// 1. 获取下单幂等令牌
Mock.mock(/\/api\/v1\/orders\/prepay-token/, 'post', () => {
  const token = 'pt_' + Random.string('lower', 24)
  const expireDate = new Date()
  expireDate.setMinutes(expireDate.getMinutes() + 10) // 10分钟有效
  prepayTokens.set(token, { expireTime: expireDate })

  console.log(`[Mock] 幂等令牌已生成: ${token}`)

  return {
    code: 0,
    message: 'success',
    data: {
      prepayToken: token,
      expireTime: expireDate.toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    },
  }
})

// 2. 创建订单
Mock.mock(/\/api\/v1\/orders$/, 'post', (options) => {
  const idempotentKey = (options.headers || {})['Idempotent-Key'] || ''
  const body = JSON.parse(options.body)

  // 幂等校验
  if (idempotentKey) {
    const existing = orders.find((o) => o._idempotentKey === idempotentKey)
    if (existing) {
      console.log(`[Mock] 幂等命中，返回已有订单: ${existing.orderId}`)
      return {
        code: 0,
        message: '下单成功',
        data: { orderId: existing.orderId, orderNo: existing.orderNo },
      }
    }
  }

  // 校验必填字段
  if (!body.serviceItemId || !body.serviceSpecId || !body.addressId || !body.serviceDate) {
    return { code: 1000, message: '缺少必填参数', data: null }
  }

  const orderId = nextOrderId++
  const orderNo = generateOrderNo()

  // 模拟服务名（实际由后端从 catalog-service 获取）
  const serviceNames = {
    101: '上门输液护理', 102: '压疮护理', 103: '日常起居照料',
    201: '康复运动指导', 202: '术后康复护理', 203: '推拿按摩',
    301: '艾灸调理', 302: '拔罐刮痧',
    401: '静脉采血', 402: 'PICC维护', 403: '鼻饲护理',
    501: '心理陪伴聊天',
  }
  const specNames = { 1: '单次服务', 2: '3次套餐', 3: '5次套餐' }
  // 从 specId 推算 spec 序号（模拟逻辑）
  const specSeq = body.serviceSpecId % 100
  const itemName = serviceNames[body.serviceItemId] || '护理服务'
  const specName = specNames[specSeq] || '单次服务'
  const specPrice = [80, 150, 220, 260, 300][specSeq - 1] || 150

  const order = {
    _idempotentKey: idempotentKey,
    orderId,
    orderNo,
    serviceItemName: itemName,
    specName,
    specPrice,
    totalAmount: specPrice,
    status: 0, // 待支付
    receiverName: '张三',
    receiverPhone: '138****5678',
    addressDetail: '北京市朝阳区建国路88号6栋301',
    serviceDate: body.serviceDate,
    serviceTimeSlot: body.serviceTimeSlot || 'MORNING',
    remark: body.remark || '',
    createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    operationLogs: [
      {
        action: 'create',
        fromStatus: null,
        toStatus: 0,
        remark: '用户创建订单',
        createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
      },
    ],
  }
  orders.push(order)

  console.log(`[Mock] 订单已创建: orderId=${orderId}, orderNo=${orderNo}`)

  return {
    code: 0,
    message: '下单成功',
    data: { orderId, orderNo },
  }
})

// 3. 订单列表
Mock.mock(/\/api\/v1\/orders\?/, 'get', (options) => {
  const url = options.url
  const status = getQueryParam(url, 'status')
  const page = parseInt(getQueryParam(url, 'page') || '1')
  const size = Math.min(parseInt(getQueryParam(url, 'size') || '20'), 50)

  let list = [...orders]

  if (status !== null && status !== undefined) {
    list = list.filter((o) => o.status === parseInt(status))
  }

  // 按 createTime 倒序
  list.sort((a, b) => b.orderId - a.orderId)

  const start = (page - 1) * size
  const paged = list.slice(start, start + size).map((o) => ({
    orderId: o.orderId,
    orderNo: o.orderNo,
    serviceItemName: o.serviceItemName,
    specName: o.specName,
    specPrice: o.specPrice,
    totalAmount: o.totalAmount,
    status: o.status,
    serviceDate: o.serviceDate,
    serviceTimeSlot: o.serviceTimeSlot,
    receiverName: o.receiverName,
    receiverPhone: o.receiverPhone,
    addressDetail: o.addressDetail,
    createTime: o.createTime,
  }))

  return {
    code: 0,
    message: 'success',
    data: { list: paged, total: list.length, page, size },
  }
})

// 4. 订单详情
Mock.mock(/\/api\/v1\/orders\/\d+$/, 'get', (options) => {
  const idMatch = options.url.match(/\/api\/v1\/orders\/(\d+)/)
  const orderId = idMatch ? parseInt(idMatch[1]) : null
  const order = orders.find((o) => o.orderId === orderId)

  if (!order) {
    return { code: 3007, message: '订单不存在', data: null }
  }

  // 返回快照版本（不含 _idempotentKey）
  const { _idempotentKey, ...detail } = order
  return { code: 0, message: 'success', data: detail }
})

// 5. 取消订单
Mock.mock(/\/api\/v1\/orders\/\d+\/cancel/, 'post', (options) => {
  const idMatch = options.url.match(/\/api\/v1\/orders\/(\d+)\/cancel/)
  const orderId = idMatch ? parseInt(idMatch[1]) : null
  const order = orders.find((o) => o.orderId === orderId)

  if (!order) {
    return { code: 3007, message: '订单不存在', data: null }
  }

  // 只有待支付(0)和待服务(1)可以取消
  if (order.status !== 0 && order.status !== 1) {
    return { code: 3009, message: '当前状态不可取消', data: null }
  }

  const body = options.body ? JSON.parse(options.body) : {}
  order.status = 3 // 已取消
  order.cancelReason = body.cancelReason || ''
  order.operationLogs.push({
    action: 'cancel',
    fromStatus: order.status === 3 ? 0 : order.status,
    toStatus: 3,
    remark: body.cancelReason || '用户取消订单',
    createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
  })

  const refundStatus = order.status === 0 ? 'NO_REFUND' : 'REFUND_PENDING'

  console.log(`[Mock] 订单已取消: orderId=${orderId}, refundStatus=${refundStatus}`)

  return {
    code: 0,
    message: '订单已取消',
    data: { orderId: order.orderId, status: 3, refundStatus },
  }
})

// 6. 发起支付（返回模拟支付宝支付参数）
Mock.mock(/\/api\/v1\/orders\/\d+\/pay/, 'post', (options) => {
  const idMatch = options.url.match(/\/api\/v1\/orders\/(\d+)\/pay/)
  const orderId = idMatch ? parseInt(idMatch[1]) : null
  const order = orders.find((o) => o.orderId === orderId)

  if (!order) {
    return { code: 3007, message: '订单不存在', data: null }
  }

  if (order.status !== 0) {
    return { code: 3009, message: '当前状态不可支付', data: null }
  }

  // 模拟支付成功（MVP 简化：直接标记为已支付）
  order.status = 1
  order.operationLogs.push({
    action: 'pay',
    fromStatus: 0,
    toStatus: 1,
    remark: '支付成功',
    createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
  })

  console.log(`[Mock] 支付成功: orderId=${orderId}`)

  return {
    code: 0,
    message: 'success',
    data: {
      orderId,
      orderNo: order.orderNo,
      payAmount: order.totalAmount,
      payStatus: 1,
      tradeNo: 'mock_trade_' + Random.string('number', 16),
    },
  }
})

// ========== 工具 ==========
function getQueryParam(url, param) {
  const regex = new RegExp(`[?&]${param}=([^&]*)`)
  const match = url.match(regex)
  return match ? decodeURIComponent(match[1]) : null
}

console.log('[Mock] 订单模块已加载 (order-service / orders)')

/**
 * Mock — 管理员模块（admin-service）
 *
 * 对齐 API v1.0：
 * - 商户审核 /api/v1/admin/merchants/reviews
 * - 护理人员审核 /api/v1/admin/caregivers/reviews
 * - 服务审核 /api/v1/admin/services/reviews
 * - 异常订单 /api/v1/admin/orders/abnormal
 * - 投诉处理 /api/v1/admin/complaints
 */
import Mock from 'mockjs'

const Random = Mock.Random

// ========== 模拟审核数据 ==========
const merchantReviews = new Map()
const caregiverReviews = new Map()
const serviceReviews = new Map()
const abnormalOrders = new Map()
const complaints = new Map()

// 预设商户审核数据
const testMerchantReview = {
  merchantId: 20001,
  merchantName: '温馨护理中心',
  businessLicense: '91110105MA01WXEXXX',
  legalPerson: '张三',
  contactPhone: '13900138002',
  address: '北京市朝阳区建国路88号',
  auditStatus: 'PENDING',
  submitTime: '2026-07-10T10:00:00+08:00',
  documents: [
    {
      type: 'business_license',
      url: '/static/images/merchant/license-1.jpg',
    },
    {
      type: 'legal_person_id',
      url: '/static/images/merchant/id-1.jpg',
    },
  ],
}
merchantReviews.set(20001, testMerchantReview)

// 预设护理人员审核数据
const testCaregiverReview = {
  caregiverId: 50001,
  realName: '李护士',
  phone: '13800138004',
  gender: 1,
  idCard: '110101199001011234',
  workYears: 5,
  skills: ['老人护理', '康复训练', '测量血压'],
  serviceAreas: ['北京市朝阳区', '北京市海淀区'],
  auditStatus: 'PENDING',
  submitTime: '2026-07-01T10:00:00+08:00',
  certificates: [
    {
      certType: '护士执业证书',
      certNo: '202611000001',
      certImage: '/static/images/cert-1.jpg',
      validFrom: '2020-01-01',
      validTo: '2026-12-31',
    },
  ],
}
caregiverReviews.set(50001, testCaregiverReview)

// 预设服务审核数据
const testServiceReview = {
  serviceId: 10001,
  serviceName: '老人日常护理',
  serviceCategory: '日常护理',
  merchantId: 20001,
  merchantName: '温馨护理中心',
  price: 18000,
  originalPrice: 20000,
  duration: '2小时',
  auditStatus: 'PENDING',
  submitTime: '2026-07-12T14:00:00+08:00',
  description: '专业护理人员上门提供老人日常护理服务',
  coverImage: '/static/images/service/elderly-care.jpg',
}
serviceReviews.set(10001, testServiceReview)

// 预设异常订单数据
const testAbnormalOrder = {
  orderId: 30005,
  orderNo: 'ORD202607150005',
  abnormalType: 'CHECKIN_ABNORMAL',
  abnormalReason: '签到定位失败，距离服务地址超过500米',
  merchantId: 20001,
  merchantName: '温馨护理中心',
  caregiverId: 50002,
  caregiverName: '张护士',
  customerId: 10001,
  customerName: '测试用户',
  serviceDate: '2026-07-15',
  serviceTimeSlot: 'MORNING',
  createTime: '2026-07-15T09:30:00+08:00',
  handleStatus: 'PENDING',
}
abnormalOrders.set(30005, testAbnormalOrder)

// 预设投诉数据
const testComplaint = {
  complaintId: 70001,
  orderId: 30006,
  orderNo: 'ORD202607150006',
  customerId: 10001,
  customerName: '测试用户',
  merchantId: 20001,
  merchantName: '温馨护理中心',
  caregiverId: 50002,
  caregiverName: '张护士',
  complaintType: 'SERVICE_QUALITY',
  complaintReason: '护理人员服务态度差，未按约定时间到达',
  complaintImages: ['/static/images/complaint/img-1.jpg'],
  submitTime: '2026-07-15T18:00:00+08:00',
  handleStatus: 'PENDING',
  handleResult: null,
}
complaints.set(70001, testComplaint)

// ========== 1. 获取商户审核列表 ==========
Mock.mock(/\/api\/v1\/admin\/merchants\/reviews/, 'get', (options) => {
  console.log(`[Mock] 获取商户审核列表`)

  const url = options.url
  const params = new URLSearchParams(url.split('?')[1] || '')
  const status = params.get('status')

  let filteredReviews = Array.from(merchantReviews.values())
  if (status) {
    filteredReviews = filteredReviews.filter(r => r.auditStatus === status)
  }

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredReviews,
      total: filteredReviews.length,
    },
  }
})

// ========== 2. 获取商户审核详情 ==========
Mock.mock(/\/api\/v1\/admin\/merchants\/\d+\/review-detail/, 'get', (options) => {
  const merchantId = parseInt(options.url.match(/\/api\/v1\/admin\/merchants\/(\d+)/)[1])
  console.log(`[Mock] 获取商户审核详情 → 商户ID: ${merchantId}`)

  const review = merchantReviews.get(merchantId)
  if (!review) {
    return { code: 2004, message: '商户不存在', data: null }
  }

  return {
    code: 0,
    message: 'success',
    data: review,
  }
})

// ========== 3. 审核商户 ==========
Mock.mock(/\/api\/v1\/admin\/merchants\/\d+\/review/, 'post', (options) => {
  const merchantId = parseInt(options.url.match(/\/api\/v1\/admin\/merchants\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  console.log(`[Mock] 审核商户 → 商户ID: ${merchantId}，操作: ${body.action}`)

  // 输入验证
  if (!body.action || !['APPROVED', 'REJECTED'].includes(body.action)) {
    return { code: 1001, message: '审核操作无效', data: null }
  }
  if (body.action === 'REJECTED' && !body.reviewComment?.trim()) {
    return { code: 1002, message: '驳回必须填写审核意见', data: null }
  }

  const review = merchantReviews.get(merchantId)
  if (!review) {
    return { code: 2004, message: '商户不存在', data: null }
  }

  review.auditStatus = body.action
  review.reviewComment = body.reviewComment || ''
  review.reviewTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  merchantReviews.set(merchantId, review)

  return {
    code: 0,
    message: body.action === 'APPROVED' ? '审核通过' : '审核驳回',
    data: {
      merchantId,
      auditStatus: review.auditStatus,
    },
  }
})

// ========== 4. 获取护理人员审核列表 ==========
Mock.mock(/\/api\/v1\/admin\/caregivers\/reviews/, 'get', (options) => {
  console.log(`[Mock] 获取护理人员审核列表`)

  const url = options.url
  const params = new URLSearchParams(url.split('?')[1] || '')
  const status = params.get('status')

  let filteredReviews = Array.from(caregiverReviews.values())
  if (status) {
    filteredReviews = filteredReviews.filter(r => r.auditStatus === status)
  }

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredReviews,
      total: filteredReviews.length,
    },
  }
})

// ========== 5. 获取护理人员审核详情 ==========
Mock.mock(/\/api\/v1\/admin\/caregivers\/\d+\/review-detail/, 'get', (options) => {
  const caregiverId = parseInt(options.url.match(/\/api\/v1\/admin\/caregivers\/(\d+)/)[1])
  console.log(`[Mock] 获取护理人员审核详情 → 护理人员ID: ${caregiverId}`)

  const review = caregiverReviews.get(caregiverId)
  if (!review) {
    return { code: 2004, message: '护理人员不存在', data: null }
  }

  return {
    code: 0,
    message: 'success',
    data: review,
  }
})

// ========== 6. 审核护理人员 ==========
Mock.mock(/\/api\/v1\/admin\/caregivers\/\d+\/review/, 'post', (options) => {
  const caregiverId = parseInt(options.url.match(/\/api\/v1\/admin\/caregivers\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  console.log(`[Mock] 审核护理人员 → 护理人员ID: ${caregiverId}，操作: ${body.action}`)

  const review = caregiverReviews.get(caregiverId)
  if (!review) {
    return { code: 2004, message: '护理人员不存在', data: null }
  }

  review.auditStatus = body.action
  review.reviewComment = body.reviewComment
  review.reviewTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  caregiverReviews.set(caregiverId, review)

  return {
    code: 0,
    message: body.action === 'APPROVED' ? '审核通过' : '审核驳回',
    data: {
      caregiverId,
      auditStatus: review.auditStatus,
    },
  }
})

// ========== 7. 获取服务审核列表 ==========
Mock.mock(/\/api\/v1\/admin\/services\/reviews/, 'get', (options) => {
  console.log(`[Mock] 获取服务审核列表`)

  const url = options.url
  const params = new URLSearchParams(url.split('?')[1] || '')
  const status = params.get('status')

  let filteredReviews = Array.from(serviceReviews.values())
  if (status) {
    filteredReviews = filteredReviews.filter(r => r.auditStatus === status)
  }

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredReviews,
      total: filteredReviews.length,
    },
  }
})

// ========== 8. 获取服务审核详情 ==========
Mock.mock(/\/api\/v1\/admin\/services\/\d+\/review-detail/, 'get', (options) => {
  const serviceId = parseInt(options.url.match(/\/api\/v1\/admin\/services\/(\d+)/)[1])
  console.log(`[Mock] 获取服务审核详情 → 服务ID: ${serviceId}`)

  const review = serviceReviews.get(serviceId)
  if (!review) {
    return { code: 2004, message: '服务不存在', data: null }
  }

  return {
    code: 0,
    message: 'success',
    data: review,
  }
})

// ========== 9. 审核服务 ==========
Mock.mock(/\/api\/v1\/admin\/services\/\d+\/review/, 'post', (options) => {
  const serviceId = parseInt(options.url.match(/\/api\/v1\/admin\/services\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  console.log(`[Mock] 审核服务 → 服务ID: ${serviceId}，操作: ${body.action}`)

  const review = serviceReviews.get(serviceId)
  if (!review) {
    return { code: 2004, message: '服务不存在', data: null }
  }

  review.auditStatus = body.action
  review.reviewComment = body.reviewComment
  review.reviewTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  serviceReviews.set(serviceId, review)

  return {
    code: 0,
    message: body.action === 'APPROVED' ? '审核通过' : '审核驳回',
    data: {
      serviceId,
      auditStatus: review.auditStatus,
    },
  }
})

// ========== 10. 获取异常订单列表 ==========
Mock.mock(/\/api\/v1\/admin\/orders\/abnormal/, 'get', (options) => {
  console.log(`[Mock] 获取异常订单列表`)

  const url = options.url
  const params = new URLSearchParams(url.split('?')[1] || '')
  const abnormalType = params.get('abnormalType')

  let filteredOrders = Array.from(abnormalOrders.values())
  if (abnormalType) {
    filteredOrders = filteredOrders.filter(o => o.abnormalType === abnormalType)
  }

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredOrders,
      total: filteredOrders.length,
    },
  }
})

// ========== 11. 获取异常订单详情 ==========
Mock.mock(/\/api\/v1\/admin\/orders\/\d+\/abnormal-detail/, 'get', (options) => {
  const orderId = parseInt(options.url.match(/\/api\/v1\/admin\/orders\/(\d+)/)[1])
  console.log(`[Mock] 获取异常订单详情 → 订单ID: ${orderId}`)

  const order = abnormalOrders.get(orderId)
  if (!order) {
    return { code: 2004, message: '订单不存在', data: null }
  }

  return {
    code: 0,
    message: 'success',
    data: order,
  }
})

// ========== 12. 获取投诉列表 ==========
Mock.mock(/\/api\/v1\/admin\/complaints(\?|$)/, 'get', (options) => {
  console.log(`[Mock] 获取投诉列表`)

  const url = options.url
  const params = new URLSearchParams(url.split('?')[1] || '')
  const status = params.get('status')

  let filteredComplaints = Array.from(complaints.values())
  if (status) {
    filteredComplaints = filteredComplaints.filter(c => c.handleStatus === status)
  }

  return {
    code: 0,
    message: 'success',
    data: {
      list: filteredComplaints,
      total: filteredComplaints.length,
    },
  }
})

// ========== 13. 获取投诉详情 ==========
Mock.mock(/\/api\/v1\/admin\/complaints\/\d+$/, 'get', (options) => {
  const complaintId = parseInt(options.url.match(/\/api\/v1\/admin\/complaints\/(\d+)/)[1])
  console.log(`[Mock] 获取投诉详情 → 投诉ID: ${complaintId}`)

  const complaint = complaints.get(complaintId)
  if (!complaint) {
    return { code: 2004, message: '投诉不存在', data: null }
  }

  return {
    code: 0,
    message: 'success',
    data: complaint,
  }
})

// ========== 14. 处理投诉 ==========
Mock.mock(/\/api\/v1\/admin\/complaints\/\d+\/handle/, 'post', (options) => {
  const complaintId = parseInt(options.url.match(/\/api\/v1\/admin\/complaints\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  console.log(`[Mock] 处理投诉 → 投诉ID: ${complaintId}`)

  const complaint = complaints.get(complaintId)
  if (!complaint) {
    return { code: 2004, message: '投诉不存在', data: null }
  }

  complaint.handleStatus = 'HANDLED'
  complaint.handleResult = body.handleResult
  complaint.merchantExplanation = body.merchantExplanation
  complaint.compensation = body.compensation
  complaint.handleTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  complaints.set(complaintId, complaint)

  return {
    code: 0,
    message: '投诉处理成功',
    data: {
      complaintId,
      handleStatus: complaint.handleStatus,
    },
  }
})

export default {
  merchantReviews,
  caregiverReviews,
  serviceReviews,
  abnormalOrders,
  complaints,
}
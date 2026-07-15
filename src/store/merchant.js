/**
 * Pinia — 商户工作台状态管理
 *
 * 覆盖 Person B 职责域：
 * - 商户入驻申请、资料查看与编辑
 * - 服务管理（CRUD、提交审核、上下架）
 * - 护理人员管理（列表、详情、邀请、启用/停用/移出）
 * - 商户订单管理（列表、筛选、详情、状态统计）
 * - 派单管理（候选护理人员、派单、取消派单、改派、派单记录）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http, { createIdempotentKey } from '@/utils/request.js'

// ===== 状态常量 =====
export const MERCHANT_AUDIT_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
}

export const MERCHANT_AUDIT_STATUS_TEXT = {
  0: '审核中',
  1: '已通过',
  2: '已驳回',
}

export const SERVICE_STATUS = {
  DRAFT: 0,
  PENDING_REVIEW: 1,
  APPROVED: 2,
  REJECTED: 3,
  LISTED: 4,
  UNLISTED: 5,
}

export const SERVICE_STATUS_TEXT = {
  0: '草稿',
  1: '待审核',
  2: '已通过',
  3: '已驳回',
  4: '已上架',
  5: '已下架',
}

export const CAREGIVER_STATUS = {
  ACTIVE: 0,
  DISABLED: 1,
  LEFT: 2,
}

export const CAREGIVER_STATUS_TEXT = {
  0: '在职',
  1: '已停用',
  2: '已离职',
}

export const DISPATCH_STATUS = {
  UNASSIGNED: 'UNASSIGNED',
  WAITING_ACCEPT: 'WAITING_ACCEPT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
}

export const DISPATCH_STATUS_TEXT = {
  UNASSIGNED: '待派单',
  WAITING_ACCEPT: '等待接单',
  ACCEPTED: '已接单',
  REJECTED: '已拒绝',
  EXPIRED: '已超时',
  CANCELED: '已取消',
}

export const useMerchantStore = defineStore('merchant', () => {
  // ===== 商户入驻与资料 =====
  const currentMerchant = ref(null)
  const merchantLoading = ref(false)
  const applicationSubmitted = ref(false)

  // ===== 服务管理 =====
  const services = ref([])
  const servicesTotal = ref(0)
  const currentService = ref(null)
  const serviceDraft = ref(null)
  const servicesLoading = ref(false)

  // ===== 护理人员管理 =====
  const caregivers = ref([])
  const caregiversTotal = ref(0)
  const currentCaregiver = ref(null)
  const caregiversLoading = ref(false)

  // ===== 商户订单 =====
  const merchantOrders = ref([])
  const merchantOrdersTotal = ref(0)
  const currentMerchantOrder = ref(null)
  const merchantOrdersLoading = ref(false)
  const orderStats = ref({ total: 0, waitingDispatch: 0, waitingAccept: 0, waitingService: 0, inService: 0, abnormal: 0 })

  // ===== 派单 =====
  const candidates = ref([])
  const candidatesLoading = ref(false)
  const dispatchRecords = ref([])
  const dispatchRecordsLoading = ref(false)

  // ===== 商户成员 =====
  const members = ref([])
  const membersLoading = ref(false)

  // ===== 计算属性 =====
  const hasMerchant = computed(() => !!currentMerchant.value)
  const isMerchantApproved = computed(() => currentMerchant.value?.auditStatus === 1)
  const canManageService = computed(() => isMerchantApproved.value)
  const canDispatch = computed(() => isMerchantApproved.value)

  // ============================================================
  // 商户入驻与资料
  // ============================================================

  /** 获取当前商户信息 */
  async function fetchMyMerchant() {
    merchantLoading.value = true
    try {
      const res = await http.get('/api/v1/merchants/my')
      currentMerchant.value = res.data || null
      return currentMerchant.value
    } catch {
      currentMerchant.value = null
      return null
    } finally {
      merchantLoading.value = false
    }
  }

  /** 提交商户入驻申请 */
  async function submitApplication(data) {
    const res = await http.post('/api/v1/merchants/apply', data, {
      idempotencyKey: createIdempotentKey('merchant-apply'),
    })
    applicationSubmitted.value = true
    return res.data
  }

  /** 重新提交申请（驳回后） */
  async function resubmitApplication(data) {
    const res = await http.put('/api/v1/merchants/apply', data, {
      idempotencyKey: createIdempotentKey('merchant-resubmit'),
    })
    return res.data
  }

  /** 更新商户资料 */
  async function updateProfile(data) {
    const res = await http.patch('/api/v1/merchants/my', data)
    currentMerchant.value = { ...currentMerchant.value, ...res.data }
    return res.data
  }

  // ============================================================
  // 服务管理
  // ============================================================

  /** 获取商户服务列表 */
  async function fetchMyServices(params = {}) {
    servicesLoading.value = true
    try {
      const query = { page: params.page || 1, size: params.size || 20 }
      if (params.status !== undefined && params.status !== null) query.status = params.status
      if (params.keyword) query.keyword = params.keyword
      const res = await http.get('/api/v1/merchants/my/items', query)
      const data = res.data || {}
      services.value = data.list || []
      servicesTotal.value = data.total || 0
      return { list: services.value, total: servicesTotal.value }
    } finally {
      servicesLoading.value = false
    }
  }

  /** 获取服务详情（商户视角） */
  async function fetchMyServiceDetail(itemId) {
    servicesLoading.value = true
    try {
      const res = await http.get(`/api/v1/merchants/my/items/${itemId}`)
      currentService.value = res.data
      return currentService.value
    } finally {
      servicesLoading.value = false
    }
  }

  /** 初始化服务草稿 */
  function initServiceDraft() {
    serviceDraft.value = {
      categoryId: null,
      name: '',
      description: '',
      coverImage: '',
      images: [],
      serviceArea: '',
      specs: [],
      qualifications: [],
    }
    return serviceDraft.value
  }

  /** 填充服务草稿（编辑已有服务） */
  function populateServiceDraft(service) {
    serviceDraft.value = {
      itemId: service.itemId,
      categoryId: service.categoryId,
      name: service.name,
      description: service.description || '',
      coverImage: service.coverImage || '',
      images: [...(service.images || [])],
      serviceArea: service.serviceArea || '',
      specs: (service.specs || []).map((s) => ({ ...s })),
      qualifications: [...(service.qualifications || [])],
    }
    return serviceDraft.value
  }

  /** 保存服务草稿 */
  async function saveServiceDraft() {
    const draft = serviceDraft.value
    if (!draft) throw new Error('暂无草稿数据')
    const isEdit = !!draft.itemId
    const url = isEdit
      ? `/api/v1/merchants/my/items/${draft.itemId}`
      : '/api/v1/merchants/my/items'
    const method = isEdit ? 'put' : 'post'
    const res = await http[method](url, draft, {
      idempotencyKey: createIdempotentKey('service-save'),
    })
    return res.data
  }

  /** 提交服务审核 */
  async function submitServiceForReview(itemId) {
    const res = await http.post(`/api/v1/merchants/my/items/${itemId}/submit`, {}, {
      idempotencyKey: createIdempotentKey('service-submit'),
    })
    return res.data
  }

  /** 上架服务 */
  async function listService(itemId) {
    const res = await http.post(`/api/v1/merchants/my/items/${itemId}/list`, {}, {
      idempotencyKey: createIdempotentKey('service-list'),
    })
    return res.data
  }

  /** 下架服务 */
  async function unlistService(itemId) {
    const res = await http.post(`/api/v1/merchants/my/items/${itemId}/unlist`, {}, {
      idempotencyKey: createIdempotentKey('service-unlist'),
    })
    return res.data
  }

  // ============================================================
  // 护理人员管理
  // ============================================================

  /** 获取商户护理人员列表 */
  async function fetchCaregivers(params = {}) {
    caregiversLoading.value = true
    try {
      const query = { page: params.page || 1, size: params.size || 20 }
      if (params.status !== undefined && params.status !== null) query.status = params.status
      if (params.keyword) query.keyword = params.keyword
      const res = await http.get('/api/v1/merchants/my/caregivers', query)
      const data = res.data || {}
      caregivers.value = data.list || []
      caregiversTotal.value = data.total || 0
      return { list: caregivers.value, total: caregiversTotal.value }
    } finally {
      caregiversLoading.value = false
    }
  }

  /** 获取护理人员详情 */
  async function fetchCaregiverDetail(caregiverId) {
    caregiversLoading.value = true
    try {
      const res = await http.get(`/api/v1/merchants/my/caregivers/${caregiverId}`)
      currentCaregiver.value = res.data
      return currentCaregiver.value
    } finally {
      caregiversLoading.value = false
    }
  }

  /** 邀请护理人员加入商户 */
  async function inviteCaregiver(phone) {
    const res = await http.post('/api/v1/merchants/my/caregivers/invite', { phone }, {
      idempotencyKey: createIdempotentKey('caregiver-invite'),
    })
    return res.data
  }

  /** 确认护理人员加入 */
  async function confirmCaregiver(caregiverId) {
    const res = await http.post(`/api/v1/merchants/my/caregivers/${caregiverId}/confirm`, {}, {
      idempotencyKey: createIdempotentKey('caregiver-confirm'),
    })
    return res.data
  }

  /** 启用护理人员 */
  async function enableCaregiver(caregiverId) {
    const res = await http.post(`/api/v1/merchants/my/caregivers/${caregiverId}/enable`, {}, {
      idempotencyKey: createIdempotentKey('caregiver-enable'),
    })
    return res.data
  }

  /** 停用护理人员 */
  async function disableCaregiver(caregiverId) {
    const res = await http.post(`/api/v1/merchants/my/caregivers/${caregiverId}/disable`, {}, {
      idempotencyKey: createIdempotentKey('caregiver-disable'),
    })
    return res.data
  }

  /** 移出护理人员 */
  async function removeCaregiver(caregiverId) {
    const res = await http.delete(`/api/v1/merchants/my/caregivers/${caregiverId}`, {}, {
      idempotencyKey: createIdempotentKey('caregiver-remove'),
    })
    return res.data
  }

  // ============================================================
  // 商户订单管理
  // ============================================================

  /** 获取商户订单列表 */
  async function fetchMerchantOrders(params = {}) {
    merchantOrdersLoading.value = true
    try {
      const query = { page: params.page || 1, size: params.size || 20 }
      if (params.status) query.status = params.status
      if (params.dispatchStatus) query.dispatchStatus = params.dispatchStatus
      if (params.keyword) query.keyword = params.keyword
      const res = await http.get('/api/v1/merchants/my/orders', query)
      const data = res.data || {}
      merchantOrders.value = data.list || []
      merchantOrdersTotal.value = data.total || 0
      if (data.stats) orderStats.value = data.stats
      return { list: merchantOrders.value, total: merchantOrdersTotal.value, stats: orderStats.value }
    } finally {
      merchantOrdersLoading.value = false
    }
  }

  /** 获取订单详情（商户视角） */
  async function fetchMerchantOrderDetail(orderId) {
    merchantOrdersLoading.value = true
    try {
      const res = await http.get(`/api/v1/merchants/my/orders/${orderId}`)
      currentMerchantOrder.value = res.data
      return currentMerchantOrder.value
    } finally {
      merchantOrdersLoading.value = false
    }
  }

  // ============================================================
  // 派单管理
  // ============================================================

  /** 查询候选护理人员 */
  async function fetchCandidates(orderId) {
    candidatesLoading.value = true
    try {
      const res = await http.get(`/api/v1/merchants/my/orders/${orderId}/candidates`)
      candidates.value = res.data?.candidates || res.data || []
      return candidates.value
    } finally {
      candidatesLoading.value = false
    }
  }

  /** 派单 */
  async function dispatchOrder(orderId, caregiverId) {
    const res = await http.post(`/api/v1/merchants/my/orders/${orderId}/dispatch`, {
      caregiverId,
    }, {
      idempotencyKey: createIdempotentKey('dispatch'),
    })
    return res.data
  }

  /** 取消派单 */
  async function cancelDispatch(orderId, assignmentId) {
    const res = await http.post(`/api/v1/merchants/my/orders/${orderId}/dispatch/cancel`, {
      assignmentId,
    }, {
      idempotencyKey: createIdempotentKey('dispatch-cancel'),
    })
    return res.data
  }

  /** 改派 */
  async function reassignOrder(orderId, newCaregiverId) {
    const res = await http.post(`/api/v1/merchants/my/orders/${orderId}/dispatch/reassign`, {
      caregiverId: newCaregiverId,
    }, {
      idempotencyKey: createIdempotentKey('reassign'),
    })
    return res.data
  }

  /** 获取派单记录 */
  async function fetchDispatchRecords(orderId) {
    dispatchRecordsLoading.value = true
    try {
      const res = await http.get(`/api/v1/merchants/my/orders/${orderId}/dispatch-records`)
      dispatchRecords.value = res.data?.records || res.data || []
      return dispatchRecords.value
    } finally {
      dispatchRecordsLoading.value = false
    }
  }

  // ============================================================
  // 商户成员管理
  // ============================================================

  /** 获取商户成员列表 */
  async function fetchMembers(params = {}) {
    membersLoading.value = true
    try {
      const query = { page: params.page || 1, size: params.size || 50 }
      const res = await http.get('/api/v1/merchants/my/members', query)
      const data = res.data || {}
      members.value = data.list || []
      return { list: members.value }
    } finally {
      membersLoading.value = false
    }
  }

  // ============================================================
  // 工具方法
  // ============================================================

  function getMerchantAuditStatusText(status) {
    return MERCHANT_AUDIT_STATUS_TEXT[status] || '未知'
  }

  function getServiceStatusText(status) {
    return SERVICE_STATUS_TEXT[status] || '未知'
  }

  function getCaregiverStatusText(status) {
    return CAREGIVER_STATUS_TEXT[status] || '未知'
  }

  function getDispatchStatusText(status) {
    return DISPATCH_STATUS_TEXT[status] || status || '未知'
  }

  function reset() {
    currentMerchant.value = null
    services.value = []
    servicesTotal.value = 0
    currentService.value = null
    serviceDraft.value = null
    caregivers.value = []
    caregiversTotal.value = 0
    currentCaregiver.value = null
    merchantOrders.value = []
    merchantOrdersTotal.value = 0
    currentMerchantOrder.value = null
    orderStats.value = { total: 0, waitingDispatch: 0, waitingAccept: 0, waitingService: 0, inService: 0, abnormal: 0 }
    candidates.value = []
    dispatchRecords.value = []
    members.value = []
  }

  return {
    // 状态
    currentMerchant, merchantLoading, applicationSubmitted,
    services, servicesTotal, currentService, serviceDraft, servicesLoading,
    caregivers, caregiversTotal, currentCaregiver, caregiversLoading,
    merchantOrders, merchantOrdersTotal, currentMerchantOrder, merchantOrdersLoading, orderStats,
    candidates, candidatesLoading,
    dispatchRecords, dispatchRecordsLoading,
    members, membersLoading,
    // 计算
    hasMerchant, isMerchantApproved, canManageService, canDispatch,
    // 商户入驻
    fetchMyMerchant, submitApplication, resubmitApplication, updateProfile,
    // 服务管理
    fetchMyServices, fetchMyServiceDetail,
    initServiceDraft, populateServiceDraft, saveServiceDraft,
    submitServiceForReview, listService, unlistService,
    // 护理人员
    fetchCaregivers, fetchCaregiverDetail,
    inviteCaregiver, confirmCaregiver,
    enableCaregiver, disableCaregiver, removeCaregiver,
    // 订单
    fetchMerchantOrders, fetchMerchantOrderDetail,
    // 派单
    fetchCandidates, dispatchOrder, cancelDispatch, reassignOrder, fetchDispatchRecords,
    // 成员
    fetchMembers,
    // 工具
    getMerchantAuditStatusText, getServiceStatusText, getCaregiverStatusText, getDispatchStatusText,
    reset,
  }
})

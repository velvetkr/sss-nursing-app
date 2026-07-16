/**
 * Pinia — 护理工作单管理
 *
 * 对齐 API v1.0（work-order-service）：
 * - 接单、拒单
 * - 履约流程（出发、签到、开始、结束）
 * - 服务记录提交
 * - 任务列表、详情
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http, { createIdempotentKey } from '@/utils/request.js'

export const useWorkOrderStore = defineStore('work-order', () => {
  // ===== 状态 =====
  const tasks = ref([])
  const total = ref(0)
  const currentTask = ref(null)
  const todayTasks = ref([])
  // 使用 loading 计数器避免竞态条件
  const loadingCount = ref(0)
  const loading = computed(() => loadingCount.value > 0)

  // ===== 任务状态枚举 =====
  const TASK_STATUS = {
    WAITING_ACCEPT: 'WAITING_ACCEPT',   // 等待接单
    ACCEPTED: 'ACCEPTED',               // 已接单
    REJECTED: 'REJECTED',               // 已拒绝
    EXPIRED: 'EXPIRED',                 // 已过期
    DEPARTED: 'DEPARTED',               // 已出发
    ARRIVED: 'ARRIVED',                 // 已到达
    IN_SERVICE: 'IN_SERVICE',           // 服务中
    FINISHED: 'FINISHED',               // 已完成
    WAITING_CONFIRM: 'WAITING_CONFIRM', // 等待确认
    CANCELED: 'CANCELED',               // 已取消
  }

  // ===== 签到状态枚举 =====
  const CHECKIN_STATUS = {
    SUCCESS: 'SUCCESS',         // 签到成功
    FAILED: 'FAILED',           // 签到失败
    ABNORMAL: 'ABNORMAL',       // 异常签到
    PENDING_REVIEW: 'PENDING_REVIEW', // 待审核
  }

  // ===== 计算属性 =====
  const pendingTasks = computed(() =>
    tasks.value.filter(t => t.status === TASK_STATUS.WAITING_ACCEPT)
  )
  const todayTaskCount = computed(() => todayTasks.value.length)
  const inServiceTasks = computed(() =>
    tasks.value.filter(t => t.status === TASK_STATUS.IN_SERVICE)
  )

  // ===== 方法 =====

  /**
   * 获取任务列表
   * @param {Object} params - 查询参数 { status, page, size }
   */
  async function fetchTasks(params = {}) {
    loadingCount.value++
    try {
      const query = { page: params.page || 1, size: params.size || 20 }
      if (params.status) {
        query.status = params.status
      }
      const res = await http.get('/api/v1/work-orders', query)
      const data = res.data
      tasks.value = data.list || []
      total.value = data.total || 0
      return { list: tasks.value, total: total.value }
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 获取今日任务
   */
  async function fetchTodayTasks() {
    loadingCount.value++
    try {
      const res = await http.get('/api/v1/work-orders/today')
      todayTasks.value = res.data?.list || []
      return todayTasks.value
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 获取任务详情
   */
  async function fetchTaskDetail(assignmentId) {
    loadingCount.value++
    try {
      const res = await http.get(`/api/v1/work-orders/${assignmentId}`)
      currentTask.value = res.data
      return currentTask.value
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 接受派单
   */
  async function acceptAssignment(assignmentId) {
    loadingCount.value++
    try {
      const res = await http.post(
        `/api/v1/work-orders/${assignmentId}/accept`,
        {},
        { idempotentKey: createIdempotentKey('accept') }
      )
      // 更新任务状态
      if (currentTask.value?.assignmentId === assignmentId) {
        currentTask.value.status = TASK_STATUS.ACCEPTED
      }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 拒绝派单
   * @param {number} assignmentId - 派单ID
   * @param {string} rejectReason - 拒绝原因
   */
  async function rejectAssignment(assignmentId, rejectReason) {
    loadingCount.value++
    try {
      const res = await http.post(
        `/api/v1/work-orders/${assignmentId}/reject`,
        { rejectReason },
        { idempotentKey: createIdempotentKey('reject') }
      )
      // 更新任务状态
      if (currentTask.value?.assignmentId === assignmentId) {
        currentTask.value.status = TASK_STATUS.REJECTED
        currentTask.value.rejectReason = rejectReason
      }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 确认出发
   */
  async function confirmDeparture(assignmentId) {
    loadingCount.value++
    try {
      const res = await http.post(
        `/api/v1/work-orders/${assignmentId}/depart`,
        {},
        { idempotentKey: createIdempotentKey('depart') }
      )
      if (currentTask.value?.assignmentId === assignmentId) {
        currentTask.value.status = TASK_STATUS.DEPARTED
        currentTask.value.departedAt = new Date().toISOString()
      }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 签到（到达）
   * @param {number} assignmentId - 派单ID
   * @param {Object} checkinData - 签到数据 { latitude, longitude, distance, address }
   */
  async function checkin(assignmentId, checkinData) {
    loadingCount.value++
    try {
      const res = await http.post(
        `/api/v1/work-orders/${assignmentId}/checkin`,
        checkinData,
        { idempotentKey: createIdempotentKey('checkin') }
      )
      if (currentTask.value?.assignmentId === assignmentId) {
        currentTask.value.status = TASK_STATUS.ARRIVED
        currentTask.value.checkinData = checkinData
        currentTask.value.arrivedAt = new Date().toISOString()
      }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 开始服务
   */
  async function startService(assignmentId) {
    loadingCount.value++
    try {
      const res = await http.post(
        `/api/v1/work-orders/${assignmentId}/start`,
        {},
        { idempotentKey: createIdempotentKey('start') }
      )
      if (currentTask.value?.assignmentId === assignmentId) {
        currentTask.value.status = TASK_STATUS.IN_SERVICE
        currentTask.value.serviceStartedAt = new Date().toISOString()
      }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 结束服务（提交服务记录）
   * @param {number} assignmentId - 派单ID
   * @param {Object} serviceRecord - 服务记录
   */
  async function finishService(assignmentId, serviceRecord) {
    loadingCount.value++
    try {
      const res = await http.post(
        `/api/v1/work-orders/${assignmentId}/finish`,
        serviceRecord,
        { idempotentKey: createIdempotentKey('finish') }
      )
      if (currentTask.value?.assignmentId === assignmentId) {
        currentTask.value.status = TASK_STATUS.WAITING_CONFIRM
        currentTask.value.serviceRecord = serviceRecord
        currentTask.value.serviceFinishedAt = new Date().toISOString()
      }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 上传服务记录图片
   */
  async function uploadServiceImage(filePath) {
    loadingCount.value++
    try {
      const res = await http.upload(
        '/api/v1/files/upload',
        filePath,
        { bizType: 'service_record' },
        { idempotentKey: createIdempotentKey('service-img') }
      )
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 获取状态文案
   */
  function getStatusText(status) {
    const STATUS_TEXT_MAP = {
      [TASK_STATUS.WAITING_ACCEPT]: '等待接单',
      [TASK_STATUS.ACCEPTED]: '已接单',
      [TASK_STATUS.REJECTED]: '已拒绝',
      [TASK_STATUS.EXPIRED]: '已过期',
      [TASK_STATUS.DEPARTED]: '已出发',
      [TASK_STATUS.ARRIVED]: '已到达',
      [TASK_STATUS.IN_SERVICE]: '服务中',
      [TASK_STATUS.FINISHED]: '已完成',
      [TASK_STATUS.WAITING_CONFIRM]: '等待确认',
      [TASK_STATUS.CANCELED]: '已取消',
    }
    return STATUS_TEXT_MAP[status] || '未知状态'
  }

  /**
   * 获取状态颜色
   */
  function getStatusColor(status) {
    const STATUS_COLOR_MAP = {
      [TASK_STATUS.WAITING_ACCEPT]: 'warning',
      [TASK_STATUS.ACCEPTED]: 'primary',
      [TASK_STATUS.REJECTED]: 'error',
      [TASK_STATUS.EXPIRED]: 'info',
      [TASK_STATUS.DEPARTED]: 'primary',
      [TASK_STATUS.ARRIVED]: 'primary',
      [TASK_STATUS.IN_SERVICE]: 'success',
      [TASK_STATUS.FINISHED]: 'success',
      [TASK_STATUS.WAITING_CONFIRM]: 'warning',
      [TASK_STATUS.CANCELED]: 'info',
    }
    return STATUS_COLOR_MAP[status] || 'default'
  }

  /**
   * 清空工作单状态
   */
  function clearWorkOrderState() {
    tasks.value = []
    total.value = 0
    currentTask.value = null
    todayTasks.value = []
  }

  return {
    // 状态
    tasks,
    total,
    currentTask,
    todayTasks,
    loading,

    // 枚举
    TASK_STATUS,
    CHECKIN_STATUS,

    // 计算属性
    pendingTasks,
    todayTaskCount,
    inServiceTasks,

    // 方法
    fetchTasks,
    fetchTodayTasks,
    fetchTaskDetail,
    acceptAssignment,
    rejectAssignment,
    confirmDeparture,
    checkin,
    startService,
    finishService,
    uploadServiceImage,
    getStatusText,
    getStatusColor,
    clearWorkOrderState,
  }
})
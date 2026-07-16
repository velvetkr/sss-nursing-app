/**
 * Pinia — 护理人员状态管理
 *
 * 对齐 API v1.0（caregiver-service）：
 * - 护理人员申请、审核状态
 * - 个人档案、资质管理
 * - 排班、可接单状态
 * - 服务技能、服务区域设置
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http, { createIdempotentKey } from '@/utils/request.js'

export const useCaregiverStore = defineStore('caregiver', () => {
  // ===== 状态 =====
  const caregiverInfo = ref(null)
  const applicationStatus = ref(null)
  const skills = ref([])
  const serviceAreas = ref([])
  const schedule = ref([])
  // 使用 loading 计数器避免竞态条件
  const loadingCount = ref(0)
  const loading = computed(() => loadingCount.value > 0)

  // ===== 审核状态枚举 =====
  const AUDIT_STATUS = {
    DRAFT: 'DRAFT',           // 草稿
    PENDING: 'PENDING',       // 审核中
    APPROVED: 'APPROVED',     // 已通过
    REJECTED: 'REJECTED',     // 已驳回
    SUSPENDED: 'SUSPENDED',   // 已停用
  }

  // ===== 计算属性 =====
  const isApproved = computed(() => applicationStatus.value === AUDIT_STATUS.APPROVED)
  const isPending = computed(() => applicationStatus.value === AUDIT_STATUS.PENDING)
  const canAcceptOrder = computed(() => isApproved.value && caregiverInfo.value?.available === true)
  const caregiverId = computed(() => caregiverInfo.value?.caregiverId || null)

  // ===== 方法 =====

  /**
   * 提交护理人员申请
   * @param {Object} params - 申请信息
   */
  async function submitApplication(params) {
    loadingCount.value++
    try {
      const res = await http.post('/api/v1/caregivers/apply', params, {
        idempotentKey: createIdempotentKey('caregiver-apply'),
      })
      applicationStatus.value = AUDIT_STATUS.PENDING
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 获取申请审核状态
   */
  async function fetchApplicationStatus() {
    loadingCount.value++
    try {
      const res = await http.get('/api/v1/caregivers/application-status')
      applicationStatus.value = res.data?.status || null
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 获取护理人员档案
   */
  async function fetchCaregiverProfile() {
    loadingCount.value++
    try {
      const res = await http.get('/api/v1/caregivers/profile')
      caregiverInfo.value = res.data
      applicationStatus.value = res.data?.auditStatus || null
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 更新护理人员档案
   */
  async function updateCaregiverProfile(data) {
    loadingCount.value++
    try {
      const res = await http.patch('/api/v1/caregivers/profile', {
        ...data,
        version: data.version ?? caregiverInfo.value?.version ?? 0,
      })
      caregiverInfo.value = { ...caregiverInfo.value, ...res.data }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 获取服务技能列表
   */
  async function fetchSkills() {
    loadingCount.value++
    try {
      const res = await http.get('/api/v1/caregivers/skills')
      skills.value = res.data?.list || []
      return skills.value
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 更新服务技能
   */
  async function updateSkills(skillList) {
    loadingCount.value++
    try {
      const res = await http.put('/api/v1/caregivers/skills', {
        skills: skillList,
      })
      skills.value = skillList
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 获取服务区域列表
   */
  async function fetchServiceAreas() {
    loadingCount.value++
    try {
      const res = await http.get('/api/v1/caregivers/service-areas')
      serviceAreas.value = res.data?.list || []
      return serviceAreas.value
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 更新服务区域
   */
  async function updateServiceAreas(areaList) {
    loadingCount.value++
    try {
      const res = await http.put('/api/v1/caregivers/service-areas', {
        areas: areaList,
      })
      serviceAreas.value = areaList
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 获取排班信息
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   */
  async function fetchSchedule(startDate, endDate) {
    loadingCount.value++
    try {
      const res = await http.get('/api/v1/caregivers/schedule', {
        startDate,
        endDate,
      })
      schedule.value = res.data?.list || []
      return schedule.value
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 更新排班状态
   * @param {string} date - 日期
   * @param {string} status - 排班状态 (AVAILABLE / LEAVE / BUSY)
   */
  async function updateScheduleStatus(date, status) {
    loadingCount.value++
    try {
      const res = await http.patch('/api/v1/caregivers/schedule', {
        date,
        status,
      })
      // 更新本地排班数据
      const index = schedule.value.findIndex(s => s.date === date)
      if (index !== -1) {
        schedule.value[index].status = status
      }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 设置可接单状态
   */
  async function setAvailableStatus(available) {
    loadingCount.value++
    try {
      const res = await http.patch('/api/v1/caregivers/available', {
        available,
      })
      if (caregiverInfo.value) {
        caregiverInfo.value.available = available
      }
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 上传资质证书
   */
  async function uploadCertificate(filePath, certType) {
    loadingCount.value++
    try {
      const res = await http.upload(
        '/api/v1/files/upload',
        filePath,
        { bizType: 'caregiver_certificate' },
        { idempotentKey: createIdempotentKey('cert') }
      )
      return res.data
    } finally {
      loadingCount.value--
    }
  }

  /**
   * 清空护理人员状态
   */
  function clearCaregiverState() {
    caregiverInfo.value = null
    applicationStatus.value = null
    skills.value = []
    serviceAreas.value = []
    schedule.value = []
  }

  return {
    // 状态
    caregiverInfo,
    applicationStatus,
    skills,
    serviceAreas,
    schedule,
    loading,

    // 枚举
    AUDIT_STATUS,

    // 计算属性
    isApproved,
    isPending,
    canAcceptOrder,
    caregiverId,

    // 方法
    submitApplication,
    fetchApplicationStatus,
    fetchCaregiverProfile,
    updateCaregiverProfile,
    fetchSkills,
    updateSkills,
    fetchServiceAreas,
    updateServiceAreas,
    fetchSchedule,
    updateScheduleStatus,
    setAvailableStatus,
    uploadCertificate,
    clearCaregiverState,
  }
})
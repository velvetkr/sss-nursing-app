/**
 * 管理员状态管理
 * @description 管理员审核、异常监管、投诉处理等功能
 * @author Person C
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 审核状态枚举
export const AuditStatus = {
  PENDING: 'PENDING',       // 待审核
  APPROVED: 'APPROVED',     // 已通过
  REJECTED: 'REJECTED',     // 已驳回
}

// 审核类型枚举
export const AuditType = {
  MERCHANT: 'MERCHANT',           // 商户审核
  CAREGIVER: 'CAREGIVER',         // 护理人员审核
  SERVICE: 'SERVICE',             // 服务审核
}

export const useAdminStore = defineStore('admin', () => {
  // ==================== 状态 ====================
  
  // 加载状态计数器（避免竞态条件）
  const loadingCount = ref(0)
  const loading = computed(() => loadingCount.value > 0)
  
  // 商户审核相关
  const merchantReviewList = ref([])
  const merchantReviewTotal = ref(0)
  const currentMerchantReview = ref(null)
  
  // 护理人员审核相关
  const caregiverReviewList = ref([])
  const caregiverReviewTotal = ref(0)
  const currentCaregiverReview = ref(null)
  
  // 服务审核相关
  const serviceReviewList = ref([])
  const serviceReviewTotal = ref(0)
  const currentServiceReview = ref(null)
  
  // 异常订单相关
  const abnormalOrderList = ref([])
  const abnormalOrderTotal = ref(0)
  
  // 投诉处理相关
  const complaintDetail = ref(null)
  
  // 错误信息
  const error = ref(null)

  // ==================== 商户审核 ====================
  
  /**
   * 获取商户审核列表
   * @param {Object} params - 查询参数
   * @param {string} params.status - 审核状态
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页数量
   */
  async function fetchMerchantReviewList(params = {}) {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.get('/admin/merchant-review/list', { params })
      
      if (response.code === 0) {
        merchantReviewList.value = response.data.list || []
        merchantReviewTotal.value = response.data.total || 0
      } else {
        error.value = response.message || '获取商户审核列表失败'
      }
    } catch (err) {
      console.error('获取商户审核列表失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loadingCount.value--
    }
  }
  
  /**
   * 获取商户审核详情
   * @param {number} merchantId - 商户ID
   */
  async function fetchMerchantReviewDetail(merchantId) {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.get(`/admin/merchant-review/${merchantId}`)
      
      if (response.code === 0) {
        currentMerchantReview.value = response.data
      } else {
        error.value = response.message || '获取商户审核详情失败'
      }
    } catch (err) {
      console.error('获取商户审核详情失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loadingCount.value--
    }
  }
  
  /**
   * 审核商户
   * @param {number} merchantId - 商户ID
   * @param {string} action - 审核动作（APPROVED/REJECTED）
   * @param {string} reviewComment - 审核意见
   */
  async function auditMerchant(merchantId, action, reviewComment = '') {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.post(`/admin/merchant-review/${merchantId}/audit`, {
        action,
        reviewComment,
      })
      
      if (response.code === 0) {
        // 更新列表中的状态
        const index = merchantReviewList.value.findIndex(item => item.merchantId === merchantId)
        if (index !== -1) {
          merchantReviewList.value[index].auditStatus = action
          merchantReviewList.value[index].reviewComment = reviewComment
          merchantReviewList.value[index].reviewedAt = new Date().toISOString()
        }
        
        return true
      } else {
        error.value = response.message || '审核失败'
        return false
      }
    } catch (err) {
      console.error('审核商户失败:', err)
      error.value = '网络错误，请稍后重试'
      return false
    } finally {
      loadingCount.value--
    }
  }

  // ==================== 护理人员审核 ====================
  
  /**
   * 获取护理人员审核列表
   * @param {Object} params - 查询参数
   */
  async function fetchCaregiverReviewList(params = {}) {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.get('/admin/caregiver-review/list', { params })
      
      if (response.code === 0) {
        caregiverReviewList.value = response.data.list || []
        caregiverReviewTotal.value = response.data.total || 0
      } else {
        error.value = response.message || '获取护理人员审核列表失败'
      }
    } catch (err) {
      console.error('获取护理人员审核列表失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loadingCount.value--
    }
  }
  
  /**
   * 获取护理人员审核详情
   * @param {number} caregiverId - 护理人员ID
   */
  async function fetchCaregiverReviewDetail(caregiverId) {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.get(`/admin/caregiver-review/${caregiverId}`)
      
      if (response.code === 0) {
        currentCaregiverReview.value = response.data
      } else {
        error.value = response.message || '获取护理人员审核详情失败'
      }
    } catch (err) {
      console.error('获取护理人员审核详情失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loadingCount.value--
    }
  }
  
  /**
   * 审核护理人员
   * @param {number} caregiverId - 护理人员ID
   * @param {string} action - 审核动作
   * @param {string} reviewComment - 审核意见
   */
  async function auditCaregiver(caregiverId, action, reviewComment = '') {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.post(`/admin/caregiver-review/${caregiverId}/audit`, {
        action,
        reviewComment,
      })
      
      if (response.code === 0) {
        // 更新列表中的状态
        const index = caregiverReviewList.value.findIndex(item => item.caregiverId === caregiverId)
        if (index !== -1) {
          caregiverReviewList.value[index].auditStatus = action
          caregiverReviewList.value[index].reviewComment = reviewComment
          caregiverReviewList.value[index].reviewedAt = new Date().toISOString()
        }
        
        return true
      } else {
        error.value = response.message || '审核失败'
        return false
      }
    } catch (err) {
      console.error('审核护理人员失败:', err)
      error.value = '网络错误，请稍后重试'
      return false
    } finally {
      loadingCount.value--
    }
  }

  // ==================== 服务审核 ====================
  
  /**
   * 获取服务审核列表
   * @param {Object} params - 查询参数
   */
  async function fetchServiceReviewList(params = {}) {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.get('/admin/service-review/list', { params })
      
      if (response.code === 0) {
        serviceReviewList.value = response.data.list || []
        serviceReviewTotal.value = response.data.total || 0
      } else {
        error.value = response.message || '获取服务审核列表失败'
      }
    } catch (err) {
      console.error('获取服务审核列表失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loadingCount.value--
    }
  }
  
  /**
   * 获取服务审核详情
   * @param {number} serviceId - 服务ID
   */
  async function fetchServiceReviewDetail(serviceId) {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.get(`/admin/service-review/${serviceId}`)
      
      if (response.code === 0) {
        currentServiceReview.value = response.data
      } else {
        error.value = response.message || '获取服务审核详情失败'
      }
    } catch (err) {
      console.error('获取服务审核详情失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loadingCount.value--
    }
  }
  
  /**
   * 审核服务
   * @param {number} serviceId - 服务ID
   * @param {string} action - 审核动作
   * @param {string} reviewComment - 审核意见
   */
  async function auditService(serviceId, action, reviewComment = '') {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.post(`/admin/service-review/${serviceId}/audit`, {
        action,
        reviewComment,
      })
      
      if (response.code === 0) {
        // 更新列表中的状态
        const index = serviceReviewList.value.findIndex(item => item.serviceId === serviceId)
        if (index !== -1) {
          serviceReviewList.value[index].auditStatus = action
          serviceReviewList.value[index].reviewComment = reviewComment
          serviceReviewList.value[index].reviewedAt = new Date().toISOString()
        }
        
        return true
      } else {
        error.value = response.message || '审核失败'
        return false
      }
    } catch (err) {
      console.error('审核服务失败:', err)
      error.value = '网络错误，请稍后重试'
      return false
    } finally {
      loadingCount.value--
    }
  }

  // ==================== 异常订单监管 ====================
  
  /**
   * 获取异常订单列表
   * @param {Object} params - 查询参数
   */
  async function fetchAbnormalOrderList(params = {}) {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.get('/admin/order/abnormal', { params })
      
      if (response.code === 0) {
        abnormalOrderList.value = response.data.list || []
        abnormalOrderTotal.value = response.data.total || 0
      } else {
        error.value = response.message || '获取异常订单列表失败'
      }
    } catch (err) {
      console.error('获取异常订单列表失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loadingCount.value--
    }
  }

  // ==================== 投诉处理 ====================
  
  /**
   * 获取投诉详情
   * @param {number} complaintId - 投诉ID
   */
  async function fetchComplaintDetail(complaintId) {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.get(`/admin/complaint/${complaintId}`)
      
      if (response.code === 0) {
        complaintDetail.value = response.data
      } else {
        error.value = response.message || '获取投诉详情失败'
      }
    } catch (err) {
      console.error('获取投诉详情失败:', err)
      error.value = '网络错误，请稍后重试'
    } finally {
      loadingCount.value--
    }
  }
  
  /**
   * 处理投诉
   * @param {number} complaintId - 投诉ID
   * @param {string} action - 处理动作
   * @param {string} handleResult - 处理结果
   */
  async function handleComplaint(complaintId, action, handleResult = '') {
    loadingCount.value++
    error.value = null
    
    try {
      const response = await uni.$http.post(`/admin/complaint/${complaintId}/handle`, {
        action,
        handleResult,
      })
      
      if (response.code === 0) {
        // 更新投诉详情
        if (complaintDetail.value && complaintDetail.value.complaintId === complaintId) {
          complaintDetail.value.status = 'RESOLVED'
          complaintDetail.value.handleResult = handleResult
          complaintDetail.value.handledAt = new Date().toISOString()
        }
        
        return true
      } else {
        error.value = response.message || '处理失败'
        return false
      }
    } catch (err) {
      console.error('处理投诉失败:', err)
      error.value = '网络错误，请稍后重试'
      return false
    } finally {
      loadingCount.value--
    }
  }

  // ==================== 统计数据 ====================
  
  /**
   * 待审核数量统计
   */
  const pendingReviewCount = computed(() => {
    return {
      merchant: merchantReviewList.value.filter(item => item.auditStatus === 'PENDING').length,
      caregiver: caregiverReviewList.value.filter(item => item.auditStatus === 'PENDING').length,
      service: serviceReviewList.value.filter(item => item.auditStatus === 'PENDING').length,
    }
  })
  
  /**
   * 异常订单数量
   */
  const abnormalOrderCount = computed(() => abnormalOrderTotal.value)

  // ==================== 辅助方法 ====================
  
  /**
   * 清空当前审核详情
   */
  function clearCurrentReview(type) {
    switch (type) {
      case AuditType.MERCHANT:
        currentMerchantReview.value = null
        break
      case AuditType.CAREGIVER:
        currentCaregiverReview.value = null
        break
      case AuditType.SERVICE:
        currentServiceReview.value = null
        break
    }
  }
  
  /**
   * 清空错误信息
   */
  function clearError() {
    error.value = null
  }
  
  /**
   * 重置所有状态
   */
  function resetAll() {
    merchantReviewList.value = []
    merchantReviewTotal.value = 0
    currentMerchantReview.value = null
    
    caregiverReviewList.value = []
    caregiverReviewTotal.value = 0
    currentCaregiverReview.value = null
    
    serviceReviewList.value = []
    serviceReviewTotal.value = 0
    currentServiceReview.value = null
    
    abnormalOrderList.value = []
    abnormalOrderTotal.value = 0
    
    complaintDetail.value = null
    error.value = null
  }

  return {
    // 状态
    loading,
    error,
    
    // 商户审核
    merchantReviewList,
    merchantReviewTotal,
    currentMerchantReview,
    fetchMerchantReviewList,
    fetchMerchantReviewDetail,
    auditMerchant,
    
    // 护理人员审核
    caregiverReviewList,
    caregiverReviewTotal,
    currentCaregiverReview,
    fetchCaregiverReviewList,
    fetchCaregiverReviewDetail,
    auditCaregiver,
    
    // 服务审核
    serviceReviewList,
    serviceReviewTotal,
    currentServiceReview,
    fetchServiceReviewList,
    fetchServiceReviewDetail,
    auditService,
    
    // 异常订单
    abnormalOrderList,
    abnormalOrderTotal,
    fetchAbnormalOrderList,
    
    // 投诉处理
    complaintDetail,
    fetchComplaintDetail,
    handleComplaint,
    
    // 统计
    pendingReviewCount,
    abnormalOrderCount,
    
    // 辅助方法
    clearCurrentReview,
    clearError,
    resetAll,
  }
})
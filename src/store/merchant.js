import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/utils/request.js'
import { normalizeOrderState } from '@/constants/order-status.js'

export const useMerchantStore = defineStore('merchant', () => {
  const dashboard = ref(null)
  const orders = ref([])
  const currentOrder = ref(null)
  const total = ref(0)
  const loading = ref(false)

  async function fetchDashboard() {
    const res = await http.get('/api/v1/merchants/dashboard')
    dashboard.value = res.data
    return dashboard.value
  }

  async function fetchOrders(params = {}) {
    loading.value = true
    try {
      const res = await http.get('/api/v1/merchants/orders', {
        page: params.page || 1,
        size: params.size || 20,
        ...(params.orderStatus ? { orderStatus: params.orderStatus } : {}),
        ...(params.assignmentStatus ? { assignmentStatus: params.assignmentStatus } : {}),
        ...(params.keyword ? { keyword: params.keyword } : {}),
      })
      orders.value = (res.data?.list || []).map(normalizeOrderState)
      total.value = res.data?.total || 0
      return { list: orders.value, total: total.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderDetail(orderId) {
    loading.value = true
    try {
      const res = await http.get(`/api/v1/merchants/orders/${orderId}`)
      currentOrder.value = normalizeOrderState(res.data)
      return currentOrder.value
    } finally {
      loading.value = false
    }
  }

  return {
    dashboard,
    orders,
    currentOrder,
    total,
    loading,
    fetchDashboard,
    fetchOrders,
    fetchOrderDetail,
  }
})

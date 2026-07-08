/**
 * Pinia — 订单管理
 *
 * 对齐 API v1.0（order-service）：
 * - 下单：prepay-token → create order → pay
 * - 列表、详情、取消
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http, { setIdempotentKey, clearIdempotentKey } from '@/utils/request.js'

export const useOrderStore = defineStore('order', () => {
  // ===== 状态 =====
  const orders = ref([])
  const total = ref(0)
  const currentOrder = ref(null)
  const prepayToken = ref('')
  const loading = ref(false)

  // ===== 状态映射 =====
  const STATUS_MAP = {
    0: '待支付',
    1: '待服务',
    2: '已完成',
    3: '已取消',
    4: '退款中',
    5: '已退款',
  }

  const SLOT_MAP = {
    MORNING: '上午 (08:00-12:00)',
    AFTERNOON: '下午 (13:00-17:00)',
    EVENING: '晚上 (18:00-21:00)',
  }

  // ===== 方法 =====

  /** 第一步：获取下单幂等令牌 */
  async function getPrepayToken() {
    const res = await http.post('/api/v1/orders/prepay-token')
    const token = res.data?.prepayToken
    prepayToken.value = token
    setIdempotentKey(token)
    return token
  }

  /**
   * 第二步：创建订单
   * @param {Object} params - { serviceItemId, serviceSpecId, addressId, serviceDate, serviceTimeSlot, remark }
   */
  async function createOrder(params) {
    if (!prepayToken.value) {
      throw new Error('请先获取下单令牌')
    }
    const res = await http.post('/api/v1/orders', params)
    clearIdempotentKey()
    prepayToken.value = ''
    return res.data // { orderId, orderNo }
  }

  /**
   * 第三步：发起支付
   */
  async function payOrder(orderId) {
    const res = await http.post(`/api/v1/orders/${orderId}/pay`, {
      payChannel: 'alipay',
    })
    return res.data
  }

  /** 订单列表（支持状态筛选 + 分页） */
  async function fetchOrders(params = {}) {
    loading.value = true
    try {
      const query = { page: params.page || 1, size: params.size || 20 }
      if (params.status !== undefined && params.status !== null) {
        query.status = params.status
      }
      const res = await http.get('/api/v1/orders', query)
      const data = res.data
      orders.value = data.list || []
      total.value = data.total || 0
      return { list: orders.value, total: total.value }
    } finally {
      loading.value = false
    }
  }

  /** 订单详情 */
  async function fetchOrderDetail(orderId) {
    loading.value = true
    try {
      const res = await http.get(`/api/v1/orders/${orderId}`)
      currentOrder.value = res.data
      return currentOrder.value
    } finally {
      loading.value = false
    }
  }

  /** 取消订单 */
  async function cancelOrder(orderId, cancelReason) {
    const res = await http.post(`/api/v1/orders/${orderId}/cancel`, {
      cancelReason: cancelReason || '',
    })
    // 刷新详情
    if (currentOrder.value?.orderId === orderId) {
      await fetchOrderDetail(orderId)
    }
    return res.data
  }

  /** 获取状态文案 */
  function getStatusText(status) {
    return STATUS_MAP[status] || '未知'
  }

  /** 获取时段文案 */
  function getSlotText(slot) {
    return SLOT_MAP[slot] || slot
  }

  return {
    orders,
    total,
    currentOrder,
    prepayToken,
    loading,
    STATUS_MAP,
    SLOT_MAP,
    getPrepayToken,
    createOrder,
    payOrder,
    fetchOrders,
    fetchOrderDetail,
    cancelOrder,
    getStatusText,
    getSlotText,
  }
})

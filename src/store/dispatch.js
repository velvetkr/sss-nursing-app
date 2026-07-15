import { defineStore } from 'pinia'
import { ref } from 'vue'
import http, { createIdempotentKey } from '@/utils/request.js'

export const useDispatchStore = defineStore('dispatch', () => {
  const candidates = ref([])
  const assignments = ref([])
  const loading = ref(false)

  async function fetchCandidates(orderId) {
    loading.value = true
    try {
      const res = await http.get(`/api/v1/merchants/orders/${orderId}/candidates`)
      candidates.value = res.data?.list || []
      return candidates.value
    } finally {
      loading.value = false
    }
  }

  async function fetchAssignments(orderId) {
    const res = await http.get(`/api/v1/merchants/orders/${orderId}/assignments`)
    assignments.value = res.data?.list || []
    return assignments.value
  }

  async function dispatchOrder(orderId, caregiverId, remark = '') {
    const res = await http.post(`/api/v1/merchants/orders/${orderId}/dispatch`, {
      caregiverId,
      remark,
    }, {
      idempotentKey: createIdempotentKey('dispatch'),
    })
    return res.data
  }

  async function redispatchOrder(orderId, caregiverId, remark = '') {
    const res = await http.post(`/api/v1/merchants/orders/${orderId}/redispatch`, {
      caregiverId,
      remark,
    }, {
      idempotentKey: createIdempotentKey('redispatch'),
    })
    return res.data
  }

  return {
    candidates,
    assignments,
    loading,
    fetchCandidates,
    fetchAssignments,
    dispatchOrder,
    redispatchOrder,
  }
})

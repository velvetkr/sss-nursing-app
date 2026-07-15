import { defineStore } from 'pinia'
import { ref } from 'vue'
import http, { createIdempotentKey } from '@/utils/request.js'
import { normalizeOrderState } from '@/constants/order-status.js'

export const useWorkOrderStore = defineStore('workOrder', () => {
  const tasks = ref([])
  const currentTask = ref(null)
  const loading = ref(false)

  async function fetchTasks(params = {}) {
    loading.value = true
    try {
      const res = await http.get('/api/v1/caregivers/tasks', params)
      tasks.value = (res.data?.list || []).map(normalizeOrderState)
      return tasks.value
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskDetail(orderId) {
    const res = await http.get(`/api/v1/caregivers/tasks/${orderId}`)
    currentTask.value = normalizeOrderState(res.data)
    return currentTask.value
  }

  async function acceptAssignment(assignmentId) {
    const res = await http.post(`/api/v1/caregivers/assignments/${assignmentId}/accept`, null, {
      idempotentKey: createIdempotentKey('accept'),
    })
    if (currentTask.value?.currentAssignment?.assignmentId === assignmentId) {
      await fetchTaskDetail(currentTask.value.orderId)
    }
    return res.data
  }

  async function rejectAssignment(assignmentId, reason) {
    const res = await http.post(`/api/v1/caregivers/assignments/${assignmentId}/reject`, {
      reason,
    }, {
      idempotentKey: createIdempotentKey('reject'),
    })
    if (currentTask.value?.currentAssignment?.assignmentId === assignmentId) {
      await fetchTaskDetail(currentTask.value.orderId)
    }
    return res.data
  }

  async function updateServiceStatus(orderId, action, payload = {}) {
    const res = await http.post(`/api/v1/caregivers/orders/${orderId}/${action}`, payload, {
      idempotentKey: createIdempotentKey(action),
    })
    if (currentTask.value?.orderId === orderId) {
      await fetchTaskDetail(orderId)
    }
    return res.data
  }

  const depart = (orderId, payload) => updateServiceStatus(orderId, 'depart', payload)
  const checkIn = (orderId, payload) => updateServiceStatus(orderId, 'check-in', payload)
  const startService = (orderId, payload) => updateServiceStatus(orderId, 'start', payload)
  const finishService = (orderId, payload) => updateServiceStatus(orderId, 'finish', payload)

  return {
    tasks,
    currentTask,
    loading,
    fetchTasks,
    fetchTaskDetail,
    acceptAssignment,
    rejectAssignment,
    depart,
    checkIn,
    startService,
    finishService,
  }
})

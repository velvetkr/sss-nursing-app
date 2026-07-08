/**
 * Pinia — 服务项目状态管理
 *
 * 对齐 API v1.0（catalog-service）：
 * - 分类: /api/v1/categories
 * - 列表: /api/v1/items?categoryId=&page=&size=
 * - 详情: /api/v1/items/{id}
 * - 搜索: /api/v1/items?keyword=&categoryId=&page=&size=
 * - 分页响应: { list, total, page, size }
 * - 规格数组 specs: [{ specId, name, price, originalPrice, duration }]
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/utils/request.js'

export const useServiceStore = defineStore('service', () => {
  // ===== 状态 =====
  const categories = ref([])
  const services = ref([])          // 当前列表数据
  const total = ref(0)              // 总条数
  const currentPage = ref(1)
  const pageSize = ref(20)
  const currentService = ref(null)  // 服务详情
  const searchKeyword = ref('')
  const activeCategoryId = ref(null)
  const loading = ref(false)

  // ===== 计算属性 =====
  const hasMore = computed(() => {
    return services.value.length < total.value
  })

  // ===== 方法 =====

  /** 获取服务分类 */
  async function fetchCategories() {
    const res = await http.get('/api/v1/categories')
    categories.value = res.data || []
    return categories.value
  }

  /**
   * 获取服务列表（支持分类筛选 + 分页）
   * @param {Object} params - { categoryId, page, size }
   */
  async function fetchServices(params = {}) {
    loading.value = true
    try {
      const query = {}
      if (params.categoryId) query.categoryId = params.categoryId
      if (params.page) query.page = params.page
      else query.page = currentPage.value
      if (params.size) query.size = params.size
      else query.size = pageSize.value

      const res = await http.get('/api/v1/items', query)
      const data = res.data
      services.value = data.list || []
      total.value = data.total || 0
      currentPage.value = data.page || 1
      pageSize.value = data.size || 20
      return { list: services.value, total: total.value }
    } finally {
      loading.value = false
    }
  }

  /** 加载更多（追加分页） */
  async function loadMore() {
    if (!hasMore.value) return { list: [], total: total.value }
    loading.value = true
    try {
      const query = {
        page: currentPage.value + 1,
        size: pageSize.value,
      }
      if (activeCategoryId.value) query.categoryId = activeCategoryId.value
      if (searchKeyword.value) query.keyword = searchKeyword.value

      const res = await http.get('/api/v1/items', query)
      const data = res.data
      services.value = [...services.value, ...(data.list || [])]
      total.value = data.total || 0
      currentPage.value = data.page || currentPage.value + 1
      return { list: services.value, total: total.value }
    } finally {
      loading.value = false
    }
  }

  /** 获取服务详情 */
  async function fetchServiceDetail(itemId) {
    loading.value = true
    try {
      const res = await http.get(`/api/v1/items/${itemId}`)
      currentService.value = res.data
      return currentService.value
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索服务项目
   * @param {string} keyword - 搜索关键词
   * @param {Object} params - { categoryId, page, size }
   */
  async function searchServices(keyword, params = {}) {
    searchKeyword.value = keyword
    loading.value = true
    try {
      const query = { keyword, page: params.page || 1, size: params.size || 20 }
      if (params.categoryId) query.categoryId = params.categoryId

      const res = await http.get('/api/v1/items', query)
      const data = res.data
      services.value = data.list || []
      total.value = data.total || 0
      currentPage.value = data.page || 1
      return { list: services.value, total: total.value }
    } finally {
      loading.value = false
    }
  }

  /** 切换分类 */
  function setActiveCategory(categoryId) {
    activeCategoryId.value = categoryId
  }

  /** 重置搜索/分类状态 */
  function reset() {
    services.value = []
    total.value = 0
    currentPage.value = 1
    searchKeyword.value = ''
    activeCategoryId.value = null
  }

  return {
    categories,
    services,
    total,
    currentPage,
    pageSize,
    currentService,
    searchKeyword,
    activeCategoryId,
    loading,
    hasMore,
    fetchCategories,
    fetchServices,
    loadMore,
    fetchServiceDetail,
    searchServices,
    setActiveCategory,
    reset,
  }
})

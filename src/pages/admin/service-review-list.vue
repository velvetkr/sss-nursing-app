<template>
  <view class="review-list">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索服务名称"
          placeholder-class="placeholder"
          @confirm="handleSearch"
        />
        <text v-if="searchKeyword" class="clear-btn" @tap="clearSearch">✕</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view
        class="tab-item"
        :class="{ active: currentStatus === '' }"
        @tap="changeStatus('')"
      >
        全部({{ totalCount }})
      </view>
      <view
        class="tab-item"
        :class="{ active: currentStatus === 'PENDING' }"
        @tap="changeStatus('PENDING')"
      >
        待审核({{ pendingCount }})
      </view>
      <view
        class="tab-item"
        :class="{ active: currentStatus === 'APPROVED' }"
        @tap="changeStatus('APPROVED')"
      >
        已通过({{ approvedCount }})
      </view>
      <view
        class="tab-item"
        :class="{ active: currentStatus === 'REJECTED' }"
        @tap="changeStatus('REJECTED')"
      >
        已驳回({{ rejectedCount }})
      </view>
    </view>

    <!-- 审核列表 -->
    <scroll-view
      class="review-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 列表项 -->
      <view
        v-for="item in reviewList"
        :key="item.serviceId"
        class="review-item"
        @tap="goToDetail(item.serviceId)"
      >
        <view class="item-header">
          <view class="service-info">
            <text class="service-name">{{ item.serviceName }}</text>
            <text class="service-merchant">{{ item.merchantName || '暂无商户' }}</text>
          </view>
          <view class="status-tag" :class="getStatusClass(item.auditStatus)">
            {{ getStatusText(item.auditStatus) }}
          </view>
        </view>

        <view class="item-body">
          <view class="info-row">
            <text class="info-label">服务分类：</text>
            <text class="info-value">{{ item.categoryName || '暂无' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">服务价格：</text>
            <text class="info-value price">{{ item.price ? '¥' + item.price : '暂无' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">服务时长：</text>
            <text class="info-value">{{ item.duration ? item.duration + '分钟' : '暂无' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">申请时间：</text>
            <text class="info-value">{{ formatTime(item.createdAt) }}</text>
          </view>
        </view>

        <view v-if="item.auditStatus === 'REJECTED'" class="reject-reason">
          <text class="reason-label">驳回原因：</text>
          <text class="reason-text">{{ item.reviewComment || '暂无' }}</text>
        </view>

        <view class="item-footer">
          <text class="view-detail">查看详情 ›</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view v-if="!hasMore && reviewList.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && reviewList.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无审核数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/store/admin.js'

// Store
const adminStore = useAdminStore()

// 搜索关键词
const searchKeyword = ref('')

// 当前状态
const currentStatus = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 加载状态
const loading = ref(false)
const isRefreshing = ref(false)
const hasMore = ref(true)

// 审核列表
const reviewList = computed(() => adminStore.serviceReviewList)
const totalCount = computed(() => adminStore.serviceReviewTotal)

// 统计数量
const pendingCount = computed(() =>
  reviewList.value.filter(item => item.auditStatus === 'PENDING').length
)
const approvedCount = computed(() =>
  reviewList.value.filter(item => item.auditStatus === 'APPROVED').length
)
const rejectedCount = computed(() =>
  reviewList.value.filter(item => item.auditStatus === 'REJECTED').length
)

// 加载数据
async function loadData(isRefresh = false) {
  if (loading.value) return

  loading.value = true

  try {
    await adminStore.fetchServiceReviewList({
      status: currentStatus.value,
      keyword: searchKeyword.value,
      page: isRefresh ? 1 : currentPage.value,
      size: pageSize.value,
    })

    if (isRefresh) {
      currentPage.value = 1
      hasMore.value = true
    }

    // 判断是否还有更多数据
    if (reviewList.value.length < totalCount.value) {
      hasMore.value = true
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('加载数据失败:', err)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  loadData(true)
}

// 清除搜索
function clearSearch() {
  searchKeyword.value = ''
  currentPage.value = 1
  loadData(true)
}

// 切换状态
function changeStatus(status) {
  currentStatus.value = status
  currentPage.value = 1
  loadData(true)
}

// 下拉刷新
function onRefresh() {
  isRefreshing.value = true
  loadData(true)
}

// 加载更多
function onLoadMore() {
  if (!hasMore.value || loading.value) return

  currentPage.value++
  loadData()
}

// 获取状态样式
function getStatusClass(status) {
  const statusMap = {
    PENDING: 'status-pending',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
  }
  return statusMap[status] || ''
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已驳回',
  }
  return statusMap[status] || '未知'
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 跳转详情
function goToDetail(id) {
  uni.navigateTo({
    url: `/pages/admin/service-review-detail?id=${id}`,
  })
}

// 页面加载
onMounted(() => {
  loadData(true)
})
</script>

<style lang="scss" scoped>
.review-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f6fa;
}

/* 搜索栏 */
.search-bar {
  padding: 20rpx 30rpx;
  background: #ffffff;

  .search-input {
    display: flex;
    align-items: center;
    background: #f5f6fa;
    border-radius: 40rpx;
    padding: 16rpx 24rpx;

    .search-icon {
      font-size: 32rpx;
      margin-right: 16rpx;
    }

    input {
      flex: 1;
      font-size: 28rpx;
      color: #333333;
    }

    .clear-btn {
      font-size: 32rpx;
      color: #999999;
      padding: 10rpx;
    }
  }
}

.placeholder {
  color: #999999;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  background: #ffffff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eeeeee;

  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 26rpx;
    color: #666666;
    padding: 16rpx 0;
    border-radius: 30rpx;
    transition: all 0.3s;

    &.active {
      background: #667eea;
      color: #ffffff;
    }
  }
}

/* 审核列表 */
.review-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}

.review-item {
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 24rpx;

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;

    .service-info {
      flex: 1;

      .service-name {
        display: block;
        font-size: 32rpx;
        color: #333333;
        font-weight: bold;
      }

      .service-merchant {
        display: block;
        font-size: 24rpx;
        color: #999999;
        margin-top: 8rpx;
      }
    }

    .status-tag {
      font-size: 24rpx;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;

      &.status-pending {
        background: #fff3e0;
        color: #ff9800;
      }

      &.status-approved {
        background: #e8f5e9;
        color: #4caf50;
      }

      &.status-rejected {
        background: #ffebee;
        color: #f44336;
      }
    }
  }

  .item-body {
    .info-row {
      display: flex;
      margin-bottom: 12rpx;

      .info-label {
        font-size: 26rpx;
        color: #999999;
        width: 160rpx;
      }

      .info-value {
        flex: 1;
        font-size: 26rpx;
        color: #666666;

        &.price {
          color: #f44336;
          font-weight: bold;
        }
      }
    }
  }

  .reject-reason {
    background: #ffebee;
    border-radius: 8rpx;
    padding: 16rpx;
    margin-top: 16rpx;

    .reason-label {
      font-size: 24rpx;
      color: #f44336;
    }

    .reason-text {
      font-size: 24rpx;
      color: #666666;
      margin-left: 8rpx;
    }
  }

  .item-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #eeeeee;

    .view-detail {
      font-size: 26rpx;
      color: #667eea;
    }
  }
}

/* 加载状态 */
.loading-state,
.no-more {
  text-align: center;
  padding: 40rpx 0;

  .loading-text,
  .no-more-text {
    font-size: 26rpx;
    color: #999999;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;

  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999999;
  }
}
</style>
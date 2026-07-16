<template>
  <view class="order-list-page">
    <!-- 背景弥散光 -->
    <view class="bg-glow bg-glow-top" />

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的任务</text>
    </view>

    <!-- 状态筛选标签 -->
    <view class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentStatus === tab.value }"
        @click="onTabChange(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
      </view>
    </view>

    <!-- 任务列表 -->
    <scroll-view
      class="task-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 加载中 -->
      <view v-if="workOrderStore.loading && !workOrderStore.tasks.length" class="loading-state">
        <u-icon name="loading" size="32" color="#3A7BF7" />
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!workOrderStore.tasks.length" class="empty-state">
        <view class="empty-icon">
          <u-icon name="inbox" size="64" color="#6B7B8D" />
        </view>
        <text class="empty-title">暂无任务</text>
        <text class="empty-desc">{{ getEmptyDesc() }}</text>
      </view>

      <!-- 任务列表 -->
      <view v-else class="task-list">
        <view
          v-for="task in workOrderStore.tasks"
          :key="task.assignmentId"
          class="task-card"
          @click="goTaskDetail(task.assignmentId)"
        >
          <!-- 任务头部 -->
          <view class="task-header">
            <view class="task-status" :class="getStatusClass(task.status)">
              <text class="status-text">{{ workOrderStore.getStatusText(task.status) }}</text>
            </view>
            <text class="task-date">{{ task.serviceDate }}</text>
          </view>

          <!-- 任务主体 -->
          <view class="task-body">
            <view class="task-service">
              <text class="service-name">{{ task.serviceItem }}</text>
              <text class="service-spec">{{ task.serviceSpec }}</text>
            </view>
            <view class="task-info">
              <view class="info-row">
                <u-icon name="clock" size="16" color="#6B7B8D" />
                <text class="info-text">{{ formatTime(task.serviceTimeSlot) }}</text>
              </view>
              <view class="info-row">
                <u-icon name="map" size="16" color="#6B7B8D" />
                <text class="info-text">{{ maskAddress(task.serviceAddress) }}</text>
              </view>
              <view class="info-row">
                <u-icon name="account" size="16" color="#6B7B8D" />
                <text class="info-text">{{ task.contactName }} {{ maskPhone(task.contactPhone) }}</text>
              </view>
            </view>
          </view>

          <!-- 任务底部 -->
          <view class="task-footer">
            <view class="task-price">
              <text class="price-label">服务费用</text>
              <text class="price-value">¥ {{ (task.servicePrice / 100).toFixed(2) }}</text>
            </view>
            <view class="task-action">
              <!-- 等待接单 -->
              <view v-if="task.status === 'WAITING_ACCEPT'" class="action-buttons">
                <u-button
                  type="default"
                  size="small"
                  :plain="true"
                  @click.stop="handleReject(task.assignmentId)"
                >
                  拒绝
                </u-button>
                <u-button
                  type="primary"
                  size="small"
                  @click.stop="handleAccept(task.assignmentId)"
                >
                  接受
                </u-button>
              </view>

              <!-- 已接单 -->
              <view v-else-if="task.status === 'ACCEPTED'" class="action-hint">
                <text class="hint-text">请按时前往服务地点</text>
                <u-icon name="arrow-right" size="16" color="#6B7B8D" />
              </view>

              <!-- 服务中 -->
              <view v-else-if="task.status === 'IN_SERVICE'" class="action-hint">
                <text class="hint-text active">服务进行中</text>
                <u-icon name="arrow-right" size="16" color="#6B7B8D" />
              </view>

              <!-- 其他状态 -->
              <view v-else class="action-hint">
                <text class="hint-text">查看详情</text>
                <u-icon name="arrow-right" size="16" color="#6B7B8D" />
              </view>
            </view>
          </view>

          <!-- 倒计时提醒 -->
          <view v-if="task.status === 'WAITING_ACCEPT' && task.acceptDeadline" class="countdown-bar">
            <u-icon name="info-circle" size="14" color="#F59E0B" />
            <text class="countdown-text">接单截止：{{ formatDeadline(task.acceptDeadline) }}</text>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more">
          <u-icon v-if="isLoadingMore" name="loading" size="20" color="#6B7B8D" />
          <text class="load-more-text">{{ isLoadingMore ? '加载中...' : '上拉加载更多' }}</text>
        </view>

        <!-- 没有更多 -->
        <view v-if="!hasMore && workOrderStore.tasks.length" class="no-more">
          <text class="no-more-text">没有更多任务了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkOrderStore } from '@/store/work-order.js'

const workOrderStore = useWorkOrderStore()

const currentStatus = ref(null)
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const pageSize = 20

// 状态标签
const statusTabs = computed(() => [
  {
    label: '全部',
    value: null,
    count: workOrderStore.total,
  },
  {
    label: '待接单',
    value: 'WAITING_ACCEPT',
    count: workOrderStore.pendingTasks.length,
  },
  {
    label: '已接单',
    value: 'ACCEPTED',
    count: 0,
  },
  {
    label: '服务中',
    value: 'IN_SERVICE',
    count: workOrderStore.inServiceTasks.length,
  },
  {
    label: '已完成',
    value: 'FINISHED',
    count: 0,
  },
])

// 是否有更多数据
const hasMore = computed(() => {
  return workOrderStore.tasks.length < workOrderStore.total
})

// 页面加载
onMounted(async () => {
  await loadTasks()
})

// 监听状态变化
watch(currentStatus, async () => {
  currentPage.value = 1
  await loadTasks()
})

// 加载任务列表
async function loadTasks(page = 1) {
  const params = {
    page,
    size: pageSize,
  }
  if (currentStatus.value) {
    params.status = currentStatus.value
  }
  await workOrderStore.fetchTasks(params)
}

// 标签切换
function onTabChange(status) {
  currentStatus.value = status
}

// 下拉刷新
async function onRefresh() {
  isRefreshing.value = true
  currentPage.value = 1
  try {
    await loadTasks(1)
  } finally {
    isRefreshing.value = false
  }
}

// 上拉加载更多
async function onLoadMore() {
  if (!hasMore.value || isLoadingMore.value) return
  isLoadingMore.value = true
  try {
    currentPage.value += 1
    await loadTasks(currentPage.value)
  } finally {
    isLoadingMore.value = false
  }
}

// 接受派单
async function handleAccept(assignmentId) {
  try {
    await workOrderStore.acceptAssignment(assignmentId)
    uni.showToast({ title: '接单成功', icon: 'success' })
    await loadTasks(currentPage.value)
  } catch (error) {
    uni.showToast({ title: '接单失败', icon: 'none' })
  }
}

// 拒绝派单
function handleReject(assignmentId) {
  uni.navigateTo({
    url: `/pages/caregiver/order-detail?id=${assignmentId}&action=reject`,
  })
}

// 获取状态样式类
function getStatusClass(status) {
  const classMap = {
    WAITING_ACCEPT: 'status-warning',
    ACCEPTED: 'status-primary',
    DEPARTED: 'status-primary',
    ARRIVED: 'status-primary',
    IN_SERVICE: 'status-success',
    FINISHED: 'status-success',
    WAITING_CONFIRM: 'status-success',
    REJECTED: 'status-error',
    CANCELED: 'status-default',
  }
  return classMap[status] || 'status-default'
}

// 格式化时间
function formatTime(slot) {
  const timeMap = {
    MORNING: '上午 (08:00-12:00)',
    AFTERNOON: '下午 (13:00-17:00)',
    EVENING: '晚上 (18:00-21:00)',
  }
  return timeMap[slot] || slot
}

// 格式化截止时间
function formatDeadline(deadline) {
  if (!deadline) return ''
  const date = new Date(deadline)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 遮蔽地址
function maskAddress(address) {
  if (!address) return ''
  return address.replace(/\d+/g, '**')
}

// 遮蔽手机号
function maskPhone(phone) {
  if (!phone) return ''
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

// 获取空状态描述
function getEmptyDesc() {
  const descMap = {
    WAITING_ACCEPT: '暂无待接单任务',
    ACCEPTED: '暂无已接单任务',
    IN_SERVICE: '暂无服务中任务',
    FINISHED: '暂无已完成任务',
  }
  return descMap[currentStatus.value] || '暂无任务记录'
}

// 跳转任务详情
function goTaskDetail(assignmentId) {
  uni.navigateTo({
    url: `/pages/caregiver/order-detail?id=${assignmentId}`,
  })
}
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background: $page-gradient;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120rpx);
  opacity: 0.4;
  pointer-events: none;

  &.bg-glow-top {
    width: 600rpx;
    height: 600rpx;
    background: linear-gradient(135deg, #3A7BF7 0%, #6C63FF 100%);
    top: -200rpx;
    right: -200rpx;
  }
}

.page-header {
  padding: 32rpx $spacing-base 24rpx;
  position: relative;
  z-index: 1;

  .page-title {
    font-size: 40rpx;
    font-weight: 600;
    color: $text-primary;
  }
}

.status-tabs {
  display: flex;
  gap: 16rpx;
  padding: 0 $spacing-base 24rpx;
  overflow-x: auto;
  white-space: nowrap;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    position: relative;
    flex-shrink: 0;
    padding: 12rpx 24rpx;
    background: rgba(255, 255, 255, 0.6);
    border-radius: $radius-full;
    transition: all 0.3s ease;

    &.active {
      background: $primary-color;

      .tab-text {
        color: #ffffff;
      }
    }

    .tab-text {
      font-size: 26rpx;
      color: $text-primary;
    }

    .tab-badge {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      min-width: 32rpx;
      height: 32rpx;
      line-height: 32rpx;
      padding: 0 8rpx;
      background: #FF4444;
      color: #ffffff;
      font-size: 20rpx;
      border-radius: 16rpx;
      text-align: center;
    }
  }
}

.task-scroll {
  flex: 1;
  padding: 0 $spacing-base 32rpx;
  position: relative;
  z-index: 1;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .loading-text,
  .empty-title,
  .empty-desc {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: $text-secondary;
  }

  .empty-desc {
    font-size: 24rpx;
    color: $text-placeholder;
  }
}

.task-list {
  .task-card {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16rpx);
    border-radius: $radius-lg;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: $shadow-sm;
    position: relative;

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .task-status {
        padding: 8rpx 16rpx;
        border-radius: $radius-full;

        &.status-warning {
          background: rgba(245, 158, 11, 0.15);
          .status-text { color: #F59E0B; }
        }

        &.status-primary {
          background: rgba(58, 123, 247, 0.15);
          .status-text { color: #3A7BF7; }
        }

        &.status-success {
          background: rgba(16, 185, 129, 0.15);
          .status-text { color: #10B981; }
        }

        &.status-error {
          background: rgba(255, 68, 68, 0.15);
          .status-text { color: #FF4444; }
        }

        &.status-default {
          background: rgba(107, 123, 141, 0.15);
          .status-text { color: #6B7B8D; }
        }

        .status-text {
          font-size: 24rpx;
        }
      }

      .task-date {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }

    .task-body {
      margin-bottom: 16rpx;

      .task-service {
        margin-bottom: 16rpx;

        .service-name {
          display: block;
          font-size: 32rpx;
          font-weight: 600;
          color: $text-primary;
          margin-bottom: 4rpx;
        }

        .service-spec {
          display: block;
          font-size: 24rpx;
          color: $text-secondary;
        }
      }

      .task-info {
        .info-row {
          display: flex;
          align-items: center;
          gap: 8rpx;
          margin-bottom: 8rpx;

          .info-text {
            font-size: 24rpx;
            color: $text-secondary;
          }
        }
      }
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16rpx;
      border-top: 1rpx solid rgba(107, 123, 141, 0.1);

      .task-price {
        .price-label {
          display: block;
          font-size: 24rpx;
          color: $text-placeholder;
          margin-bottom: 4rpx;
        }

        .price-value {
          display: block;
          font-size: 32rpx;
          font-weight: 600;
          color: $primary-color;
        }
      }

      .task-action {
        .action-buttons {
          display: flex;
          gap: 16rpx;
        }

        .action-hint {
          display: flex;
          align-items: center;
          gap: 8rpx;

          .hint-text {
            font-size: 24rpx;
            color: $text-secondary;

            &.active {
              color: #10B981;
            }
          }
        }
      }
    }

    .countdown-bar {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 16rpx;
      margin-top: 16rpx;
      background: rgba(245, 158, 11, 0.1);
      border-radius: $radius-base;

      .countdown-text {
        font-size: 22rpx;
        color: #F59E0B;
      }
    }
  }
}

.load-more,
.no-more {
  text-align: center;
  padding: 32rpx 0;

  .load-more-text,
  .no-more-text {
    font-size: 24rpx;
    color: $text-placeholder;
  }
}
</style>
<template>
  <view class="caregiver-home">
    <!-- 背景弥散光 -->
    <view class="bg-glow bg-glow-top" />
    <view class="bg-glow bg-glow-mid" />

    <!-- 顶部状态栏 -->
    <view class="status-header">
      <view class="header-left">
        <text class="eyebrow">护理工作台</text>
        <text class="page-title">{{ greeting }}</text>
      </view>
      <view class="header-right">
        <view class="status-badge" :class="caregiverStore.canAcceptOrder ? 'online' : 'offline'">
          <view class="status-dot" />
          <text class="status-text">{{ caregiverStore.canAcceptOrder ? '可接单' : '不可接单' }}</text>
        </view>
      </view>
    </view>

    <!-- 今日概览卡片 -->
    <view class="overview-card">
      <view class="overview-header">
        <text class="overview-title">今日任务</text>
        <text class="overview-date">{{ todayDate }}</text>
      </view>
      <view class="overview-stats">
        <view class="stat-item">
          <text class="stat-value">{{ workOrderStore.todayTaskCount }}</text>
          <text class="stat-label">待完成</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ workOrderStore.pendingTasks.length }}</text>
          <text class="stat-label">待接单</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ workOrderStore.inServiceTasks.length }}</text>
          <text class="stat-label">服务中</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-item" @click="goSchedule">
        <view class="action-icon-wrap">
          <u-icon name="calendar" size="28" color="#3A7BF7" />
        </view>
        <text class="action-label">排班管理</text>
      </view>
      <view class="action-item" @click="goProfile">
        <view class="action-icon-wrap">
          <u-icon name="account" size="28" color="#6C63FF" />
        </view>
        <text class="action-label">个人资料</text>
      </view>
      <view class="action-item" @click="toggleAvailable">
        <view class="action-icon-wrap">
          <u-icon
            :name="caregiverStore.canAcceptOrder ? 'checkmark-circle' : 'close-circle'"
            size="28"
            :color="caregiverStore.canAcceptOrder ? '#10B981' : '#FF6B6B'"
          />
        </view>
        <text class="action-label">{{ caregiverStore.canAcceptOrder ? '暂停接单' : '开启接单' }}</text>
      </view>
      <view class="action-item" @click="goHistory">
        <view class="action-icon-wrap">
          <u-icon name="list" size="28" color="#F59E0B" />
        </view>
        <text class="action-label">历史任务</text>
      </view>
    </view>

    <!-- 待处理任务 -->
    <view class="task-section">
      <view class="section-heading">
        <view>
          <text class="section-title">待处理任务</text>
          <text class="section-subtitle">及时响应，专业服务</text>
        </view>
        <text class="section-link" @click="goOrderList">全部</text>
      </view>

      <!-- 加载中 -->
      <view v-if="workOrderStore.loading" class="loading-state">
        <u-icon name="loading" size="32" color="#3A7BF7" />
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="workOrderStore.todayTasks.length === 0" class="empty-state">
        <view class="empty-icon">
          <u-icon name="checkmark-circle" size="64" color="#10B981" />
        </view>
        <text class="empty-title">暂无待处理任务</text>
        <text class="empty-desc">保持接单状态，等待新派单</text>
      </view>

      <!-- 任务列表 -->
      <view v-else class="task-list">
        <view
          v-for="task in workOrderStore.todayTasks"
          :key="task.assignmentId"
          class="task-card"
          @click="goTaskDetail(task.assignmentId)"
        >
          <view class="task-header">
            <view class="task-status" :class="getStatusClass(task.status)">
              <text class="status-text">{{ workOrderStore.getStatusText(task.status) }}</text>
            </view>
            <text class="task-time">{{ formatTime(task.serviceTimeSlot) }}</text>
          </view>
          <view class="task-body">
            <text class="task-service">{{ task.serviceItem }}</text>
            <text class="task-address">{{ maskAddress(task.serviceAddress) }}</text>
          </view>
          <view class="task-footer">
            <text class="task-price">¥ {{ (task.servicePrice / 100).toFixed(2) }}</text>
            <u-icon name="arrow-right" size="16" color="#6B7B8D" />
          </view>
        </view>
      </view>
    </view>

    <!-- 接单提醒弹窗 -->
    <u-popup v-model="showAcceptModal" mode="center" :round="10" :closeable="false">
      <view class="accept-modal">
        <view class="modal-header">
          <text class="modal-title">新的派单提醒</text>
        </view>
        <view class="modal-body">
          <text class="modal-service">{{ newTask?.serviceItem }}</text>
          <view class="modal-info">
            <u-icon name="calendar" size="16" color="#6B7B8D" />
            <text class="modal-text">{{ newTask?.serviceDate }} {{ formatTime(newTask?.serviceTimeSlot) }}</text>
          </view>
          <view class="modal-info">
            <u-icon name="map" size="16" color="#6B7B8D" />
            <text class="modal-text">{{ newTask?.serviceAddress }}</text>
          </view>
        </view>
        <view class="modal-footer">
          <u-button type="default" size="small" @click="handleReject">拒绝</u-button>
          <u-button type="primary" size="small" @click="handleAccept">接受</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCaregiverStore } from '@/store/caregiver.js'
import { useWorkOrderStore } from '@/store/work-order.js'

const caregiverStore = useCaregiverStore()
const workOrderStore = useWorkOrderStore()

const showAcceptModal = ref(false)
const newTask = ref(null)

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意休息'
  if (hour < 9) return '早上好，新的一天开始了'
  if (hour < 12) return '上午好，祝工作顺利'
  if (hour < 14) return '中午好，记得休息'
  if (hour < 18) return '下午好，继续加油'
  if (hour < 22) return '晚上好，辛苦了'
  return '夜深了，注意休息'
})

// 今日日期
const todayDate = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

// 页面加载
onMounted(async () => {
  await Promise.all([
    caregiverStore.fetchCaregiverProfile(),
    workOrderStore.fetchTodayTasks(),
  ])
})

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

// 遮蔽地址
function maskAddress(address) {
  if (!address) return ''
  return address.replace(/\d+/g, '**')
}

// 切换接单状态
async function toggleAvailable() {
  try {
    const newStatus = !caregiverStore.canAcceptOrder
    await caregiverStore.setAvailableStatus(newStatus)
    uni.showToast({
      title: newStatus ? '已开启接单' : '已暂停接单',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none',
    })
  }
}

// 接受派单
async function handleAccept() {
  if (!newTask.value) return
  try {
    await workOrderStore.acceptAssignment(newTask.value.assignmentId)
    uni.showToast({ title: '接单成功', icon: 'success' })
    showAcceptModal.value = false
    newTask.value = null
    await workOrderStore.fetchTodayTasks()
  } catch (error) {
    uni.showToast({ title: '接单失败', icon: 'none' })
  }
}

// 拒绝派单
function handleReject() {
  showAcceptModal.value = false
  if (newTask.value) {
    uni.navigateTo({
      url: `/pages/caregiver/order-detail?id=${newTask.value.assignmentId}&action=reject`,
    })
  }
  newTask.value = null
}

// 导航方法
function goSchedule() {
  uni.navigateTo({ url: '/pages/caregiver/schedule' })
}

function goProfile() {
  uni.navigateTo({ url: '/pages/caregiver/profile' })
}

function goHistory() {
  uni.navigateTo({ url: '/pages/caregiver/order-list?status=FINISHED' })
}

function goOrderList() {
  uni.navigateTo({ url: '/pages/caregiver/order-list' })
}

function goTaskDetail(assignmentId) {
  uni.navigateTo({ url: `/pages/caregiver/order-detail?id=${assignmentId}` })
}
</script>

<style lang="scss" scoped>
.caregiver-home {
  min-height: 100vh;
  padding: 32rpx $spacing-base 48rpx;
  background: $page-gradient;
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

  &.bg-glow-mid {
    width: 500rpx;
    height: 500rpx;
    background: linear-gradient(135deg, #6C63FF 0%, #9D4EDD 100%);
    top: 400rpx;
    left: -200rpx;
  }
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 1;

  .header-left {
    .eyebrow {
      display: block;
      font-size: 24rpx;
      color: $text-placeholder;
      margin-bottom: 8rpx;
    }

    .page-title {
      display: block;
      font-size: 40rpx;
      font-weight: 600;
      color: $text-primary;
    }
  }

  .header-right {
    .status-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 24rpx;
      border-radius: $radius-full;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(16rpx);

      &.online {
        .status-dot {
          background: #10B981;
        }
      }

      &.offline {
        .status-dot {
          background: #FF6B6B;
        }
      }

      .status-dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
      }

      .status-text {
        font-size: 24rpx;
        color: $text-primary;
      }
    }
  }
}

.overview-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24rpx);
  border-radius: $radius-xl;
  padding: $spacing-xl;
  margin-bottom: 32rpx;
  box-shadow: $shadow-card;
  position: relative;
  z-index: 1;

  .overview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .overview-title {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
    }

    .overview-date {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }

  .overview-stats {
    display: flex;
    justify-content: space-around;
    align-items: center;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: 48rpx;
        font-weight: 600;
        color: $primary-color;
        margin-bottom: 8rpx;
      }

      .stat-label {
        display: block;
        font-size: 24rpx;
        color: $text-secondary;
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 48rpx;
      background: rgba(107, 123, 141, 0.2);
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;

    .action-icon-wrap {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(16rpx);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: $shadow-sm;
    }

    .action-label {
      font-size: 24rpx;
      color: $text-primary;
    }
  }
}

.task-section {
  position: relative;
  z-index: 1;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;

  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8rpx;
  }

  .section-subtitle {
    display: block;
    font-size: 24rpx;
    color: $text-secondary;
  }

  .section-link {
    font-size: 24rpx;
    color: $primary-color;
  }
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  background: rgba(255, 255, 255, 0.6);
  border-radius: $radius-xl;

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

        .status-text {
          font-size: 24rpx;
        }
      }

      .task-time {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }

    .task-body {
      margin-bottom: 16rpx;

      .task-service {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: $text-primary;
        margin-bottom: 8rpx;
      }

      .task-address {
        display: block;
        font-size: 24rpx;
        color: $text-secondary;
      }
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .task-price {
        font-size: 28rpx;
        font-weight: 600;
        color: $primary-color;
      }
    }
  }
}

.accept-modal {
  width: 600rpx;
  padding: 48rpx;
  background: #ffffff;
  border-radius: $radius-xl;

  .modal-header {
    text-align: center;
    margin-bottom: 32rpx;

    .modal-title {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
    }
  }

  .modal-body {
    margin-bottom: 32rpx;

    .modal-service {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 24rpx;
    }

    .modal-info {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 12rpx;

      .modal-text {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
  }

  .modal-footer {
    display: flex;
    gap: 24rpx;
  }
}
</style>
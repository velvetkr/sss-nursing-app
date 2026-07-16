<template>
  <view class="order-detail-page">
    <!-- 背景弥散光 -->
    <view class="bg-glow bg-glow-top" />

    <!-- 加载中 -->
    <view v-if="workOrderStore.loading" class="loading-state">
      <u-icon name="loading" size="32" color="#3A7BF7" />
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 任务详情 -->
    <scroll-view v-else class="detail-scroll" scroll-y>
      <!-- 状态卡片 -->
      <view class="status-card">
        <view class="status-header">
          <view class="status-badge" :class="getStatusClass(task?.status)">
            <u-icon :name="getStatusIcon(task?.status)" size="24" :color="getStatusColor(task?.status)" />
            <text class="status-text">{{ workOrderStore.getStatusText(task?.status) }}</text>
          </view>
          <text class="task-date">{{ task?.serviceDate }}</text>
        </view>

        <!-- 服务信息 -->
        <view class="service-info">
          <text class="service-name">{{ task?.serviceItem }}</text>
          <text class="service-spec">{{ task?.serviceSpec }}</text>
          <view class="service-price">
            <text class="price-label">服务费用</text>
            <text class="price-value">¥ {{ (task?.servicePrice / 100).toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- 服务时间与地址 -->
      <view class="info-card">
        <view class="card-title">
          <u-icon name="calendar" size="20" color="#3A7BF7" />
          <text class="title-text">服务时间与地点</text>
        </view>

        <view class="info-item">
          <text class="info-label">服务时间</text>
          <text class="info-value">{{ task?.serviceDate }} {{ formatTime(task?.serviceTimeSlot) }}</text>
        </view>

        <view class="info-item">
          <text class="info-label">服务地址</text>
          <view class="address-value">
            <text class="address-text">{{ task?.serviceAddress }} {{ task?.serviceAddressDetail }}</text>
            <u-icon name="map" size="20" color="#3A7BF7" @click="openMap" />
          </view>
        </view>

        <view class="info-item">
          <text class="info-label">联系人</text>
          <text class="info-value">{{ task?.contactName }} {{ task?.contactPhone }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <view class="card-title">
          <u-icon name="file-text" size="20" color="#6C63FF" />
          <text class="title-text">订单信息</text>
        </view>

        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ task?.orderNo }}</text>
        </view>

        <view class="info-item">
          <text class="info-label">服务商户</text>
          <text class="info-value">{{ task?.merchantName }}</text>
        </view>

        <view v-if="task?.assignedAt" class="info-item">
          <text class="info-label">派单时间</text>
          <text class="info-value">{{ formatDateTime(task?.assignedAt) }}</text>
        </view>
      </view>

      <!-- 状态时间线 -->
      <view class="timeline-card">
        <view class="card-title">
          <u-icon name="clock" size="20" color="#10B981" />
          <text class="title-text">服务进度</text>
        </view>

        <view class="timeline-list">
          <view
            v-for="(event, index) in timelineEvents"
            :key="index"
            class="timeline-item"
          >
            <view class="timeline-dot" :class="{ active: event.active }" />
            <view class="timeline-content">
              <text class="timeline-title">{{ event.title }}</text>
              <text v-if="event.time" class="timeline-time">{{ formatDateTime(event.time) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 拒单原因 -->
      <view v-if="task?.status === 'REJECTED' && task?.rejectReason" class="info-card">
        <view class="card-title">
          <u-icon name="info-circle" size="20" color="#FF4444" />
          <text class="title-text">拒绝原因</text>
        </view>
        <text class="reject-reason">{{ task?.rejectReason }}</text>
      </view>

      <!-- 服务记录 -->
      <view v-if="task?.serviceRecord" class="info-card">
        <view class="card-title">
          <u-icon name="edit-pen" size="20" color="#F59E0B" />
          <text class="title-text">服务记录</text>
        </view>

        <view class="service-record">
          <view v-if="task.serviceRecord.serviceItems?.length" class="record-section">
            <text class="record-label">服务项目</text>
            <view class="record-items">
              <text v-for="item in task.serviceRecord.serviceItems" :key="item" class="record-tag">
                {{ item }}
              </text>
            </view>
          </view>

          <view v-if="task.serviceRecord.serviceNote" class="record-section">
            <text class="record-label">服务备注</text>
            <text class="record-text">{{ task.serviceRecord.serviceNote }}</text>
          </view>

          <view v-if="task.serviceRecord.images?.length" class="record-section">
            <text class="record-label">服务图片</text>
            <view class="record-images">
              <image
                v-for="(img, index) in task.serviceRecord.images"
                :key="index"
                :src="img"
                class="record-image"
                mode="aspectFill"
                @click="previewImage(index)"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作区 -->
      <view class="action-section">
        <!-- 等待接单 -->
        <view v-if="task?.status === 'WAITING_ACCEPT'" class="action-buttons">
          <u-button type="default" size="large" @click="handleReject">
            拒绝接单
          </u-button>
          <u-button type="primary" size="large" @click="handleAccept">
            接受接单
          </u-button>
        </view>

        <!-- 已接单 -->
        <view v-else-if="task?.status === 'ACCEPTED'" class="action-buttons">
          <u-button type="primary" size="large" @click="handleDepart">
            确认出发
          </u-button>
        </view>

        <!-- 已出发 -->
        <view v-else-if="task?.status === 'DEPARTED'" class="action-buttons">
          <u-button type="primary" size="large" @click="handleCheckin">
            到达签到
          </u-button>
        </view>

        <!-- 已到达 -->
        <view v-else-if="task?.status === 'ARRIVED'" class="action-buttons">
          <u-button type="primary" size="large" @click="handleStartService">
            开始服务
          </u-button>
        </view>

        <!-- 服务中 -->
        <view v-else-if="task?.status === 'IN_SERVICE'" class="action-buttons">
          <u-button type="primary" size="large" @click="handleFinishService">
            结束服务
          </u-button>
        </view>

        <!-- 等待确认 -->
        <view v-else-if="task?.status === 'WAITING_CONFIRM'" class="action-hint">
          <u-icon name="checkmark-circle" size="20" color="#10B981" />
          <text class="hint-text">服务已完成，等待顾客确认</text>
        </view>

        <!-- 已完成 -->
        <view v-else-if="task?.status === 'FINISHED'" class="action-hint">
          <u-icon name="checkmark-circle" size="20" color="#10B981" />
          <text class="hint-text">服务已完成</text>
        </view>
      </view>

      <view class="bottom-space" />
    </scroll-view>

    <!-- 拒单弹窗 -->
    <u-popup v-model="showRejectModal" mode="center" :round="10" :closeable="false">
      <view class="reject-modal">
        <view class="modal-header">
          <text class="modal-title">拒绝接单</text>
        </view>
        <view class="modal-body">
          <u-input
            v-model="rejectReason"
            type="textarea"
            placeholder="请输入拒绝原因（必填）"
            :maxlength="200"
            border="bottom"
          />
        </view>
        <view class="modal-footer">
          <u-button type="default" size="small" @click="showRejectModal = false">
            取消
          </u-button>
          <u-button type="primary" size="small" :disabled="!rejectReason.trim()" @click="confirmReject">
            确认拒绝
          </u-button>
        </view>
      </view>
    </u-popup>

    <!-- 结束服务弹窗 -->
    <u-popup v-model="showFinishModal" mode="center" :round="10" :closeable="false">
      <view class="finish-modal">
        <view class="modal-header">
          <text class="modal-title">结束服务</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">服务项目 <text class="required">*</text></text>
            <view class="service-tags">
              <view
                v-for="item in serviceItemOptions"
                :key="item"
                class="service-tag"
                :class="{ active: finishForm.serviceItems.includes(item) }"
                @click="toggleServiceItem(item)"
              >
                <text class="tag-text">{{ item }}</text>
              </view>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">服务备注</text>
            <u-input
              v-model="finishForm.serviceNote"
              type="textarea"
              placeholder="请输入服务备注"
              :maxlength="500"
              border="bottom"
            />
          </view>
        </view>
        <view class="modal-footer">
          <u-button type="default" size="small" @click="showFinishModal = false">
            取消
          </u-button>
          <u-button type="primary" size="small" :disabled="finishForm.serviceItems.length === 0" @click="confirmFinish">
            确认结束
          </u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkOrderStore } from '@/store/work-order.js'

const workOrderStore = useWorkOrderStore()

const assignmentId = ref(null)
const task = computed(() => workOrderStore.currentTask)
const showRejectModal = ref(false)
const rejectReason = ref('')
const showFinishModal = ref(false)

const finishForm = ref({
  serviceItems: [],
  serviceNote: '',
  images: [],
})

const serviceItemOptions = [
  '测量血压',
  '测量血糖',
  '伤口护理',
  '康复训练',
  '个人卫生护理',
  '饮食护理',
  '心理疏导',
  '其他',
]

// 时间线事件
const timelineEvents = computed(() => {
  if (!task.value) return []

  const events = [
    { title: '派单成功', time: task.value.assignedAt, active: true },
    { title: '接单', time: task.value.acceptedAt, active: !!task.value.acceptedAt },
    { title: '出发', time: task.value.departedAt, active: !!task.value.departedAt },
    { title: '到达', time: task.value.arrivedAt, active: !!task.value.arrivedAt },
    { title: '开始服务', time: task.value.serviceStartedAt, active: !!task.value.serviceStartedAt },
    { title: '结束服务', time: task.value.serviceFinishedAt, active: !!task.value.serviceFinishedAt },
  ]

  return events
})

// 页面加载
onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  assignmentId.value = currentPage.options?.id

  if (assignmentId.value) {
    await workOrderStore.fetchTaskDetail(parseInt(assignmentId.value))
  }
})

// 接受派单
async function handleAccept() {
  try {
    await workOrderStore.acceptAssignment(parseInt(assignmentId.value))
    uni.showToast({ title: '接单成功', icon: 'success' })
    await workOrderStore.fetchTaskDetail(parseInt(assignmentId.value))
  } catch (error) {
    uni.showToast({ title: '接单失败', icon: 'none' })
  }
}

// 拒绝派单
function handleReject() {
  showRejectModal.value = true
}

// 确认拒绝
async function confirmReject() {
  if (!rejectReason.value.trim()) return

  try {
    await workOrderStore.rejectAssignment(parseInt(assignmentId.value), rejectReason.value)
    uni.showToast({ title: '已拒绝', icon: 'success' })
    showRejectModal.value = false
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 确认出发
async function handleDepart() {
  try {
    await workOrderStore.confirmDeparture(parseInt(assignmentId.value))
    uni.showToast({ title: '已出发', icon: 'success' })
    await workOrderStore.fetchTaskDetail(parseInt(assignmentId.value))
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 签到
function handleCheckin() {
  uni.navigateTo({
    url: `/pages/caregiver/check-in?id=${assignmentId.value}`,
  })
}

// 开始服务
async function handleStartService() {
  try {
    await workOrderStore.startService(parseInt(assignmentId.value))
    uni.showToast({ title: '服务已开始', icon: 'success' })
    await workOrderStore.fetchTaskDetail(parseInt(assignmentId.value))
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 结束服务
function handleFinishService() {
  showFinishModal.value = true
}

// 切换服务项目
function toggleServiceItem(item) {
  const index = finishForm.value.serviceItems.indexOf(item)
  if (index > -1) {
    finishForm.value.serviceItems.splice(index, 1)
  } else {
    finishForm.value.serviceItems.push(item)
  }
}

// 确认结束
async function confirmFinish() {
  if (finishForm.value.serviceItems.length === 0) return

  try {
    await workOrderStore.finishService(parseInt(assignmentId.value), {
      serviceItems: finishForm.value.serviceItems,
      serviceNote: finishForm.value.serviceNote,
      images: finishForm.value.images,
    })
    uni.showToast({ title: '服务已完成', icon: 'success' })
    showFinishModal.value = false
    await workOrderStore.fetchTaskDetail(parseInt(assignmentId.value))
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
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
  }
  return classMap[status] || 'status-default'
}

// 获取状态图标
function getStatusIcon(status) {
  const iconMap = {
    WAITING_ACCEPT: 'clock',
    ACCEPTED: 'checkmark-circle',
    DEPARTED: 'car',
    ARRIVED: 'map',
    IN_SERVICE: 'play-circle',
    FINISHED: 'checkmark-circle-fill',
    WAITING_CONFIRM: 'info-circle',
    REJECTED: 'close-circle',
  }
  return iconMap[status] || 'info-circle'
}

// 获取状态颜色
function getStatusColor(status) {
  const colorMap = {
    WAITING_ACCEPT: '#F59E0B',
    ACCEPTED: '#3A7BF7',
    DEPARTED: '#3A7BF7',
    ARRIVED: '#3A7BF7',
    IN_SERVICE: '#10B981',
    FINISHED: '#10B981',
    WAITING_CONFIRM: '#10B981',
    REJECTED: '#FF4444',
  }
  return colorMap[status] || '#6B7B8D'
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

// 格式化日期时间
function formatDateTime(datetime) {
  if (!datetime) return ''
  return datetime.replace('T', ' ').replace(/\+08:00$/, '')
}

// 打开地图
function openMap() {
  if (!task.value?.lat || !task.value?.lng) return
  uni.openLocation({
    latitude: task.value.lat,
    longitude: task.value.lng,
    name: task.value.serviceAddress,
    address: task.value.serviceAddressDetail,
  })
}

// 预览图片
function previewImage(index) {
  if (!task.value?.serviceRecord?.images) return
  uni.previewImage({
    current: index,
    urls: task.value.serviceRecord.images,
  })
}
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
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
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: $text-secondary;
  }
}

.detail-scroll {
  height: 100vh;
  padding: 32rpx $spacing-base;
}

.status-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24rpx);
  border-radius: $radius-xl;
  padding: $spacing-xl;
  margin-bottom: 24rpx;
  box-shadow: $shadow-card;

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 20rpx;
      border-radius: $radius-full;

      &.status-warning {
        background: rgba(245, 158, 11, 0.15);
      }

      &.status-primary {
        background: rgba(58, 123, 247, 0.15);
      }

      &.status-success {
        background: rgba(16, 185, 129, 0.15);
      }

      &.status-error {
        background: rgba(255, 68, 68, 0.15);
      }

      .status-text {
        font-size: 28rpx;
        color: $text-primary;
      }
    }

    .task-date {
      font-size: 24rpx;
      color: $text-secondary;
    }
  }

  .service-info {
    .service-name {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 8rpx;
    }

    .service-spec {
      display: block;
      font-size: 24rpx;
      color: $text-secondary;
      margin-bottom: 24rpx;
    }

    .service-price {
      display: flex;
      align-items: baseline;
      gap: 12rpx;

      .price-label {
        font-size: 24rpx;
        color: $text-placeholder;
      }

      .price-value {
        font-size: 36rpx;
        font-weight: 600;
        color: $primary-color;
      }
    }
  }
}

.info-card,
.timeline-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16rpx);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: 24rpx;
  box-shadow: $shadow-sm;

  .card-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 24rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
    }
  }

  .info-item {
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      display: block;
      font-size: 24rpx;
      color: $text-placeholder;
      margin-bottom: 8rpx;
    }

    .info-value {
      display: block;
      font-size: 28rpx;
      color: $text-primary;
    }

    .address-value {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .address-text {
        flex: 1;
        font-size: 28rpx;
        color: $text-primary;
      }
    }
  }
}

.timeline-card {
  .timeline-list {
    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 20rpx;
      margin-bottom: 24rpx;
      position: relative;

      &:last-child {
        margin-bottom: 0;
      }

      .timeline-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background: rgba(107, 123, 141, 0.3);
        flex-shrink: 0;
        margin-top: 8rpx;

        &.active {
          background: #10B981;
        }
      }

      .timeline-content {
        flex: 1;

        .timeline-title {
          display: block;
          font-size: 28rpx;
          color: $text-primary;
          margin-bottom: 4rpx;
        }

        .timeline-time {
          display: block;
          font-size: 24rpx;
          color: $text-placeholder;
        }
      }
    }
  }
}

.reject-reason {
  font-size: 28rpx;
  color: #FF4444;
  line-height: 1.6;
}

.service-record {
  .record-section {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .record-label {
      display: block;
      font-size: 24rpx;
      color: $text-placeholder;
      margin-bottom: 12rpx;
    }

    .record-items {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .record-tag {
        padding: 8rpx 16rpx;
        background: rgba(58, 123, 247, 0.1);
        border-radius: $radius-base;
        font-size: 24rpx;
        color: $primary-color;
      }
    }

    .record-text {
      font-size: 28rpx;
      color: $text-primary;
      line-height: 1.6;
    }

    .record-images {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .record-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: $radius-base;
      }
    }
  }
}

.action-section {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16rpx);
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;

  .action-buttons {
    display: flex;
    gap: 24rpx;
  }

  .action-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 24rpx 0;

    .hint-text {
      font-size: 28rpx;
      color: #10B981;
    }
  }
}

.bottom-space {
  height: 48rpx;
}

.reject-modal,
.finish-modal {
  width: 600rpx;
  padding: 48rpx;

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

    .form-item {
      margin-bottom: 24rpx;

      .form-label {
        display: block;
        font-size: 28rpx;
        color: $text-primary;
        margin-bottom: 16rpx;

        .required {
          color: #FF4444;
        }
      }

      .service-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;

        .service-tag {
          padding: 12rpx 20rpx;
          background: rgba(245, 247, 250, 0.6);
          border: 2rpx solid transparent;
          border-radius: $radius-base;
          transition: all 0.3s ease;

          &.active {
            background: rgba(58, 123, 247, 0.1);
            border-color: $primary-color;
          }

          .tag-text {
            font-size: 26rpx;
            color: $text-primary;
          }
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    gap: 24rpx;
  }
}
</style>
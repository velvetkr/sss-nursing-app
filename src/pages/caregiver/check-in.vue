<template>
  <view class="checkin-page">
    <!-- 背景弥散光 -->
    <view class="bg-glow bg-glow-top" />
    <view class="bg-glow bg-glow-bottom" />

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">服务签到</text>
      <text class="page-subtitle">请到达服务地点后进行签到</text>
    </view>

    <!-- 定位状态卡片 -->
    <view class="location-card">
      <view class="location-header">
        <view class="location-icon" :class="locationStatus">
          <u-icon
            :name="locationStatus === 'success' ? 'checkmark-circle' : 'map-pin'"
            size="32"
            :color="locationStatus === 'success' ? '#10B981' : '#3A7BF7'"
          />
        </view>
        <view class="location-info">
          <text class="location-title">{{ locationTitle }}</text>
          <text class="location-desc">{{ locationDesc }}</text>
        </view>
      </view>

      <!-- 定位信息 -->
      <view v-if="currentLocation" class="location-detail">
        <view class="detail-item">
          <u-icon name="map" size="20" color="#6B7B8D" />
          <text class="detail-text">{{ currentLocation.address || '获取地址中...' }}</text>
        </view>
        <view class="detail-item">
          <u-icon name="navigation" size="20" color="#6B7B8D" />
          <text class="detail-text">
            经度: {{ currentLocation.longitude?.toFixed(6) }} 纬度: {{ currentLocation.latitude?.toFixed(6) }}
          </text>
        </view>
      </view>

      <!-- 距离提示 -->
      <view v-if="distance !== null" class="distance-info">
        <view class="distance-item" :class="distanceClass">
          <u-icon
            :name="distance <= 500 ? 'checkmark-circle' : 'info-circle'"
            size="20"
            :color="distance <= 500 ? '#10B981' : '#FF4444'"
          />
          <text class="distance-text">
            距离服务地点: {{ distance }}米
          </text>
        </view>
        <text v-if="distance > 500" class="distance-warning">
          超出签到范围（500米），需提交异常说明
        </text>
      </view>
    </view>

    <!-- 服务地点信息 -->
    <view class="service-card">
      <view class="card-title">
        <u-icon name="home" size="20" color="#6C63FF" />
        <text class="title-text">服务地点</text>
      </view>

      <view class="service-address">
        <text class="address-text">{{ task?.serviceAddress }} {{ task?.serviceAddressDetail }}</text>
        <u-icon name="map" size="24" color="#6C63FF" @click="openMap" />
      </view>

      <view class="service-info">
        <view class="info-row">
          <u-icon name="account" size="16" color="#6B7B8D" />
          <text class="info-text">{{ task?.contactName }} {{ task?.contactPhone }}</text>
        </view>
        <view class="info-row">
          <u-icon name="clock" size="16" color="#6B7B8D" />
          <text class="info-text">{{ task?.serviceDate }} {{ formatTime(task?.serviceTimeSlot) }}</text>
        </view>
      </view>
    </view>

    <!-- 异常说明 -->
    <view v-if="distance !== null && distance > 500" class="abnormal-card">
      <view class="card-title">
        <u-icon name="info-circle" size="20" color="#F59E0B" />
        <text class="title-text">异常签到说明</text>
      </view>

      <view class="abnormal-form">
        <text class="form-label">异常原因 <text class="required">*</text></text>
        <u-input
          v-model="abnormalReason"
          type="textarea"
          placeholder="请说明无法到达签到范围的原因"
          :maxlength="200"
          border="bottom"
        />

        <text class="form-label">补充说明</text>
        <u-input
          v-model="abnormalNote"
          type="textarea"
          placeholder="其他需要说明的情况（选填）"
          :maxlength="500"
          border="bottom"
        />
      </view>
    </view>

    <!-- 签到记录 -->
    <view v-if="checkinRecord" class="record-card">
      <view class="card-title">
        <u-icon name="checkmark-circle" size="20" color="#10B981" />
        <text class="title-text">签到记录</text>
      </view>

      <view class="record-info">
        <view class="record-item">
          <text class="record-label">签到时间</text>
          <text class="record-value">{{ formatDateTime(checkinRecord.checkinTime) }}</text>
        </view>
        <view class="record-item">
          <text class="record-label">签到状态</text>
          <view class="record-status" :class="checkinRecord.status === 'SUCCESS' ? 'success' : 'abnormal'">
            <text class="status-text">{{ checkinRecord.status === 'SUCCESS' ? '签到成功' : '异常签到' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作区 -->
    <view class="action-section">
      <u-button
        v-if="!checkinRecord"
        type="primary"
        size="large"
        :loading="isSubmitting"
        :disabled="!canCheckin"
        @click="handleCheckin"
      >
        {{ canCheckin ? '确认签到' : '正在定位...' }}
      </u-button>

      <u-button
        v-else
        type="primary"
        size="large"
        @click="handleComplete"
      >
        继续服务
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWorkOrderStore } from '@/store/work-order.js'

const workOrderStore = useWorkOrderStore()

const assignmentId = ref(null)
const task = computed(() => workOrderStore.currentTask)

const currentLocation = ref(null)
const distance = ref(null)
const isLocating = ref(false)
const isSubmitting = ref(false)
const checkinRecord = ref(null)

const abnormalReason = ref('')
const abnormalNote = ref('')

let locationTimer = null
// 组件挂载状态标志，防止卸载后回调执行
const isMounted = ref(true)

// 定位状态
const locationStatus = computed(() => {
  if (!currentLocation.value) return 'loading'
  if (distance.value === null) return 'loading'
  return distance.value <= 500 ? 'success' : 'warning'
})

// 定位标题
const locationTitle = computed(() => {
  if (isLocating.value) return '正在定位...'
  if (!currentLocation.value) return '获取位置信息'
  if (distance.value === null) return '计算距离中...'
  return distance.value <= 500 ? '定位成功' : '定位异常'
})

// 定位描述
const locationDesc = computed(() => {
  if (isLocating.value) return '请确保已开启定位权限'
  if (!currentLocation.value) return '点击下方按钮开始定位'
  if (distance.value === null) return '正在计算与服务地点的距离'
  return distance.value <= 500 ? '您在签到范围内' : '您不在签到范围内'
})

// 距离样式类
const distanceClass = computed(() => {
  if (distance.value === null) return ''
  return distance.value <= 500 ? 'in-range' : 'out-range'
})

// 是否可以签到
const canCheckin = computed(() => {
  if (!currentLocation.value || distance.value === null || isSubmitting.value) {
    return false
  }
  if (distance.value <= 500) {
    return true
  }
  return abnormalReason.value.trim().length > 0
})

// 页面加载
onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  assignmentId.value = currentPage.options?.id

  if (assignmentId.value) {
    await workOrderStore.fetchTaskDetail(parseInt(assignmentId.value))
    startLocation()
  }
})

// 页面卸载
onUnmounted(() => {
  isMounted.value = false
  stopLocation()
})

// 开始定位
function startLocation() {
  isLocating.value = true
  getLocation()
}

// 获取位置
function getLocation() {
  uni.getLocation({
    type: 'gcj02',
    geocode: true,
    success: (res) => {
      // 检查组件是否仍挂载
      if (!isMounted.value) return
      currentLocation.value = {
        latitude: res.latitude,
        longitude: res.longitude,
        address: res.address?.street || res.address?.streetSub || '',
      }
      calculateDistance()
    },
    fail: (error) => {
      // 检查组件是否仍挂载
      if (!isMounted.value) return
      console.error('定位失败:', error)
      uni.showToast({
        title: '定位失败，请检查定位权限',
        icon: 'none',
      })
      isLocating.value = false
    },
    complete: () => {
      // 检查组件是否仍挂载
      if (!isMounted.value) return
      isLocating.value = false
    },
  })
}

// 停止定位
function stopLocation() {
  if (locationTimer) {
    clearInterval(locationTimer)
    locationTimer = null
  }
}

// 计算距离
function calculateDistance() {
  if (!currentLocation.value || !task.value?.lat || !task.value?.lng) {
    distance.value = null
    return
  }

  // 使用 Haversine 公式计算两点距离
  const lat1 = currentLocation.value.latitude
  const lng1 = currentLocation.value.longitude
  const lat2 = task.value.lat
  const lng2 = task.value.lng

  const R = 6371000 // 地球半径（米）
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  distance.value = Math.round(R * c)
}

// 角度转弧度
function toRad(deg) {
  return deg * (Math.PI / 180)
}

// 处理签到
async function handleCheckin() {
  if (!canCheckin.value || isSubmitting.value) return

  isSubmitting.value = true
  try {
    const checkinData = {
      latitude: currentLocation.value.latitude,
      longitude: currentLocation.value.longitude,
      distance: distance.value,
      address: currentLocation.value.address,
    }

    // 如果是异常签到，添加异常说明
    if (distance.value > 500) {
      checkinData.abnormalReason = abnormalReason.value
      checkinData.abnormalNote = abnormalNote.value
      checkinData.status = 'ABNORMAL'
    } else {
      checkinData.status = 'SUCCESS'
    }

    await workOrderStore.checkin(parseInt(assignmentId.value), checkinData)

    // 保存签到记录
    checkinRecord.value = {
      checkinTime: new Date().toISOString(),
      status: checkinData.status,
      distance: distance.value,
    }

    uni.showToast({
      title: checkinData.status === 'SUCCESS' ? '签到成功' : '异常签到已提交',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: '签到失败，请重试',
      icon: 'none',
    })
  } finally {
    isSubmitting.value = false
  }
}

// 继续服务
function handleComplete() {
  uni.navigateTo({
    url: `/pages/caregiver/order-detail?id=${assignmentId.value}`,
  })
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
</script>

<style lang="scss" scoped>
.checkin-page {
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

  &.bg-glow-bottom {
    width: 500rpx;
    height: 500rpx;
    background: linear-gradient(135deg, #6C63FF 0%, #9D4EDD 100%);
    bottom: -100rpx;
    left: -200rpx;
  }
}

.page-header {
  text-align: center;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 1;

  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8rpx;
  }

  .page-subtitle {
    display: block;
    font-size: 24rpx;
    color: $text-secondary;
  }
}

.location-card,
.service-card,
.abnormal-card,
.record-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24rpx);
  border-radius: $radius-xl;
  padding: $spacing-lg;
  margin-bottom: 24rpx;
  box-shadow: $shadow-card;
  position: relative;
  z-index: 1;
}

.location-card {
  .location-header {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-bottom: 24rpx;

    .location-icon {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.success {
        background: rgba(16, 185, 129, 0.15);
      }

      &.warning {
        background: rgba(245, 158, 11, 0.15);
      }

      &.loading {
        background: rgba(58, 123, 247, 0.15);
      }
    }

    .location-info {
      flex: 1;

      .location-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: $text-primary;
        margin-bottom: 4rpx;
      }

      .location-desc {
        display: block;
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
  }

  .location-detail {
    padding: 24rpx;
    background: rgba(245, 247, 250, 0.6);
    border-radius: $radius-lg;
    margin-bottom: 24rpx;

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .detail-text {
        flex: 1;
        font-size: 24rpx;
        color: $text-primary;
      }
    }
  }

  .distance-info {
    .distance-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 8rpx;

      &.in-range {
        .distance-text {
          color: #10B981;
        }
      }

      &.out-range {
        .distance-text {
          color: #FF4444;
        }
      }

      .distance-text {
        font-size: 28rpx;
        font-weight: 600;
      }
    }

    .distance-warning {
      display: block;
      font-size: 24rpx;
      color: #FF4444;
      margin-top: 8rpx;
    }
  }
}

.service-card {
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

  .service-address {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    background: rgba(245, 247, 250, 0.6);
    border-radius: $radius-lg;
    margin-bottom: 24rpx;

    .address-text {
      flex: 1;
      font-size: 28rpx;
      color: $text-primary;
    }
  }

  .service-info {
    .info-row {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .info-text {
        font-size: 24rpx;
        color: $text-secondary;
      }
    }
  }
}

.abnormal-card {
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

  .abnormal-form {
    .form-label {
      display: block;
      font-size: 28rpx;
      color: $text-primary;
      margin-bottom: 12rpx;

      .required {
        color: #FF4444;
      }
    }
  }
}

.record-card {
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

  .record-info {
    .record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .record-label {
        font-size: 24rpx;
        color: $text-secondary;
      }

      .record-value {
        font-size: 28rpx;
        color: $text-primary;
      }

      .record-status {
        padding: 8rpx 16rpx;
        border-radius: $radius-full;

        &.success {
          background: rgba(16, 185, 129, 0.15);
          .status-text { color: #10B981; }
        }

        &.abnormal {
          background: rgba(245, 158, 11, 0.15);
          .status-text { color: #F59E0B; }
        }

        .status-text {
          font-size: 24rpx;
        }
      }
    }
  }
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx $spacing-xl;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16rpx);
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}
</style>
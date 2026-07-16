<template>
  <view class="service-record-page">
    <!-- 背景弥散光 -->
    <view class="bg-glow bg-glow-top" />
    <view class="bg-glow bg-glow-bottom" />

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">服务记录</text>
      <text class="page-subtitle">记录服务详情，确保服务质量</text>
    </view>

    <!-- 服务信息卡片 -->
    <view class="service-card">
      <view class="card-title">
        <u-icon name="file-text" size="20" color="#3A7BF7" />
        <text class="title-text">服务信息</text>
      </view>

      <view class="info-row">
        <text class="info-label">服务项目</text>
        <text class="info-value">{{ task?.serviceItem }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">服务时间</text>
        <text class="info-value">{{ task?.serviceDate }} {{ formatTime(task?.serviceTimeSlot) }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">服务地址</text>
        <text class="info-value">{{ task?.serviceAddress }}</text>
      </view>
    </view>

    <!-- 服务时长 -->
    <view class="duration-card">
      <view class="card-title">
        <u-icon name="clock" size="20" color="#10B981" />
        <text class="title-text">服务时长</text>
      </view>

      <view class="duration-info">
        <view class="duration-item">
          <text class="duration-label">开始时间</text>
          <text class="duration-value">{{ formatDateTime(serviceRecord.startTime) || '未开始' }}</text>
        </view>
        <view class="duration-divider" />
        <view class="duration-item">
          <text class="duration-label">结束时间</text>
          <text class="duration-value">{{ formatDateTime(serviceRecord.endTime) || '进行中' }}</text>
        </view>
      </view>

      <view class="duration-total">
        <text class="total-label">服务时长</text>
        <text class="total-value">{{ totalDuration }}</text>
      </view>
    </view>

    <!-- 服务项目清单 -->
    <view class="checklist-card">
      <view class="card-title">
        <u-icon name="checkmark-circle" size="20" color="#6C63FF" />
        <text class="title-text">服务项目清单 <text class="required">*</text></text>
      </view>

      <view class="checklist-items">
        <view
          v-for="item in serviceItemOptions"
          :key="item.value"
          class="checklist-item"
          :class="{ active: serviceRecord.serviceItems.includes(item.value) }"
          @click="toggleServiceItem(item.value)"
        >
          <u-icon
            :name="serviceRecord.serviceItems.includes(item.value) ? 'checkmark-circle-fill' : 'circle'"
            size="24"
            :color="serviceRecord.serviceItems.includes(item.value) ? '#10B981' : '#6B7B8D'"
          />
          <text class="item-text">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 服务备注 -->
    <view class="note-card">
      <view class="card-title">
        <u-icon name="edit-pen" size="20" color="#F59E0B" />
        <text class="title-text">服务备注</text>
      </view>

      <u-input
        v-model="serviceRecord.serviceNote"
        type="textarea"
        placeholder="请记录服务过程中的重要事项..."
        :maxlength="500"
        border="bottom"
        :auto-height="true"
      />

      <view class="char-count">
        <text class="count-text">{{ serviceRecord.serviceNote.length }} / 500</text>
      </view>
    </view>

    <!-- 异常情况 -->
    <view class="abnormal-card">
      <view class="card-title">
        <u-icon name="info-circle" size="20" color="#FF6B6B" />
        <text class="title-text">异常情况</text>
      </view>

      <view class="abnormal-switch">
        <text class="switch-label">是否有异常情况</text>
        <u-switch v-model="serviceRecord.hasAbnormal" size="22" />
      </view>

      <view v-if="serviceRecord.hasAbnormal" class="abnormal-form">
        <text class="form-label">异常类型 <text class="required">*</text></text>
        <view class="abnormal-tags">
          <view
            v-for="type in abnormalTypes"
            :key="type.value"
            class="abnormal-tag"
            :class="{ active: serviceRecord.abnormalType === type.value }"
            @click="serviceRecord.abnormalType = type.value"
          >
            <text class="tag-text">{{ type.label }}</text>
          </view>
        </view>

        <text class="form-label">异常说明 <text class="required">*</text></text>
        <u-input
          v-model="serviceRecord.abnormalNote"
          type="textarea"
          placeholder="请详细说明异常情况..."
          :maxlength="300"
          border="bottom"
        />
      </view>
    </view>

    <!-- 图片附件 -->
    <view class="image-card">
      <view class="card-title">
        <u-icon name="photo" size="20" color="#3A7BF7" />
        <text class="title-text">服务图片</text>
        <text class="image-tip">（最多上传 {{ maxImages }} 张）</text>
      </view>

      <view class="image-upload">
        <view
          v-for="(image, index) in serviceRecord.images"
          :key="index"
          class="image-item"
        >
          <image :src="image" class="uploaded-image" mode="aspectFill" @click="previewImage(index)" />
          <view class="image-delete" @click="removeImage(index)">
            <u-icon name="close" size="14" color="#FFFFFF" />
          </view>
        </view>

        <view
          v-if="serviceRecord.images.length < maxImages"
          class="image-upload-btn"
          @click="chooseImage"
        >
          <u-icon name="plus" size="32" color="#6B7B8D" />
          <text class="upload-text">添加图片</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <u-button
        type="primary"
        size="large"
        :loading="isSubmitting"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        提交服务记录
      </u-button>
      <text class="submit-tip">提交后将结束本次服务，等待顾客确认</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkOrderStore } from '@/store/work-order.js'

const workOrderStore = useWorkOrderStore()

const assignmentId = ref(null)
const task = computed(() => workOrderStore.currentTask)

const isSubmitting = ref(false)
const maxImages = 9

// 服务记录表单
const serviceRecord = ref({
  startTime: null,
  endTime: null,
  serviceItems: [],
  serviceNote: '',
  hasAbnormal: false,
  abnormalType: '',
  abnormalNote: '',
  images: [],
})

// 服务项目选项
const serviceItemOptions = [
  { label: '测量血压', value: 'blood_pressure' },
  { label: '测量血糖', value: 'blood_glucose' },
  { label: '伤口护理', value: 'wound_care' },
  { label: '康复训练', value: 'rehabilitation' },
  { label: '个人卫生护理', value: 'personal_hygiene' },
  { label: '饮食护理', value: 'dietary_care' },
  { label: '心理疏导', value: 'psychological_counseling' },
  { label: '用药指导', value: 'medication_guidance' },
  { label: '生命体征监测', value: 'vital_signs' },
  { label: '其他', value: 'other' },
]

// 异常类型选项
const abnormalTypes = [
  { label: '顾客不在家', value: 'customer_absent' },
  { label: '设备故障', value: 'equipment_failure' },
  { label: '顾客拒绝服务', value: 'customer_refused' },
  { label: '服务时间延误', value: 'time_delay' },
  { label: '顾客身体异常', value: 'health_issue' },
  { label: '其他', value: 'other' },
]

// 总时长
const totalDuration = computed(() => {
  if (!serviceRecord.value.startTime || !serviceRecord.value.endTime) {
    return '进行中'
  }

  const start = new Date(serviceRecord.value.startTime)
  const end = new Date(serviceRecord.value.endTime)
  const diff = Math.floor((end - start) / 1000 / 60) // 分钟

  const hours = Math.floor(diff / 60)
  const minutes = diff % 60

  return `${hours}小时${minutes}分钟`
})

// 是否可以提交
const canSubmit = computed(() => {
  if (serviceRecord.value.serviceItems.length === 0) return false
  if (serviceRecord.value.hasAbnormal) {
    if (!serviceRecord.value.abnormalType || !serviceRecord.value.abnormalNote.trim()) {
      return false
    }
  }
  return !isSubmitting.value
})

// 页面加载
onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  assignmentId.value = currentPage.options?.id

  if (assignmentId.value) {
    await workOrderStore.fetchTaskDetail(parseInt(assignmentId.value))

    // 如果已有服务记录，加载到表单
    if (workOrderStore.currentTask?.serviceRecord) {
      serviceRecord.value = {
        ...serviceRecord.value,
        ...workOrderStore.currentTask.serviceRecord,
      }
    }

    // 设置开始时间（如果任务已开始）
    if (workOrderStore.currentTask?.serviceStartedAt) {
      serviceRecord.value.startTime = workOrderStore.currentTask.serviceStartedAt
    }
  }
})

// 切换服务项目
function toggleServiceItem(value) {
  const index = serviceRecord.value.serviceItems.indexOf(value)
  if (index > -1) {
    serviceRecord.value.serviceItems.splice(index, 1)
  } else {
    serviceRecord.value.serviceItems.push(value)
  }
}

// 选择图片
function chooseImage() {
  const remaining = maxImages - serviceRecord.value.images.length
  if (remaining <= 0) return

  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      serviceRecord.value.images.push(...res.tempFilePaths)
    },
    fail: (error) => {
      console.error('选择图片失败:', error)
      uni.showToast({
        title: '选择图片失败，请检查权限设置',
        icon: 'none',
        duration: 2000,
      })
    },
  })
}

// 删除图片
function removeImage(index) {
  serviceRecord.value.images.splice(index, 1)
}

// 预览图片
function previewImage(index) {
  uni.previewImage({
    current: index,
    urls: serviceRecord.value.images,
  })
}

// 提交服务记录
async function handleSubmit() {
  if (!canSubmit.value || isSubmitting.value) return

  // 记录结束时间
  serviceRecord.value.endTime = new Date().toISOString()

  isSubmitting.value = true
  try {
    const recordData = {
      serviceItems: serviceRecord.value.serviceItems.map(value => {
        const item = serviceItemOptions.find(i => i.value === value)
        return item?.label || value
      }),
      serviceNote: serviceRecord.value.serviceNote,
      images: serviceRecord.value.images,
    }

    // 如果有异常情况，添加到记录
    if (serviceRecord.value.hasAbnormal) {
      const abnormalType = abnormalTypes.find(t => t.value === serviceRecord.value.abnormalType)
      recordData.abnormalSituation = {
        type: abnormalType?.label || serviceRecord.value.abnormalType,
        note: serviceRecord.value.abnormalNote,
      }
    }

    await workOrderStore.finishService(parseInt(assignmentId.value), recordData)

    uni.showToast({
      title: '服务记录已提交',
      icon: 'success',
      duration: 2000,
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  } catch (error) {
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none',
    })
  } finally {
    isSubmitting.value = false
  }
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
.service-record-page {
  min-height: 100vh;
  padding: 32rpx $spacing-base 200rpx;
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

.service-card,
.duration-card,
.checklist-card,
.note-card,
.abnormal-card,
.image-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24rpx);
  border-radius: $radius-xl;
  padding: $spacing-lg;
  margin-bottom: 24rpx;
  box-shadow: $shadow-card;
  position: relative;
  z-index: 1;

  .card-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 24rpx;

    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
      flex: 1;

      .required {
        color: #FF4444;
        margin-left: 4rpx;
      }
    }

    .image-tip {
      font-size: 24rpx;
      color: $text-placeholder;
    }
  }
}

.service-card {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: 24rpx;
      color: $text-secondary;
    }

    .info-value {
      font-size: 28rpx;
      color: $text-primary;
    }
  }
}

.duration-card {
  .duration-info {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;

    .duration-item {
      flex: 1;
      text-align: center;

      .duration-label {
        display: block;
        font-size: 24rpx;
        color: $text-secondary;
        margin-bottom: 8rpx;
      }

      .duration-value {
        display: block;
        font-size: 28rpx;
        color: $text-primary;
      }
    }

    .duration-divider {
      width: 1rpx;
      height: 48rpx;
      background: rgba(107, 123, 141, 0.2);
    }
  }

  .duration-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    background: rgba(16, 185, 129, 0.1);
    border-radius: $radius-lg;

    .total-label {
      font-size: 28rpx;
      color: $text-primary;
    }

    .total-value {
      font-size: 32rpx;
      font-weight: 600;
      color: #10B981;
    }
  }
}

.checklist-card {
  .checklist-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 20rpx;
      background: rgba(245, 247, 250, 0.6);
      border-radius: $radius-lg;
      transition: all 0.3s ease;

      &.active {
        background: rgba(16, 185, 129, 0.1);
      }

      .item-text {
        font-size: 28rpx;
        color: $text-primary;
      }
    }
  }
}

.note-card {
  .char-count {
    text-align: right;
    margin-top: 8rpx;

    .count-text {
      font-size: 24rpx;
      color: $text-placeholder;
    }
  }
}

.abnormal-card {
  .abnormal-switch {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .switch-label {
      font-size: 28rpx;
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
        margin-left: 4rpx;
      }
    }

    .abnormal-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-bottom: 24rpx;

      .abnormal-tag {
        padding: 12rpx 20rpx;
        background: rgba(245, 247, 250, 0.6);
        border: 2rpx solid transparent;
        border-radius: $radius-base;
        transition: all 0.3s ease;

        &.active {
          background: rgba(255, 107, 107, 0.1);
          border-color: #FF6B6B;
        }

        .tag-text {
          font-size: 26rpx;
          color: $text-primary;
        }
      }
    }
  }
}

.image-card {
  .image-upload {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;

    .image-item {
      position: relative;
      aspect-ratio: 1;

      .uploaded-image {
        width: 100%;
        height: 100%;
        border-radius: $radius-lg;
      }

      .image-delete {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .image-upload-btn {
      aspect-ratio: 1;
      border: 2rpx dashed rgba(107, 123, 141, 0.3);
      border-radius: $radius-lg;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8rpx;

      .upload-text {
        font-size: 24rpx;
        color: $text-placeholder;
      }
    }
  }
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx $spacing-xl;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16rpx);
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
  z-index: 100;

  .submit-tip {
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: $text-placeholder;
    margin-top: 12rpx;
  }
}
</style>
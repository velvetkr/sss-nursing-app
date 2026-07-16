<template>
  <view class="task-card" @tap="handleClick">
    <!-- 任务头部 -->
    <view class="card-header">
      <view class="status-wrapper">
        <view class="status-tag" :class="getStatusClass(task.status)">
          {{ getStatusText(task.status) }}
        </view>
        <text v-if="task.urgent" class="urgent-tag">紧急</text>
      </view>
      <text class="task-time">{{ formatTime(task.serviceTime) }}</text>
    </view>

    <!-- 任务内容 -->
    <view class="card-body">
      <view class="service-info">
        <text class="service-name">{{ task.serviceName }}</text>
        <text class="service-spec">{{ task.specName }}</text>
      </view>
      
      <view class="info-row">
        <view class="info-item">
          <text class="info-icon">📍</text>
          <text class="info-text">{{ task.serviceAddress }}</text>
        </view>
      </view>
      
      <view class="info-row">
        <view class="info-item">
          <text class="info-icon">👤</text>
          <text class="info-text">{{ task.customerName }} {{ task.customerPhone }}</text>
        </view>
      </view>
    </view>

    <!-- 任务底部 -->
    <view class="card-footer">
      <view class="price-info">
        <text class="price-label">服务费用</text>
        <text class="price-value">¥{{ (task.amount / 100).toFixed(2) }}</text>
      </view>
      <view class="action-btns">
        <button
          v-if="showAcceptBtn"
          class="btn-accept"
          @tap.stop="handleAccept"
        >
          接单
        </button>
        <button
          v-if="showRejectBtn"
          class="btn-reject"
          @tap.stop="handleReject"
        >
          拒绝
        </button>
        <button
          v-if="showDetailBtn"
          class="btn-detail"
        >
          详情
        </button>
      </view>
    </view>

    <!-- 倒计时提示 -->
    <view v-if="task.countdown && task.countdown > 0" class="countdown-bar">
      <text class="countdown-text">剩余 {{ formatCountdown(task.countdown) }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  task: {
    type: Object,
    required: true,
    default: () => ({
      orderId: '',
      status: '',
      serviceName: '',
      specName: '',
      serviceTime: '',
      serviceAddress: '',
      customerName: '',
      customerPhone: '',
      amount: 0,
      urgent: false,
      countdown: 0,
    }),
  },
  showAcceptBtn: {
    type: Boolean,
    default: false,
  },
  showRejectBtn: {
    type: Boolean,
    default: false,
  },
  showDetailBtn: {
    type: Boolean,
    default: true,
  },
})

// Emits
const emit = defineEmits(['click', 'accept', 'reject'])

// 点击卡片
function handleClick() {
  emit('click', props.task)
}

// 接单
function handleAccept() {
  emit('accept', props.task)
}

// 拒绝
function handleReject() {
  emit('reject', props.task)
}

// 获取状态样式
function getStatusClass(status) {
  const classMap = {
    WAITING_ACCEPT: 'status-waiting',
    ACCEPTED: 'status-accepted',
    DEPARTED: 'status-departed',
    ARRIVED: 'status-arrived',
    IN_SERVICE: 'status-service',
    FINISHED: 'status-finished',
  }
  return classMap[status] || ''
}

// 获取状态文本
function getStatusText(status) {
  const textMap = {
    WAITING_ACCEPT: '待接单',
    ACCEPTED: '已接单',
    DEPARTED: '已出发',
    ARRIVED: '已到达',
    IN_SERVICE: '服务中',
    FINISHED: '已完成',
  }
  return textMap[status] || '未知'
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${minute}`
}

// 格式化倒计时
function formatCountdown(seconds) {
  if (seconds <= 0) return '0秒'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  }
  return `${secs}秒`
}
</script>

<style lang="scss" scoped>
.task-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  position: relative;
  overflow: hidden;
  
  &:active {
    background: #f5f5f5;
  }
}

/* 任务头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  
  .status-wrapper {
    display: flex;
    align-items: center;
    
    .status-tag {
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      
      &.status-waiting {
        background: #fff3e0;
        color: #ff9800;
      }
      
      &.status-accepted {
        background: #e3f2fd;
        color: #2196f3;
      }
      
      &.status-departed {
        background: #f3e5f5;
        color: #9c27b0;
      }
      
      &.status-arrived {
        background: #e8f5e9;
        color: #4caf50;
      }
      
      &.status-service {
        background: #667eea;
        color: #ffffff;
      }
      
      &.status-finished {
        background: #e0e0e0;
        color: #757575;
      }
    }
    
    .urgent-tag {
      font-size: 20rpx;
      color: #f44336;
      background: #ffebee;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      margin-left: 10rpx;
    }
  }
  
  .task-time {
    font-size: 24rpx;
    color: #999999;
  }
}

/* 任务内容 */
.card-body {
  .service-info {
    margin-bottom: 16rpx;
    
    .service-name {
      display: block;
      font-size: 32rpx;
      color: #333333;
      font-weight: bold;
    }
    
    .service-spec {
      display: block;
      font-size: 26rpx;
      color: #666666;
      margin-top: 6rpx;
    }
  }
  
  .info-row {
    margin-bottom: 10rpx;
    
    .info-item {
      display: flex;
      align-items: center;
      
      .info-icon {
        font-size: 24rpx;
        margin-right: 8rpx;
      }
      
      .info-text {
        font-size: 26rpx;
        color: #666666;
      }
    }
  }
}

/* 任务底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
  
  .price-info {
    .price-label {
      font-size: 24rpx;
      color: #999999;
    }
    
    .price-value {
      font-size: 32rpx;
      color: #f44336;
      font-weight: bold;
      margin-left: 10rpx;
    }
  }
  
  .action-btns {
    display: flex;
    gap: 16rpx;
    
    button {
      font-size: 26rpx;
      padding: 10rpx 24rpx;
      border-radius: 30rpx;
      border: none;
      
      &.btn-accept {
        background: #667eea;
        color: #ffffff;
      }
      
      &.btn-reject {
        background: #ffebee;
        color: #f44336;
      }
      
      &.btn-detail {
        background: #f5f6fa;
        color: #667eea;
      }
    }
  }
}

/* 倒计时提示 */
.countdown-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #ff9800 0%, #f44336 100%);
  padding: 8rpx 0;
  
  .countdown-text {
    display: block;
    text-align: center;
    font-size: 22rpx;
    color: #ffffff;
  }
}
</style>
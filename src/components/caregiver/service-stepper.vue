<template>
  <view class="service-stepper">
    <!-- 步骤列表 -->
    <view class="stepper-container">
      <view
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{
          'step-active': index <= currentStep,
          'step-current': index === currentStep,
        }"
      >
        <!-- 步骤图标 -->
        <view class="step-icon-wrapper">
          <view class="step-icon" :class="getStepClass(index)">
            <text v-if="index < currentStep" class="icon-check">✓</text>
            <text v-else class="icon-num">{{ index + 1 }}</text>
          </view>
          <!-- 连接线 -->
          <view
            v-if="index < steps.length - 1"
            class="step-line"
            :class="{ 'line-active': index < currentStep }"
          ></view>
        </view>

        <!-- 步骤内容 -->
        <view class="step-content">
          <text class="step-title">{{ step.title }}</text>
          <text v-if="step.time" class="step-time">{{ formatTime(step.time) }}</text>
          <text v-if="step.note" class="step-note">{{ step.note }}</text>
        </view>
      </view>
    </view>

    <!-- 当前步骤提示 -->
    <view v-if="showTip && currentStep < steps.length" class="step-tip">
      <text class="tip-icon">💡</text>
      <text class="tip-text">{{ steps[currentStep]?.tip || '请完成当前步骤' }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  steps: {
    type: Array,
    default: () => [
      { title: '接单', tip: '请在规定时间内接单' },
      { title: '出发', tip: '请按时出发前往服务地点' },
      { title: '签到', tip: '到达后请进行签到' },
      { title: '服务', tip: '开始提供服务' },
      { title: '完成', tip: '提交服务记录' },
    ],
  },
  currentStep: {
    type: Number,
    default: 0,
  },
  showTip: {
    type: Boolean,
    default: true,
  },
})

// 获取步骤样式
function getStepClass(index) {
  if (index < props.currentStep) {
    return 'icon-completed'
  }
  if (index === props.currentStep) {
    return 'icon-current'
  }
  return 'icon-pending'
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}
</script>

<style lang="scss" scoped>
.service-stepper {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
}

/* 步骤容器 */
.stepper-container {
  position: relative;
}

/* 步骤项 */
.step-item {
  display: flex;
  position: relative;
  padding-bottom: 30rpx;
  
  &:last-child {
    padding-bottom: 0;
  }
}

/* 步骤图标包装器 */
.step-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60rpx;
  flex-shrink: 0;
}

/* 步骤图标 */
.step-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  font-weight: bold;
  
  &.icon-completed {
    background: #4caf50;
    color: #ffffff;
  }
  
  &.icon-current {
    background: #667eea;
    color: #ffffff;
    box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.2);
  }
  
  &.icon-pending {
    background: #e0e0e0;
    color: #9e9e9e;
  }
  
  .icon-check {
    font-size: 28rpx;
  }
  
  .icon-num {
    font-size: 24rpx;
  }
}

/* 连接线 */
.step-line {
  width: 4rpx;
  flex: 1;
  min-height: 40rpx;
  background: #e0e0e0;
  margin-top: 8rpx;
  
  &.line-active {
    background: #4caf50;
  }
}

/* 步骤内容 */
.step-content {
  flex: 1;
  padding-left: 20rpx;
  padding-top: 8rpx;
  
  .step-title {
    display: block;
    font-size: 30rpx;
    color: #333333;
    font-weight: bold;
  }
  
  .step-time {
    display: block;
    font-size: 24rpx;
    color: #999999;
    margin-top: 8rpx;
  }
  
  .step-note {
    display: block;
    font-size: 24rpx;
    color: #666666;
    margin-top: 8rpx;
    padding: 10rpx 16rpx;
    background: #f5f6fa;
    border-radius: 8rpx;
  }
}

/* 当前步骤高亮 */
.step-item.step-current {
  .step-title {
    color: #667eea;
  }
}

/* 步骤提示 */
.step-tip {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding: 16rpx 20rpx;
  background: #f0f5ff;
  border-radius: 12rpx;
  
  .tip-icon {
    font-size: 28rpx;
    margin-right: 10rpx;
  }
  
  .tip-text {
    font-size: 26rpx;
    color: #667eea;
  }
}
</style>
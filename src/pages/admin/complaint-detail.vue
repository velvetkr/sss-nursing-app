<template>
  <view class="complaint-detail">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 详情内容 -->
    <view v-else-if="detail" class="detail-content">
      <!-- 状态卡片 -->
      <view class="status-card">
        <view class="status-header">
          <text class="status-icon">{{ getStatusIcon(detail.status) }}</text>
          <view class="status-info">
            <text class="status-text" :class="getStatusClass(detail.status)">
              {{ getStatusText(detail.status) }}
            </text>
            <text class="status-time">投诉时间：{{ formatTime(detail.createdAt) }}</text>
          </view>
        </view>
      </view>

      <!-- 投诉信息 -->
      <view class="section-card">
        <view class="section-title">
          <text class="title-icon">📝</text>
          <text class="title-text">投诉信息</text>
        </view>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">投诉类型</text>
            <text class="info-value">{{ getComplaintType(detail.type) }}</text>
          </view>
          <view class="info-item full-width">
            <text class="info-label">投诉原因</text>
            <text class="info-value">{{ detail.reason }}</text>
          </view>
          <view class="info-item full-width">
            <text class="info-label">详细描述</text>
            <text class="info-value">{{ detail.description || '暂无' }}</text>
          </view>
        </view>
        
        <!-- 投诉图片 -->
        <view v-if="detail.images && detail.images.length > 0" class="complaint-images">
          <text class="images-label">投诉图片</text>
          <view class="images-grid">
            <view
              v-for="(img, index) in detail.images"
              :key="index"
              class="image-item"
              @tap="previewImage(img)"
            >
              <image class="image" :src="img" mode="aspectFill" />
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="section-card">
        <view class="section-title">
          <text class="title-icon">📋</text>
          <text class="title-text">订单信息</text>
        </view>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">订单号</text>
            <text class="info-value">{{ detail.orderNo }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务名称</text>
            <text class="info-value">{{ detail.serviceName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">服务时间</text>
            <text class="info-value">{{ detail.serviceTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">订单金额</text>
            <text class="info-value">¥{{ (detail.amount / 100).toFixed(2) }}</text>
          </view>
        </view>
      </view>

      <!-- 当事人信息 -->
      <view class="section-card">
        <view class="section-title">
          <text class="title-icon">👥</text>
          <text class="title-text">当事人信息</text>
        </view>
        <view class="party-list">
          <view class="party-item">
            <text class="party-role">顾客</text>
            <text class="party-name">{{ detail.customerName }}</text>
            <text class="party-phone">{{ detail.customerPhone }}</text>
          </view>
          <view class="party-item">
            <text class="party-role">护理人员</text>
            <text class="party-name">{{ detail.caregiverName || '未指派' }}</text>
            <text class="party-phone">{{ detail.caregiverPhone || '-' }}</text>
          </view>
          <view class="party-item">
            <text class="party-role">商户</text>
            <text class="party-name">{{ detail.merchantName }}</text>
          </view>
        </view>
      </view>

      <!-- 商户说明 -->
      <view v-if="detail.merchantResponse" class="section-card">
        <view class="section-title">
          <text class="title-icon">💬</text>
          <text class="title-text">商户说明</text>
        </view>
        <view class="response-content">
          <text class="response-text">{{ detail.merchantResponse }}</text>
          <text class="response-time">回复时间：{{ formatTime(detail.merchantResponseAt) }}</text>
        </view>
      </view>

      <!-- 处理记录 -->
      <view v-if="detail.handleRecords && detail.handleRecords.length > 0" class="section-card">
        <view class="section-title">
          <text class="title-icon">📋</text>
          <text class="title-text">处理记录</text>
        </view>
        <view class="record-list">
          <view
            v-for="(record, index) in detail.handleRecords"
            :key="index"
            class="record-item"
          >
            <view class="record-header">
              <text class="record-status">{{ record.action }}</text>
              <text class="record-time">{{ formatTime(record.handledAt) }}</text>
            </view>
            <view class="record-body">
              <text class="handler">处理人：{{ record.handlerName }}</text>
              <text v-if="record.handleResult" class="result">
                处理结果：{{ record.handleResult }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 处理操作 -->
      <view v-if="detail.status !== 'RESOLVED'" class="action-bar">
        <view class="action-form">
          <text class="form-label">处理结果</text>
          <textarea
            v-model="handleResult"
            class="form-input"
            placeholder="请输入处理结果"
            placeholder-class="placeholder"
            maxlength="500"
          />
          <text class="char-count">{{ handleResult.length }}/500</text>
        </view>
        <view class="action-buttons">
          <button class="btn-handle" @tap="handleComplaint">确认处理</button>
        </view>
      </view>

      <!-- 处理结果 -->
      <view v-if="detail.status === 'RESOLVED'" class="section-card resolved-card">
        <view class="section-title">
          <text class="title-icon">✅</text>
          <text class="title-text">处理结果</text>
        </view>
        <view class="resolved-content">
          <text class="resolved-text">{{ detail.handleResult }}</text>
          <text class="resolved-time">处理时间：{{ formatTime(detail.handledAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="error-state">
      <text class="error-icon">❌</text>
      <text class="error-text">加载失败，请重试</text>
      <button class="retry-btn" @tap="loadDetail">重新加载</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/store/admin.js'

// Store
const adminStore = useAdminStore()

// 页面参数
const complaintId = ref(null)

// 详情数据
const detail = ref(null)

// 加载状态
const loading = ref(true)

// 处理结果
const handleResult = ref('')

// 加载详情
async function loadDetail() {
  loading.value = true
  
  try {
    await adminStore.fetchComplaintDetail(complaintId.value)
    detail.value = adminStore.complaintDetail
  } catch (err) {
    console.error('加载详情失败:', err)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 处理投诉
async function handleComplaint() {
  if (!handleResult.value.trim()) {
    uni.showToast({
      title: '请输入处理结果',
      icon: 'none',
    })
    return
  }
  
  uni.showModal({
    title: '确认操作',
    content: '确定已完成投诉处理吗？',
    success: async (res) => {
      if (res.confirm) {
        const success = await adminStore.handleComplaint(
          complaintId.value,
          'RESOLVE',
          handleResult.value
        )
        if (success) {
          uni.showToast({
            title: '处理成功',
            icon: 'success',
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      }
    },
  })
}

// 获取状态图标
function getStatusIcon(status) {
  const iconMap = {
    PENDING: '⏳',
    PROCESSING: '🔄',
    RESOLVED: '✅',
  }
  return iconMap[status] || '❓'
}

// 获取状态样式
function getStatusClass(status) {
  const classMap = {
    PENDING: 'status-pending',
    PROCESSING: 'status-processing',
    RESOLVED: 'status-resolved',
  }
  return classMap[status] || ''
}

// 获取状态文本
function getStatusText(status) {
  const textMap = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    RESOLVED: '已处理',
  }
  return textMap[status] || '未知'
}

// 获取投诉类型
function getComplaintType(type) {
  const typeMap = {
    SERVICE_QUALITY: '服务质量问题',
    ATTITUDE: '态度问题',
    PRICE: '价格问题',
    SAFETY: '安全问题',
    OTHER: '其他问题',
  }
  return typeMap[type] || '未知类型'
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 预览图片
function previewImage(url) {
  uni.previewImage({
    urls: detail.value.images || [],
    current: url,
  })
}

// 页面加载
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  complaintId.value = currentPage.options?.id
  
  if (complaintId.value) {
    loadDetail()
  } else {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.complaint-detail {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 40rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
  
  .loading-text {
    font-size: 28rpx;
    color: #999999;
  }
}

/* 状态卡片 */
.status-card {
  background: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .status-header {
    display: flex;
    align-items: center;
    
    .status-icon {
      font-size: 80rpx;
      margin-right: 30rpx;
    }
    
    .status-info {
      display: flex;
      flex-direction: column;
      
      .status-text {
        font-size: 36rpx;
        font-weight: bold;
        
        &.status-pending { color: #ff9800; }
        &.status-processing { color: #2196f3; }
        &.status-resolved { color: #4caf50; }
      }
      
      .status-time {
        font-size: 24rpx;
        color: #999999;
        margin-top: 10rpx;
      }
    }
  }
}

/* 区块卡片 */
.section-card {
  background: #ffffff;
  margin-bottom: 20rpx;
  padding: 30rpx;
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #eeeeee;
    
    .title-icon {
      font-size: 32rpx;
      margin-right: 10rpx;
    }
    
    .title-text {
      font-size: 32rpx;
      color: #333333;
      font-weight: bold;
    }
  }
}

/* 信息网格 */
.info-grid {
  display: flex;
  flex-wrap: wrap;
  
  .info-item {
    width: 50%;
    padding: 16rpx 0;
    
    &.full-width {
      width: 100%;
    }
    
    .info-label {
      display: block;
      font-size: 24rpx;
      color: #999999;
      margin-bottom: 8rpx;
    }
    
    .info-value {
      display: block;
      font-size: 28rpx;
      color: #333333;
    }
  }
}

/* 投诉图片 */
.complaint-images {
  margin-top: 20rpx;
  
  .images-label {
    display: block;
    font-size: 24rpx;
    color: #999999;
    margin-bottom: 16rpx;
  }
  
  .images-grid {
    display: flex;
    flex-wrap: wrap;
    
    .image-item {
      width: 160rpx;
      height: 160rpx;
      margin-right: 16rpx;
      margin-bottom: 16rpx;
      border-radius: 8rpx;
      overflow: hidden;
      
      .image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

/* 当事人信息 */
.party-list {
  .party-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .party-role {
      font-size: 24rpx;
      color: #999999;
      width: 120rpx;
    }
    
    .party-name {
      font-size: 28rpx;
      color: #333333;
      flex: 1;
    }
    
    .party-phone {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

/* 商户说明 */
.response-content {
  .response-text {
    display: block;
    font-size: 28rpx;
    color: #333333;
    line-height: 1.6;
    margin-bottom: 16rpx;
  }
  
  .response-time {
    display: block;
    font-size: 24rpx;
    color: #999999;
  }
}

/* 处理记录 */
.record-list {
  .record-item {
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10rpx;
      
      .record-status {
        font-size: 26rpx;
        color: #667eea;
        font-weight: bold;
      }
      
      .record-time {
        font-size: 24rpx;
        color: #999999;
      }
    }
    
    .record-body {
      display: flex;
      flex-direction: column;
      
      .handler {
        font-size: 26rpx;
        color: #666666;
      }
      
      .result {
        font-size: 26rpx;
        color: #999999;
        margin-top: 8rpx;
      }
    }
  }
}

/* 审核操作 */
.action-bar {
  background: #ffffff;
  padding: 30rpx;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  
  .action-form {
    margin-bottom: 30rpx;
    
    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 16rpx;
    }
    
    .form-input {
      width: 100%;
      height: 200rpx;
      background: #f5f6fa;
      border-radius: 12rpx;
      padding: 20rpx;
      font-size: 28rpx;
      color: #333333;
    }
    
    .char-count {
      display: block;
      text-align: right;
      font-size: 24rpx;
      color: #999999;
      margin-top: 10rpx;
    }
  }
  
  .action-buttons {
    button {
      width: 100%;
      height: 88rpx;
      font-size: 32rpx;
      font-weight: bold;
      border: none;
      border-radius: 12rpx;
    }
    
    .btn-handle {
      background: #4caf50;
      color: #ffffff;
    }
  }
}

.placeholder {
  color: #999999;
}

/* 处理结果 */
.resolved-card {
  background: #e8f5e9;
  
  .resolved-content {
    .resolved-text {
      display: block;
      font-size: 28rpx;
      color: #333333;
      line-height: 1.6;
      margin-bottom: 16rpx;
    }
    
    .resolved-time {
      display: block;
      font-size: 24rpx;
      color: #999999;
    }
  }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  
  .error-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }
  
  .error-text {
    font-size: 28rpx;
    color: #999999;
    margin-bottom: 30rpx;
  }
  
  .retry-btn {
    background: #667eea;
    color: #ffffff;
    font-size: 28rpx;
    padding: 20rpx 60rpx;
    border-radius: 40rpx;
    border: none;
  }
}
</style>
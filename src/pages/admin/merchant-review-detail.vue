<template>
  <view class="review-detail">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 详情内容 -->
    <view v-else-if="detail" class="detail-content">
      <!-- 状态卡片 -->
      <view class="status-card">
        <view class="status-header">
          <text class="status-icon">{{ getStatusIcon(detail.auditStatus) }}</text>
          <view class="status-info">
            <text class="status-text" :class="getStatusClass(detail.auditStatus)">
              {{ getStatusText(detail.auditStatus) }}
            </text>
            <text class="status-time">申请时间：{{ formatTime(detail.createdAt) }}</text>
          </view>
        </view>
      </view>

      <!-- 商户基本信息 -->
      <view class="section-card">
        <view class="section-title">
          <text class="title-icon">🏢</text>
          <text class="title-text">商户基本信息</text>
        </view>
        <view class="info-grid">
          <view class="info-item">
            <text class="info-label">商户名称</text>
            <text class="info-value">{{ detail.merchantName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系人</text>
            <text class="info-value">{{ detail.contactPerson }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系电话</text>
            <text class="info-value">{{ detail.contactPhone }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">营业执照号</text>
            <text class="info-value">{{ detail.businessLicense }}</text>
          </view>
          <view class="info-item full-width">
            <text class="info-label">服务区域</text>
            <text class="info-value">{{ detail.serviceArea || '暂无' }}</text>
          </view>
          <view class="info-item full-width">
            <text class="info-label">详细地址</text>
            <text class="info-value">{{ detail.address || '暂无' }}</text>
          </view>
        </view>
      </view>

      <!-- 资质证书 -->
      <view class="section-card">
        <view class="section-title">
          <text class="title-icon">📄</text>
          <text class="title-text">资质证书</text>
        </view>
        <view class="cert-list">
          <view
            v-for="(cert, index) in detail.certificates"
            :key="index"
            class="cert-item"
            @tap="previewImage(cert)"
          >
            <image class="cert-image" :src="cert" mode="aspectFill" />
          </view>
          <view v-if="!detail.certificates || detail.certificates.length === 0" class="empty-cert">
            <text class="empty-text">暂无资质证书</text>
          </view>
        </view>
      </view>

      <!-- 审核记录 -->
      <view v-if="detail.auditRecords && detail.auditRecords.length > 0" class="section-card">
        <view class="section-title">
          <text class="title-icon">📋</text>
          <text class="title-text">审核记录</text>
        </view>
        <view class="record-list">
          <view
            v-for="(record, index) in detail.auditRecords"
            :key="index"
            class="record-item"
          >
            <view class="record-header">
              <text class="record-status" :class="getStatusClass(record.action)">
                {{ getStatusText(record.action) }}
              </text>
              <text class="record-time">{{ formatTime(record.reviewedAt) }}</text>
            </view>
            <view class="record-body">
              <text class="reviewer">审核人：{{ record.reviewerName }}</text>
              <text v-if="record.reviewComment" class="comment">
                审核意见：{{ record.reviewComment }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 驳回原因 -->
      <view v-if="detail.auditStatus === 'REJECTED'" class="section-card reject-card">
        <view class="section-title">
          <text class="title-icon">⚠️</text>
          <text class="title-text">驳回原因</text>
        </view>
        <view class="reject-content">
          <text class="reject-text">{{ detail.reviewComment || '暂无驳回原因' }}</text>
        </view>
      </view>

      <!-- 审核操作 -->
      <view v-if="detail.auditStatus === 'PENDING'" class="action-bar">
        <view class="action-form">
          <text class="form-label">审核意见</text>
          <textarea
            v-model="reviewComment"
            class="form-input"
            placeholder="请输入审核意见（驳回时必填）"
            placeholder-class="placeholder"
            maxlength="200"
          />
          <text class="char-count">{{ reviewComment.length }}/200</text>
        </view>
        <view class="action-buttons">
          <button class="btn-reject" @tap="handleReject">驳 回</button>
          <button class="btn-approve" @tap="handleApprove">通 过</button>
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
const merchantId = ref(null)

// 详情数据
const detail = ref(null)

// 加载状态
const loading = ref(true)

// 审核意见
const reviewComment = ref('')

// 加载详情
async function loadDetail() {
  loading.value = true
  
  try {
    await adminStore.fetchMerchantReviewDetail(merchantId.value)
    detail.value = adminStore.currentMerchantReview
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

// 通过审核
async function handleApprove() {
  uni.showModal({
    title: '确认操作',
    content: '确定通过该商户的审核吗？',
    success: async (res) => {
      if (res.confirm) {
        const success = await adminStore.auditMerchant(merchantId.value, 'APPROVED', reviewComment.value)
        if (success) {
          uni.showToast({
            title: '审核通过',
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

// 驳回审核
async function handleReject() {
  if (!reviewComment.value.trim()) {
    uni.showToast({
      title: '请输入驳回原因',
      icon: 'none',
    })
    return
  }
  
  uni.showModal({
    title: '确认操作',
    content: '确定驳回该商户的审核吗？',
    success: async (res) => {
      if (res.confirm) {
        const success = await adminStore.auditMerchant(merchantId.value, 'REJECTED', reviewComment.value)
        if (success) {
          uni.showToast({
            title: '已驳回',
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
    APPROVED: '✅',
    REJECTED: '❌',
  }
  return iconMap[status] || '❓'
}

// 获取状态样式
function getStatusClass(status) {
  const classMap = {
    PENDING: 'status-pending',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
  }
  return classMap[status] || ''
}

// 获取状态文本
function getStatusText(status) {
  const textMap = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已驳回',
  }
  return textMap[status] || '未知'
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
    urls: detail.value.certificates || [],
    current: url,
  })
}

// 页面加载
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  merchantId.value = currentPage.options?.id
  
  if (merchantId.value) {
    loadDetail()
  } else {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.review-detail {
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
        &.status-approved { color: #4caf50; }
        &.status-rejected { color: #f44336; }
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

/* 资质证书 */
.cert-list {
  display: flex;
  flex-wrap: wrap;
  
  .cert-item {
    width: 200rpx;
    height: 200rpx;
    margin-right: 20rpx;
    margin-bottom: 20rpx;
    border-radius: 8rpx;
    overflow: hidden;
    
    .cert-image {
      width: 100%;
      height: 100%;
    }
  }
  
  .empty-cert {
    width: 100%;
    text-align: center;
    padding: 40rpx 0;
    
    .empty-text {
      font-size: 26rpx;
      color: #999999;
    }
  }
}

/* 审核记录 */
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
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        
        &.status-pending { background: #fff3e0; color: #ff9800; }
        &.status-approved { background: #e8f5e9; color: #4caf50; }
        &.status-rejected { background: #ffebee; color: #f44336; }
      }
      
      .record-time {
        font-size: 24rpx;
        color: #999999;
      }
    }
    
    .record-body {
      display: flex;
      flex-direction: column;
      
      .reviewer {
        font-size: 26rpx;
        color: #666666;
      }
      
      .comment {
        font-size: 26rpx;
        color: #999999;
        margin-top: 8rpx;
      }
    }
  }
}

/* 驳回原因 */
.reject-card {
  background: #ffebee;
  
  .reject-content {
    .reject-text {
      font-size: 28rpx;
      color: #f44336;
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
    display: flex;
    gap: 20rpx;
    
    button {
      flex: 1;
      height: 88rpx;
      font-size: 32rpx;
      font-weight: bold;
      border: none;
      border-radius: 12rpx;
    }
    
    .btn-reject {
      background: #ffebee;
      color: #f44336;
    }
    
    .btn-approve {
      background: #667eea;
      color: #ffffff;
    }
  }
}

.placeholder {
  color: #999999;
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
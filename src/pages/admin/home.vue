<template>
  <view class="admin-home">
    <!-- 顶部信息栏 -->
    <view class="header">
      <view class="user-info">
        <text class="user-avatar">👤</text>
        <view class="user-detail">
          <text class="user-name">{{ adminInfo.name || '管理员' }}</text>
          <text class="user-role">平台管理员</text>
        </view>
      </view>
      <view class="header-actions">
        <text class="action-btn" @tap="handleLogout">退出</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="section-title">待审核</view>
      <view class="stats-grid">
        <view class="stat-card" @tap="goToMerchantReview">
          <text class="stat-number">{{ pendingCount.merchant }}</text>
          <text class="stat-label">商户审核</text>
          <text class="stat-icon">🏢</text>
        </view>
        <view class="stat-card" @tap="goToCaregiverReview">
          <text class="stat-number">{{ pendingCount.caregiver }}</text>
          <text class="stat-label">护理人员审核</text>
          <text class="stat-icon">👩‍⚕️</text>
        </view>
        <view class="stat-card" @tap="goToServiceReview">
          <text class="stat-number">{{ pendingCount.service }}</text>
          <text class="stat-label">服务审核</text>
          <text class="stat-icon">📋</text>
        </view>
        <view class="stat-card warning" @tap="goToAbnormalOrders">
          <text class="stat-number">{{ abnormalCount }}</text>
          <text class="stat-label">异常订单</text>
          <text class="stat-icon">⚠️</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-section">
      <view class="section-title">快捷入口</view>
      <view class="quick-grid">
        <view class="quick-item" @tap="goToMerchantReview">
          <text class="quick-icon">🏢</text>
          <text class="quick-text">商户审核</text>
        </view>
        <view class="quick-item" @tap="goToCaregiverReview">
          <text class="quick-icon">👩‍⚕️</text>
          <text class="quick-text">护理人员审核</text>
        </view>
        <view class="quick-item" @tap="goToServiceReview">
          <text class="quick-icon">📋</text>
          <text class="quick-text">服务审核</text>
        </view>
        <view class="quick-item" @tap="goToAbnormalOrders">
          <text class="quick-icon">⚠️</text>
          <text class="quick-text">异常订单</text>
        </view>
      </view>
    </view>

    <!-- 最近待审核 -->
    <view class="pending-section">
      <view class="section-header">
        <text class="section-title">最近待审核</text>
        <text class="section-more" @tap="viewAllPending">查看全部</text>
      </view>

      <!-- 商户审核 -->
      <view v-if="merchantReviewList.length > 0" class="pending-group">
        <view class="group-title">
          <text class="group-icon">🏢</text>
          <text class="group-text">商户审核</text>
        </view>
        <view
          v-for="item in merchantReviewList.slice(0, 3)"
          :key="item.merchantId"
          class="pending-item"
          @tap="goToMerchantReviewDetail(item.merchantId)"
        >
          <view class="item-left">
            <text class="item-name">{{ item.merchantName }}</text>
            <text class="item-time">{{ formatTime(item.createdAt) }}</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>

      <!-- 护理人员审核 -->
      <view v-if="caregiverReviewList.length > 0" class="pending-group">
        <view class="group-title">
          <text class="group-icon">👩‍⚕️</text>
          <text class="group-text">护理人员审核</text>
        </view>
        <view
          v-for="item in caregiverReviewList.slice(0, 3)"
          :key="item.caregiverId"
          class="pending-item"
          @tap="goToCaregiverReviewDetail(item.caregiverId)"
        >
          <view class="item-left">
            <text class="item-name">{{ item.caregiverName }}</text>
            <text class="item-time">{{ formatTime(item.createdAt) }}</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>

      <!-- 服务审核 -->
      <view v-if="serviceReviewList.length > 0" class="pending-group">
        <view class="group-title">
          <text class="group-icon">📋</text>
          <text class="group-text">服务审核</text>
        </view>
        <view
          v-for="item in serviceReviewList.slice(0, 3)"
          :key="item.serviceId"
          class="pending-item"
          @tap="goToServiceReviewDetail(item.serviceId)"
        >
          <view class="item-left">
            <text class="item-name">{{ item.serviceName }}</text>
            <text class="item-time">{{ formatTime(item.createdAt) }}</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="isEmpty" class="empty-state">
        <text class="empty-icon">✅</text>
        <text class="empty-text">暂无待审核项</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">🏠</text>
        <text class="nav-text">首页</text>
      </view>
      <view class="nav-item" @tap="goToMerchantReview">
        <text class="nav-icon">🏢</text>
        <text class="nav-text">商户</text>
      </view>
      <view class="nav-item" @tap="goToCaregiverReview">
        <text class="nav-icon">👩‍⚕️</text>
        <text class="nav-text">人员</text>
      </view>
      <view class="nav-item" @tap="goToServiceReview">
        <text class="nav-icon">📋</text>
        <text class="nav-text">服务</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/store/admin.js'
import { useUserStore } from '@/store/user.js'

// Store
const adminStore = useAdminStore()
const userStore = useUserStore()

// 管理员信息
const adminInfo = computed(() => userStore.userInfo || {})

// 待审核数量
const pendingCount = computed(() => adminStore.pendingReviewCount)

// 异常订单数量
const abnormalCount = computed(() => adminStore.abnormalOrderCount)

// 审核列表
const merchantReviewList = computed(() => 
  adminStore.merchantReviewList.filter(item => item.auditStatus === 'PENDING')
)

const caregiverReviewList = computed(() => 
  adminStore.caregiverReviewList.filter(item => item.auditStatus === 'PENDING')
)

const serviceReviewList = computed(() => 
  adminStore.serviceReviewList.filter(item => item.auditStatus === 'PENDING')
)

// 是否为空
const isEmpty = computed(() => {
  return merchantReviewList.value.length === 0 &&
         caregiverReviewList.value.length === 0 &&
         serviceReviewList.value.length === 0
})

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 加载数据
async function loadData() {
  await Promise.all([
    adminStore.fetchMerchantReviewList({ status: 'PENDING', size: 5 }),
    adminStore.fetchCaregiverReviewList({ status: 'PENDING', size: 5 }),
    adminStore.fetchServiceReviewList({ status: 'PENDING', size: 5 }),
    adminStore.fetchAbnormalOrderList({ size: 10 }),
  ])
}

// 页面跳转
function goToMerchantReview() {
  uni.navigateTo({ url: '/pages/admin/merchant-review-list' })
}

function goToCaregiverReview() {
  uni.navigateTo({ url: '/pages/admin/caregiver-review-list' })
}

function goToServiceReview() {
  uni.navigateTo({ url: '/pages/admin/service-review-list' })
}

function goToAbnormalOrders() {
  uni.navigateTo({ url: '/pages/admin/order-list' })
}

function goToMerchantReviewDetail(id) {
  uni.navigateTo({ url: `/pages/admin/merchant-review-detail?id=${id}` })
}

function goToCaregiverReviewDetail(id) {
  uni.navigateTo({ url: `/pages/admin/caregiver-review-detail?id=${id}` })
}

function goToServiceReviewDetail(id) {
  uni.navigateTo({ url: `/pages/admin/service-review-detail?id=${id}` })
}

function viewAllPending() {
  // 默认跳转到商户审核列表
  goToMerchantReview()
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.redirectTo({ url: '/pages/admin/login' })
      }
    },
  })
}

// 页面加载
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.admin-home {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 120rpx;
}

/* 顶部信息栏 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .user-info {
    display: flex;
    align-items: center;
    
    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 40rpx;
      margin-right: 20rpx;
    }
    
    .user-detail {
      display: flex;
      flex-direction: column;
      
      .user-name {
        font-size: 32rpx;
        color: #ffffff;
        font-weight: bold;
      }
      
      .user-role {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 6rpx;
      }
    }
  }
  
  .header-actions {
    .action-btn {
      font-size: 28rpx;
      color: #ffffff;
      padding: 12rpx 24rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 30rpx;
    }
  }
}

/* 统计卡片 */
.stats-section {
  margin: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    color: #333333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    
    .stat-card {
      background: #ffffff;
      border-radius: 16rpx;
      padding: 30rpx;
      position: relative;
      overflow: hidden;
      
      &.warning {
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
      }
      
      .stat-number {
        font-size: 48rpx;
        font-weight: bold;
        color: #667eea;
      }
      
      .stat-label {
        display: block;
        font-size: 26rpx;
        color: #666666;
        margin-top: 10rpx;
      }
      
      .stat-icon {
        position: absolute;
        right: 20rpx;
        top: 50%;
        transform: translateY(-50%);
        font-size: 60rpx;
        opacity: 0.2;
      }
    }
  }
}

/* 快捷入口 */
.quick-section {
  margin: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    color: #333333;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 30rpx 20rpx;
    
    .quick-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .quick-icon {
        font-size: 50rpx;
        margin-bottom: 10rpx;
      }
      
      .quick-text {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
}

/* 最近待审核 */
.pending-section {
  margin: 30rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      color: #333333;
      font-weight: bold;
    }
    
    .section-more {
      font-size: 26rpx;
      color: #667eea;
    }
  }
  
  .pending-group {
    background: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    
    .group-title {
      display: flex;
      align-items: center;
      padding: 20rpx 30rpx;
      background: #f8f9fa;
      border-bottom: 1rpx solid #eee;
      
      .group-icon {
        font-size: 32rpx;
        margin-right: 10rpx;
      }
      
      .group-text {
        font-size: 28rpx;
        color: #333333;
      }
    }
    
    .pending-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-left {
        display: flex;
        flex-direction: column;
        
        .item-name {
          font-size: 30rpx;
          color: #333333;
        }
        
        .item-time {
          font-size: 24rpx;
          color: #999999;
          margin-top: 6rpx;
        }
      }
      
      .item-arrow {
        font-size: 40rpx;
        color: #cccccc;
      }
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;
    background: #ffffff;
    border-radius: 16rpx;
    
    .empty-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }
}

/* 底部导航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1rpx solid #eeeeee;
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .nav-icon {
      font-size: 40rpx;
    }
    
    .nav-text {
      font-size: 22rpx;
      color: #999999;
      margin-top: 6rpx;
    }
    
    &.active {
      .nav-text {
        color: #667eea;
      }
    }
  }
}
</style>
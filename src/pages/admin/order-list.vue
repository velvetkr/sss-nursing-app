<template>
  <view class="order-list">
    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view
        class="tab-item"
        :class="{ active: currentType === 'ALL' }"
        @tap="changeType('ALL')"
      >
        全部({{ totalCount }})
      </view>
      <view
        class="tab-item"
        :class="{ active: currentType === 'ABNORMAL' }"
        @tap="changeType('ABNORMAL')"
      >
        异常签到({{ abnormalCount }})
      </view>
      <view
        class="tab-item"
        :class="{ active: currentType === 'DISPUTED' }"
        @tap="changeType('DISPUTED')"
      >
        投诉中({{ disputedCount }})
      </view>
      <view
        class="tab-item"
        :class="{ active: currentType === 'REFUNDING' }"
        @tap="changeType('REFUNDING')"
      >
        退款中({{ refundingCount }})
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view
      class="order-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 列表项 -->
      <view
        v-for="item in orderList"
        :key="item.orderId"
        class="order-item"
        @tap="goToDetail(item)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <view class="order-info">
            <text class="order-id">订单号：{{ item.orderNo }}</text>
            <view class="status-tag" :class="getTypeClass(item.abnormalType)">
              {{ getTypeText(item.abnormalType) }}
            </view>
          </view>
          <text class="order-time">{{ formatTime(item.createdAt) }}</text>
        </view>

        <!-- 服务信息 -->
        <view class="order-body">
          <view class="service-row">
            <text class="service-name">{{ item.serviceName }}</text>
            <text class="service-price">¥{{ (item.amount / 100).toFixed(2) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">服务时间：</text>
            <text class="info-value">{{ item.serviceTime }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">服务地址：</text>
            <text class="info-value">{{ item.serviceAddress }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">顾客：</text>
            <text class="info-value">{{ item.customerName }} {{ item.customerPhone }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">护理人员：</text>
            <text class="info-value">{{ item.caregiverName || '未指派' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">商户：</text>
            <text class="info-value">{{ item.merchantName }}</text>
          </view>
        </view>

        <!-- 异常说明 -->
        <view v-if="item.abnormalReason" class="abnormal-reason">
          <text class="reason-label">异常说明：</text>
          <text class="reason-text">{{ item.abnormalReason }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="order-footer">
          <text class="view-detail">查看详情 ›</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多 -->
      <view v-if="!hasMore && orderList.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && orderList.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无异常订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/store/admin.js'

// Store
const adminStore = useAdminStore()

// 当前类型
const currentType = ref('ALL')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 加载状态
const loading = ref(false)
const isRefreshing = ref(false)
const hasMore = ref(true)

// 订单列表
const orderList = computed(() => adminStore.abnormalOrderList)
const totalCount = computed(() => adminStore.abnormalOrderTotal)

// 统计数量
const abnormalCount = computed(() => 
  orderList.value.filter(item => item.abnormalType === 'ABNORMAL').length
)
const disputedCount = computed(() => 
  orderList.value.filter(item => item.abnormalType === 'DISPUTED').length
)
const refundingCount = computed(() => 
  orderList.value.filter(item => item.abnormalType === 'REFUNDING').length
)

// 加载数据
async function loadData(isRefresh = false) {
  if (loading.value) return
  
  loading.value = true
  
  try {
    await adminStore.fetchAbnormalOrderList({
      type: currentType.value === 'ALL' ? undefined : currentType.value,
      page: isRefresh ? 1 : currentPage.value,
      size: pageSize.value,
    })
    
    if (isRefresh) {
      currentPage.value = 1
      hasMore.value = true
    }
    
    if (orderList.value.length < totalCount.value) {
      hasMore.value = true
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('加载数据失败:', err)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 切换类型
function changeType(type) {
  currentType.value = type
  currentPage.value = 1
  loadData(true)
}

// 下拉刷新
function onRefresh() {
  isRefreshing.value = true
  loadData(true)
}

// 加载更多
function onLoadMore() {
  if (!hasMore.value || loading.value) return
  
  currentPage.value++
  loadData()
}

// 获取类型样式
function getTypeClass(type) {
  const classMap = {
    ABNORMAL: 'type-abnormal',
    DISPUTED: 'type-disputed',
    REFUNDING: 'type-refunding',
  }
  return classMap[type] || ''
}

// 获取类型文本
function getTypeText(type) {
  const textMap = {
    ABNORMAL: '异常签到',
    DISPUTED: '投诉中',
    REFUNDING: '退款中',
  }
  return textMap[type] || '未知'
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 跳转详情
function goToDetail(item) {
  if (item.abnormalType === 'DISPUTED') {
    uni.navigateTo({
      url: `/pages/admin/complaint-detail?id=${item.complaintId}`,
    })
  } else {
    uni.showToast({
      title: '订单详情页面待实现',
      icon: 'none',
    })
  }
}

// 页面加载
onMounted(() => {
  loadData(true)
})
</script>

<style lang="scss" scoped>
.order-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f6fa;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  background: #ffffff;
  padding: 20rpx 20rpx;
  border-bottom: 1rpx solid #eeeeee;
  
  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 24rpx;
    color: #666666;
    padding: 14rpx 0;
    border-radius: 30rpx;
    transition: all 0.3s;
    
    &.active {
      background: #667eea;
      color: #ffffff;
    }
  }
}

/* 订单列表 */
.order-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}

.order-item {
  background: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 24rpx;
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
    
    .order-info {
      flex: 1;
      display: flex;
      align-items: center;
      
      .order-id {
        font-size: 26rpx;
        color: #999999;
      }
      
      .status-tag {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        margin-left: 16rpx;
        
        &.type-abnormal {
          background: #fff3e0;
          color: #ff9800;
        }
        
        &.type-disputed {
          background: #ffebee;
          color: #f44336;
        }
        
        &.type-refunding {
          background: #e3f2fd;
          color: #2196f3;
        }
      }
    }
    
    .order-time {
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .order-body {
    .service-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .service-name {
        font-size: 30rpx;
        color: #333333;
        font-weight: bold;
      }
      
      .service-price {
        font-size: 30rpx;
        color: #f44336;
        font-weight: bold;
      }
    }
    
    .info-row {
      display: flex;
      margin-bottom: 10rpx;
      
      .info-label {
        font-size: 24rpx;
        color: #999999;
        width: 140rpx;
      }
      
      .info-value {
        flex: 1;
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
  
  .abnormal-reason {
    background: #fff3e0;
    border-radius: 8rpx;
    padding: 16rpx;
    margin-top: 16rpx;
    
    .reason-label {
      font-size: 24rpx;
      color: #ff9800;
    }
    
    .reason-text {
      font-size: 24rpx;
      color: #666666;
      margin-left: 8rpx;
    }
  }
  
  .order-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #eeeeee;
    
    .view-detail {
      font-size: 26rpx;
      color: #667eea;
    }
  }
}

/* 加载状态 */
.loading-state,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  
  .loading-text,
  .no-more-text {
    font-size: 26rpx;
    color: #999999;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  
  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 20rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999999;
  }
}
</style>
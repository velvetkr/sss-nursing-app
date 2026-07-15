<template>
  <view class="page-shell">
    <!-- 搜索 -->
    <view class="search-bar">
      <u-search v-model="keyword" placeholder="订单号/顾客/服务名" :showAction="false" @search="onSearch" @clear="onClear" shape="round" bgColor="#f5f6f8" />
    </view>

    <!-- 状态筛选 -->
    <scroll-view scroll-x :show-scrollbar="false" class="tabs-scroll">
      <view class="tabs">
        <view v-for="tab in orderStatusTabs" :key="String(tab.value)" class="tab" :class="{ active: activeStatus === tab.value }" @click="changeStatus(tab.value)">{{ tab.label }}</view>
      </view>
    </scroll-view>

    <scroll-view scroll-x :show-scrollbar="false" class="tabs-scroll">
      <view class="tabs sub-tabs">
        <view v-for="tab in dispatchTabs" :key="String(tab.value)" class="tab" :class="{ active: activeDispatch === tab.value }" @click="changeDispatch(tab.value)">{{ tab.label }}</view>
      </view>
    </scroll-view>

    <!-- 统计概览 -->
    <view class="stats-bar" v-if="stats.total">
      <text class="stat-chip" :class="{ active: !activeStatus && !activeDispatch }" @click="clearFilters()">全部 {{ stats.total }}</text>
      <text class="stat-chip warn" @click="changeDispatch('UNASSIGNED')">待派单 {{ stats.waitingDispatch }}</text>
      <text class="stat-chip warn" @click="changeDispatch('WAITING_ACCEPT')">待接单 {{ stats.waitingAccept }}</text>
      <text class="stat-chip primary" @click="changeStatus('IN_SERVICE')">服务中 {{ stats.inService }}</text>
    </view>

    <!-- 列表 -->
    <view v-if="store.merchantOrdersLoading" class="loading-wrap"><u-loading-icon size="28" color="#3A7BF7" /></view>
    <empty-state v-else-if="!store.merchantOrders.length" title="暂无订单" description="顾客下单并支付后会出现在这里" />
    <view v-else class="order-list">
      <view v-for="order in store.merchantOrders" :key="order.orderId" class="order-card" @click="goDetail(order.orderId)">
        <view class="card-head">
          <text class="order-no">{{ order.orderNo }}</text>
          <text class="order-status" :class="orderStatusClass(order.orderStatus)">{{ orderStatusText(order.orderStatus) }}</text>
        </view>
        <view class="service-row">
          <view class="service-copy">
            <text class="service-name">{{ order.serviceItemName }}</text>
            <text class="service-spec">{{ order.specName }} · {{ order.serviceDate }}</text>
          </view>
          <text class="amount">¥{{ (order.totalAmount / 100).toFixed(0) }}</text>
        </view>
        <view class="meta-row">
          <u-icon name="account" size="14" color="#98A5B3" /><text>{{ order.customerName }}</text>
          <u-icon name="map" size="14" color="#98A5B3" /><text class="address">{{ order.addressDetail }}</text>
        </view>
        <view class="dispatch-info" v-if="order.caregiverName">
          <text class="dispatch-label">派单：</text>
          <text class="dispatch-status" :class="dispatchStatusClass(order.dispatchStatus)">{{ dispatchStatusText(order.dispatchStatus) }}</text>
          <text class="caregiver-name">{{ order.caregiverName }}</text>
        </view>
        <view class="card-actions" @click.stop>
          <button v-if="order.dispatchStatus === 'UNASSIGNED'" class="act-btn primary" @click="goDispatch(order.orderId)">派单</button>
          <button v-if="order.dispatchStatus === 'WAITING_ACCEPT'" class="act-btn" @click="cancelDispatch(order.orderId)">取消派单</button>
          <button v-if="order.dispatchStatus === 'REJECTED' || order.dispatchStatus === 'EXPIRED'" class="act-btn primary" @click="goDispatch(order.orderId)">改派</button>
          <button class="act-btn" @click="goDetail(order.orderId)">详情</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { useMerchantStore, DISPATCH_STATUS_TEXT } from '@/store/merchant.js'
import EmptyState from '@/components/base/empty-state.vue'

const store = useMerchantStore()
const activeStatus = ref('')
const activeDispatch = ref('')
const keyword = ref('')
const stats = reactive({ total: 0, waitingDispatch: 0, waitingAccept: 0, inService: 0 })

const ORDER_STATUS_TEXT_MAP = {
  CREATED: '待支付', WAITING_DISPATCH: '待派单', WAITING_SERVICE: '待服务',
  IN_SERVICE: '服务中', WAITING_CONFIRM: '待确认', COMPLETED: '已完成',
  CANCELED: '已取消', CLOSED: '已关闭', DISPUTED: '争议中',
}

const orderStatusTabs = [
  { label: '全部状态', value: '' },
  { label: '待派单', value: 'WAITING_DISPATCH' },
  { label: '待服务', value: 'WAITING_SERVICE' },
  { label: '服务中', value: 'IN_SERVICE' },
  { label: '待确认', value: 'WAITING_CONFIRM' },
  { label: '已完成', value: 'COMPLETED' },
]

const dispatchTabs = [
  { label: '全部派单', value: '' },
  { label: '待派单', value: 'UNASSIGNED' },
  { label: '等待接单', value: 'WAITING_ACCEPT' },
  { label: '已拒绝', value: 'REJECTED' },
]

onLoad((options) => {
  if (options?.status) activeStatus.value = options.status
  if (options?.dispatchStatus) activeDispatch.value = options.dispatchStatus
})

onShow(() => loadOrders())

async function loadOrders() {
  const params = {}
  if (activeStatus.value) params.status = activeStatus.value
  if (activeDispatch.value) params.dispatchStatus = activeDispatch.value
  if (keyword.value) params.keyword = keyword.value
  const result = await store.fetchMerchantOrders(params)
  if (result?.stats) Object.assign(stats, result.stats)
}

function changeStatus(s) { activeStatus.value = s; activeDispatch.value = ''; loadOrders() }
function changeDispatch(d) { activeDispatch.value = d; activeStatus.value = ''; loadOrders() }
function clearFilters() { activeStatus.value = ''; activeDispatch.value = ''; keyword.value = ''; loadOrders() }
function onSearch() { loadOrders() }
function onClear() { keyword.value = ''; loadOrders() }

function orderStatusText(s) { return ORDER_STATUS_TEXT_MAP[s] || s }
function dispatchStatusText(s) { return DISPATCH_STATUS_TEXT[s] || s }
function orderStatusClass(s) {
  if (s === 'COMPLETED') return 'done'
  if (s === 'IN_SERVICE') return 'active'
  if (s === 'CANCELED' || s === 'CLOSED') return 'gray'
  return 'pending'
}
function dispatchStatusClass(s) {
  if (s === 'ACCEPTED') return 'done'
  if (s === 'REJECTED' || s === 'EXPIRED') return 'reject'
  return 'pending'
}

function goDetail(id) { uni.navigateTo({ url: `/pages/merchant/order-detail?id=${id}` }) }
function goDispatch(id) { uni.navigateTo({ url: `/pages/merchant/dispatch?id=${id}` }) }

async function cancelDispatch(orderId) {
  uni.showModal({ title: '取消派单', content: '确定取消当前派单吗？', success: async ({ confirm }) => {
    if (!confirm) return
    try {
      const records = await store.fetchDispatchRecords(orderId)
      const active = records.find(r => r.status === 'WAITING_ACCEPT')
      if (active) {
        await store.cancelDispatch(orderId, active.assignmentId)
        uni.showToast({ title: '已取消', icon: 'success' })
        loadOrders()
      }
    } catch { /* handled */ }
  }})
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 16rpx $spacing-base 50rpx; background: $page-gradient; }
.search-bar { margin-bottom: 8rpx; }

.tabs-scroll { white-space: nowrap; margin-bottom: 8rpx; }
.tabs { display: flex; gap: 8rpx; padding: 2rpx 0; }
.tab { flex-shrink: 0; padding: 8rpx 18rpx; border-radius: $radius-round; background: rgba(255,255,255,0.74); color: $text-color-secondary; font-size: 20rpx; }
.tab.active { color: #fff; background: $primary-gradient; }

.stats-bar { display: flex; gap: 10rpx; padding: 12rpx 0; flex-wrap: wrap; }
.stat-chip { padding: 6rpx 16rpx; border-radius: $radius-round; font-size: $font-size-xs; background: rgba(255,255,255,0.74); color: $text-color-secondary; }
.stat-chip.active { background: $primary-gradient; color: #fff; }
.stat-chip.warn { color: $warning-color; }

.loading-wrap { padding: 160rpx 0; display: flex; justify-content: center; }

.order-card { margin-bottom: 16rpx; padding: 22rpx; border-radius: 24rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.card-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14rpx; border-bottom: 1rpx solid $divider-color; }
.order-no { font-size: $font-size-xs; color: $text-color-hint; }
.order-status { padding: 4rpx 12rpx; border-radius: $radius-round; font-size: $font-size-xs; }
.order-status.done { color: $success-color; background: #e9fbf7; }
.order-status.active { color: $primary-color; background: $primary-bg; }
.order-status.pending { color: $warning-color; background: #fff2eb; }
.order-status.gray { color: $info-color; background: #f0f3f7; }

.service-row { display: flex; align-items: center; gap: 12rpx; padding: 18rpx 0; }
.service-copy { flex: 1; }
.service-name { display: block; font-size: $font-size-base; font-weight: 700; color: $text-color; }
.service-spec { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; }
.amount { font-size: $font-size-md; font-weight: 700; color: $warning-color; }

.meta-row { display: flex; align-items: center; gap: 6rpx; color: $text-color-hint; font-size: 20rpx; }
.address { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dispatch-info { display: flex; align-items: center; gap: 6rpx; margin-top: 10rpx; padding: 10rpx 14rpx; background: $primary-bg; border-radius: $radius-base; font-size: $font-size-xs; }
.dispatch-label { color: $text-color-hint; }
.dispatch-status { padding: 2rpx 8rpx; border-radius: $radius-round; }
.dispatch-status.done { color: $success-color; }
.dispatch-status.pending { color: $warning-color; }
.dispatch-status.reject { color: $error-color; }
.caregiver-name { color: $text-color; font-weight: 600; }

.card-actions { display: flex; justify-content: flex-end; gap: 10rpx; margin-top: 16rpx; }
.act-btn { height: 54rpx; margin: 0; padding: 0 20rpx; border: 1rpx solid $border-color; border-radius: $radius-round; background: #fff; color: $text-color-secondary; font-size: $font-size-xs; line-height: 52rpx; }
.act-btn::after { border: none; }
.act-btn.primary { border: none; color: #fff; background: $primary-gradient; }
</style>

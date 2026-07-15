<template>
  <view class="page-shell">
    <view v-if="store.merchantOrdersLoading" class="loading-wrap"><u-loading-icon size="28" /></view>
    <template v-else-if="order">
      <!-- 订单状态头部 -->
      <view class="status-header">
        <text class="status-title" :class="statusClass">{{ orderStatusText(order.orderStatus) }}</text>
        <text class="status-desc">{{ statusDescription }}</text>
      </view>

      <!-- 服务信息 -->
      <view class="card">
        <text class="card-title">服务信息</text>
        <view class="info-rows">
          <view class="info-row"><text class="ik">服务项目</text><text class="iv">{{ order.serviceItemName }}</text></view>
          <view class="info-row"><text class="ik">规格</text><text class="iv">{{ order.specName }}</text></view>
          <view class="info-row"><text class="ik">金额</text><text class="iv price">¥{{ (order.totalAmount / 100).toFixed(2) }}</text></view>
          <view class="info-row"><text class="ik">预约时间</text><text class="iv">{{ order.serviceDate }} {{ slotText(order.serviceTimeSlot) }}</text></view>
          <view class="info-row"><text class="ik">支付状态</text><text class="iv">{{ order.paymentStatus === 'PAID' ? '已支付' : '待支付' }}</text></view>
        </view>
      </view>

      <!-- 顾客信息 -->
      <view class="card">
        <text class="card-title">顾客信息</text>
        <view class="info-rows">
          <view class="info-row"><text class="ik">姓名</text><text class="iv">{{ order.customerName }}</text></view>
          <view class="info-row"><text class="ik">电话</text><text class="iv">{{ order.customerPhone }}</text></view>
          <view class="info-row"><text class="ik">服务地址</text><text class="iv">{{ order.addressDetail }}</text></view>
          <view class="info-row" v-if="order.remark"><text class="ik">备注</text><text class="iv">{{ order.remark }}</text></view>
        </view>
      </view>

      <!-- 派单信息 -->
      <view class="card" v-if="order.caregiverName || dispatchRecords.length">
        <text class="card-title">派单信息</text>
        <view class="info-rows" v-if="order.caregiverName">
          <view class="info-row"><text class="ik">护理人员</text><text class="iv">{{ order.caregiverName }}</text></view>
          <view class="info-row"><text class="ik">派单状态</text><text class="iv dispatch-status" :class="dispatchClass">{{ dispatchStatusText(order.dispatchStatus) }}</text></view>
        </view>
        <!-- 派单记录 -->
        <view class="dispatch-records" v-if="dispatchRecords.length">
          <text class="sub-title">派单记录</text>
          <view v-for="r in dispatchRecords" :key="r.assignmentId" class="record-item">
            <view class="record-head">
              <text class="caregiver-name">{{ r.caregiverName }}</text>
              <text class="record-status" :class="recordStatusClass(r.status)">{{ dispatchStatusText(r.status) }}</text>
            </view>
            <text class="record-time">派单时间：{{ r.assignedAt?.slice(0, 16)?.replace('T', ' ') }}</text>
            <text class="record-reason" v-if="r.rejectReason">拒绝原因：{{ r.rejectReason }}</text>
          </view>
        </view>
      </view>

      <!-- 服务时间线 -->
      <view class="card" v-if="order.events?.length">
        <text class="card-title">订单进度</text>
        <view class="timeline">
          <view v-for="(event, i) in order.events" :key="i" class="tl-item">
            <view class="tl-dot" :class="{ active: i === order.events.length - 1 }" />
            <view class="tl-content">
              <text class="tl-text">{{ event.remark }}</text>
              <text class="tl-time">{{ event.eventTime?.slice(0, 16)?.replace('T', ' ') }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="action-bar-bottom">
        <button v-if="order.dispatchStatus === 'UNASSIGNED' && order.paymentStatus === 'PAID'" class="btn primary" @click="goDispatch">派单</button>
        <button v-if="order.dispatchStatus === 'WAITING_ACCEPT'" class="btn" @click="handleCancelDispatch">取消派单</button>
        <button v-if="order.dispatchStatus === 'REJECTED' || order.dispatchStatus === 'EXPIRED'" class="btn primary" @click="goDispatch">改派</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMerchantStore, DISPATCH_STATUS_TEXT } from '@/store/merchant.js'

const store = useMerchantStore()
const order = ref(null)
const dispatchRecords = ref([])

const ORDER_STATUS_TEXT_MAP = {
  CREATED: '待支付', WAITING_DISPATCH: '待派单', WAITING_SERVICE: '待服务',
  IN_SERVICE: '服务中', WAITING_CONFIRM: '待确认', COMPLETED: '已完成',
  CANCELED: '已取消', CLOSED: '已关闭', DISPUTED: '争议中',
}
const SLOT_TEXT_MAP = { MORNING: '上午 (08:00-12:00)', AFTERNOON: '下午 (13:00-17:00)', EVENING: '晚上 (18:00-21:00)' }

const statusDescription = computed(() => {
  if (!order.value) return ''
  const text = orderStatusText(order.value.orderStatus)
  const map = {
    CREATED: '顾客已下单，等待支付',
    WAITING_DISPATCH: '顾客已支付，请尽快派单',
    WAITING_SERVICE: '已派单，等待护理人员接单或上门',
    IN_SERVICE: '护理人员正在服务中',
    WAITING_CONFIRM: '服务已结束，等待顾客确认',
    COMPLETED: '订单已完成',
    CANCELED: '订单已取消',
  }
  return map[order.value.orderStatus] || ''
})

const statusClass = computed(() => {
  const s = order.value?.orderStatus
  if (s === 'COMPLETED') return 'done'
  if (s === 'IN_SERVICE') return 'active'
  if (s === 'CANCELED' || s === 'CLOSED') return 'gray'
  return 'pending'
})

const dispatchClass = computed(() => {
  const s = order.value?.dispatchStatus
  if (s === 'ACCEPTED') return 'done'
  if (s === 'REJECTED' || s === 'EXPIRED') return 'reject'
  return 'pending'
})

onLoad(async (options) => {
  if (options?.id) {
    const detail = await store.fetchMerchantOrderDetail(parseInt(options.id))
    order.value = detail
    dispatchRecords.value = detail?.dispatchRecords || []
  }
})

function orderStatusText(s) { return ORDER_STATUS_TEXT_MAP[s] || s }
function dispatchStatusText(s) { return DISPATCH_STATUS_TEXT[s] || s }
function slotText(s) { return SLOT_TEXT_MAP[s] || s }
function recordStatusClass(s) {
  if (s === 'ACCEPTED') return 'done'
  if (s === 'REJECTED' || s === 'EXPIRED') return 'reject'
  if (s === 'CANCELED') return 'gray'
  return 'pending'
}

function goDispatch() { uni.navigateTo({ url: `/pages/merchant/dispatch?id=${order.value.orderId}` }) }

async function handleCancelDispatch() {
  uni.showModal({ title: '取消派单', content: '确定取消当前派单吗？', success: async ({ confirm }) => {
    if (!confirm) return
    try {
      const active = dispatchRecords.value.find(r => r.status === 'WAITING_ACCEPT')
      if (active) {
        await store.cancelDispatch(order.value.orderId, active.assignmentId)
        uni.showToast({ title: '已取消', icon: 'success' })
        const detail = await store.fetchMerchantOrderDetail(order.value.orderId)
        order.value = detail
        dispatchRecords.value = detail?.dispatchRecords || []
      }
    } catch { /* handled */ }
  }})
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding-bottom: 120rpx; background: $page-gradient; }
.loading-wrap { padding: 200rpx 0; display: flex; justify-content: center; }

.status-header { padding: 40rpx $spacing-base 32rpx; text-align: center; }
.status-title { font-size: $font-size-xl; font-weight: 800; }
.status-title.done { color: $success-color; }
.status-title.active { color: $primary-color; }
.status-title.pending { color: $warning-color; }
.status-title.gray { color: $info-color; }
.status-desc { display: block; margin-top: 8rpx; font-size: $font-size-sm; color: $text-color-hint; }

.card { margin: 0 $spacing-base 16rpx; padding: 24rpx; border-radius: 24rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.card-title { display: block; font-size: $font-size-base; font-weight: 700; color: $text-color; margin-bottom: 16rpx; }
.info-rows { display: flex; flex-direction: column; gap: 12rpx; }
.info-row { display: flex; }
.ik { width: 140rpx; flex-shrink: 0; font-size: $font-size-sm; color: $text-color-hint; }
.iv { flex: 1; font-size: $font-size-sm; color: $text-color; }
.price { color: $warning-color; font-weight: 700; }

.dispatch-status.done { color: $success-color; }
.dispatch-status.pending { color: $warning-color; }
.dispatch-status.reject { color: $error-color; }

.sub-title { display: block; font-size: $font-size-sm; font-weight: 600; color: $text-color; margin-top: 18rpx; margin-bottom: 10rpx; }
.dispatch-records { border-top: 1rpx solid $divider-color; padding-top: 14rpx; margin-top: 4rpx; }
.record-item { padding: 12rpx 0; border-bottom: 1rpx solid $divider-color; }
.record-item:last-child { border-bottom: none; }
.record-head { display: flex; align-items: center; justify-content: space-between; }
.caregiver-name { font-size: $font-size-sm; font-weight: 600; color: $text-color; }
.record-status { font-size: $font-size-xs; padding: 2rpx 10rpx; border-radius: $radius-round; }
.record-status.done { color: $success-color; background: #e9fbf7; }
.record-status.pending { color: $warning-color; background: #fff2eb; }
.record-status.reject { color: $error-color; background: #fff0f0; }
.record-status.gray { color: $info-color; background: #f0f3f7; }
.record-time { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; }
.record-reason { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $error-color; }

.timeline { padding-left: 8rpx; }
.tl-item { display: flex; gap: 14rpx; padding-bottom: 20rpx; position: relative; }
.tl-item:not(:last-child)::before { content: ''; position: absolute; left: 9rpx; top: 20rpx; bottom: -4rpx; width: 2rpx; background: $divider-color; }
.tl-dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: $divider-color; flex-shrink: 0; margin-top: 4rpx; }
.tl-dot.active { background: $primary-gradient; box-shadow: $shadow-glow; }
.tl-content { flex: 1; }
.tl-text { display: block; font-size: $font-size-sm; color: $text-color; }
.tl-time { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; }

.action-bar-bottom { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx $spacing-base; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); display: flex; gap: 14rpx; border-top: 1rpx solid $divider-color; }
.btn { flex: 1; height: 80rpx; margin: 0; border: 1rpx solid $border-color; border-radius: $radius-round; background: #fff; color: $text-color-secondary; font-size: $font-size-base; line-height: 78rpx; }
.btn::after { border: none; }
.btn.primary { border: none; background: $primary-gradient; color: #fff; font-weight: 600; }
</style>

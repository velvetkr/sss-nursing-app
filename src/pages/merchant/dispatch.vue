<template>
  <view class="page-shell">
    <!-- 订单摘要 -->
    <view class="order-summary" v-if="order">
      <text class="summary-title">{{ order.serviceItemName }}</text>
      <view class="summary-meta">
        <text>{{ order.specName }}</text>
        <text>·</text>
        <text>{{ order.serviceDate }}</text>
        <text>·</text>
        <text>{{ order.customerName }}</text>
      </view>
      <text class="summary-addr">📍 {{ order.addressDetail }}</text>
    </view>

    <!-- 当前派单状态 -->
    <view class="current-dispatch" v-if="order && order.dispatchStatus !== 'UNASSIGNED'">
      <text class="section-label">当前派单状态：</text>
      <text class="dispatch-badge" :class="dispatchBadgeClass">{{ dispatchText }}</text>
      <text v-if="order.caregiverName"> → {{ order.caregiverName }}</text>
    </view>

    <text class="section-label">候选护理人员</text>
    <text class="section-hint">根据技能匹配、服务区域和当前任务量综合排序</text>

    <!-- 候选列表 -->
    <view v-if="store.candidatesLoading" class="loading-wrap"><u-loading-icon size="28" /></view>
    <empty-state v-else-if="!candidates.length" title="暂无可用护理人员" description="当前没有在职且可接单的护理人员" />
    <view v-else class="candidate-list">
      <view v-for="c in candidates" :key="c.caregiverId" class="candidate-card" :class="{ matched: c.skillMatch }">
        <view class="c-head">
          <view class="c-avatar">{{ c.name.charAt(0) }}</view>
          <view class="c-info">
            <view class="c-name-row">
              <text class="c-name">{{ c.name }}</text>
              <text class="c-match" v-if="c.skillMatch">技能匹配</text>
            </view>
            <text class="c-skills">{{ c.skills?.join('、') }}</text>
            <view class="c-stats">
              <text>⭐ {{ c.avgRating }}</text>
              <text>📋 {{ c.totalServiceCount }}单</text>
              <text>📍 {{ c.distance }}km</text>
            </view>
          </view>
        </view>
        <view class="c-meta">
          <text>当前任务：{{ c.currentTaskCount }}个</text>
          <text>区域：{{ c.serviceArea }}</text>
        </view>
        <button class="btn-dispatch" @click="handleDispatch(c)">
          {{ order?.dispatchStatus === 'UNASSIGNED' ? '派单给TA' : '改派给TA' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'
import EmptyState from '@/components/base/empty-state.vue'

const store = useMerchantStore()
const order = ref(null)
const candidates = ref([])

const dispatchText = computed(() => {
  const map = { UNASSIGNED: '待派单', WAITING_ACCEPT: '等待接单', ACCEPTED: '已接单', REJECTED: '已拒绝', EXPIRED: '已超时', CANCELED: '已取消' }
  return map[order.value?.dispatchStatus] || '未知'
})
const dispatchBadgeClass = computed(() => {
  const s = order.value?.dispatchStatus
  if (s === 'ACCEPTED') return 'done'
  if (s === 'REJECTED' || s === 'EXPIRED') return 'reject'
  return 'pending'
})

onLoad(async (options) => {
  if (options?.id) {
    const oid = parseInt(options.id)
    order.value = await store.fetchMerchantOrderDetail(oid)
    candidates.value = await store.fetchCandidates(oid)
  }
})

async function handleDispatch(caregiver) {
  const isReassign = order.value.dispatchStatus !== 'UNASSIGNED' && order.value.dispatchStatus !== 'CANCELED'
  const title = isReassign ? '确认改派' : '确认派单'
  const content = isReassign
    ? `确定将订单改派给"${caregiver.name}"吗？之前的派单将被取消。`
    : `确定将订单派给"${caregiver.name}"吗？`

  uni.showModal({ title, content, success: async ({ confirm }) => {
    if (!confirm) return
    try {
      if (isReassign) {
        await store.reassignOrder(order.value.orderId, caregiver.caregiverId)
      } else {
        await store.dispatchOrder(order.value.orderId, caregiver.caregiverId)
      }
      uni.showToast({ title: isReassign ? '改派成功' : '派单成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1200)
    } catch { /* handled */ }
  }})
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 16rpx $spacing-base 50rpx; background: $page-gradient; }

.order-summary { padding: 24rpx; margin-bottom: 20rpx; border-radius: 20rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.summary-title { display: block; font-size: $font-size-md; font-weight: 700; color: $text-color; }
.summary-meta { display: flex; gap: 6rpx; margin-top: 8rpx; font-size: $font-size-xs; color: $text-color-hint; flex-wrap: wrap; }
.summary-addr { display: block; margin-top: 6rpx; font-size: $font-size-xs; color: $text-color-hint; }

.current-dispatch { padding: 16rpx 20rpx; margin-bottom: 20rpx; border-radius: 16rpx; background: #fff8f0; font-size: $font-size-sm; color: $text-color-secondary; }
.dispatch-badge { padding: 2rpx 10rpx; border-radius: $radius-round; font-size: $font-size-xs; }
.dispatch-badge.done { color: $success-color; background: #e9fbf7; }
.dispatch-badge.pending { color: $warning-color; background: #fff2eb; }
.dispatch-badge.reject { color: $error-color; background: #fff0f0; }

.section-label { display: block; font-size: $font-size-base; font-weight: 700; color: $text-color; margin-bottom: 4rpx; }
.section-hint { display: block; font-size: $font-size-xs; color: $text-color-hint; margin-bottom: 14rpx; }

.loading-wrap { padding: 160rpx 0; display: flex; justify-content: center; }

.candidate-card { padding: 22rpx; margin-bottom: 16rpx; border-radius: 20rpx; background: $surface-gradient; border: 1rpx solid $border-color; box-shadow: $shadow-sm; }
.candidate-card.matched { border-color: $primary-color; box-shadow: 0 0 20rpx rgba(58,123,247,0.08); }
.c-head { display: flex; gap: 14rpx; }
.c-avatar { width: 72rpx; height: 72rpx; border-radius: 20rpx; background: linear-gradient(135deg, #00B8A9, #3DD9C5); color: #fff; font-size: 32rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.c-info { flex: 1; }
.c-name-row { display: flex; align-items: center; gap: 8rpx; }
.c-name { font-size: $font-size-base; font-weight: 700; color: $text-color; }
.c-match { padding: 2rpx 10rpx; border-radius: $radius-round; font-size: 18rpx; color: $success-color; background: #e9fbf7; }
.c-skills { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-secondary; }
.c-stats { display: flex; gap: 14rpx; margin-top: 6rpx; font-size: $font-size-xs; color: $text-color-hint; }
.c-meta { display: flex; gap: 20rpx; margin-top: 14rpx; padding-top: 12rpx; border-top: 1rpx solid $divider-color; font-size: $font-size-xs; color: $text-color-hint; }

.btn-dispatch { width: 100%; height: 72rpx; margin: 0; margin-top: 16rpx; border: none; border-radius: $radius-round; background: $primary-gradient; color: #fff; font-size: $font-size-sm; font-weight: 600; line-height: 72rpx; box-shadow: $shadow-glow; }
.btn-dispatch::after { border: none; }
</style>

<template>
  <view class="page-shell">
    <!-- 商户信息头部 -->
    <view class="merchant-header" v-if="store.hasMerchant">
      <view class="header-top">
        <view class="merchant-info">
          <view class="merchant-avatar">{{ store.currentMerchant.shortName?.charAt(0) || store.currentMerchant.name?.charAt(0) }}</view>
          <view class="merchant-text">
            <text class="merchant-name">{{ store.currentMerchant.shortName || store.currentMerchant.name }}</text>
            <text class="merchant-status" :class="auditClass">{{ store.getMerchantAuditStatusText(store.currentMerchant.auditStatus) }}</text>
          </view>
        </view>
        <view class="header-actions">
          <button class="action-link" @click="goProfile">商户资料</button>
        </view>
      </view>
      <view class="audit-banner" v-if="store.currentMerchant.auditStatus === 2">
        <u-icon name="error-circle" size="18" color="#FF5252" />
        <text>审核被驳回：{{ store.currentMerchant.auditOpinion }}</text>
        <button class="btn-resubmit" @click="resubmit">重新提交</button>
      </view>
    </view>

    <!-- 待审核状态 -->
    <view class="pending-card" v-else-if="store.currentMerchant && store.currentMerchant.auditStatus === 0">
      <u-icon name="clock" size="48" color="#3A7BF7" />
      <text class="pending-title">商户审核中</text>
      <text class="pending-desc">您的商户入驻申请正在审核中，请耐心等待。审核通过后即可使用完整功能。</text>
    </view>

    <!-- 无商户 -->
    <view class="no-merchant-card" v-else>
      <u-icon name="shop" size="48" color="#98A5B3" />
      <text class="pending-title">尚未入驻商户</text>
      <text class="pending-desc">成为商户后，您可以发布护理服务、管理护理人员和订单。</text>
      <button class="btn-apply" @click="goApply">立即入驻</button>
    </view>

    <!-- 统计数据 -->
    <view class="stats-row" v-if="store.isMerchantApproved">
      <view class="stat-item" @click="goOrders('WAITING_DISPATCH')">
        <text class="stat-value">{{ stats.waitingDispatch }}</text>
        <text class="stat-label">待派单</text>
      </view>
      <view class="stat-item" @click="goOrders(null, 'WAITING_ACCEPT')">
        <text class="stat-value">{{ stats.waitingAccept }}</text>
        <text class="stat-label">等待接单</text>
      </view>
      <view class="stat-item" @click="goOrders('IN_SERVICE')">
        <text class="stat-value">{{ stats.inService }}</text>
        <text class="stat-label">服务中</text>
      </view>
      <view class="stat-item" @click="goOrders(null, null, true)">
        <text class="stat-value abnormal">{{ stats.abnormal }}</text>
        <text class="stat-label">异常</text>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="menu-section" v-if="store.isMerchantApproved">
      <text class="section-title">服务管理</text>
      <view class="menu-grid">
        <view class="menu-item" @click="goServiceList">
          <view class="menu-icon service-icon"><u-icon name="grid" size="28" color="#fff" /></view>
          <text class="menu-label">服务管理</text>
          <text class="menu-desc">发布、编辑和上下架</text>
        </view>
        <view class="menu-item" @click="goOrderList">
          <view class="menu-icon order-icon"><u-icon name="order" size="28" color="#fff" /></view>
          <text class="menu-label">订单管理</text>
          <text class="menu-desc">查看、派单和处理</text>
        </view>
        <view class="menu-item" @click="goCaregiverList">
          <view class="menu-icon caregiver-icon"><u-icon name="account" size="28" color="#fff" /></view>
          <text class="menu-label">护理人员</text>
          <text class="menu-desc">管理和排班</text>
        </view>
        <view class="menu-item" @click="goMemberList">
          <view class="menu-icon member-icon"><u-icon name="man-add" size="28" color="#fff" /></view>
          <text class="menu-label">商户成员</text>
          <text class="menu-desc">查看成员列表</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'

const store = useMerchantStore()
const stats = ref({ waitingDispatch: 0, waitingAccept: 0, inService: 0, abnormal: 0 })

const auditClass = computed(() => {
  const s = store.currentMerchant?.auditStatus
  if (s === 1) return 'approved'
  if (s === 2) return 'rejected'
  return 'pending'
})

onShow(async () => {
  await store.fetchMyMerchant()
  if (store.isMerchantApproved) {
    try {
      const result = await store.fetchMerchantOrders({ page: 1, size: 1 })
      if (result.stats) stats.value = result.stats
    } catch { /* ignore */ }
  }
})

function goApply() { uni.navigateTo({ url: '/pages/merchant/apply' }) }
function goProfile() { uni.navigateTo({ url: '/pages/merchant/profile' }) }
function resubmit() { uni.navigateTo({ url: '/pages/merchant/apply?resubmit=1' }) }
function goServiceList() { uni.navigateTo({ url: '/pages/merchant/service-list' }) }
function goOrderList() { uni.navigateTo({ url: '/pages/merchant/order-list' }) }
function goCaregiverList() { uni.navigateTo({ url: '/pages/merchant/caregiver-list' }) }
function goMemberList() { uni.navigateTo({ url: '/pages/merchant/member-list' }) }
function goOrders(orderStatus, dispatchStatus, abnormal) {
  let url = '/pages/merchant/order-list'
  const params = []
  if (orderStatus) params.push(`status=${orderStatus}`)
  if (dispatchStatus) params.push(`dispatchStatus=${dispatchStatus}`)
  if (abnormal) params.push('abnormal=1')
  if (params.length) url += '?' + params.join('&')
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 20rpx $spacing-base 50rpx; background: $page-gradient; }

.merchant-header {
  padding: 32rpx 28rpx; border-radius: 28rpx;
  background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; margin-bottom: 20rpx;
  .header-top { display: flex; align-items: center; justify-content: space-between; }
  .merchant-info { display: flex; align-items: center; gap: 16rpx; }
  .merchant-avatar { width: 80rpx; height: 80rpx; border-radius: 24rpx; background: $primary-gradient; color: #fff; font-size: 36rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .merchant-text { display: flex; flex-direction: column; gap: 6rpx; }
  .merchant-name { font-size: $font-size-md; font-weight: 700; color: $text-color; }
  .merchant-status { font-size: $font-size-xs; padding: 4rpx 14rpx; border-radius: $radius-round; }
  .merchant-status.approved { color: $success-color; background: #e9fbf7; }
  .merchant-status.rejected { color: $error-color; background: #fff0f0; }
  .merchant-status.pending { color: $warning-color; background: #fff2eb; }
  .action-link { height: 56rpx; padding: 0 20rpx; border: 1rpx solid $border-color; border-radius: $radius-round; background: #fff; color: $primary-color; font-size: $font-size-xs; line-height: 54rpx; }
  .action-link::after { border: none; }
  .audit-banner { margin-top: 20rpx; padding: 16rpx 20rpx; background: #fff0f0; border-radius: $radius-base; display: flex; align-items: center; gap: 10rpx; font-size: $font-size-sm; color: $error-color; flex-wrap: wrap; }
  .btn-resubmit { height: 48rpx; padding: 0 16rpx; margin: 0; border: none; border-radius: $radius-round; background: $error-color; color: #fff; font-size: $font-size-xs; line-height: 48rpx; margin-left: auto; }
  .btn-resubmit::after { border: none; }
}

.pending-card, .no-merchant-card {
  display: flex; flex-direction: column; align-items: center; padding: 80rpx 48rpx; margin-bottom: 24rpx;
  border-radius: 28rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; text-align: center;
  .pending-title { margin-top: 24rpx; font-size: $font-size-md; font-weight: 700; color: $text-color; }
  .pending-desc { margin-top: 12rpx; font-size: $font-size-sm; color: $text-color-secondary; line-height: 1.6; }
  .btn-apply { margin-top: 32rpx; width: 280rpx; height: 80rpx; border: none; border-radius: $radius-round; background: $primary-gradient; color: #fff; font-size: $font-size-base; font-weight: 600; box-shadow: $shadow-glow; }
  .btn-apply::after { border: none; }
}

.stats-row { display: flex; gap: 16rpx; margin-bottom: 28rpx; }
.stat-item { flex: 1; text-align: center; padding: 24rpx 12rpx; border-radius: 20rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.stat-value { display: block; font-size: 44rpx; font-weight: 800; color: $primary-color; }
.stat-value.abnormal { color: $warning-color; }
.stat-label { display: block; margin-top: 6rpx; font-size: $font-size-xs; color: $text-color-hint; }

.menu-section { margin-bottom: 28rpx; }
.section-title { font-size: $font-size-base; font-weight: 700; color: $text-color; margin-bottom: 16rpx; display: block; }
.menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
.menu-item {
  padding: 28rpx 24rpx; border-radius: 20rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm;
  .menu-icon { width: 64rpx; height: 64rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; margin-bottom: 14rpx; }
  .service-icon { background: linear-gradient(135deg, #3A7BF7, #5B8DF7); }
  .order-icon { background: linear-gradient(135deg, #FF8A5C, #FFB088); }
  .caregiver-icon { background: linear-gradient(135deg, #00B8A9, #3DD9C5); }
  .member-icon { background: linear-gradient(135deg, #8E9DAE, #B0BECC); }
  .menu-label { display: block; font-size: $font-size-base; font-weight: 700; color: $text-color; }
  .menu-desc { display: block; margin-top: 6rpx; font-size: $font-size-xs; color: $text-color-hint; }
}
</style>

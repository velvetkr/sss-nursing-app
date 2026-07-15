<template>
  <view class="page-shell">
    <view v-if="store.caregiversLoading" class="loading-wrap"><u-loading-icon size="28" /></view>
    <template v-else-if="caregiver">
      <!-- 头部信息 -->
      <view class="profile-header">
        <view class="avatar">{{ caregiver.name?.charAt(0) }}</view>
        <text class="name">{{ caregiver.name }}</text>
        <text class="status-badge" :class="statusClass">{{ store.getCaregiverStatusText(caregiver.status) }}</text>
        <view class="rating-row">
          <text>⭐ {{ caregiver.avgRating }} · 📋 {{ caregiver.totalServiceCount }}单</text>
        </view>
        <text class="schedule-tip" v-if="caregiver.schedule?.mode === 'leave'">⚠ 请假中至 {{ caregiver.schedule.leaveUntil?.slice(0, 10) }}</text>
      </view>

      <!-- 基本信息 -->
      <view class="card">
        <text class="card-title">基本信息</text>
        <view class="info-rows">
          <view class="info-row"><text class="ik">姓名</text><text class="iv">{{ caregiver.name }}</text></view>
          <view class="info-row"><text class="ik">电话</text><text class="iv">{{ caregiver.phone }}</text></view>
          <view class="info-row"><text class="ik">性别</text><text class="iv">{{ caregiver.gender === 1 ? '男' : '女' }}</text></view>
          <view class="info-row"><text class="ik">年龄</text><text class="iv">{{ caregiver.age }}岁</text></view>
          <view class="info-row"><text class="ik">服务区域</text><text class="iv">{{ caregiver.serviceArea }}</text></view>
          <view class="info-row"><text class="ik">当前任务</text><text class="iv">{{ caregiver.currentTaskCount }}个进行中</text></view>
          <view class="info-row"><text class="ik">加入时间</text><text class="iv">{{ caregiver.joinTime?.slice(0, 10) }}</text></view>
        </view>
      </view>

      <!-- 技能 -->
      <view class="card">
        <text class="card-title">服务技能</text>
        <view class="skill-tags">
          <text v-for="s in caregiver.skills" :key="s" class="skill-tag">{{ s }}</text>
        </view>
      </view>

      <!-- 资质证书 -->
      <view class="card">
        <text class="card-title">资质证书（{{ caregiver.qualifications?.length || 0 }}）</text>
        <view v-for="q in caregiver.qualifications" :key="q.name" class="qual-item">
          <view class="qual-head">
            <text class="qual-name">{{ q.name }}</text>
            <text class="qual-status" :class="q.status === 1 ? 'valid' : q.status === 3 ? 'expiring' : 'expired'">
              {{ q.status === 1 ? '有效' : q.status === 3 ? '即将过期' : '已过期' }}
            </text>
          </view>
          <text class="qual-meta">编号：{{ q.certNo }} · 发证：{{ q.issuer }}</text>
          <text class="qual-meta">有效期至：{{ q.validUntil?.slice(0, 10) }}</text>
        </view>
      </view>

      <!-- 操作 -->
      <view class="action-bar-bottom">
        <button v-if="caregiver.status === 0" class="btn warn" @click="handleDisable">停用</button>
        <button v-if="caregiver.status === 1" class="btn primary" @click="handleEnable">启用</button>
        <button v-if="caregiver.status !== 2" class="btn" @click="handleRemove">移出商户</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'

const store = useMerchantStore()
const caregiver = ref(null)

const statusClass = computed(() => {
  const s = caregiver.value?.status
  if (s === 0) return 'active'
  if (s === 1) return 'disabled'
  return 'left'
})

onLoad(async (options) => {
  if (options?.id) {
    await store.fetchCaregiverDetail(parseInt(options.id))
    caregiver.value = store.currentCaregiver
  }
})

async function handleEnable() {
  uni.showModal({ title: '启用护理人员', content: '确定启用该护理人员吗？', success: async ({ confirm }) => {
    if (!confirm) return
    try { await store.enableCaregiver(caregiver.value.caregiverId); refresh() } catch { /* handled */ }
  }})
}

async function handleDisable() {
  uni.showModal({ title: '停用护理人员', content: '停用后该护理人员将无法接收新派单，确定停用吗？', success: async ({ confirm }) => {
    if (!confirm) return
    try { await store.disableCaregiver(caregiver.value.caregiverId); refresh() } catch { /* handled */ }
  }})
}

async function handleRemove() {
  uni.showModal({ title: '移出商户', content: '移出后该护理人员将不再属于您的商户，此操作不可撤销。确定移出吗？', success: async ({ confirm }) => {
    if (!confirm) return
    try { await store.removeCaregiver(caregiver.value.caregiverId); uni.showToast({ title: '已移出', icon: 'success' }); setTimeout(() => uni.navigateBack(), 1200) } catch { /* handled */ }
  }})
}

async function refresh() {
  await store.fetchCaregiverDetail(caregiver.value.caregiverId)
  caregiver.value = store.currentCaregiver
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding-bottom: 120rpx; background: $page-gradient; }
.loading-wrap { padding: 200rpx 0; display: flex; justify-content: center; }

.profile-header { display: flex; flex-direction: column; align-items: center; padding: 48rpx 0 32rpx; }
.avatar { width: 120rpx; height: 120rpx; border-radius: 32rpx; background: linear-gradient(135deg, #00B8A9, #3DD9C5); color: #fff; font-size: 48rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.name { margin-top: 16rpx; font-size: $font-size-lg; font-weight: 700; color: $text-color; }
.status-badge { margin-top: 8rpx; padding: 4rpx 16rpx; border-radius: $radius-round; font-size: $font-size-xs; }
.status-badge.active { color: $success-color; background: #e9fbf7; }
.status-badge.disabled { color: $warning-color; background: #fff2eb; }
.status-badge.left { color: $info-color; background: #f0f3f7; }
.rating-row { margin-top: 6rpx; font-size: $font-size-sm; color: $text-color-hint; }
.schedule-tip { margin-top: 8rpx; font-size: $font-size-xs; color: $warning-color; }

.card { margin: 0 $spacing-base 16rpx; padding: 24rpx; border-radius: 24rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.card-title { display: block; font-size: $font-size-base; font-weight: 700; color: $text-color; margin-bottom: 14rpx; }
.info-rows { display: flex; flex-direction: column; gap: 10rpx; }
.info-row { display: flex; }
.ik { width: 140rpx; flex-shrink: 0; font-size: $font-size-sm; color: $text-color-hint; }
.iv { flex: 1; font-size: $font-size-sm; color: $text-color; }

.skill-tags { display: flex; flex-wrap: wrap; gap: 8rpx; }
.skill-tag { padding: 8rpx 16rpx; border-radius: $radius-round; background: $primary-bg; color: $primary-color; font-size: $font-size-xs; }

.qual-item { padding: 14rpx 0; border-bottom: 1rpx solid $divider-color; }
.qual-item:last-child { border-bottom: none; }
.qual-head { display: flex; align-items: center; justify-content: space-between; }
.qual-name { font-size: $font-size-sm; font-weight: 600; color: $text-color; }
.qual-status { font-size: $font-size-xs; padding: 2rpx 10rpx; border-radius: $radius-round; }
.qual-status.valid { color: $success-color; background: #e9fbf7; }
.qual-status.expiring { color: $warning-color; background: #fff2eb; }
.qual-status.expired { color: $error-color; background: #fff0f0; }
.qual-meta { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; }

.action-bar-bottom { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx $spacing-base; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); display: flex; gap: 14rpx; border-top: 1rpx solid $divider-color; }
.btn { flex: 1; height: 80rpx; margin: 0; border: 1rpx solid $border-color; border-radius: $radius-round; background: #fff; color: $text-color-secondary; font-size: $font-size-base; line-height: 78rpx; }
.btn::after { border: none; }
.btn.primary { border: none; background: $primary-gradient; color: #fff; font-weight: 600; }
.btn.warn { border: 1rpx solid $warning-color; color: $warning-color; }
</style>

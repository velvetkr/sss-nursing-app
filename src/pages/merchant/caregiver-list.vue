<template>
  <view class="page-shell">
    <!-- 筛选 -->
    <scroll-view scroll-x :show-scrollbar="false" class="tabs-scroll">
      <view class="tabs">
        <view v-for="tab in statusTabs" :key="String(tab.value)" class="tab" :class="{ active: activeStatus === tab.value }" @click="changeStatus(tab.value)">{{ tab.label }}</view>
      </view>
    </scroll-view>

    <view class="action-bar">
      <text class="count-text">共 {{ store.caregiversTotal }} 人</text>
      <button class="btn-invite" @click="showInvite = true">+ 邀请加入</button>
    </view>

    <!-- 列表 -->
    <view v-if="store.caregiversLoading" class="loading-wrap"><u-loading-icon size="28" color="#3A7BF7" /></view>
    <empty-state v-else-if="!store.caregivers.length" title="暂无护理人员" description="邀请护理人员加入您的商户团队" />
    <view v-else class="caregiver-list">
      <view v-for="c in store.caregivers" :key="c.caregiverId" class="cg-card" @click="goDetail(c.caregiverId)">
        <view class="cg-head">
          <view class="cg-avatar">{{ c.name?.charAt(0) }}</view>
          <view class="cg-info">
            <view class="cg-name-row">
              <text class="cg-name">{{ c.name }}</text>
              <text class="cg-status" :class="statusClass(c.status)">{{ store.getCaregiverStatusText(c.status) }}</text>
            </view>
            <text class="cg-skills">{{ c.skills?.join('、') }}</text>
            <view class="cg-stats">
              <text>⭐ {{ c.avgRating }}</text>
              <text>📋 {{ c.totalServiceCount }}单</text>
              <text v-if="c.currentTaskCount">🔔 {{ c.currentTaskCount }}进行中</text>
            </view>
          </view>
          <u-icon name="arrow-right" size="16" color="#C5CDD8" />
        </view>
        <view class="cg-meta">
          <text>区域：{{ c.serviceArea }}</text>
          <text v-if="c.schedule?.mode === 'leave'">⚠ 请假中（至{{ c.schedule.leaveUntil?.slice(0,10) }}）</text>
        </view>
      </view>
    </view>

    <!-- 邀请弹窗 -->
    <u-modal :show="showInvite" title="邀请护理人员" @confirm="handleInvite" @cancel="showInvite = false" confirmText="发送邀请">
      <view style="padding:20rpx">
        <u-input v-model="invitePhone" placeholder="请输入护理人员手机号" border="surround" maxlength="11" type="number" />
      </view>
    </u-modal>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'
import EmptyState from '@/components/base/empty-state.vue'

const store = useMerchantStore()
const activeStatus = ref(null)
const showInvite = ref(false)
const invitePhone = ref('')

const statusTabs = [
  { label: '全部', value: null },
  { label: '在职', value: 0 },
  { label: '已停用', value: 1 },
  { label: '已离职', value: 2 },
]

onShow(() => loadData())
function loadData() {
  store.fetchCaregivers({ status: activeStatus.value, page: 1 })
}

function changeStatus(s) { activeStatus.value = s; loadData() }
function statusClass(s) {
  if (s === 0) return 'active'
  if (s === 1) return 'disabled'
  return 'left'
}
function goDetail(id) { uni.navigateTo({ url: `/pages/merchant/caregiver-detail?id=${id}` }) }

async function handleInvite() {
  if (!invitePhone.value || !/^1\d{10}$/.test(invitePhone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return
  }
  try {
    await store.inviteCaregiver(invitePhone.value)
    uni.showToast({ title: '邀请已发送', icon: 'success' })
    showInvite.value = false
    invitePhone.value = ''
  } catch { /* handled */ }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 16rpx $spacing-base 50rpx; background: $page-gradient; }

.tabs-scroll { white-space: nowrap; margin-bottom: 12rpx; }
.tabs { display: flex; gap: 10rpx; padding: 2rpx 0; }
.tab { flex-shrink: 0; padding: 10rpx 20rpx; border-radius: $radius-round; background: rgba(255,255,255,0.74); color: $text-color-secondary; font-size: $font-size-xs; }
.tab.active { color: #fff; background: $primary-gradient; box-shadow: $shadow-glow; }

.action-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.count-text { font-size: $font-size-xs; color: $text-color-hint; }
.btn-invite { height: 56rpx; padding: 0 22rpx; margin: 0; border: 1rpx solid $primary-color; border-radius: $radius-round; background: #fff; color: $primary-color; font-size: $font-size-xs; line-height: 54rpx; }
.btn-invite::after { border: none; }

.loading-wrap { padding: 160rpx 0; display: flex; justify-content: center; }

.cg-card { padding: 22rpx; margin-bottom: 14rpx; border-radius: 20rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.cg-head { display: flex; align-items: center; gap: 14rpx; }
.cg-avatar { width: 72rpx; height: 72rpx; border-radius: 20rpx; background: linear-gradient(135deg, #00B8A9, #3DD9C5); color: #fff; font-size: 32rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cg-info { flex: 1; }
.cg-name-row { display: flex; align-items: center; gap: 8rpx; }
.cg-name { font-size: $font-size-base; font-weight: 700; color: $text-color; }
.cg-status { padding: 2rpx 10rpx; border-radius: $radius-round; font-size: $font-size-xs; }
.cg-status.active { color: $success-color; background: #e9fbf7; }
.cg-status.disabled { color: $warning-color; background: #fff2eb; }
.cg-status.left { color: $info-color; background: #f0f3f7; }
.cg-skills { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-secondary; }
.cg-stats { display: flex; gap: 14rpx; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; }
.cg-meta { display: flex; gap: 16rpx; margin-top: 12rpx; padding-top: 10rpx; border-top: 1rpx solid $divider-color; font-size: $font-size-xs; color: $text-color-hint; }
</style>

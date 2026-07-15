<template>
  <view class="page-shell">
    <view class="header-bar">
      <text class="header-title">商户成员</text>
      <text class="header-count">共 {{ store.members.length }} 人</text>
    </view>

    <view v-if="store.membersLoading" class="loading-wrap"><u-loading-icon size="28" color="#3A7BF7" /></view>
    <empty-state v-else-if="!store.members.length" title="暂无成员" description="商户成员将在此处显示" />
    <view v-else class="member-list">
      <view v-for="m in store.members" :key="m.memberId" class="member-card">
        <view class="m-avatar">{{ m.name?.charAt(0) }}</view>
        <view class="m-info">
          <view class="m-name-row">
            <text class="m-name">{{ m.name }}</text>
            <text class="m-role">{{ roleText(m.role) }}</text>
          </view>
          <text class="m-phone">{{ m.phone }}</text>
          <text class="m-join">加入时间：{{ m.joinTime?.slice(0, 10) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'
import EmptyState from '@/components/base/empty-state.vue'

const store = useMerchantStore()

const ROLE_TEXT = { OWNER: '负责人', DISPATCHER: '调度员', OPERATOR: '运营员', MEMBER: '成员' }

onShow(() => store.fetchMembers())

function roleText(role) { return ROLE_TEXT[role] || role }
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 16rpx $spacing-base 50rpx; background: $page-gradient; }
.header-bar { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16rpx; padding: 0 4rpx; }
.header-title { font-size: $font-size-md; font-weight: 700; color: $text-color; }
.header-count { font-size: $font-size-xs; color: $text-color-hint; }
.loading-wrap { padding: 160rpx 0; display: flex; justify-content: center; }

.member-card { display: flex; gap: 14rpx; padding: 22rpx; margin-bottom: 12rpx; border-radius: 20rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.m-avatar { width: 72rpx; height: 72rpx; border-radius: 20rpx; background: linear-gradient(135deg, #8E9DAE, #B0BECC); color: #fff; font-size: 32rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.m-info { flex: 1; }
.m-name-row { display: flex; align-items: center; gap: 8rpx; }
.m-name { font-size: $font-size-base; font-weight: 700; color: $text-color; }
.m-role { padding: 2rpx 10rpx; border-radius: $radius-round; font-size: $font-size-xs; color: $primary-color; background: $primary-bg; }
.m-phone { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; }
.m-join { display: block; margin-top: 2rpx; font-size: $font-size-xs; color: $text-color-hint; }
</style>

<template>
  <view class="page-shell">
    <view class="page-content">
      <view class="summary-card"><view><text class="summary-title">本周排班</text><text class="summary-desc">当前为前端演示配置，后续接入排班 API</text></view><u-switch v-model="available" active-color="#00B8A9" /></view>
      <view class="schedule-card"><view v-for="day in days" :key="day.date" class="day-row"><view class="day-copy"><text class="day-name">{{ day.name }}</text><text class="day-date">{{ day.date }}</text></view><view class="slots"><text v-for="slot in day.slots" :key="slot" class="slot">{{ slot }}</text><text v-if="!day.slots.length" class="rest">休息</text></view></view></view>
      <view class="tip-card"><u-icon name="info-circle" size="20" color="#3A7BF7" /><text>调整排班、请假和接单上限将在后续版本开放。</text></view>
    </view>
    <role-tab-bar :tabs="CAREGIVER_TABS" current="/subpkg-caregiver/schedule/index" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import RoleTabBar from '@/components/base/role-tab-bar.vue'
import { CAREGIVER_TABS } from '@/constants/caregiver-navigation.js'
import { ROLES } from '@/constants/roles.js'
import { requireRole } from '@/utils/permission.js'

const available = ref(true)
const days = [
  { name: '今天', date: '07-15', slots: ['上午', '下午'] },
  { name: '周三', date: '07-16', slots: ['上午'] },
  { name: '周四', date: '07-17', slots: ['下午', '晚上'] },
  { name: '周五', date: '07-18', slots: [] },
  { name: '周六', date: '07-19', slots: ['上午', '下午'] },
]
onShow(() => requireRole(ROLES.CAREGIVER))
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; background: $page-gradient; }.page-content { padding: 24rpx $spacing-base calc(140rpx + env(safe-area-inset-bottom)); }.summary-card { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 24rpx; border-radius: 28rpx; background: $primary-gradient; color: #fff; box-shadow: $shadow-float; }.summary-title,.summary-desc { display: block; }.summary-title { font-size: $font-size-md; font-weight: 700; }.summary-desc { margin-top: 7rpx; font-size: $font-size-xs; opacity: .78; }
.schedule-card { margin-top: 22rpx; padding: 4rpx 24rpx; border: $glass-border-soft; border-radius: 28rpx; background: $surface-gradient; box-shadow: $shadow-sm; }.day-row { display: flex; align-items: center; gap: 24rpx; min-height: 112rpx; border-bottom: 1rpx solid $divider-color; }.day-row:last-child { border-bottom: none; }.day-copy { width: 100rpx; flex-shrink: 0; }.day-name,.day-date { display: block; }.day-name { color: $text-color; font-size: $font-size-base; font-weight: 600; }.day-date { margin-top: 5rpx; color: $text-color-hint; font-size: $font-size-xs; }.slots { display: flex; gap: 10rpx; flex-wrap: wrap; }.slot { padding: 9rpx 18rpx; border-radius: $radius-round; background: $primary-bg; color: $primary-color; font-size: $font-size-xs; }.rest { color: $text-color-disabled; font-size: $font-size-sm; }.tip-card { display: flex; align-items: flex-start; gap: 10rpx; margin-top: 22rpx; padding: 20rpx; border-radius: 22rpx; background: $primary-bg; color: $text-color-secondary; font-size: $font-size-xs; line-height: 1.5; }
</style>

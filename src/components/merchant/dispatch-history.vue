<!--
  派单记录组件 — 商户订单详情页复用
  展示某笔订单的所有派单记录（含拒绝原因）
  @props {Array} records - 派单记录数组
-->
<template>
  <view class="dh-section" v-if="records && records.length">
    <text class="dh-title">派单记录（{{ records.length }}）</text>
    <view class="dh-list">
      <view v-for="r in records" :key="r.assignmentId" class="dh-item">
        <view class="dh-dot" :class="dotClass(r.status)" />
        <view class="dh-content">
          <view class="dh-head">
            <text class="dh-caregiver">{{ r.caregiverName }}</text>
            <text class="dh-status" :class="statusClass(r.status)">{{ statusText(r.status) }}</text>
          </view>
          <text class="dh-time">派单时间：{{ (r.assignedAt || '').slice(0, 16)?.replace('T', ' ') }}</text>
          <text class="dh-deadline" v-if="r.acceptDeadline">响应截止：{{ r.acceptDeadline.slice(0, 16)?.replace('T', ' ') }}</text>
          <view class="dh-reason" v-if="r.rejectReason">
            <text class="dh-reason-label">拒绝原因：</text>
            <text class="dh-reason-text">{{ r.rejectReason }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { DISPATCH_STATUS_TEXT } from '@/store/merchant.js'

defineProps({ records: { type: Array, default: () => [] } })

function statusText(s) { return DISPATCH_STATUS_TEXT[s] || s }
function dotClass(s) {
  if (s === 'ACCEPTED') return 'accepted'
  if (s === 'REJECTED' || s === 'EXPIRED') return 'rejected'
  if (s === 'CANCELED') return 'canceled'
  return 'pending'
}
function statusClass(s) {
  if (s === 'ACCEPTED') return 'accepted'
  if (s === 'REJECTED' || s === 'EXPIRED') return 'rejected'
  if (s === 'CANCELED') return 'canceled'
  return 'pending'
}
</script>

<style lang="scss" scoped>
.dh-section { margin-top: 8rpx; }
.dh-title { display: block; font-size: $font-size-sm; font-weight: 600; color: $text-color; margin-bottom: 12rpx; }
.dh-list { padding-left: 0; }
.dh-item { display: flex; gap: 12rpx; padding-bottom: 18rpx; position: relative; }
.dh-item:not(:last-child)::before { content: ''; position: absolute; left: 8rpx; top: 18rpx; bottom: -4rpx; width: 2rpx; background: $divider-color; }
.dh-dot { width: 18rpx; height: 18rpx; border-radius: 50%; flex-shrink: 0; margin-top: 4rpx; background: $divider-color; }
.dh-dot.accepted { background: $success-color; }
.dh-dot.rejected { background: $error-color; }
.dh-dot.canceled { background: $info-color; }
.dh-dot.pending { background: $warning-color; }
.dh-content { flex: 1; }
.dh-head { display: flex; align-items: center; justify-content: space-between; }
.dh-caregiver { font-size: $font-size-sm; font-weight: 600; color: $text-color; }
.dh-status { font-size: $font-size-xs; padding: 2rpx 10rpx; border-radius: $radius-round; }
.dh-status.accepted { color: $success-color; background: #e9fbf7; }
.dh-status.pending { color: $warning-color; background: #fff2eb; }
.dh-status.rejected { color: $error-color; background: #fff0f0; }
.dh-status.canceled { color: $info-color; background: #f0f3f7; }
.dh-time, .dh-deadline { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; }
.dh-reason { margin-top: 8rpx; padding: 10rpx 14rpx; background: #fff0f0; border-radius: $radius-base; }
.dh-reason-label { font-size: $font-size-xs; color: $error-color; }
.dh-reason-text { font-size: $font-size-xs; color: $text-color-secondary; line-height: 1.5; }
</style>

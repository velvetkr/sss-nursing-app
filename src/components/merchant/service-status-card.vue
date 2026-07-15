<!--
  服务状态卡片 — 商户端复用
  展示服务名称、状态标签、规格数和最近更新时间
  @props {Object} service - 服务对象
  @events {Function} click - 点击卡片
-->
<template>
  <view class="ssc-card" @click="$emit('click')">
    <image v-if="service.coverImage" :src="service.coverImage" mode="aspectFill" class="ssc-cover" />
    <view class="ssc-body">
      <view class="ssc-top">
        <text class="ssc-name">{{ service.name }}</text>
        <text class="ssc-status" :class="statusClass">{{ statusText }}</text>
      </view>
      <text class="ssc-meta">{{ service.categoryName }} · {{ service.specs?.length || 0 }}种规格</text>
      <text class="ssc-area" v-if="service.serviceArea">{{ service.serviceArea }}</text>
      <text class="ssc-time">更新于 {{ (service.updateTime || service.createTime || '').slice(0, 10) }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { SERVICE_STATUS_TEXT } from '@/store/merchant.js'

const props = defineProps({ service: { type: Object, required: true } })
defineEmits(['click'])

const statusText = computed(() => SERVICE_STATUS_TEXT[props.service.status] || '未知')
const statusClass = computed(() => {
  const s = props.service.status
  if (s === 4) return 'listed'
  if (s === 1 || s === 0) return 'pending'
  if (s === 3) return 'rejected'
  if (s === 5) return 'unlisted'
  return ''
})
</script>

<style lang="scss" scoped>
.ssc-card { border-radius: 20rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; margin-bottom: 16rpx; overflow: hidden; }
.ssc-cover { width: 100%; height: 180rpx; }
.ssc-body { padding: 20rpx 22rpx; }
.ssc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8rpx; }
.ssc-name { font-size: $font-size-base; font-weight: 700; color: $text-color; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ssc-status { flex-shrink: 0; padding: 4rpx 12rpx; border-radius: $radius-round; font-size: $font-size-xs; background: #f0f3f7; color: $info-color; }
.ssc-status.listed { color: $success-color; background: #e9fbf7; }
.ssc-status.pending { color: $warning-color; background: #fff2eb; }
.ssc-status.rejected { color: $error-color; background: #fff0f0; }
.ssc-meta { display: block; font-size: $font-size-xs; color: $text-color-hint; }
.ssc-area { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ssc-time { display: block; margin-top: 8rpx; font-size: 20rpx; color: $text-color-disabled; }
</style>

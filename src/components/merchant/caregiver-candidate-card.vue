<!--
  候选护理人员卡片 — 派单页复用
  展示护理人员匹配信息：技能、评分、距离、当前任务
  @props {Object} candidate - 候选人对象
  @props {Boolean} showDispatch - 是否显示派单按钮
  @events {Function} dispatch - 点击派单按钮
-->
<template>
  <view class="ccc-card" :class="{ matched: candidate.skillMatch }">
    <view class="ccc-head">
      <view class="ccc-avatar">{{ candidate.name?.charAt(0) }}</view>
      <view class="ccc-info">
        <view class="ccc-name-row">
          <text class="ccc-name">{{ candidate.name }}</text>
          <text class="ccc-match" v-if="candidate.skillMatch">技能匹配</text>
        </view>
        <text class="ccc-skills">{{ candidate.skills?.join('、') }}</text>
        <view class="ccc-stats">
          <text>⭐ {{ candidate.avgRating }}</text>
          <text>📋 {{ candidate.totalServiceCount }}单</text>
          <text>📍 {{ candidate.distance }}km</text>
          <text>🔔 {{ candidate.currentTaskCount }}任务</text>
        </view>
      </view>
    </view>
    <text class="ccc-area">服务区域：{{ candidate.serviceArea }}</text>
    <button v-if="showDispatch" class="ccc-btn" @click="$emit('dispatch', candidate)">派单给TA</button>
  </view>
</template>

<script setup>
defineProps({
  candidate: { type: Object, required: true },
  showDispatch: { type: Boolean, default: true },
})
defineEmits(['dispatch'])
</script>

<style lang="scss" scoped>
.ccc-card { padding: 22rpx; margin-bottom: 16rpx; border-radius: 20rpx; background: $surface-gradient; border: 1rpx solid $border-color; box-shadow: $shadow-sm; }
.ccc-card.matched { border-color: $primary-color; box-shadow: 0 0 20rpx rgba(58,123,247,0.08); }
.ccc-head { display: flex; gap: 14rpx; }
.ccc-avatar { width: 72rpx; height: 72rpx; border-radius: 20rpx; background: linear-gradient(135deg, #00B8A9, #3DD9C5); color: #fff; font-size: 32rpx; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ccc-info { flex: 1; }
.ccc-name-row { display: flex; align-items: center; gap: 8rpx; }
.ccc-name { font-size: $font-size-base; font-weight: 700; color: $text-color; }
.ccc-match { padding: 2rpx 10rpx; border-radius: $radius-round; font-size: 18rpx; color: $success-color; background: #e9fbf7; }
.ccc-skills { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-secondary; }
.ccc-stats { display: flex; gap: 14rpx; margin-top: 6rpx; font-size: $font-size-xs; color: $text-color-hint; }
.ccc-area { display: block; margin-top: 14rpx; padding-top: 10rpx; border-top: 1rpx solid $divider-color; font-size: $font-size-xs; color: $text-color-hint; }
.ccc-btn { width: 100%; height: 72rpx; margin: 0; margin-top: 14rpx; border: none; border-radius: $radius-round; background: $primary-gradient; color: #fff; font-size: $font-size-sm; font-weight: 600; line-height: 72rpx; box-shadow: $shadow-glow; }
.ccc-btn::after { border: none; }
</style>

<template>
  <view class="empty-state">
    <u-icon :name="icon" :size="size" :color="iconColor" />
    <text class="empty-title">{{ title }}</text>
    <text class="empty-desc" v-if="description">{{ description }}</text>
    <slot />
  </view>
</template>

<script setup>
defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' },
  icon: { type: String, default: 'frown' },
  size: { type: [Number, String], default: 80 },
  iconColor: { type: String, default: '#C5CDD8' },
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-title {
  font-size: $font-size-base;
  color: $text-color-hint;
  margin-top: 24rpx;
}

.empty-desc {
  font-size: $font-size-sm;
  color: $text-color-disabled;
  margin-top: 8rpx;
}
</style>

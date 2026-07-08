<template>
  <view class="service-card" @click="handleClick" :class="{ 'has-shadow': shadow }">
    <view class="card-body">
      <image
        v-if="data.coverImage"
        :src="data.coverImage"
        class="card-cover"
        mode="aspectFill"
      />
      <view class="card-info">
        <text class="card-name">{{ data.name }}</text>
        <text class="card-desc">{{ data.description }}</text>
        <view class="card-meta" v-if="data.specs && data.specs.length">
          <text
            v-for="spec in data.specs.slice(0, 2)"
            :key="spec.specId"
            class="card-spec"
          >{{ spec.name }} · ⏱ {{ spec.duration }}分钟</text>
        </view>
      </view>
      <view class="card-price">
        <text class="price-num">¥{{ data.minPrice || (data.specs && data.specs[0]?.price) || '--' }}</text>
        <text class="price-label">起</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true,
  },
  shadow: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click')
}
</script>

<style lang="scss" scoped>
.service-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,251,255,0.55) 100%);
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-radius: $radius-md;
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-left: 6rpx solid rgba(58, 123, 247, 0.3);
  transition: transform $transition-fast, box-shadow $transition-fast;

  &.has-shadow {
    box-shadow: 0 4rpx 20rpx rgba(58, 123, 247, 0.06);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(58, 123, 247, 0.1);
  }
}

.card-body {
  display: flex;
}

.card-cover {
  width: 130rpx;
  height: 130rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  background-color: $bg-color-grey;
}

.card-info {
  flex: 1;
  margin-right: 16rpx;
  min-width: 0;
}

.card-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-color;
  line-height: 1.4;
}

.card-desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 24rpx;
  color: $text-color-secondary;
  margin-top: 8rpx;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10rpx;
  gap: 8rpx;
}

.card-spec {
  font-size: 20rpx;
  color: $primary-color;
  background-color: $primary-bg;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.card-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 100rpx;
  flex-shrink: 0;
}

.price-num {
  font-size: 36rpx;
  font-weight: 700;
  color: $warning-color;
  line-height: 1.1;
}

.price-label {
  font-size: 20rpx;
  color: $text-color-hint;
  margin-top: 2rpx;
}
</style>

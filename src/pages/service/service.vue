<template>
  <view class="service-page">
    <!-- 背景弥散光 -->
    <view class="bg-glow bg-glow-top" />

    <!-- 搜索栏 — 玻璃拟态 -->
    <view class="search-bar" @click="goSearch">
      <u-icon name="search" size="20" color="#6B7B8D" />
      <text class="search-placeholder">搜索护理服务</text>
    </view>

    <!-- 分类标签 — 胶囊切换 -->
    <view class="category-tabs">
      <scroll-view scroll-x :show-scrollbar="false">
        <view class="tab-list">
          <view
            v-for="cat in serviceStore.categories"
            :key="cat.categoryId"
            class="tab-item"
            :class="{ active: serviceStore.activeCategoryId === cat.categoryId }"
            @click="onCategoryChange(cat.categoryId)"
          >
            <text class="tab-text">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 服务列表 -->
    <view class="service-list">
      <!-- 骨架屏 -->
      <view v-if="serviceStore.loading && serviceStore.services.length === 0">
        <view v-for="i in 3" :key="i" class="skeleton-card">
          <view class="skeleton-line skeleton-title" />
          <view class="skeleton-line skeleton-desc" />
          <view class="skeleton-line skeleton-short" />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!serviceStore.loading && serviceStore.services.length === 0" class="empty-wrap">
        <u-icon name="frown" size="80" color="#C5CDD8" />
        <text class="empty-text">暂无相关服务</text>
      </view>

      <!-- 服务卡片 — 玻璃拟态 -->
      <view v-else>
        <view
          v-for="item in serviceStore.services"
          :key="item.itemId"
          class="service-card"
          @click="goDetail(item.itemId)"
        >
          <view class="card-body">
            <image
              v-if="item.coverImage"
              :src="item.coverImage"
              class="card-cover"
              mode="aspectFill"
            />
            <view class="card-info">
              <text class="card-name">{{ item.name }}</text>
              <text class="card-desc">{{ item.description }}</text>
              <view class="card-meta" v-if="item.specs && item.specs.length">
                <text
                  v-for="spec in item.specs.slice(0, 2)"
                  :key="spec.specId"
                  class="card-spec"
                >{{ spec.name }}</text>
              </view>
            </view>
            <view class="card-price">
              <text class="price-num">¥{{ item.minPrice }}</text>
              <text class="price-label">起</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="serviceStore.hasMore" class="load-more" @click="serviceStore.loadMore()">
          <text class="load-text">加载更多</text>
        </view>
        <view v-else class="load-more">
          <text class="load-end">— 已显示全部服务 —</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useServiceStore } from '@/store/service.js'

const serviceStore = useServiceStore()

onMounted(async () => {
  if (!serviceStore.categories.length) {
    await serviceStore.fetchCategories()
  }
  if (!serviceStore.services.length) {
    await serviceStore.fetchServices()
  }
})

function onCategoryChange(categoryId) {
  if (serviceStore.activeCategoryId === categoryId) {
    serviceStore.setActiveCategory(null)
    serviceStore.fetchServices({ page: 1 })
  } else {
    serviceStore.setActiveCategory(categoryId)
    serviceStore.fetchServices({ categoryId, page: 1 })
  }
}

function goSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/service-detail/service-detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.service-page {
  min-height: 100vh;
  background-color: $bg-color-grey;
  position: relative;
  overflow: hidden;
}

/* 背景弥散光 */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80rpx);
  opacity: 0.55;
  pointer-events: none;
  z-index: 0;
}
.bg-glow-top {
  width: 380rpx;
  height: 380rpx;
  background: radial-gradient(circle, rgba(58, 123, 247, 0.16), transparent 70%);
  top: 120rpx;
  right: -60rpx;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  margin: 20rpx $spacing-base;
  padding: 22rpx 28rpx;
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-radius: 36rpx;
  box-shadow: $shadow-sm;
  border: $glass-border;
  min-height: $touch-min;
}

.search-placeholder {
  margin-left: 16rpx;
  font-size: $font-size-base;
  color: $text-color-hint;
}

/* 分类标签 */
.category-tabs {
  background-color: $bg-color;
  padding: 16rpx 0;
  margin-bottom: 4rpx;
}

.tab-list {
  display: flex;
  padding: 0 $spacing-base;
}

.tab-item {
  padding: 14rpx 28rpx;
  border-radius: $radius-round;
  margin-right: 16rpx;
  background-color: $bg-color-grey;
  transition: all $transition-base;

  &:active {
    transform: scale(0.96);
  }

  &.active {
    background: $primary-gradient;
    box-shadow: 0 4rpx 16rpx rgba(58, 123, 247, 0.25);

    .tab-text {
      color: #fff;
      font-weight: 600;
    }
  }
}

.tab-text {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  white-space: nowrap;
}

/* 服务列表 */
.service-list {
  padding: $spacing-sm $spacing-base;
}

/* 骨架屏 */
.skeleton-card {
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-radius: $radius-md;
  padding: 28rpx;
  margin-bottom: 16rpx;
}

.skeleton-line {
  height: 24rpx;
  background: linear-gradient(90deg, #ECF0F6 25%, #DEE4ED 50%, #ECF0F6 75%);
  background-size: 200% 100%;
  border-radius: 6rpx;
  margin-bottom: 16rpx;
  animation: shimmer 1.5s ease-in-out infinite;
}
.skeleton-title { width: 55%; height: 34rpx; }
.skeleton-desc { width: 88%; }
.skeleton-short { width: 32%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-text {
  margin-top: 24rpx;
  font-size: $font-size-base;
  color: $text-color-hint;
}

/* 服务卡片 */
.service-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,251,255,0.55) 100%);
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-radius: $radius-md;
  margin-bottom: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(58, 123, 247, 0.06);
  border-left: 6rpx solid rgba(58, 123, 247, 0.3);
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.98);
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
  flex-shrink: 0;
  min-width: 100rpx;
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
  margin-top: 4rpx;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 32rpx 0;
}

.load-text {
  font-size: 26rpx;
  color: $primary-color;
  font-weight: 500;
}

.load-end {
  font-size: 24rpx;
  color: $text-color-disabled;
}
</style>

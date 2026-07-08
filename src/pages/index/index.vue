<template>
  <view class="home-page">
    <!-- 背景弥散光（让玻璃拟态有东西可透） -->
    <view class="bg-glow bg-glow-top" />
    <view class="bg-glow bg-glow-mid" />
    <view class="bg-glow bg-glow-bottom" />

    <!-- 顶部搜索栏 — 玻璃拟态 -->
    <view class="search-bar" @click="goSearch">
      <u-icon name="search" size="20" color="#6B7B8D" />
      <text class="search-placeholder">搜索护理服务...</text>
    </view>

    <!-- Banner — 科技蓝渐变 -->
    <view class="banner">
      <view class="banner-content">
        <text class="banner-title">专业护理，温暖到家</text>
        <text class="banner-desc">为老人提供居家护理服务</text>
      </view>
      <!-- 装饰光点 -->
      <view class="banner-dot banner-dot-1" />
      <view class="banner-dot banner-dot-2" />
      <view class="banner-dot banner-dot-3" />
    </view>

    <!-- 服务分类 — 瓷感白底 -->
    <view class="category-section">
      <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
        <view class="category-list">
          <view
            v-for="cat in serviceStore.categories"
            :key="cat.categoryId"
            class="category-item"
            :class="{ active: activeCategory === cat.categoryId }"
            @click="onCategoryClick(cat)"
          >
            <view class="category-icon-wrap" :class="{ 'icon-active': activeCategory === cat.categoryId }">
              <image
                v-if="cat.icon"
                :src="cat.icon"
                class="category-icon-img"
                mode="aspectFit"
              />
              <text v-else class="category-icon-text">📋</text>
            </view>
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 服务列表 -->
    <view class="service-section">
      <view class="section-header">
        <text class="section-title">{{ activeCategoryName || '全部服务' }}</text>
        <text class="section-count">共 {{ serviceStore.total }} 个</text>
      </view>

      <!-- 骨架屏 -->
      <view v-if="serviceStore.loading" class="skeleton-list">
        <view v-for="i in 3" :key="i" class="skeleton-card">
          <view class="skeleton-line skeleton-title" />
          <view class="skeleton-line skeleton-desc" />
          <view class="skeleton-line skeleton-short" />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="serviceStore.services.length === 0" class="empty-wrap">
        <u-icon name="frown" size="80" color="#C5CDD8" />
        <text class="empty-text">暂无相关服务</text>
      </view>

      <!-- 服务卡片列表 -->
      <view v-else class="service-list">
        <view
          v-for="item in serviceStore.services"
          :key="item.itemId"
          class="service-card"
          @click="goDetail(item.itemId)"
        >
          <view class="card-body">
            <view class="card-info">
              <text class="card-name">{{ item.name }}</text>
              <text class="card-desc">{{ item.description }}</text>
              <view class="card-meta" v-if="item.specs && item.specs.length">
                <text
                  v-for="spec in item.specs.slice(0, 3)"
                  :key="spec.specId"
                  class="card-spec"
                >{{ spec.name }} · ⏱ {{ spec.duration }}分钟</text>
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

        <!-- 已全部加载 -->
        <view v-else-if="serviceStore.services.length > 0" class="load-end">
          <text class="load-end-text">— 已显示全部服务 —</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useServiceStore } from '@/store/service.js'

const serviceStore = useServiceStore()
const activeCategory = ref(null)

onMounted(async () => {
  await serviceStore.fetchCategories()
  await serviceStore.fetchServices()
})

const activeCategoryName = computed(() => {
  if (!activeCategory.value) return ''
  const cat = serviceStore.categories.find((c) => c.categoryId === activeCategory.value)
  return cat?.name || ''
})

function onCategoryClick(cat) {
  if (activeCategory.value === cat.categoryId) {
    activeCategory.value = null
    serviceStore.setActiveCategory(null)
    serviceStore.fetchServices()
  } else {
    activeCategory.value = cat.categoryId
    serviceStore.setActiveCategory(cat.categoryId)
    serviceStore.fetchServices({ categoryId: cat.categoryId, page: 1 })
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
.home-page {
  min-height: 100vh;
  background-color: $bg-color-grey;
  padding-bottom: 32rpx;
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
  width: 420rpx;
  height: 420rpx;
  background: radial-gradient(circle, rgba(58, 123, 247, 0.18), transparent 70%);
  top: -100rpx;
  right: -80rpx;
}
.bg-glow-mid {
  width: 360rpx;
  height: 360rpx;
  background: radial-gradient(circle, rgba(0, 194, 255, 0.14), transparent 70%);
  top: 480rpx;
  left: -100rpx;
}
.bg-glow-bottom {
  width: 320rpx;
  height: 320rpx;
  background: radial-gradient(circle, rgba(255, 138, 92, 0.1), transparent 70%);
  bottom: 200rpx;
  right: -60rpx;
}

/* 搜索栏 — 玻璃拟态 */
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

/* Banner — 科技蓝渐变 */
.banner {
  position: relative;
  margin: 0 $spacing-base 20rpx;
  padding: 44rpx 36rpx;
  background: linear-gradient(135deg, #2561E0 0%, #3A7BF7 40%, #00C2FF 100%);
  border-radius: 20rpx;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(58, 123, 247, 0.30);
}

.banner-content {
  position: relative;
  z-index: 1;
}

/* 🔴 临时验证条 — 彩色渐变条纹，确认代码生效 */
.verify-strip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #FF5252, #FF8A5C, #FFD93D, #00B8A9, #3A7BF7);
  z-index: 2;
  border-radius: 20rpx 20rpx 0 0;
}

.banner-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.banner-desc {
  display: block;
  font-size: 26rpx;
  opacity: 0.85;
  margin-top: 10rpx;
}

/* 装饰光点 */
.banner-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  pointer-events: none;
}
.banner-dot-1 {
  width: 80rpx;
  height: 80rpx;
  top: -20rpx;
  right: 40rpx;
}
.banner-dot-2 {
  width: 48rpx;
  height: 48rpx;
  bottom: 16rpx;
  right: 120rpx;
}
.banner-dot-3 {
  width: 24rpx;
  height: 24rpx;
  top: 50%;
  right: 20rpx;
}

/* 分类导航 */
.category-section {
  background-color: $bg-color;
  padding: 20rpx 0 12rpx;
  margin-bottom: 4rpx;
}

.category-list {
  display: flex;
  padding: 0 $spacing-base;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 20rpx;
  border-radius: $radius-base;
  margin-right: 20rpx;
  min-width: 120rpx;
  transition: all $transition-base;

  &:active {
    transform: scale(0.96);
  }
}

.category-item.active {
  .category-name {
    color: $primary-color;
    font-weight: 600;
  }
}

.category-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  background-color: $bg-color-grey;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
  transition: all $transition-base;

  &.icon-active {
    background: $primary-bg;
    box-shadow: 0 4rpx 16rpx rgba(58, 123, 247, 0.15);
  }
}

.category-icon-img {
  width: 48rpx;
  height: 48rpx;
  border-radius: 10rpx;
}

.category-icon-text {
  font-size: 40rpx;
}

.category-name {
  font-size: 22rpx;
  color: $text-color-secondary;
  transition: color $transition-base;
}

/* 服务列表 */
.service-section {
  padding: 0 $spacing-base;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 8rpx 16rpx;
}

.section-title {
  font-size: $font-size-md;
  font-weight: 600;
  color: $text-color;
}

.section-count {
  font-size: $font-size-sm;
  color: $text-color-hint;
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

/* 服务卡片 — 玻璃拟态 */
.service-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,251,255,0.55) 100%);
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-radius: $radius-md;
  margin-bottom: 16rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(58, 123, 247, 0.06);
  border-left: 6rpx solid rgba(58, 123, 247, 0.35);
  transition: transform $transition-fast, box-shadow $transition-fast;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 12rpx rgba(58, 123, 247, 0.1);
  }
}

.card-body {
  display: flex;
  justify-content: space-between;
}

.card-info {
  flex: 1;
  min-width: 0;
  margin-right: 24rpx;
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
  margin-top: 14rpx;
  gap: 10rpx;
}

.card-spec {
  font-size: 20rpx;
  color: $primary-color;
  background-color: $primary-bg;
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.card-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 120rpx;
  flex-shrink: 0;
}

.price-num {
  font-size: 38rpx;
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
  padding: 28rpx 0;
}

.load-text {
  font-size: 26rpx;
  color: $primary-color;
  font-weight: 500;
}

.load-end {
  text-align: center;
  padding: 28rpx 0;
}

.load-end-text {
  font-size: 24rpx;
  color: $text-color-disabled;
}
</style>

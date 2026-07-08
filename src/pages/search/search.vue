<template>
  <view class="search-page">
    <!-- 背景弥散光 -->
    <view class="bg-glow bg-glow-top" />

    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-input-wrap">
        <u-icon name="search" size="18" color="#6B7B8D" />
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索护理服务..."
          focus
          @confirm="onSearch"
        />
        <u-icon
          v-if="keyword"
          name="close-circle-fill"
          size="18"
          color="#C5CDD8"
          @click="clearSearch"
        />
      </view>
      <text class="search-cancel" @click="goBack">取消</text>
    </view>

    <!-- 搜索历史 -->
    <view v-if="!keyword && history.length" class="history-section">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <u-icon name="trash" size="18" color="#98A5B3" @click="clearHistory" />
      </view>
      <view class="history-list">
        <text
          v-for="(item, index) in history"
          :key="index"
          class="history-tag"
          @click="onHistoryClick(item)"
        >
          {{ item }}
        </text>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="keyword" class="result-section">
      <!-- 搜索中 -->
      <view v-if="searching" class="searching">
        <u-loading-icon size="24" />
        <text class="searching-text">搜索中...</text>
      </view>

      <!-- 空结果 -->
      <view v-else-if="results.length === 0" class="empty-wrap">
        <u-icon name="frown" size="60" color="#C5CDD8" />
        <text class="empty-title">未找到相关服务</text>
        <text class="empty-desc">换个关键词试试吧</text>
      </view>

      <!-- 结果列表 -->
      <view v-else class="result-list">
        <text class="result-count">找到 {{ total }} 个相关服务</text>
        <view
          v-for="item in results"
          :key="item.itemId"
          class="result-card"
          @click="goDetail(item.itemId)"
        >
          <image
            v-if="item.coverImage"
            :src="item.coverImage"
            class="result-cover"
            mode="aspectFill"
          />
          <view class="card-info">
            <text class="card-name" v-html="highlight(item.name)" />
            <text class="card-category">{{ item.categoryName }}</text>
            <text class="card-desc" v-html="highlight(item.description || '')" />
            <view class="card-meta">
              <text class="card-specs">{{ (item.specs || []).map(s => s.name).join(' / ') }}</text>
              <text class="card-price">¥{{ item.minPrice }} 起</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useServiceStore } from '@/store/service.js'

const serviceStore = useServiceStore()
const keyword = ref('')
const results = ref([])
const total = ref(0)
const searching = ref(false)
const history = ref(JSON.parse(uni.getStorageSync('searchHistory') || '[]'))

function onSearch() {
  const kw = keyword.value.trim()
  if (!kw) return

  if (!history.value.includes(kw)) {
    history.value.unshift(kw)
    if (history.value.length > 10) history.value.pop()
    uni.setStorageSync('searchHistory', JSON.stringify(history.value))
  }

  doSearch(kw)
}

async function doSearch(kw) {
  searching.value = true
  try {
    const { list, total: t } = await serviceStore.searchServices(kw)
    results.value = list
    total.value = t
  } catch {
    results.value = []
    total.value = 0
  } finally {
    searching.value = false
  }
}

function onHistoryClick(item) {
  keyword.value = item
  onSearch()
}

function clearSearch() {
  keyword.value = ''
  results.value = []
}

function clearHistory() {
  history.value = []
  uni.removeStorageSync('searchHistory')
}

function goBack() {
  uni.navigateBack()
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/service-detail/service-detail?id=${id}` })
}

function highlight(text) {
  if (!keyword.value) return text
  const reg = new RegExp(keyword.value, 'gi')
  return text.replace(reg, (match) => `<text style="color:#3A7BF7;font-weight:600;">${match}</text>`)
}
</script>

<style lang="scss" scoped>
.search-page {
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
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}
.bg-glow-top {
  width: 360rpx;
  height: 360rpx;
  background: radial-gradient(circle, rgba(58, 123, 247, 0.16), transparent 70%);
  top: 200rpx;
  right: -80rpx;
}

/* 搜索栏 */
.search-header {
  display: flex;
  align-items: center;
  padding: 16rpx $spacing-base;
  background-color: $bg-color;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: $bg-color-grey;
  border-radius: 32rpx;
  padding: 16rpx 24rpx;
  min-height: $touch-min;
}

.search-input {
  flex: 1;
  margin: 0 16rpx;
  font-size: $font-size-base;
  color: $text-color;
}

.search-cancel {
  font-size: $font-size-base;
  color: $text-color-secondary;
  margin-left: 20rpx;
  flex-shrink: 0;
}

/* 搜索历史 */
.history-section {
  background-color: $bg-color;
  padding: 24rpx $spacing-base;
  margin-top: 4rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.history-title {
  font-size: $font-size-base;
  font-weight: 500;
  color: $text-color;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
}

.history-tag {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  background-color: $bg-color-grey;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  min-height: $touch-min;
  display: flex;
  align-items: center;

  &:active {
    background-color: $primary-bg;
    color: $primary-color;
  }
}

/* 搜索结果 */
.result-section {
  padding: $spacing-sm $spacing-base;
}

.searching {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.searching-text {
  margin-left: 16rpx;
  font-size: $font-size-base;
  color: $text-color-hint;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-title {
  font-size: $font-size-md;
  color: $text-color-secondary;
  margin-top: 24rpx;
}

.empty-desc {
  font-size: $font-size-sm;
  color: $text-color-hint;
  margin-top: 8rpx;
}

.result-count {
  font-size: $font-size-sm;
  color: $text-color-hint;
  margin-bottom: 16rpx;
  display: block;
}

/* 结果卡片 — 玻璃拟态 */
.result-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,251,255,0.55) 100%);
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-radius: $radius-md;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  box-shadow: 0 4rpx 20rpx rgba(58, 123, 247, 0.06);
  border-left: 6rpx solid rgba(58, 123, 247, 0.3);
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.98);
  }
}

.result-cover {
  width: 110rpx;
  height: 110rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  background-color: $bg-color-grey;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: $font-size-md;
  font-weight: 500;
  color: $text-color;
}

.card-category {
  font-size: 20rpx;
  color: $primary-color;
  background-color: $primary-bg;
  padding: 4rpx 14rpx;
  border-radius: 6rpx;
  display: inline-block;
  margin-top: 6rpx;
  font-weight: 500;
}

.card-desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  font-size: $font-size-sm;
  color: $text-color-secondary;
  margin-top: 10rpx;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14rpx;
}

.card-specs {
  font-size: 20rpx;
  color: $text-color-hint;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-price {
  font-size: $font-size-base;
  font-weight: 600;
  color: $warning-color;
  flex-shrink: 0;
  margin-left: 16rpx;
}
</style>

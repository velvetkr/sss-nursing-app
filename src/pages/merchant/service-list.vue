<template>
  <view class="page-shell">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <u-search v-model="keyword" placeholder="搜索服务名称" :showAction="false" @search="onSearch" @clear="onClear" shape="round" bgColor="#f5f6f8" />
    </view>

    <!-- 状态筛选 -->
    <scroll-view scroll-x :show-scrollbar="false" class="tabs-scroll">
      <view class="tabs">
        <view v-for="tab in statusTabs" :key="String(tab.value)" class="tab" :class="{ active: activeStatus === tab.value }" @click="changeStatus(tab.value)">{{ tab.label }}</view>
      </view>
    </scroll-view>

    <!-- 操作栏 -->
    <view class="action-bar">
      <text class="count-text">共 {{ store.servicesTotal }} 项服务</text>
      <button class="btn-add" @click="goCreate">+ 新建服务</button>
    </view>

    <!-- 列表 -->
    <view v-if="store.servicesLoading" class="loading-wrap"><u-loading-icon size="28" color="#3A7BF7" /></view>
    <empty-state v-else-if="!store.services.length" title="暂无服务" description="点击上方按钮创建您的第一个护理服务" />
    <view v-else class="service-list">
      <view v-for="item in store.services" :key="item.itemId" class="service-card" @click="goDetail(item.itemId)">
        <image v-if="item.coverImage" :src="item.coverImage" mode="aspectFill" class="card-cover" />
        <view class="card-body">
          <view class="card-top">
            <text class="item-name">{{ item.name }}</text>
            <text class="status-badge" :class="statusClass(item.status)">{{ store.getServiceStatusText(item.status) }}</text>
          </view>
          <text class="item-cat">{{ item.categoryName }} · {{ item.specs?.length || 0 }}种规格</text>
          <text class="item-area" v-if="item.serviceArea">{{ item.serviceArea }}</text>
          <view class="card-actions" @click.stop>
            <button v-if="item.status === 0 || item.status === 3" class="act-btn edit" @click="goEdit(item.itemId)">编辑</button>
            <button v-if="item.status === 0 || item.status === 3" class="act-btn submit" @click="handleSubmit(item.itemId)">提交审核</button>
            <button v-if="item.status === 2" class="act-btn submit" @click="handleList(item.itemId)">上架</button>
            <button v-if="item.status === 4" class="act-btn warn" @click="handleUnlist(item.itemId)">下架</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'
import EmptyState from '@/components/base/empty-state.vue'

const store = useMerchantStore()
const activeStatus = ref(null)
const keyword = ref('')
const statusTabs = [
  { label: '全部', value: null },
  { label: '草稿', value: 0 },
  { label: '待审核', value: 1 },
  { label: '已通过', value: 2 },
  { label: '已驳回', value: 3 },
  { label: '已上架', value: 4 },
  { label: '已下架', value: 5 },
]

onShow(() => loadServices())

function loadServices() {
  const params = {}
  if (activeStatus.value !== null) params.status = activeStatus.value
  if (keyword.value) params.keyword = keyword.value
  store.fetchMyServices(params)
}

function changeStatus(s) { activeStatus.value = s; loadServices() }
function onSearch() { loadServices() }
function onClear() { keyword.value = ''; loadServices() }
function statusClass(s) {
  if (s === 4) return 'listed'
  if (s === 1 || s === 0) return 'pending'
  if (s === 3) return 'rejected'
  if (s === 5) return 'unlisted'
  return ''
}
function goCreate() { uni.navigateTo({ url: '/pages/merchant/service-edit' }) }
function goEdit(id) { uni.navigateTo({ url: `/pages/merchant/service-edit?id=${id}` }) }
function goDetail(id) { uni.navigateTo({ url: `/pages/merchant/service-detail?id=${id}` }) }

async function handleSubmit(itemId) {
  uni.showModal({ title: '提交审核', content: '确认提交该服务审核吗？提交后将无法编辑。', success: async ({ confirm }) => {
    if (!confirm) return
    try { await store.submitServiceForReview(itemId); uni.showToast({ title: '已提交', icon: 'success' }); loadServices() } catch { /* handled */ }
  }})
}

async function handleList(itemId) {
  try { await store.listService(itemId); uni.showToast({ title: '已上架', icon: 'success' }); loadServices() } catch { /* handled */ }
}

async function handleUnlist(itemId) {
  uni.showModal({ title: '下架服务', content: '下架后顾客将无法预约该服务，确定下架吗？', success: async ({ confirm }) => {
    if (!confirm) return
    try { await store.unlistService(itemId); uni.showToast({ title: '已下架', icon: 'success' }); loadServices() } catch { /* handled */ }
  }})
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 16rpx $spacing-base 50rpx; background: $page-gradient; }
.search-bar { margin-bottom: 12rpx; }
.tabs-scroll { white-space: nowrap; margin-bottom: 12rpx; }
.tabs { display: flex; gap: 10rpx; padding: 4rpx 0; }
.tab { flex-shrink: 0; padding: 10rpx 20rpx; border-radius: $radius-round; background: rgba(255,255,255,0.74); color: $text-color-secondary; font-size: $font-size-xs; }
.tab.active { color: #fff; background: $primary-gradient; box-shadow: $shadow-glow; }

.action-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.count-text { font-size: $font-size-xs; color: $text-color-hint; }
.btn-add { height: 56rpx; padding: 0 22rpx; margin: 0; border: none; border-radius: $radius-round; background: $primary-gradient; color: #fff; font-size: $font-size-xs; font-weight: 600; line-height: 56rpx; }
.btn-add::after { border: none; }

.loading-wrap { padding: 160rpx 0; display: flex; justify-content: center; }

.service-card { border-radius: 20rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; margin-bottom: 16rpx; overflow: hidden; }
.card-cover { width: 100%; height: 180rpx; }
.card-body { padding: 20rpx 22rpx; }
.card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8rpx; }
.item-name { font-size: $font-size-base; font-weight: 700; color: $text-color; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.status-badge { flex-shrink: 0; padding: 4rpx 12rpx; border-radius: $radius-round; font-size: $font-size-xs; background: #f0f3f7; color: $info-color; }
.status-badge.listed { color: $success-color; background: #e9fbf7; }
.status-badge.pending { color: $warning-color; background: #fff2eb; }
.status-badge.rejected { color: $error-color; background: #fff0f0; }
.item-cat { display: block; font-size: $font-size-xs; color: $text-color-hint; }
.item-area { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.card-actions { display: flex; justify-content: flex-end; gap: 10rpx; margin-top: 16rpx; padding-top: 14rpx; border-top: 1rpx solid $divider-color; }
.act-btn { height: 52rpx; margin: 0; padding: 0 18rpx; border-radius: $radius-round; font-size: $font-size-xs; line-height: 50rpx; }
.act-btn::after { border: none; }
.act-btn.edit { border: 1rpx solid $border-color; background: #fff; color: $text-color-secondary; }
.act-btn.submit { border: none; background: $primary-gradient; color: #fff; }
.act-btn.warn { border: 1rpx solid $warning-color; background: #fff; color: $warning-color; }
</style>

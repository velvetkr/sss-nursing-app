<template>
  <view class="page-shell">
    <view v-if="store.servicesLoading" class="loading-wrap"><u-loading-icon size="28" /></view>
    <template v-else-if="service">
      <!-- 封面 -->
      <image v-if="service.coverImage" :src="service.coverImage" mode="aspectFill" class="cover-img" />

      <!-- 基本信息 -->
      <view class="card">
        <view class="row-between"><text class="title">{{ service.name }}</text><text class="status-badge" :class="statusClass">{{ store.getServiceStatusText(service.status) }}</text></view>
        <text class="cat">{{ service.categoryName }}</text>
        <text class="area" v-if="service.serviceArea">📍 {{ service.serviceArea }}</text>
      </view>

      <!-- 审核意见 -->
      <view class="card audit-card" v-if="service.auditOpinion">
        <view class="audit-row"><u-icon name="info-circle" size="18" :color="service.status === 3 ? '#FF5252' : '#3A7BF7'" /><text class="audit-text">{{ service.status === 3 ? '驳回原因' : '审核意见' }}：{{ service.auditOpinion }}</text></view>
      </view>

      <!-- 规格列表 -->
      <view class="card">
        <text class="section-title">服务规格（{{ service.specs?.length || 0 }}）</text>
        <view v-for="spec in service.specs" :key="spec.specId" class="spec-item">
          <text class="spec-name">{{ spec.name }}</text>
          <view class="spec-meta">
            <text class="spec-price">¥{{ (spec.price / 100).toFixed(2) }}</text>
            <text class="spec-original" v-if="spec.originalPrice">¥{{ (spec.originalPrice / 100).toFixed(2) }}</text>
            <text class="spec-dur">{{ spec.duration }}分钟</text>
          </view>
          <text class="spec-qual" v-if="spec.qualification">资质：{{ spec.qualification }}</text>
        </view>
      </view>

      <!-- 资质要求 -->
      <view class="card" v-if="service.qualifications?.length">
        <text class="section-title">资质要求</text>
        <view class="qual-tags">
          <text v-for="q in service.qualifications" :key="q" class="qual-tag">{{ q }}</text>
        </view>
      </view>

      <!-- 服务介绍 -->
      <view class="card" v-if="service.description">
        <text class="section-title">服务介绍</text>
        <view class="desc-text">{{ service.description }}</view>
      </view>

      <!-- 轮播图 -->
      <view class="card" v-if="service.images?.length">
        <text class="section-title">展示图片</text>
        <scroll-view scroll-x class="img-scroll">
          <image v-for="(img, i) in service.images" :key="i" :src="img" mode="aspectFill" class="detail-img" />
        </scroll-view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-bar-bottom">
        <button v-if="service.status === 0 || service.status === 3" class="btn" @click="goEdit">编辑</button>
        <button v-if="service.status === 0 || service.status === 3" class="btn primary" @click="handleSubmit">提交审核</button>
        <button v-if="service.status === 2" class="btn primary" @click="handleList">上架服务</button>
        <button v-if="service.status === 4" class="btn warn" @click="handleUnlist">下架服务</button>
        <button v-if="service.status === 1" class="btn" disabled>已提交审核，等待管理员处理</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'

const store = useMerchantStore()
const service = ref(null)

onLoad(async (options) => {
  if (options?.id) {
    await store.fetchMyServiceDetail(parseInt(options.id))
    service.value = store.currentService
  }
})

const statusClass = computed(() => {
  const s = service.value?.status
  if (s === 4) return 'listed'
  if (s === 1 || s === 0) return 'pending'
  if (s === 3) return 'rejected'
  return ''
})

function goEdit() { uni.navigateTo({ url: `/pages/merchant/service-edit?id=${service.value.itemId}` }) }

async function handleSubmit() {
  uni.showModal({ title: '提交审核', content: '确认提交该服务审核吗？', success: async ({ confirm }) => {
    if (!confirm) return
    try { await store.submitServiceForReview(service.value.itemId); uni.showToast({ title: '已提交', icon: 'success' }); refresh() } catch { /* handled */ }
  }})
}
async function handleList() {
  try { await store.listService(service.value.itemId); uni.showToast({ title: '已上架', icon: 'success' }); refresh() } catch { /* handled */ }
}
async function handleUnlist() {
  uni.showModal({ title: '下架服务', content: '确定下架该服务吗？', success: async ({ confirm }) => {
    if (!confirm) return
    try { await store.unlistService(service.value.itemId); uni.showToast({ title: '已下架', icon: 'success' }); refresh() } catch { /* handled */ }
  }})
}
async function refresh() {
  await store.fetchMyServiceDetail(service.value.itemId)
  service.value = store.currentService
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding-bottom: 120rpx; background: $page-gradient; }
.loading-wrap { padding: 200rpx 0; display: flex; justify-content: center; }
.cover-img { width: 100%; height: 360rpx; }

.card { margin: 16rpx $spacing-base; padding: 24rpx; border-radius: 24rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.row-between { display: flex; align-items: center; justify-content: space-between; }
.title { font-size: $font-size-lg; font-weight: 700; color: $text-color; flex: 1; }
.status-badge { padding: 6rpx 14rpx; border-radius: $radius-round; font-size: $font-size-xs; background: #f0f3f7; color: $info-color; }
.status-badge.listed { color: $success-color; background: #e9fbf7; }
.status-badge.pending { color: $warning-color; background: #fff2eb; }
.status-badge.rejected { color: $error-color; background: #fff0f0; }
.cat { display: block; margin-top: 8rpx; font-size: $font-size-sm; color: $text-color-secondary; }
.area { display: block; margin-top: 6rpx; font-size: $font-size-sm; color: $text-color-hint; }

.audit-card { background: #fff8f0; }
.audit-row { display: flex; align-items: flex-start; gap: 8rpx; }
.audit-text { font-size: $font-size-sm; color: $text-color-secondary; line-height: 1.5; flex: 1; }

.section-title { display: block; font-size: $font-size-base; font-weight: 700; color: $text-color; margin-bottom: 14rpx; }

.spec-item { padding: 16rpx 0; border-bottom: 1rpx solid $divider-color; }
.spec-item:last-child { border-bottom: none; }
.spec-name { font-size: $font-size-sm; font-weight: 600; color: $text-color; }
.spec-meta { display: flex; align-items: baseline; gap: 10rpx; margin-top: 6rpx; }
.spec-price { font-size: $font-size-base; font-weight: 700; color: $warning-color; }
.spec-original { font-size: $font-size-xs; color: $text-color-hint; text-decoration: line-through; }
.spec-dur { font-size: $font-size-xs; color: $text-color-hint; }
.spec-qual { display: block; margin-top: 4rpx; font-size: $font-size-xs; color: $text-color-hint; }

.qual-tags { display: flex; flex-wrap: wrap; gap: 8rpx; }
.qual-tag { padding: 6rpx 14rpx; border-radius: $radius-round; background: $primary-bg; color: $primary-color; font-size: $font-size-xs; }

.desc-text { font-size: $font-size-sm; color: $text-color-secondary; line-height: 1.7; white-space: pre-wrap; }

.img-scroll { white-space: nowrap; }
.detail-img { display: inline-block; width: 240rpx; height: 160rpx; border-radius: $radius-base; margin-right: 12rpx; }

.action-bar-bottom { position: fixed; bottom: 0; left: 0; right: 0; padding: 20rpx $spacing-base; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); display: flex; gap: 14rpx; border-top: 1rpx solid $divider-color; }
.btn { flex: 1; height: 80rpx; margin: 0; border: 1rpx solid $border-color; border-radius: $radius-round; background: #fff; color: $text-color-secondary; font-size: $font-size-base; line-height: 78rpx; }
.btn::after { border: none; }
.btn.primary { border: none; background: $primary-gradient; color: #fff; font-weight: 600; }
.btn.warn { border: 1rpx solid $warning-color; color: $warning-color; }
.btn[disabled] { opacity: 0.5; }
</style>

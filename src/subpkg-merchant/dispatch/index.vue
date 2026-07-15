<template>
  <view class="page-shell">
    <view v-if="order" class="order-summary"><view><text class="summary-title">{{ order.serviceItemName }}</text><text class="summary-desc">{{ order.serviceDate }} {{ slotText(order.serviceTimeSlot) }}</text><text class="summary-address">{{ order.addressDetail }}</text></view><text class="mode-tag">{{ isRedispatch ? '重新派单' : '首次派单' }}</text></view>
    <view class="section-head"><text class="section-title">候选护理人员</text><text class="section-desc">已按资质、服务能力和可用状态筛选</text></view>
    <view v-if="dispatchStore.loading" class="loading-wrap"><u-loading-icon size="30" color="#3A7BF7" /></view>
    <view v-else class="candidate-list"><view v-for="candidate in dispatchStore.candidates" :key="candidate.caregiverId" class="candidate-card" :class="{ selected: selectedId === candidate.caregiverId }" @click="selectedId = candidate.caregiverId"><view class="avatar"><u-icon name="server-man" size="29" color="#3A7BF7" /></view><view class="candidate-copy"><view class="name-row"><text class="candidate-name">{{ candidate.name }}</text><text class="rating">★ {{ candidate.rating }}</text></view><text class="candidate-meta">已完成 {{ candidate.completedOrders }} 单 · 距离 {{ candidate.distanceKm }}km</text><view class="skill-list"><text v-for="skill in candidate.skills" :key="skill" class="skill">{{ skill }}</text></view></view><view class="radio" :class="{ checked: selectedId === candidate.caregiverId }"><view v-if="selectedId === candidate.caregiverId" class="radio-dot" /></view></view></view>
    <view class="remark-card"><text class="field-label">派单备注</text><textarea v-model="remark" maxlength="200" class="remark-input" placeholder="可填写上门注意事项或调度说明" /></view>
    <view class="bottom-bar"><u-button type="primary" shape="round" :disabled="!selectedId" :loading="submitting" class="submit-btn" @click="submit">{{ isRedispatch ? '确认重新派单' : '确认派单' }}</u-button></view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { ROLES } from '@/constants/roles.js'
import { useDispatchStore } from '@/store/dispatch.js'
import { useMerchantStore } from '@/store/merchant.js'
import { requireRole } from '@/utils/permission.js'

const merchantStore = useMerchantStore()
const dispatchStore = useDispatchStore()
const orderId = ref(null)
const mode = ref('dispatch')
const selectedId = ref(null)
const remark = ref('')
const submitting = ref(false)
const order = computed(() => merchantStore.currentOrder)
const isRedispatch = computed(() => mode.value === 'redispatch')
onLoad(async (options) => { if (!requireRole(ROLES.MERCHANT_MEMBER)) return; orderId.value = Number(options.id); mode.value = options.mode === 'redispatch' ? 'redispatch' : 'dispatch'; await Promise.all([merchantStore.fetchOrderDetail(orderId.value), dispatchStore.fetchCandidates(orderId.value)]) })
function slotText(slot) { return ({ MORNING: '上午 08:00-12:00', AFTERNOON: '下午 13:00-17:00', EVENING: '晚上 18:00-21:00' }[slot] || slot) }
async function submit() { if (!selectedId.value || submitting.value) return; submitting.value = true; try { if (isRedispatch.value) await dispatchStore.redispatchOrder(orderId.value, selectedId.value, remark.value.trim()); else await dispatchStore.dispatchOrder(orderId.value, selectedId.value, remark.value.trim()); uni.showToast({ title: '派单成功', icon: 'success' }); setTimeout(() => uni.redirectTo({ url: `/subpkg-merchant/order-detail/index?id=${orderId.value}` }), 700) } finally { submitting.value = false } }
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 24rpx $spacing-base 150rpx; background: $page-gradient; }.order-summary { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; padding: 25rpx; border-radius: 28rpx; background: linear-gradient(135deg,#116b68,#00a89d); color: #fff; box-shadow: $shadow-float; }.summary-title,.summary-desc,.summary-address { display: block; }.summary-title { font-size: 31rpx; font-weight: 700; }.summary-desc { margin-top: 8rpx; font-size: $font-size-sm; opacity: .86; }.summary-address { max-width: 520rpx; margin-top: 7rpx; font-size: $font-size-xs; opacity: .72; line-height: 1.5; }.mode-tag { flex-shrink: 0; padding: 8rpx 14rpx; border-radius: $radius-round; background: rgba(255,255,255,.18); font-size: $font-size-xs; }.section-head { margin: 30rpx 4rpx 17rpx; }.section-title,.section-desc { display: block; }.section-title { color: $text-color; font-size: $font-size-md; font-weight: 700; }.section-desc { margin-top: 5rpx; color: $text-color-hint; font-size: $font-size-xs; }.loading-wrap { display: flex; justify-content: center; padding: 130rpx 0; }
.candidate-card { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; padding: 22rpx; border: 2rpx solid transparent; border-radius: 27rpx; background: $surface-gradient; box-shadow: $shadow-sm; }.candidate-card.selected { border-color: rgba(58,123,247,.35); background: linear-gradient(145deg,#fff,#edf4fe); }.avatar { display: flex; align-items: center; justify-content: center; width: 76rpx; height: 76rpx; flex-shrink: 0; border-radius: 24rpx; background: $primary-bg; }.candidate-copy { min-width: 0; flex: 1; }.name-row { display: flex; align-items: center; gap: 12rpx; }.candidate-name { color: $text-color; font-size: $font-size-base; font-weight: 700; }.rating { color: $warning-color; font-size: $font-size-xs; }.candidate-meta { display: block; margin-top: 6rpx; color: $text-color-hint; font-size: $font-size-xs; }.skill-list { display: flex; gap: 7rpx; margin-top: 10rpx; overflow: hidden; }.skill { flex-shrink: 0; padding: 5rpx 10rpx; border-radius: $radius-round; background: $primary-bg; color: $primary-color; font-size: 18rpx; }.radio { display: flex; align-items: center; justify-content: center; width: 36rpx; height: 36rpx; flex-shrink: 0; border: 2rpx solid $border-color; border-radius: 50%; }.radio.checked { border-color: $primary-color; }.radio-dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: $primary-color; }
.remark-card { margin-top: 22rpx; padding: 24rpx; border: $glass-border-soft; border-radius: 27rpx; background: $surface-gradient; box-shadow: $shadow-sm; }.field-label { display: block; color: $text-color; font-size: $font-size-base; font-weight: 600; }.remark-input { width: 100%; height: 150rpx; margin-top: 14rpx; padding: 18rpx; border: 1rpx solid $border-color; border-radius: 20rpx; background: rgba(255,255,255,.72); color: $text-color; font-size: $font-size-sm; line-height: 1.5; }.bottom-bar { position: fixed; left: 0; right: 0; bottom: 0; padding: 18rpx $spacing-base calc(18rpx + env(safe-area-inset-bottom)); background: rgba(249,251,255,.95); box-shadow: 0 -6rpx 24rpx rgba(42,91,170,.08); }.submit-btn { height: 84rpx !important; border: none !important; background: $primary-gradient !important; font-size: 30rpx !important; font-weight: 600 !important; }
</style>

<template>
  <view v-if="order" class="page-shell">
    <view class="status-card" :class="`tone-${order.status}`"><view><text class="status-title">{{ orderStore.getStatusText(order.status) }}</text><text class="status-desc">{{ statusDescription }}</text></view><u-icon :name="statusIcon" size="46" color="rgba(255,255,255,0.9)" /></view>
    <view class="detail-card"><text class="card-title">服务信息</text><view class="service-row"><view class="service-icon"><u-icon name="heart-fill" size="28" color="#3A7BF7" /></view><view class="service-copy"><text class="service-name">{{ order.serviceItemName }}</text><text class="secondary">{{ order.specName }}</text></view><text class="amount">¥{{ order.totalAmount }}</text></view></view>
    <view class="detail-card"><text class="card-title">预约信息</text><view class="info-row"><text class="label">服务时间</text><text class="value">{{ order.serviceDate }} {{ orderStore.getSlotText(order.serviceTimeSlot) }}</text></view><view class="info-row"><text class="label">联系人</text><text class="value">{{ order.receiverName }} {{ order.receiverPhone }}</text></view><view class="info-row"><text class="label">服务地址</text><text class="value multiline">{{ order.addressDetail }}</text></view><view v-if="order.remark" class="info-row"><text class="label">备注</text><text class="value multiline">{{ order.remark }}</text></view></view>
    <view class="detail-card"><text class="card-title">订单信息</text><view class="info-row"><text class="label">订单编号</text><text class="value">{{ order.orderNo }}</text></view><view class="info-row"><text class="label">创建时间</text><text class="value">{{ formatTime(order.createTime) }}</text></view><view class="info-row"><text class="label">服务费用</text><text class="value price">¥{{ order.totalAmount }}</text></view></view>
    <view v-if="order.operationLogs?.length" class="detail-card"><text class="card-title">订单进度</text><view class="timeline"><view v-for="(log, index) in order.operationLogs" :key="`${log.action}-${index}`" class="timeline-item"><view class="timeline-mark"><view class="dot" /><view v-if="index < order.operationLogs.length - 1" class="line" /></view><view class="timeline-copy"><text class="timeline-title">{{ log.remark }}</text><text class="timeline-time">{{ formatTime(log.createTime) }}</text></view></view></view></view>
    <view class="bottom-actions">
      <button v-if="order.status === 0" class="action-btn primary" @click="pay">立即支付</button>
      <button v-if="order.status === 0 || order.status === 1" class="action-btn" @click="cancel">取消订单</button>
      <button v-if="order.status === 2" class="action-btn primary" @click="review">评价服务</button>
      <button v-if="order.status === 1" class="action-btn primary" @click="complete">确认完成</button>
      <button v-if="order.status === 1 || order.status === 2" class="action-btn" @click="complaint">投诉反馈</button>
      <button v-if="order.serviceItemId" class="action-btn" @click="bookAgain">再次预约</button>
    </view>
  </view>
  <view v-else class="loading-page"><u-loading-icon size="32" color="#3A7BF7" /></view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useOrderStore } from '@/store/order.js'

const orderStore = useOrderStore()
const order = ref(null)
const statusDescription = computed(() => ({ 0: '请尽快完成支付，订单将为您保留', 1: '护理人员将按预约时间上门服务', 2: '本次护理服务已顺利完成', 3: '订单已取消，如有疑问请联系客服', 4: '退款正在处理中', 5: '退款已原路退回' }[order.value?.status] || '订单状态已更新'))
const statusIcon = computed(() => ({ 0: 'rmb-circle-fill', 1: 'clock-fill', 2: 'checkmark-circle-fill', 3: 'close-circle-fill', 4: 'reload', 5: 'checkmark-circle' }[order.value?.status] || 'info-circle'))
onLoad(async (options) => { order.value = await orderStore.fetchOrderDetail(Number(options.id)) })
function formatTime(value) { return value ? value.replace('T', ' ').replace('+08:00', '').slice(0, 16) : '--' }
async function pay() { try { const payment = await orderStore.executePayment(order.value.orderId); const status = payment.success ? 'success' : 'failed'; uni.redirectTo({ url: `/pages/payment-result/payment-result?status=${status}&orderId=${order.value.orderId}&amount=${order.value.totalAmount}` }) } catch { uni.redirectTo({ url: `/pages/payment-result/payment-result?status=failed&orderId=${order.value.orderId}&amount=${order.value.totalAmount}` }) } }
function cancel() { uni.showModal({ title: '取消订单', content: '确定取消本次护理服务吗？', success: async ({ confirm }) => { if (confirm) order.value = await orderStore.cancelOrder(order.value.orderId, '用户主动取消').then(() => orderStore.fetchOrderDetail(order.value.orderId)) } }) }
function review() { uni.navigateTo({ url: `/pages/review/review-submit?orderId=${order.value.orderId}` }) }
function complaint() { uni.navigateTo({ url: `/pages/complaint/complaint-submit?orderId=${order.value.orderId}` }) }
async function complete() { await orderStore.completeOrder(order.value.orderId); order.value = await orderStore.fetchOrderDetail(order.value.orderId) }
function bookAgain() { uni.navigateTo({ url: `/pages/booking/booking?itemId=${order.value.serviceItemId}&specId=${order.value.serviceSpecId || ''}` }) }
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 24rpx $spacing-base 170rpx; background: $page-gradient; }.status-card { display: flex; align-items: center; justify-content: space-between; min-height: 170rpx; padding: 30rpx; border-radius: 30rpx; color: #fff; box-shadow: $shadow-float; }.tone-0 { background: linear-gradient(135deg,#ff9a6c,#ff7b55); }.tone-1 { background: $primary-gradient; }.tone-2 { background: linear-gradient(135deg,#00a99d,#2dd4bf); }.tone-3,.tone-4,.tone-5 { background: linear-gradient(135deg,#728096,#9aa7b7); }.status-title { display: block; font-size: 40rpx; font-weight: 700; }.status-desc { display: block; margin-top: 10rpx; font-size: $font-size-sm; opacity: 0.82; }
.detail-card { margin-top: 20rpx; padding: 26rpx 24rpx; border: $glass-border-soft; border-radius: 28rpx; background: $surface-gradient; box-shadow: $shadow-sm; }.card-title { display: block; margin-bottom: 22rpx; color: $text-color; font-size: $font-size-md; font-weight: 700; }.service-row { display: flex; align-items: center; gap: 16rpx; }.service-icon { width: 76rpx; height: 76rpx; display: flex; align-items: center; justify-content: center; border-radius: 24rpx; background: $primary-bg; }.service-copy { flex: 1; }.service-name { display: block; color: $text-color; font-size: 30rpx; font-weight: 700; }.secondary { display: block; margin-top: 6rpx; color: $text-color-hint; font-size: $font-size-xs; }.amount,.price { color: $warning-color !important; font-size: 34rpx; font-weight: 700; }
.info-row { display: flex; justify-content: space-between; gap: 28rpx; padding: 15rpx 0; }.label { flex-shrink: 0; color: $text-color-hint; font-size: $font-size-sm; }.value { color: $text-color-secondary; font-size: $font-size-sm; text-align: right; }.value.multiline { line-height: 1.6; }
.timeline-item { display: flex; min-height: 92rpx; }.timeline-mark { position: relative; width: 34rpx; flex-shrink: 0; }.dot { width: 18rpx; height: 18rpx; margin-top: 5rpx; border: 5rpx solid rgba(58,123,247,0.2); border-radius: 50%; background: $primary-color; }.line { position: absolute; left: 8rpx; top: 28rpx; bottom: 0; width: 2rpx; background: $border-color; }.timeline-copy { flex: 1; padding-bottom: 22rpx; }.timeline-title { display: block; color: $text-color-secondary; font-size: $font-size-sm; }.timeline-time { display: block; margin-top: 7rpx; color: $text-color-disabled; font-size: $font-size-xs; }
.bottom-actions { position: fixed; left: 0; right: 0; bottom: 0; display: flex; justify-content: flex-end; gap: 12rpx; padding: 18rpx $spacing-base calc(18rpx + env(safe-area-inset-bottom)); background: rgba(249,251,255,0.93); backdrop-filter: $glass-blur; box-shadow: 0 -6rpx 24rpx rgba(42,91,170,0.08); }.action-btn { height: 66rpx; margin: 0; padding: 0 24rpx; border: 1rpx solid $border-color; border-radius: $radius-round; background: #fff; color: $text-color-secondary; font-size: $font-size-xs; line-height: 64rpx; }.action-btn::after { border: none; }.action-btn.primary { border: none; color: #fff; background: $primary-gradient; }.loading-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: $page-gradient; }
</style>

<template>
  <view class="page-shell"><view class="page-content"><view class="profile-card"><view class="logo"><u-icon name="home-fill" size="37" color="#FFFFFF" /></view><view class="profile-copy"><text class="merchant-name">{{ userStore.userInfo?.nickname || '商户' }}</text><text class="merchant-id">商户编号 {{ userStore.userInfo?.merchantId || '--' }}</text></view><text class="verified">已认证</text></view><view class="menu-card"><view v-for="item in menus" :key="item.label" class="menu-row" @click="pending(item.label)"><view class="menu-icon"><u-icon :name="item.icon" size="21" color="#3A7BF7" /></view><view class="menu-copy"><text class="menu-title">{{ item.label }}</text><text class="menu-desc">{{ item.desc }}</text></view><u-icon name="arrow-right" size="15" color="#C5CDD8" /></view></view><u-button shape="round" class="logout-btn" @click="logout">退出当前账号</u-button></view><role-tab-bar :tabs="MERCHANT_TABS" current="/subpkg-merchant/profile/index" /></view>
</template>
<script setup>
import { onShow } from '@dcloudio/uni-app'
import RoleTabBar from '@/components/base/role-tab-bar.vue'
import { MERCHANT_TABS } from '@/constants/merchant-navigation.js'
import { ROLES } from '@/constants/roles.js'
import { useUserStore } from '@/store/user.js'
import { requireRole } from '@/utils/permission.js'
const userStore = useUserStore()
const menus = [{ label: '商户资料', desc: '主体资质与经营信息', icon: 'home' }, { label: '人员管理', desc: '护理人员和商户成员', icon: 'account' }, { label: '经营数据', desc: '订单和服务质量数据', icon: 'level' }, { label: '隐私与安全', desc: '账号与操作安全', icon: 'lock' }]
onShow(() => requireRole(ROLES.MERCHANT_MEMBER))
function pending(label) { uni.showToast({ title: `${label}将在后续版本开放`, icon: 'none' }) }
function logout() { uni.showModal({ title: '退出登录', content: '确认退出当前商户账号吗？', success: ({ confirm }) => confirm && userStore.doLogout() }) }
</script>
<style lang="scss" scoped>
.page-shell { min-height: 100vh; background: $page-gradient; }.page-content { padding: 28rpx $spacing-base calc(140rpx + env(safe-area-inset-bottom)); }.profile-card { display: flex; align-items: center; gap: 18rpx; min-height: 190rpx; padding: 28rpx; border-radius: 32rpx; background: linear-gradient(135deg,#116b68,#00a89d 55%,#38c6b5); color: #fff; box-shadow: $shadow-float; }.logo { display: flex; align-items: center; justify-content: center; width: 92rpx; height: 92rpx; border: 3rpx solid rgba(255,255,255,.35); border-radius: 30rpx; background: rgba(255,255,255,.18); }.profile-copy { flex: 1; }.merchant-name,.merchant-id { display: block; }.merchant-name { font-size: 34rpx; font-weight: 700; }.merchant-id { margin-top: 7rpx; font-size: $font-size-xs; opacity: .78; }.verified { padding: 8rpx 15rpx; border-radius: $radius-round; background: rgba(255,255,255,.18); font-size: $font-size-xs; }.menu-card { margin-top: 22rpx; padding: 4rpx 22rpx; border: $glass-border-soft; border-radius: 28rpx; background: $surface-gradient; box-shadow: $shadow-sm; }.menu-row { display: flex; align-items: center; gap: 16rpx; min-height: 112rpx; border-bottom: 1rpx solid $divider-color; }.menu-row:last-child { border-bottom: none; }.menu-icon { display: flex; align-items: center; justify-content: center; width: 64rpx; height: 64rpx; border-radius: 20rpx; background: $primary-bg; }.menu-copy { flex: 1; }.menu-title,.menu-desc { display: block; }.menu-title { color: $text-color; font-size: $font-size-base; font-weight: 600; }.menu-desc { margin-top: 5rpx; color: $text-color-hint; font-size: $font-size-xs; }.logout-btn { height: 82rpx !important; margin-top: 28rpx; color: $warning-color !important; border-color: rgba(255,138,92,.24) !important; background: rgba(255,255,255,.72) !important; }
</style>

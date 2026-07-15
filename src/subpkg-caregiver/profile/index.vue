<template>
  <view class="page-shell">
    <view class="page-content">
      <view class="profile-card"><view class="avatar"><u-icon name="server-man" size="38" color="#FFFFFF" /></view><view class="profile-copy"><text class="profile-name">{{ userStore.userInfo?.nickname || '护理人员' }}</text><text class="profile-id">护理人员编号 {{ userStore.userInfo?.caregiverId || '--' }}</text></view><text class="verified">已认证</text></view>
      <view class="data-card"><view><text class="data-value">4.9</text><text class="data-label">综合评分</text></view><view><text class="data-value">126</text><text class="data-label">完成服务</text></view><view><text class="data-value">98%</text><text class="data-label">准时率</text></view></view>
      <view class="menu-card"><view v-for="item in menus" :key="item.label" class="menu-row" @click="pending(item.label)"><view class="menu-icon"><u-icon :name="item.icon" size="21" color="#3A7BF7" /></view><view class="menu-copy"><text class="menu-title">{{ item.label }}</text><text class="menu-desc">{{ item.desc }}</text></view><u-icon name="arrow-right" size="15" color="#C5CDD8" /></view></view>
      <u-button shape="round" class="logout-btn" @click="logout">退出当前账号</u-button>
    </view>
    <role-tab-bar :tabs="CAREGIVER_TABS" current="/subpkg-caregiver/profile/index" />
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import RoleTabBar from '@/components/base/role-tab-bar.vue'
import { CAREGIVER_TABS } from '@/constants/caregiver-navigation.js'
import { ROLES } from '@/constants/roles.js'
import { useUserStore } from '@/store/user.js'
import { requireRole } from '@/utils/permission.js'

const userStore = useUserStore()
const menus = [
  { label: '个人资料', desc: '基础资料和联系方式', icon: 'account' },
  { label: '资质证书', desc: '查看证书和有效期', icon: 'file-text' },
  { label: '服务能力', desc: '可承接的护理项目', icon: 'grid' },
  { label: '隐私与安全', desc: '账号保护和隐私设置', icon: 'lock' },
]
onShow(() => requireRole(ROLES.CAREGIVER))
function pending(label) { uni.showToast({ title: `${label}将在后续版本开放`, icon: 'none' }) }
function logout() { uni.showModal({ title: '退出登录', content: '确认退出当前护理人员账号吗？', success: ({ confirm }) => confirm && userStore.doLogout() }) }
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; background: $page-gradient; }.page-content { padding: 28rpx $spacing-base calc(140rpx + env(safe-area-inset-bottom)); }.profile-card { display: flex; align-items: center; gap: 18rpx; min-height: 190rpx; padding: 28rpx; border-radius: 32rpx; background: linear-gradient(135deg,#245ddc,#3a7bf7 55%,#00b8d8); color: #fff; box-shadow: $shadow-float; }.avatar { display: flex; align-items: center; justify-content: center; width: 92rpx; height: 92rpx; border: 3rpx solid rgba(255,255,255,.35); border-radius: 30rpx; background: rgba(255,255,255,.18); }.profile-copy { flex: 1; }.profile-name,.profile-id { display: block; }.profile-name { font-size: 34rpx; font-weight: 700; }.profile-id { margin-top: 7rpx; font-size: $font-size-xs; opacity: .78; }.verified { padding: 8rpx 15rpx; border-radius: $radius-round; background: rgba(255,255,255,.18); font-size: $font-size-xs; }
.data-card { display: grid; grid-template-columns: repeat(3,1fr); margin-top: 22rpx; padding: 25rpx 10rpx; border: $glass-border-soft; border-radius: 26rpx; background: $surface-gradient; box-shadow: $shadow-sm; text-align: center; }.data-value,.data-label { display: block; }.data-value { color: $text-color; font-size: 34rpx; font-weight: 700; }.data-label { margin-top: 5rpx; color: $text-color-hint; font-size: $font-size-xs; }
.menu-card { margin-top: 22rpx; padding: 4rpx 22rpx; border: $glass-border-soft; border-radius: 28rpx; background: $surface-gradient; box-shadow: $shadow-sm; }.menu-row { display: flex; align-items: center; gap: 16rpx; min-height: 112rpx; border-bottom: 1rpx solid $divider-color; }.menu-row:last-child { border-bottom: none; }.menu-icon { display: flex; align-items: center; justify-content: center; width: 64rpx; height: 64rpx; border-radius: 20rpx; background: $primary-bg; }.menu-copy { flex: 1; }.menu-title,.menu-desc { display: block; }.menu-title { color: $text-color; font-size: $font-size-base; font-weight: 600; }.menu-desc { margin-top: 5rpx; color: $text-color-hint; font-size: $font-size-xs; }.logout-btn { height: 82rpx !important; margin-top: 28rpx; color: $warning-color !important; border-color: rgba(255,138,92,.24) !important; background: rgba(255,255,255,.72) !important; }
</style>

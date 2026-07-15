<template>
  <view class="page-shell">
    <view class="profile-card" v-if="store.currentMerchant">
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-row"><text class="section-title">基本信息</text><button class="btn-edit" @click="startEdit">编辑</button></view>
        <view class="info-rows">
          <view class="info-row"><text class="ik">商户名称</text><text class="iv">{{ store.currentMerchant.name }}</text></view>
          <view class="info-row"><text class="ik">商户简称</text><text class="iv">{{ store.currentMerchant.shortName || '-' }}</text></view>
          <view class="info-row"><text class="ik">审核状态</text><text class="iv status-tag" :class="auditClass">{{ store.getMerchantAuditStatusText(store.currentMerchant.auditStatus) }}</text></view>
          <view class="info-row" v-if="store.currentMerchant.auditOpinion"><text class="ik">审核意见</text><text class="iv">{{ store.currentMerchant.auditOpinion }}</text></view>
          <view class="info-row"><text class="ik">联系人</text><text class="iv">{{ store.currentMerchant.contactName }}</text></view>
          <view class="info-row"><text class="ik">联系电话</text><text class="iv">{{ store.currentMerchant.contactPhone }}</text></view>
          <view class="info-row"><text class="ik">营业执照号</text><text class="iv">{{ store.currentMerchant.licenseNo || '-' }}</text></view>
          <view class="info-row"><text class="ik">商户地址</text><text class="iv">{{ store.currentMerchant.address || '-' }}</text></view>
          <view class="info-row"><text class="ik">入驻时间</text><text class="iv">{{ store.currentMerchant.createTime?.slice(0, 10) || '-' }}</text></view>
        </view>
        <image v-if="store.currentMerchant.businessLicense" :src="store.currentMerchant.businessLicense" mode="widthFix" class="license-img" />
      </view>

      <!-- 商户介绍 -->
      <view class="section" v-if="store.currentMerchant.description">
        <text class="section-title">商户介绍</text>
        <text class="desc-text">{{ store.currentMerchant.description }}</text>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <u-popup :show="editing" mode="bottom" :round="20" @close="editing = false">
      <view class="edit-sheet">
        <text class="edit-title">编辑商户资料</text>
        <scroll-view scroll-y style="max-height: 70vh">
          <view class="form-group"><text class="label">商户名称</text><u-input v-model="editForm.name" border="surround" maxlength="50" /></view>
          <view class="form-group"><text class="label">商户简称</text><u-input v-model="editForm.shortName" border="surround" maxlength="20" /></view>
          <view class="form-group"><text class="label">联系人</text><u-input v-model="editForm.contactName" border="surround" maxlength="20" /></view>
          <view class="form-group"><text class="label">联系电话</text><u-input v-model="editForm.contactPhone" border="surround" maxlength="11" /></view>
          <view class="form-group"><text class="label">商户地址</text><u-input v-model="editForm.address" border="surround" maxlength="100" /></view>
          <view class="form-group"><text class="label">商户介绍</text><u-textarea v-model="editForm.description" maxlength="500" autoHeight border="surround" /></view>
          <view class="form-group"><text class="label">营业执照</text>
            <view class="upload-box" @click="uploadLicense">
              <image v-if="editForm.businessLicense" :src="editForm.businessLicense" mode="aspectFill" class="upload-img-sm" />
              <view v-else class="upload-placeholder-sm"><u-icon name="plus" size="28" color="#98A5B3" /></view>
            </view>
          </view>
        </scroll-view>
        <button class="btn-save" :loading="saving" @click="handleSave">保存修改</button>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'
import { useUserStore } from '@/store/user.js'

const store = useMerchantStore()
const userStore = useUserStore()
const editing = ref(false)
const saving = ref(false)

const editForm = reactive({ name: '', shortName: '', contactName: '', contactPhone: '', address: '', description: '', businessLicense: '' })

const auditClass = computed(() => {
  const s = store.currentMerchant?.auditStatus
  if (s === 1) return 'approved'
  if (s === 2) return 'rejected'
  return 'pending'
})

onShow(() => store.fetchMyMerchant())

function startEdit() {
  const m = store.currentMerchant
  editForm.name = m.name || ''
  editForm.shortName = m.shortName || ''
  editForm.contactName = m.contactName || ''
  editForm.contactPhone = m.contactPhone || ''
  editForm.address = m.address || ''
  editForm.description = m.description || ''
  editForm.businessLicense = m.businessLicense || ''
  editing.value = true
}

async function uploadLicense() {
  try {
    const res = await uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] })
    uni.showLoading({ title: '上传中...' })
    const result = await userStore.uploadFile(res.tempFilePaths[0], 'merchant_license')
    editForm.businessLicense = result.fileUrl
    uni.hideLoading()
  } catch { uni.hideLoading() }
}

async function handleSave() {
  saving.value = true
  try {
    await store.updateProfile({ ...editForm })
    editing.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch { /* error already shown */ }
  finally { saving.value = false }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 20rpx $spacing-base 50rpx; background: $page-gradient; }
.profile-card { border-radius: 28rpx; overflow: hidden; }
.section { padding: 28rpx; margin-bottom: 16rpx; border-radius: 28rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.section-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20rpx; }
.section-title { font-size: $font-size-base; font-weight: 700; color: $text-color; }
.btn-edit { height: 52rpx; padding: 0 20rpx; border: 1rpx solid $border-color; border-radius: $radius-round; background: #fff; color: $primary-color; font-size: $font-size-xs; line-height: 50rpx; }
.btn-edit::after { border: none; }
.info-rows { display: flex; flex-direction: column; gap: 14rpx; }
.info-row { display: flex; align-items: flex-start; }
.ik { width: 160rpx; flex-shrink: 0; font-size: $font-size-sm; color: $text-color-hint; }
.iv { flex: 1; font-size: $font-size-sm; color: $text-color; }
.status-tag { padding: 2rpx 12rpx; border-radius: $radius-round; font-size: $font-size-xs; }
.status-tag.approved { color: $success-color; background: #e9fbf7; }
.status-tag.rejected { color: $error-color; background: #fff0f0; }
.status-tag.pending { color: $warning-color; background: #fff2eb; }
.license-img { margin-top: 20rpx; width: 100%; border-radius: $radius-md; }
.desc-text { margin-top: 12rpx; font-size: $font-size-sm; color: $text-color-secondary; line-height: 1.7; }

.edit-sheet { padding: 32rpx 28rpx 50rpx; }
.edit-title { display: block; font-size: $font-size-md; font-weight: 700; color: $text-color; text-align: center; margin-bottom: 28rpx; }
.form-group { margin-bottom: 22rpx; }
.label { display: block; margin-bottom: 8rpx; font-size: $font-size-sm; color: $text-color-secondary; }
.upload-box { margin-top: 6rpx; }
.upload-placeholder-sm { width: 140rpx; height: 100rpx; border: 2rpx dashed $border-color; border-radius: $radius-md; display: flex; align-items: center; justify-content: center; background: $bg-color-grey; }
.upload-img-sm { width: 140rpx; height: 100rpx; border-radius: $radius-md; }
.btn-save { width: 100%; height: 88rpx; border: none; border-radius: $radius-round; background: $primary-gradient; color: #fff; font-weight: 600; font-size: $font-size-base; margin-top: 20rpx; box-shadow: $shadow-glow; }
.btn-save::after { border: none; }
</style>

<template>
  <view class="page-shell">
    <view class="form-card">
      <text class="form-title">{{ isResubmit ? '重新提交申请' : '商户入驻申请' }}</text>
      <text class="form-subtitle">请填写真实有效的商户信息，提交后将由平台审核</text>

      <!-- 驳回原因提示 -->
      <view class="reject-tip" v-if="isResubmit && currentMerchant?.auditOpinion">
        <u-icon name="error-circle" size="16" color="#FF5252" />
        <text>驳回原因：{{ currentMerchant.auditOpinion }}</text>
      </view>

      <u-form :model="form" labelWidth="0" ref="formRef">
        <view class="form-group">
          <text class="label">商户名称 <text class="required">*</text></text>
          <u-input v-model="form.name" placeholder="请输入商户全称" border="surround" clearable maxlength="50" />
        </view>
        <view class="form-group">
          <text class="label">商户简称</text>
          <u-input v-model="form.shortName" placeholder="用于App内展示" border="surround" clearable maxlength="20" />
        </view>
        <view class="form-group">
          <text class="label">联系人姓名 <text class="required">*</text></text>
          <u-input v-model="form.contactName" placeholder="请输入联系人" border="surround" clearable maxlength="20" />
        </view>
        <view class="form-group">
          <text class="label">联系电话 <text class="required">*</text></text>
          <u-input v-model="form.contactPhone" placeholder="请输入联系电话" border="surround" clearable maxlength="11" type="number" />
        </view>
        <view class="form-group">
          <text class="label">营业执照号</text>
          <u-input v-model="form.licenseNo" placeholder="统一社会信用代码/注册号" border="surround" clearable maxlength="30" />
        </view>
        <view class="form-group">
          <text class="label">营业执照 <text class="required">*</text></text>
          <view class="upload-box" @click="uploadLicense">
            <image v-if="form.businessLicense" :src="form.businessLicense" mode="aspectFill" class="upload-img" />
            <view v-else class="upload-placeholder">
              <u-icon name="plus" size="36" color="#98A5B3" />
              <text>点击上传营业执照</text>
            </view>
          </view>
          <text class="hint">支持jpg、png格式，大小不超过5MB</text>
        </view>
        <view class="form-group">
          <text class="label">商户地址</text>
          <u-input v-model="form.address" placeholder="请输入商户地址" border="surround" clearable maxlength="100" />
        </view>
        <view class="form-group">
          <text class="label">商户介绍</text>
          <u-textarea v-model="form.description" placeholder="请介绍您的商户背景、服务特色（选填）" maxlength="500" autoHeight border="surround" />
        </view>
      </u-form>

      <button class="btn-submit" :loading="submitting" :disabled="submitting" @click="handleSubmit">
        {{ isResubmit ? '重新提交' : '提交申请' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'
import { useUserStore } from '@/store/user.js'

const store = useMerchantStore()
const userStore = useUserStore()
const isResubmit = ref(false)
const currentMerchant = ref(null)
const submitting = ref(false)

const form = reactive({
  name: '',
  shortName: '',
  contactName: '',
  contactPhone: '',
  licenseNo: '',
  businessLicense: '',
  address: '',
  description: '',
})

onLoad(async (options) => {
  if (options?.resubmit === '1') {
    isResubmit.value = true
    await store.fetchMyMerchant()
    currentMerchant.value = store.currentMerchant
    if (currentMerchant.value) {
      form.name = currentMerchant.value.name || ''
      form.shortName = currentMerchant.value.shortName || ''
      form.contactName = currentMerchant.value.contactName || ''
      form.contactPhone = currentMerchant.value.contactPhone || ''
      form.licenseNo = currentMerchant.value.licenseNo || ''
      form.businessLicense = currentMerchant.value.businessLicense || ''
      form.address = currentMerchant.value.address || ''
      form.description = currentMerchant.value.description || ''
    }
  }
})

async function uploadLicense() {
  try {
    const res = await uni.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] })
    uni.showLoading({ title: '上传中...' })
    const result = await userStore.uploadFile(res.tempFilePaths[0], 'merchant_license')
    form.businessLicense = result.fileUrl
    uni.hideLoading()
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch {
    uni.hideLoading()
  }
}

async function handleSubmit() {
  if (!form.name.trim()) { uni.showToast({ title: '请输入商户名称', icon: 'none' }); return }
  if (!form.contactName.trim()) { uni.showToast({ title: '请输入联系人姓名', icon: 'none' }); return }
  if (!form.contactPhone.trim() || !/^1\d{10}$/.test(form.contactPhone)) { uni.showToast({ title: '请输入正确的联系电话', icon: 'none' }); return }
  if (!form.businessLicense) { uni.showToast({ title: '请上传营业执照', icon: 'none' }); return }

  submitting.value = true
  try {
    if (isResubmit.value) {
      await store.resubmitApplication({ ...form })
    } else {
      await store.submitApplication({ ...form })
    }
    uni.showToast({ title: isResubmit.value ? '已重新提交' : '申请已提交', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch {
    /* error already shown by request layer */
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 20rpx $spacing-base 60rpx; background: $page-gradient; }
.form-card { padding: 32rpx 28rpx; border-radius: 28rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.form-title { display: block; font-size: $font-size-lg; font-weight: 700; color: $text-color; }
.form-subtitle { display: block; margin-top: 8rpx; font-size: $font-size-sm; color: $text-color-hint; }

.reject-tip { margin-top: 20rpx; padding: 14rpx 18rpx; background: #fff0f0; border-radius: $radius-base; display: flex; align-items: flex-start; gap: 8rpx; font-size: $font-size-sm; color: $error-color; line-height: 1.5; }

.form-group { margin-top: 28rpx; }
.label { display: block; margin-bottom: 10rpx; font-size: $font-size-sm; font-weight: 600; color: $text-color; }
.required { color: $error-color; }
.hint { display: block; margin-top: 8rpx; font-size: $font-size-xs; color: $text-color-hint; }

.upload-box { margin-top: 6rpx; }
.upload-placeholder { width: 200rpx; height: 140rpx; border: 2rpx dashed $border-color; border-radius: $radius-md; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx; font-size: $font-size-xs; color: $text-color-hint; background: $bg-color-grey; }
.upload-img { width: 200rpx; height: 140rpx; border-radius: $radius-md; }

.btn-submit { margin-top: 48rpx; width: 100%; height: 88rpx; border: none; border-radius: $radius-round; background: $primary-gradient; color: #fff; font-size: $font-size-base; font-weight: 600; box-shadow: $shadow-glow; }
.btn-submit::after { border: none; }
.btn-submit[disabled] { opacity: 0.6; }
</style>

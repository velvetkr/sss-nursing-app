<template>
  <view class="apply-page">
    <!-- 背景弥散光 -->
    <view class="bg-glow bg-glow-top" />
    <view class="bg-glow bg-glow-bottom" />

    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-icon">
        <u-icon name="account" size="32" color="#FFFFFF" />
      </view>
      <text class="page-title">护理人员认证申请</text>
      <text class="page-subtitle">专业护理，从认证开始</text>
    </view>

    <!-- 申请表单 -->
    <view class="form-section">
      <view class="form-card">
        <!-- 基本信息 -->
        <view class="form-section-title">
          <view class="section-dot" />
          <text class="section-title-text">基本信息</text>
        </view>

        <!-- 真实姓名 -->
        <view class="input-group">
          <text class="input-label">真实姓名 <text class="required">*</text></text>
          <u-input
            v-model="formData.realName"
            placeholder="请输入您的真实姓名"
            border="bottom"
            clearable
          >
            <template #prefix>
              <u-icon name="account" size="20" color="#6B7B8D" />
            </template>
          </u-input>
        </view>

        <!-- 性别 -->
        <view class="input-group">
          <text class="input-label">性别 <text class="required">*</text></text>
          <view class="gender-picker">
            <view
              class="gender-option"
              :class="{ active: formData.gender === 1 }"
              @click="formData.gender = 1"
            >
              <u-icon name="man" size="20" :color="formData.gender === 1 ? '#3A7BF7' : '#6B7B8D'" />
              <text class="gender-text">男</text>
            </view>
            <view
              class="gender-option"
              :class="{ active: formData.gender === 2 }"
              @click="formData.gender = 2"
            >
              <u-icon name="woman" size="20" :color="formData.gender === 2 ? '#3A7BF7' : '#6B7B8D'" />
              <text class="gender-text">女</text>
            </view>
          </view>
        </view>

        <!-- 身份证号 -->
        <view class="input-group">
          <text class="input-label">身份证号 <text class="required">*</text></text>
          <u-input
            v-model="formData.idCard"
            placeholder="请输入您的身份证号"
            border="bottom"
            maxlength="18"
            clearable
          >
            <template #prefix>
              <u-icon name="credit-card" size="20" color="#6B7B8D" />
            </template>
          </u-input>
        </view>

        <!-- 手机号 -->
        <view class="input-group">
          <text class="input-label">手机号 <text class="required">*</text></text>
          <u-input
            v-model="formData.phone"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            border="bottom"
            clearable
          >
            <template #prefix>
              <u-icon name="phone" size="20" color="#6B7B8D" />
            </template>
          </u-input>
        </view>

        <!-- 从业年限 -->
        <view class="input-group">
          <text class="input-label">从业年限 <text class="required">*</text></text>
          <u-input
            v-model="formData.workYears"
            type="number"
            placeholder="请输入从业年限"
            border="bottom"
            clearable
          >
            <template #prefix>
              <u-icon name="calendar" size="20" color="#6B7B8D" />
            </template>
          </u-input>
        </view>

        <!-- 服务技能 -->
        <view class="input-group">
          <text class="input-label">服务技能 <text class="required">*</text></text>
          <view class="skill-tags">
            <view
              v-for="skill in skillOptions"
              :key="skill"
              class="skill-tag"
              :class="{ active: formData.skills.includes(skill) }"
              @click="toggleSkill(skill)"
            >
              <text class="skill-text">{{ skill }}</text>
            </view>
          </view>
        </view>

        <!-- 服务区域 -->
        <view class="input-group">
          <text class="input-label">服务区域 <text class="required">*</text></text>
          <view class="area-selector" @click="showAreaPicker = true">
            <text class="area-text">{{ formData.serviceAreas.join('、') || '请选择服务区域' }}</text>
            <u-icon name="arrow-right" size="16" color="#6B7B8D" />
          </view>
        </view>

        <!-- 资质证书 -->
        <view class="input-group">
          <text class="input-label">资质证书 <text class="required">*</text></text>
          <view class="certificate-upload">
            <view
              v-for="(cert, index) in formData.certificates"
              :key="index"
              class="certificate-item"
            >
              <image v-if="cert.certImage" :src="cert.certImage" class="cert-image" mode="aspectFill" />
              <view v-else class="cert-placeholder">
                <u-icon name="plus" size="24" color="#6B7B8D" />
              </view>
              <view class="cert-info">
                <u-input
                  v-model="cert.certType"
                  placeholder="证书类型"
                  size="small"
                  border="none"
                />
                <u-input
                  v-model="cert.certNo"
                  placeholder="证书编号"
                  size="small"
                  border="none"
                />
              </view>
              <u-icon
                v-if="formData.certificates.length > 1"
                name="close"
                size="18"
                color="#FF4444"
                class="cert-delete"
                @click="removeCertificate(index)"
              />
            </view>
            <view class="add-certificate" @click="addCertificate">
              <u-icon name="plus-circle" size="20" color="#3A7BF7" />
              <text class="add-text">添加证书</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <u-button
        type="primary"
        shape="round"
        :loading="submitting"
        :disabled="!canSubmit"
        class="submit-btn"
        @click="handleSubmit"
      >
        提交申请
      </u-button>
      <text class="submit-tip">
        提交后将进入审核流程，审核结果将通过短信通知您
      </text>
    </view>

    <!-- 区域选择器 -->
    <u-picker
      v-model="showAreaPicker"
      :columns="areaColumns"
      @confirm="onAreaConfirm"
      @cancel="showAreaPicker = false"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCaregiverStore } from '@/store/caregiver.js'

const caregiverStore = useCaregiverStore()

// 表单数据
const formData = ref({
  realName: '',
  gender: 1,
  idCard: '',
  phone: '',
  workYears: '',
  skills: [],
  serviceAreas: [],
  certificates: [
    {
      certType: '',
      certNo: '',
      certImage: '',
      validFrom: '',
      validTo: '',
    },
  ],
})

// 技能选项
const skillOptions = [
  '老人护理',
  '伤口护理',
  '康复训练',
  '测量血压',
  '测量血糖',
  '压疮护理',
  '鼻饲护理',
  '导尿护理',
]

// 服务区域选项
const areaOptions = [
  '北京市朝阳区',
  '北京市海淀区',
  '北京市东城区',
  '北京市西城区',
  '北京市丰台区',
  '北京市石景山区',
]

const showAreaPicker = ref(false)
const submitting = ref(false)

// 区域选择器列
const areaColumns = [
  areaOptions.map(area => ({ label: area, value: area })),
]

// 身份证格式校验
function validateIdCard(idCard) {
  if (!idCard) return false
  // 18位身份证格式：6位地区码 + 8位出生日期 + 3位顺序码 + 1位校验码
  const reg = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  return reg.test(idCard)
}

// 手机号格式校验
function validatePhone(phone) {
  if (!phone) return false
  // 11位手机号，以1开头，第二位为3-9
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

// 是否可以提交
const canSubmit = computed(() => {
  return (
    formData.value.realName.trim() &&
    validateIdCard(formData.value.idCard) &&
    validatePhone(formData.value.phone) &&
    formData.value.workYears &&
    formData.value.skills.length > 0 &&
    formData.value.serviceAreas.length > 0 &&
    formData.value.certificates.some(cert => cert.certType && cert.certNo) &&
    !submitting.value
  )
})

// 切换技能选择
function toggleSkill(skill) {
  const index = formData.value.skills.indexOf(skill)
  if (index > -1) {
    formData.value.skills.splice(index, 1)
  } else {
    formData.value.skills.push(skill)
  }
}

// 添加证书
function addCertificate() {
  formData.value.certificates.push({
    certType: '',
    certNo: '',
    certImage: '',
    validFrom: '',
    validTo: '',
  })
}

// 删除证书
function removeCertificate(index) {
  formData.value.certificates.splice(index, 1)
}

// 区域确认
function onAreaConfirm(value) {
  formData.value.serviceAreas = value.map(v => v.value)
  showAreaPicker.value = false
}

// 提交申请
async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    const result = await caregiverStore.submitApplication({
      realName: formData.value.realName,
      gender: formData.value.gender,
      idCard: formData.value.idCard,
      phone: formData.value.phone,
      workYears: parseInt(formData.value.workYears),
      skills: formData.value.skills,
      serviceAreas: formData.value.serviceAreas,
      certificates: formData.value.certificates.filter(
        cert => cert.certType && cert.certNo
      ),
    })

    uni.showToast({
      title: '申请提交成功',
      icon: 'success',
      duration: 2000,
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  } catch (error) {
    uni.showToast({
      title: error.message || '提交失败，请重试',
      icon: 'none',
      duration: 2000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.apply-page {
  min-height: 100vh;
  padding: 32rpx $spacing-base 48rpx;
  background: $page-gradient;
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120rpx);
  opacity: 0.4;
  pointer-events: none;

  &.bg-glow-top {
    width: 600rpx;
    height: 600rpx;
    background: linear-gradient(135deg, #3A7BF7 0%, #6C63FF 100%);
    top: -200rpx;
    right: -200rpx;
  }

  &.bg-glow-bottom {
    width: 500rpx;
    height: 500rpx;
    background: linear-gradient(135deg, #6C63FF 0%, #9D4EDD 100%);
    bottom: -100rpx;
    left: -200rpx;
  }
}

.page-header {
  text-align: center;
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;

  .header-icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #3A7BF7 0%, #6C63FF 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24rpx;
  }

  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12rpx;
  }

  .page-subtitle {
    display: block;
    font-size: 28rpx;
    color: $text-secondary;
  }
}

.form-section {
  position: relative;
  z-index: 1;
  margin-bottom: 48rpx;
}

.form-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24rpx);
  border-radius: $radius-xl;
  padding: $spacing-xl;
  box-shadow: $shadow-card;
}

.form-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  margin-top: 32rpx;

  &:first-child {
    margin-top: 0;
  }

  .section-dot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: $primary-color;
    margin-right: 16rpx;
  }

  .section-title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
  }
}

.input-group {
  margin-bottom: 32rpx;

  .input-label {
    display: block;
    font-size: 28rpx;
    color: $text-secondary;
    margin-bottom: 16rpx;

    .required {
      color: #FF4444;
      margin-left: 8rpx;
    }
  }
}

.gender-picker {
  display: flex;
  gap: 24rpx;

  .gender-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 24rpx;
    background: rgba(245, 247, 250, 0.6);
    border: 2rpx solid transparent;
    border-radius: $radius-lg;
    transition: all 0.3s ease;

    &.active {
      background: rgba(58, 123, 247, 0.1);
      border-color: $primary-color;
    }

    .gender-text {
      font-size: 28rpx;
      color: $text-primary;
    }
  }
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .skill-tag {
    padding: 16rpx 24rpx;
    background: rgba(245, 247, 250, 0.6);
    border: 2rpx solid transparent;
    border-radius: $radius-full;
    transition: all 0.3s ease;

    &.active {
      background: rgba(58, 123, 247, 0.1);
      border-color: $primary-color;
    }

    .skill-text {
      font-size: 26rpx;
      color: $text-primary;
    }
  }
}

.area-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: rgba(245, 247, 250, 0.6);
  border-radius: $radius-lg;

  .area-text {
    font-size: 28rpx;
    color: $text-primary;
  }
}

.certificate-upload {
  .certificate-item {
    display: flex;
    align-items: center;
    gap: 24rpx;
    padding: 24rpx;
    background: rgba(245, 247, 250, 0.6);
    border-radius: $radius-lg;
    margin-bottom: 24rpx;
    position: relative;

    .cert-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: $radius-base;
    }

    .cert-placeholder {
      width: 120rpx;
      height: 120rpx;
      border-radius: $radius-base;
      background: rgba(245, 247, 250, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cert-info {
      flex: 1;
    }

    .cert-delete {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
    }
  }

  .add-certificate {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 24rpx;
    border: 2rpx dashed rgba(58, 123, 247, 0.3);
    border-radius: $radius-lg;

    .add-text {
      font-size: 28rpx;
      color: $primary-color;
    }
  }
}

.submit-section {
  position: relative;
  z-index: 1;
  padding: 0 $spacing-xl;

  .submit-btn {
    margin-bottom: 24rpx;
  }

  .submit-tip {
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: $text-placeholder;
  }
}
</style>
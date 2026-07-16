<template>
  <view class="profile-page">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @tap="changeAvatar">
        <image class="avatar-image" :src="profile.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="avatar-edit">
          <text class="edit-text">更换头像</text>
        </view>
      </view>
      <text class="profile-name">{{ profile.name || '未设置姓名' }}</text>
      <view class="profile-status" :class="getStatusClass(profile.auditStatus)">
        {{ getStatusText(profile.auditStatus) }}
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">👤</text>
        <text class="title-text">基本信息</text>
      </view>
      <view class="info-list">
        <view class="info-item" @tap="editField('name', '姓名')">
          <text class="info-label">姓名</text>
          <view class="info-right">
            <text class="info-value">{{ profile.name || '未设置' }}</text>
            <text class="info-arrow">›</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">身份证号</text>
          <view class="info-right">
            <text class="info-value">{{ maskIdCard(profile.idCard) }}</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">手机号</text>
          <view class="info-right">
            <text class="info-value">{{ profile.phone }}</text>
          </view>
        </view>
        <view class="info-item" @tap="editField('gender', '性别')">
          <text class="info-label">性别</text>
          <view class="info-right">
            <text class="info-value">{{ profile.gender === 'MALE' ? '男' : profile.gender === 'FEMALE' ? '女' : '未设置' }}</text>
            <text class="info-arrow">›</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">从业年限</text>
          <view class="info-right">
            <text class="info-value">{{ profile.experienceYears || 0 }} 年</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 技能信息 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">💪</text>
        <text class="title-text">服务技能</text>
      </view>
      <view class="skill-list">
        <view
          v-for="(skill, index) in profile.skills"
          :key="index"
          class="skill-tag"
        >
          {{ skill }}
        </view>
        <view v-if="!profile.skills || profile.skills.length === 0" class="empty-text">
          暂无技能信息
        </view>
      </view>
      <button class="edit-btn" @tap="editSkills">编辑技能</button>
    </view>

    <!-- 服务区域 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">📍</text>
        <text class="title-text">服务区域</text>
      </view>
      <view class="area-list">
        <view
          v-for="(area, index) in profile.serviceAreas"
          :key="index"
          class="area-tag"
        >
          {{ area }}
        </view>
        <view v-if="!profile.serviceAreas || profile.serviceAreas.length === 0" class="empty-text">
          暂无服务区域
        </view>
      </view>
      <button class="edit-btn" @tap="editAreas">编辑区域</button>
    </view>

    <!-- 资质证书 -->
    <view class="section-card">
      <view class="section-title">
        <text class="title-icon">📜</text>
        <text class="title-text">资质证书</text>
      </view>
      <view class="cert-list">
        <view
          v-for="(cert, index) in profile.certificates"
          :key="index"
          class="cert-item"
          @tap="previewCert(cert)"
        >
          <image class="cert-image" :src="cert.url" mode="aspectFill" />
          <view class="cert-info">
            <text class="cert-name">{{ cert.name }}</text>
            <text class="cert-valid">有效期：{{ cert.validUntil }}</text>
          </view>
        </view>
        <view v-if="!profile.certificates || profile.certificates.length === 0" class="empty-text">
          暂无资质证书
        </view>
      </view>
      <button class="edit-btn" @tap="addCertificate">添加证书</button>
    </view>

    <!-- 审核信息 -->
    <view v-if="profile.auditStatus === 'REJECTED'" class="section-card reject-card">
      <view class="section-title">
        <text class="title-icon">⚠️</text>
        <text class="title-text">审核驳回原因</text>
      </view>
      <view class="reject-content">
        <text class="reject-text">{{ profile.rejectReason || '暂无驳回原因' }}</text>
      </view>
      <button class="resubmit-btn" @tap="resubmit">重新提交</button>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="btn-save" @tap="saveProfile">保存修改</button>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="modal-mask" @tap="closeEditModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">编辑{{ editTitle }}</text>
          <text class="modal-close" @tap="closeEditModal">✕</text>
        </view>
        
        <view class="modal-body">
          <input
            v-model="editValue"
            class="edit-input"
            :placeholder="`请输入${editTitle}`"
            placeholder-class="placeholder"
          />
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @tap="closeEditModal">取消</button>
          <button class="btn-confirm" @tap="confirmEdit">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCaregiverStore } from '@/store/caregiver.js'

// Store
const caregiverStore = useCaregiverStore()

// 个人资料
const profile = ref({
  avatar: '',
  name: '李护士',
  idCard: '320102199001011234',
  phone: '13800138001',
  gender: 'FEMALE',
  experienceYears: 5,
  skills: ['日常护理', '康复训练', '老年护理'],
  serviceAreas: ['玄武区', '秦淮区', '建邺区'],
  certificates: [
    {
      name: '护士执业证书',
      url: '/static/cert1.jpg',
      validUntil: '2028-12-31',
    },
    {
      name: '养老护理员证书',
      url: '/static/cert2.jpg',
      validUntil: '2027-06-30',
    },
  ],
  auditStatus: 'APPROVED',
  rejectReason: '',
})

// 编辑弹窗
const showEditModal = ref(false)
const editTitle = ref('')
const editField = ref('')
const editValue = ref('')

// 获取状态样式
function getStatusClass(status) {
  const classMap = {
    DRAFT: 'status-draft',
    PENDING: 'status-pending',
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
    SUSPENDED: 'status-suspended',
  }
  return classMap[status] || ''
}

// 获取状态文本
function getStatusText(status) {
  const textMap = {
    DRAFT: '草稿',
    PENDING: '审核中',
    APPROVED: '已通过',
    REJECTED: '已驳回',
    SUSPENDED: '已停用',
  }
  return textMap[status] || '未知'
}

// 遮蔽身份证
function maskIdCard(idCard) {
  if (!idCard) return '未设置'
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}

// 更换头像
function changeAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      profile.value.avatar = res.tempFilePaths[0]
      uni.showToast({
        title: '头像已更新',
        icon: 'success',
      })
    },
  })
}

// 编辑字段
function editField(field, title) {
  editField.value = field
  editTitle.value = title
  editValue.value = profile.value[field] || ''
  showEditModal.value = true
}

// 关闭编辑弹窗
function closeEditModal() {
  showEditModal.value = false
}

// 确认编辑
function confirmEdit() {
  profile.value[editField.value] = editValue.value
  closeEditModal()
}

// 编辑技能
function editSkills() {
  uni.showToast({
    title: '技能编辑页面待实现',
    icon: 'none',
  })
}

// 编辑区域
function editAreas() {
  uni.showToast({
    title: '区域编辑页面待实现',
    icon: 'none',
  })
}

// 添加证书
function addCertificate() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      profile.value.certificates.push({
        name: '新证书',
        url: res.tempFilePaths[0],
        validUntil: '2028-12-31',
      })
      uni.showToast({
        title: '证书已添加',
        icon: 'success',
      })
    },
  })
}

// 预览证书
function previewCert(cert) {
  uni.previewImage({
    urls: [cert.url],
    current: cert.url,
  })
}

// 重新提交
function resubmit() {
  uni.navigateTo({
    url: '/pages/caregiver/apply',
  })
}

// 保存资料
async function saveProfile() {
  uni.showLoading({ title: '保存中...' })
  
  try {
    // 调用 API 保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    uni.hideLoading()
    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })
  } catch (err) {
    uni.hideLoading()
    uni.showToast({
      title: '保存失败',
      icon: 'none',
    })
  }
}

// 页面加载
onMounted(() => {
  // 加载个人资料
})
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 120rpx;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .avatar-wrapper {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    
    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4rpx solid #ffffff;
    }
    
    .avatar-edit {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 0 0 80rpx 80rpx;
      padding: 8rpx 0;
      
      .edit-text {
        display: block;
        text-align: center;
        font-size: 22rpx;
        color: #ffffff;
      }
    }
  }
  
  .profile-name {
    font-size: 36rpx;
    color: #ffffff;
    font-weight: bold;
    margin-top: 20rpx;
  }
  
  .profile-status {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    margin-top: 12rpx;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    
    &.status-approved {
      background: rgba(76, 175, 80, 0.3);
    }
    
    &.status-rejected {
      background: rgba(244, 67, 54, 0.3);
    }
  }
}

/* 区块卡片 */
.section-card {
  background: #ffffff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #eeeeee;
    
    .title-icon {
      font-size: 32rpx;
      margin-right: 10rpx;
    }
    
    .title-text {
      font-size: 32rpx;
      color: #333333;
      font-weight: bold;
    }
  }
}

/* 信息列表 */
.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-size: 28rpx;
      color: #999999;
    }
    
    .info-right {
      display: flex;
      align-items: center;
      
      .info-value {
        font-size: 28rpx;
        color: #333333;
      }
      
      .info-arrow {
        font-size: 32rpx;
        color: #cccccc;
        margin-left: 10rpx;
      }
    }
  }
}

/* 技能列表 */
.skill-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
  
  .skill-tag {
    font-size: 26rpx;
    color: #667eea;
    background: #f0f5ff;
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    margin-right: 16rpx;
    margin-bottom: 16rpx;
  }
  
  .empty-text {
    font-size: 26rpx;
    color: #999999;
  }
}

/* 区域列表 */
.area-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
  
  .area-tag {
    font-size: 26rpx;
    color: #4caf50;
    background: #e8f5e9;
    padding: 10rpx 20rpx;
    border-radius: 20rpx;
    margin-right: 16rpx;
    margin-bottom: 16rpx;
  }
  
  .empty-text {
    font-size: 26rpx;
    color: #999999;
  }
}

/* 证书列表 */
.cert-list {
  .cert-item {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background: #f5f6fa;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    
    .cert-image {
      width: 100rpx;
      height: 100rpx;
      border-radius: 8rpx;
      margin-right: 20rpx;
    }
    
    .cert-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .cert-name {
        font-size: 28rpx;
        color: #333333;
      }
      
      .cert-valid {
        font-size: 24rpx;
        color: #999999;
        margin-top: 8rpx;
      }
    }
  }
  
  .empty-text {
    font-size: 26rpx;
    color: #999999;
  }
}

/* 编辑按钮 */
.edit-btn {
  width: 100%;
  height: 80rpx;
  background: transparent;
  border: 1rpx solid #667eea;
  border-radius: 40rpx;
  color: #667eea;
  font-size: 28rpx;
}

/* 驳回卡片 */
.reject-card {
  background: #ffebee;
  
  .reject-content {
    padding: 20rpx;
    background: #ffffff;
    border-radius: 12rpx;
    
    .reject-text {
      font-size: 28rpx;
      color: #f44336;
    }
  }
  
  .resubmit-btn {
    width: 100%;
    height: 80rpx;
    background: #f44336;
    border-radius: 40rpx;
    color: #ffffff;
    font-size: 28rpx;
    margin-top: 20rpx;
    border: none;
  }
}

/* 底部按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #ffffff;
  border-top: 1rpx solid #eeeeee;
  
  .btn-save {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12rpx;
    color: #ffffff;
    font-size: 34rpx;
    font-weight: bold;
    border: none;
  }
}

/* 编辑弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eeeeee;
    
    .modal-title {
      font-size: 32rpx;
      color: #333333;
      font-weight: bold;
    }
    
    .modal-close {
      font-size: 36rpx;
      color: #999999;
    }
  }
  
  .modal-body {
    padding: 30rpx;
    
    .edit-input {
      width: 100%;
      height: 88rpx;
      background: #f5f6fa;
      border-radius: 12rpx;
      padding: 20rpx;
      font-size: 28rpx;
      color: #333333;
    }
  }
  
  .modal-footer {
    display: flex;
    padding: 20rpx 30rpx 30rpx;
    gap: 20rpx;
    
    button {
      flex: 1;
      height: 88rpx;
      font-size: 30rpx;
      font-weight: bold;
      border: none;
      border-radius: 12rpx;
    }
    
    .btn-cancel {
      background: #f5f6fa;
      color: #666666;
    }
    
    .btn-confirm {
      background: #667eea;
      color: #ffffff;
    }
  }
}

.placeholder {
  color: #999999;
}
</style>
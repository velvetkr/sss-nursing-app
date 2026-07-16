<template>
  <view class="admin-login">
    <!-- 顶部Logo区域 -->
    <view class="login-header">
      <view class="logo">
        <text class="logo-icon">🛡️</text>
      </view>
      <text class="title">智慧护理平台</text>
      <text class="subtitle">管理员登录</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 用户名 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">👤</text>
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            placeholder-class="placeholder"
            maxlength="20"
            @blur="validateUsername"
          />
        </view>
        <text v-if="errors.username" class="error-text">{{ errors.username }}</text>
      </view>

      <!-- 密码 -->
      <view class="form-item">
        <view class="input-wrapper">
          <text class="input-icon">🔐</text>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
            placeholder-class="placeholder"
            maxlength="20"
            @blur="validatePassword"
          />
          <text class="toggle-password" @tap="togglePassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
        <text v-if="errors.password" class="error-text">{{ errors.password }}</text>
      </view>

      <!-- 记住密码 -->
      <view class="remember-row">
        <view class="remember-checkbox" @tap="toggleRemember">
          <text class="checkbox" :class="{ checked: form.remember }">
            {{ form.remember ? '✓' : '' }}
          </text>
          <text class="remember-text">记住密码</text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button
        class="login-btn"
        :disabled="loading || !canSubmit"
        :loading="loading"
        @tap="handleLogin"
      >
        登 录
      </button>

      <!-- 提示信息 -->
      <view class="login-tips">
        <text class="tips-title">测试账号：</text>
        <text class="tips-content">用户名：admin</text>
        <text class="tips-content">密码：admin123</text>
      </view>
    </view>

    <!-- 底部版权 -->
    <view class="login-footer">
      <text class="copyright">© 2026 智慧护理平台</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user.js'

// 用户 Store
const userStore = useUserStore()

// 表单数据
const form = ref({
  username: '',
  password: '',
  remember: false,
})

// 错误信息
const errors = ref({
  username: '',
  password: '',
})

// 显示密码
const showPassword = ref(false)

// 加载状态
const loading = ref(false)

// 是否可提交
const canSubmit = computed(() => {
  return form.value.username.trim() !== '' && 
         form.value.password.trim() !== '' &&
         !errors.value.username &&
         !errors.value.password
})

// 切换显示密码
function togglePassword() {
  showPassword.value = !showPassword.value
}

// 切换记住密码
function toggleRemember() {
  form.value.remember = !form.value.remember
}

// 验证用户名
function validateUsername() {
  if (!form.value.username.trim()) {
    errors.value.username = '请输入用户名'
    return false
  }
  if (form.value.username.length < 3) {
    errors.value.username = '用户名至少3个字符'
    return false
  }
  errors.value.username = ''
  return true
}

// 验证密码
function validatePassword() {
  if (!form.value.password.trim()) {
    errors.value.password = '请输入密码'
    return false
  }
  if (form.value.password.length < 6) {
    errors.value.password = '密码至少6个字符'
    return false
  }
  errors.value.password = ''
  return true
}

// 登录处理
async function handleLogin() {
  // 验证表单
  const usernameValid = validateUsername()
  const passwordValid = validatePassword()
  
  if (!usernameValid || !passwordValid) {
    return
  }
  
  loading.value = true
  
  try {
    // 调用管理员登录接口
    const response = await uni.$http.post('/admin/login', {
      username: form.value.username,
      password: form.value.password,
    })
    
    if (response.code === 0) {
      // 保存登录信息
      const { token, userInfo } = response.data
      
      // 保存到用户 Store
      userStore.setToken(token)
      userStore.setUserInfo(userInfo)
      
      // 保存记住密码
      if (form.value.remember) {
        uni.setStorageSync('admin_username', form.value.username)
        uni.setStorageSync('admin_password', form.value.password)
        uni.setStorageSync('admin_remember', true)
      } else {
        uni.removeStorageSync('admin_username')
        uni.removeStorageSync('admin_password')
        uni.removeStorageSync('admin_remember')
      }
      
      // 显示成功提示
      uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000,
      })
      
      // 跳转到管理员首页
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/admin/home',
        })
      }, 1500)
    } else {
      uni.showToast({
        title: response.message || '登录失败',
        icon: 'none',
        duration: 2000,
      })
    }
  } catch (err) {
    console.error('登录失败:', err)
    uni.showToast({
      title: '网络错误，请稍后重试',
      icon: 'none',
      duration: 2000,
    })
  } finally {
    loading.value = false
  }
}

// 页面加载时读取记住的密码
onMounted(() => {
  const savedUsername = uni.getStorageSync('admin_username')
  const savedPassword = uni.getStorageSync('admin_password')
  const savedRemember = uni.getStorageSync('admin_remember')
  
  if (savedRemember) {
    form.value.username = savedUsername || ''
    form.value.password = savedPassword || ''
    form.value.remember = true
  }
})
</script>

<style lang="scss" scoped>
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  padding: 0 40rpx;
}

/* 顶部Logo区域 */
.login-header {
  padding-top: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .logo {
    width: 160rpx;
    height: 160rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 40rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
    
    .logo-icon {
      font-size: 80rpx;
    }
  }
  
  .title {
    font-size: 48rpx;
    color: #ffffff;
    font-weight: bold;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

/* 登录表单 */
.login-form {
  margin-top: 80rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 40rpx;
  
  .input-wrapper {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 24rpx 20rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    
    &:focus-within {
      border-color: #667eea;
      background: #ffffff;
    }
    
    .input-icon {
      font-size: 40rpx;
      margin-right: 20rpx;
    }
    
    input {
      flex: 1;
      font-size: 32rpx;
      color: #333333;
    }
    
    .toggle-password {
      font-size: 40rpx;
      padding: 10rpx;
    }
  }
  
  .error-text {
    display: block;
    font-size: 24rpx;
    color: #ff4d4f;
    margin-top: 12rpx;
    padding-left: 10rpx;
  }
}

.placeholder {
  color: #999999;
}

/* 记住密码 */
.remember-row {
  margin-bottom: 40rpx;
  
  .remember-checkbox {
    display: flex;
    align-items: center;
    
    .checkbox {
      width: 40rpx;
      height: 40rpx;
      border: 2rpx solid #ddd;
      border-radius: 8rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 16rpx;
      font-size: 28rpx;
      color: #ffffff;
      transition: all 0.3s;
      
      &.checked {
        background: #667eea;
        border-color: #667eea;
      }
    }
    
    .remember-text {
      font-size: 28rpx;
      color: #666666;
    }
  }
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  margin-top: 20rpx;
  
  &[disabled] {
    opacity: 0.6;
  }
}

/* 提示信息 */
.login-tips {
  margin-top: 40rpx;
  padding: 30rpx;
  background: #f0f5ff;
  border-radius: 12rpx;
  
  .tips-title {
    display: block;
    font-size: 26rpx;
    color: #666666;
    margin-bottom: 16rpx;
  }
  
  .tips-content {
    display: block;
    font-size: 26rpx;
    color: #333333;
    line-height: 1.8;
  }
}

/* 底部版权 */
.login-footer {
  margin-top: auto;
  padding: 60rpx 0;
  text-align: center;
  
  .copyright {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>
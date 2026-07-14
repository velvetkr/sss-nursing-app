/**
 * Pinia — 用户 Store 单元测试
 *
 * 覆盖：状态初始化、登录/注册流程、登出、个人信息更新
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/store/user.js'

// Mock request 模块
vi.mock('@/utils/request.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    upload: vi.fn(),
  },
}))

import http from '@/utils/request.js'

describe('userStore — 状态初始化', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
    vi.clearAllMocks()
  })

  it('初始状态：未登录、无 token、无用户信息', () => {
    const store = useUserStore()
    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.isLogin).toBe(false)
    expect(store.isLoggedIn).toBe(false)
  })

  it('初始状态 phone 和 userId 为安全默认值', () => {
    const store = useUserStore()
    expect(store.phone).toBe('')
    expect(store.userId).toBeNull()
  })
})

describe('userStore — 登录流程', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
    vi.clearAllMocks()
  })

  it('密码登录成功后状态更新', async () => {
    const mockUser = { userId: 1, phone: '138****8000', nickname: '测试' }
    http.post.mockResolvedValueOnce({
      code: 0,
      message: 'success',
      data: { token: 'jwt-token-abc', user: mockUser },
    })

    const store = useUserStore()
    await store.login('13800138000', '123456', 'password')

    expect(store.token).toBe('jwt-token-abc')
    expect(store.userInfo).toEqual(mockUser)
    expect(store.isLogin).toBe(true)
    expect(store.isLoggedIn).toBe(true)
    expect(getToken()).toBe('jwt-token-abc')
  })

  it('验证码登录成功后状态更新', async () => {
    const mockUser = { userId: 2, phone: '139****9000', nickname: '新用户' }
    http.post.mockResolvedValueOnce({
      code: 0,
      data: { token: 'jwt-sms-token', user: mockUser },
    })

    const store = useUserStore()
    await store.login('13900139000', '123456', 'sms')

    expect(store.token).toBe('jwt-sms-token')
    expect(store.isLoggedIn).toBe(true)
  })

  it('登录失败时状态不变', async () => {
    http.post.mockRejectedValueOnce({ code: 2010, message: '密码错误' })

    const store = useUserStore()
    await expect(store.login('13800138000', 'wrong', 'password')).rejects.toBeDefined()
    expect(store.token).toBe('')
    expect(store.isLogin).toBe(false)
  })
})

describe('userStore — 注册流程', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
    vi.clearAllMocks()
  })

  it('注册成功后自动登录', async () => {
    const mockUser = { userId: 3, phone: '137****7000', nickname: '新注册' }
    http.post.mockResolvedValueOnce({
      code: 0,
      data: { token: 'jwt-reg-token', user: mockUser },
    })

    const store = useUserStore()
    await store.register('13700137000', '123456', 'mypassword', '新注册')

    expect(store.token).toBe('jwt-reg-token')
    expect(store.userInfo.nickname).toBe('新注册')
    expect(store.isLogin).toBe(true)
  })
})

describe('userStore — 登出', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    uni.clearStorageSync()
    vi.clearAllMocks()
  })

  it('登出后清空状态并跳转登录页', async () => {
    http.post.mockResolvedValueOnce({ code: 0 })

    // 先模拟登录
    const store = useUserStore()
    store.token = 'some-token'
    store.userInfo = { userId: 1, phone: '138****8000' }
    store.isLogin = true

    await store.doLogout()

    expect(store.token).toBe('')
    expect(store.userInfo).toBeNull()
    expect(store.isLogin).toBe(false)
    expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/login/login' })
  })

  it('即使后端登出接口失败也清除本地状态', async () => {
    http.post.mockRejectedValueOnce(new Error('Network error'))

    const store = useUserStore()
    store.token = 'stale-token'
    store.isLogin = true

    await store.doLogout()

    expect(store.token).toBe('')
    expect(store.isLogin).toBe(false)
    expect(uni.reLaunch).toHaveBeenCalled()
  })
})

describe('userStore — 个人信息', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchProfile 获取并更新用户信息', async () => {
    const profile = { userId: 1, phone: '138****8000', nickname: '更新后', gender: 1 }
    http.get.mockResolvedValueOnce({ code: 0, data: profile })

    const store = useUserStore()
    const result = await store.fetchProfile()
    expect(result).toEqual(profile)
    expect(store.userInfo).toEqual(profile)
  })

  it('updateProfile 合并更新本地信息', async () => {
    http.put.mockResolvedValueOnce({
      code: 0,
      data: { nickname: '新昵称', gender: 0 },
    })

    const store = useUserStore()
    store.userInfo = { userId: 1, phone: '138****8000', nickname: '旧昵称' }
    await store.updateProfile({ nickname: '新昵称', gender: 0 })

    expect(store.userInfo.nickname).toBe('新昵称')
    expect(store.userInfo.gender).toBe(0)
    expect(store.userInfo.phone).toBe('138****8000') // 保留原有字段
  })
})

// helper — 从 storage 读取 token
import { getToken } from '@/utils/storage.js'

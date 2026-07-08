/**
 * Mock — 用户模块（user-service）
 *
 * 对齐 API v1.0：
 * - 发送验证码 /api/v1/users/sms-code
 * - 注册 /api/v1/users/register
 * - 登录 /api/v1/users/login（loginMode: password | sms）
 * - 登出 /api/v1/users/logout
 * - 重置密码 /api/v1/users/password/reset
 * - 个人信息 /api/v1/users/profile (GET/PUT)
 * - 文件上传 /api/v1/files/upload
 */
import Mock from 'mockjs'

const Random = Mock.Random

// ========== 模拟用户数据 ==========
const users = new Map()
const tokenBlacklist = new Set() // 登出黑名单

// 预设测试账号（密码: 123456）
const testUser = {
  userId: 10001,
  phone: '13800138000',
  password: '123456',
  nickname: '测试用户',
  avatar: '',
  gender: 0,
  idCard: '110101199001011234',
  status: 0,
  lastLoginTime: '2026-07-01T10:00:00+08:00',
  createTime: '2026-01-15T08:00:00+08:00',
}
users.set('13800138000', testUser)

// ========== 工具函数 ==========

function generateToken(userId) {
  return `mock_jwt_${userId}_${Date.now()}_${Random.string('lower', 16)}`
}

function maskPhone(phone) {
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

function buildUserResponse(user) {
  return {
    userId: user.userId,
    phone: maskPhone(user.phone),
    nickname: user.nickname,
    avatar: user.avatar || null,
    gender: user.gender,
    status: user.status,
  }
}

// 7天后过期
function expireTime() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().replace(/\.\d{3}Z$/, '+08:00')
}

// ========== 1. 发送短信验证码 ==========
Mock.mock(/\/api\/v1\/users\/sms-code/, 'post', (options) => {
  const { phone, smsType } = JSON.parse(options.body)
  console.log(`[Mock] 发送验证码 → ${phone}，类型: ${smsType}，验证码: 123456`)

  if (!/^1\d{10}$/.test(phone)) {
    return { code: 1000, message: '手机号格式不正确', data: null }
  }

  // 注册时检查手机号已存在
  if (smsType === 'register' && users.has(phone)) {
    return { code: 2003, message: '手机号已被注册', data: null }
  }
  // 登录/重置密码时检查手机号存在
  if ((smsType === 'login' || smsType === 'reset_password') && !users.has(phone)) {
    return { code: 2004, message: '手机号未注册', data: null }
  }

  return {
    code: 0,
    message: '验证码已发送',
    data: { expireSeconds: 300 },
  }
})

// ========== 2. 用户注册 ==========
Mock.mock(/\/api\/v1\/users\/register/, 'post', (options) => {
  const { phone, smsCode, password, nickname } = JSON.parse(options.body)

  // 验证码校验（Mock 固定 123456）
  if (smsCode !== '123456') {
    return { code: 2006, message: '验证码错误', data: null }
  }

  // 手机号已注册
  if (users.has(phone)) {
    return { code: 2008, message: '该手机号已注册', data: null }
  }

  // 密码校验：8-32位，包含字母和数字
  if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return { code: 2009, message: '密码需8-32位，包含字母和数字', data: null }
  }

  const user = {
    userId: Random.integer(10002, 99999),
    phone,
    password,
    nickname: nickname || `用户${phone.slice(-4)}`,
    avatar: null,
    gender: 0,
    idCard: null,
    status: 0,
    lastLoginTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
  }
  users.set(phone, user)

  const token = generateToken(user.userId)
  console.log(`[Mock] 注册成功: ${phone} → userId=${user.userId}`)

  return {
    code: 0,
    message: '注册成功',
    data: {
      token,
      expireTime: expireTime(),
      user: buildUserResponse(user),
    },
  }
})

// ========== 3. 用户登录 ==========
Mock.mock(/\/api\/v1\/users\/login/, 'post', (options) => {
  const { phone, loginMode, password, smsCode } = JSON.parse(options.body)

  const user = users.get(phone)
  if (!user) {
    return { code: 2004, message: '手机号未注册', data: null }
  }

  // 检查账号状态
  if (user.status === 1) {
    return { code: 2011, message: '账号已被禁用', data: null }
  }

  if (loginMode === 'password') {
    // 密码登录
    if (!password || password !== user.password) {
      return { code: 2010, message: '密码错误', data: null }
    }
  } else if (loginMode === 'sms') {
    // 验证码登录
    if (smsCode !== '123456') {
      return { code: 2006, message: '验证码错误', data: null }
    }
  } else {
    return { code: 1000, message: '请选择登录方式', data: null }
  }

  const token = generateToken(user.userId)
  user.lastLoginTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')

  console.log(`[Mock] 登录成功: ${phone} (${loginMode})`)

  return {
    code: 0,
    message: '登录成功',
    data: {
      token,
      expireTime: expireTime(),
      user: buildUserResponse(user),
    },
  }
})

// ========== 4. 用户登出 ==========
Mock.mock(/\/api\/v1\/users\/logout/, 'post', (options) => {
  const auth = options.headers?.Authorization || ''
  const token = auth.replace('Bearer ', '')

  if (!token || token === 'undefined') {
    return { code: 1002, message: '未授权，请先登录', data: null }
  }

  // Token 加入黑名单
  tokenBlacklist.add(token)
  console.log('[Mock] 登出成功，Token 已加入黑名单')

  return { code: 0, message: '登出成功', data: null }
})

// ========== 5. 重置密码 ==========
Mock.mock(/\/api\/v1\/users\/password\/reset/, 'post', (options) => {
  const { phone, smsCode, newPassword } = JSON.parse(options.body)

  const user = users.get(phone)
  if (!user) {
    return { code: 2004, message: '手机号未注册', data: null }
  }

  if (smsCode !== '123456') {
    return { code: 2006, message: '验证码错误', data: null }
  }

  if (!newPassword || newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return { code: 2009, message: '密码需8-32位，包含字母和数字', data: null }
  }

  if (newPassword === user.password) {
    return { code: 2012, message: '新密码不能与旧密码相同', data: null }
  }

  user.password = newPassword
  console.log(`[Mock] 密码重置成功: ${phone}`)

  return { code: 0, message: '密码重置成功', data: null }
})

// ========== 6. 获取个人信息 ==========
Mock.mock(/\/api\/v1\/users\/profile/, 'get', (options) => {
  const auth = options.headers?.Authorization || ''
  const token = auth.replace('Bearer ', '')

  if (!token || tokenBlacklist.has(token)) {
    return { code: 1002, message: '未授权，请先登录', data: null }
  }

  // 简单解析：mock token 里包含 userId
  const userIdMatch = token.match(/mock_jwt_(\d+)/)
  const userId = userIdMatch ? parseInt(userIdMatch[1]) : 10001

  // 找到对应用户
  let user = null
  for (const u of users.values()) {
    if (u.userId === userId) { user = u; break }
  }
  if (!user) user = testUser

  // 脱敏身份证号
  const maskedIdCard = user.idCard
    ? user.idCard.slice(0, 3) + '***********' + user.idCard.slice(-4)
    : null

  return {
    code: 0,
    message: 'success',
    data: {
      userId: user.userId,
      phone: maskPhone(user.phone),
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      idCard: maskedIdCard,
      status: user.status,
      lastLoginTime: user.lastLoginTime,
      createTime: user.createTime,
    },
  }
})

// ========== 7. 修改个人信息 ==========
Mock.mock(/\/api\/v1\/users\/profile/, 'put', (options) => {
  const auth = options.headers?.Authorization || ''
  const token = auth.replace('Bearer ', '')

  if (!token || tokenBlacklist.has(token)) {
    return { code: 1002, message: '未授权，请先登录', data: null }
  }

  const userIdMatch = token.match(/mock_jwt_(\d+)/)
  const userId = userIdMatch ? parseInt(userIdMatch[1]) : 10001

  const body = JSON.parse(options.body || '{}')

  let user = null
  for (const u of users.values()) {
    if (u.userId === userId) { user = u; break }
  }
  if (!user) user = testUser

  // 更新字段
  if (body.nickname !== undefined) {
    if (body.nickname.length < 2 || body.nickname.length > 16) {
      return { code: 1000, message: '昵称长度需2-16个字符', data: null }
    }
    user.nickname = body.nickname
  }
  if (body.avatar !== undefined) user.avatar = body.avatar
  if (body.gender !== undefined) user.gender = body.gender
  if (body.idCard !== undefined) {
    if (!/^\d{17}[\dXx]$/.test(body.idCard)) {
      return { code: 2013, message: '身份证号格式不正确', data: null }
    }
    user.idCard = body.idCard
  }

  console.log(`[Mock] 个人信息已更新: userId=${userId}`)

  return {
    code: 0,
    message: '修改成功',
    data: {
      userId: user.userId,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
    },
  }
})

// ========== 8. 文件上传 ==========
Mock.mock(/\/api\/v1\/files\/upload/, 'post', () => {
  const fileName = Random.string('lower', 10) + '.jpg'
  const fileUrl = `https://cdn.nursing.com/${new Date().toISOString().slice(0, 10).replace(/-/g, '/')}/${fileName}`

  console.log(`[Mock] 文件上传成功 → ${fileUrl}`)

  return {
    code: 0,
    message: '上传成功',
    data: {
      fileUrl,
      fileName,
      fileSize: Random.integer(10240, 204800),
      bizType: 'avatar',
    },
  }
})

console.log('[Mock] 用户模块已加载 (user-service v1.0)')

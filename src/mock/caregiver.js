/**
 * Mock — 护理人员模块（caregiver-service）
 *
 * 对齐 API v1.0：
 * - 护理人员申请 /api/v1/caregivers/apply
 * - 申请审核状态 /api/v1/caregivers/application-status
 * - 护理人员档案 /api/v1/caregivers/profile (GET/PATCH)
 * - 服务技能 /api/v1/caregivers/skills (GET/PUT)
 * - 服务区域 /api/v1/caregivers/service-areas (GET/PUT)
 * - 排班管理 /api/v1/caregivers/schedule (GET/PATCH)
 * - 可接单状态 /api/v1/caregivers/available
 */
import Mock from 'mockjs'

const Random = Mock.Random

// ========== 模拟护理人员数据 ==========
const caregivers = new Map()

// 预设测试账号（待审核护理人员）
const testCaregiver = {
  caregiverId: 50001,
  userId: 10004,
  phone: '13800138004',
  realName: '李护士',
  gender: 1,
  idCard: '110101199001011234',
  avatar: '',
  auditStatus: 'PENDING',
  skills: ['老人护理', '康复训练', '测量血压'],
  serviceAreas: ['北京市朝阳区', '北京市海淀区'],
  workYears: 5,
  certificates: [
    {
      certId: 1,
      certType: '护士执业证书',
      certNo: '202611000001',
      certImage: '/static/images/cert-1.jpg',
      validFrom: '2020-01-01',
      validTo: '2026-12-31',
      status: 'VALID',
    },
  ],
  available: true,
  merchantId: null,
  schedule: [
    { date: '2026-07-15', status: 'AVAILABLE' },
    { date: '2026-07-16', status: 'AVAILABLE' },
    { date: '2026-07-17', status: 'LEAVE' },
  ],
  createTime: '2026-06-01T10:00:00+08:00',
  updateTime: '2026-07-01T15:00:00+08:00',
  version: 0,
}
caregivers.set(50001, testCaregiver)

// 已通过审核的护理人员
const approvedCaregiver = {
  caregiverId: 50002,
  userId: 10005,
  phone: '13800138005',
  realName: '张护士',
  gender: 2,
  idCard: '110101199002022345',
  avatar: '',
  auditStatus: 'APPROVED',
  skills: ['老人护理', '伤口护理', '康复训练'],
  serviceAreas: ['北京市朝阳区', '北京市东城区'],
  workYears: 8,
  certificates: [
    {
      certId: 2,
      certType: '护士执业证书',
      certNo: '202611000002',
      certImage: '/static/images/cert-2.jpg',
      validFrom: '2019-06-01',
      validTo: '2025-06-01',
      status: 'EXPIRING',
    },
  ],
  available: true,
  merchantId: 20001,
  schedule: [
    { date: '2026-07-15', status: 'AVAILABLE' },
    { date: '2026-07-16', status: 'BUSY' },
    { date: '2026-07-17', status: 'AVAILABLE' },
  ],
  createTime: '2026-05-15T08:00:00+08:00',
  updateTime: '2026-07-10T12:00:00+08:00',
  version: 1,
}
caregivers.set(50002, approvedCaregiver)

// ========== 工具函数 ==========

function maskPhone(phone) {
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

function buildCaregiverResponse(caregiver) {
  return {
    caregiverId: caregiver.caregiverId,
    userId: caregiver.userId,
    phone: maskPhone(caregiver.phone),
    realName: caregiver.realName,
    gender: caregiver.gender,
    avatar: caregiver.avatar || null,
    auditStatus: caregiver.auditStatus,
    skills: caregiver.skills,
    serviceAreas: caregiver.serviceAreas,
    workYears: caregiver.workYears,
    certificates: caregiver.certificates,
    available: caregiver.available,
    merchantId: caregiver.merchantId,
    version: caregiver.version || 0,
  }
}

// ========== 1. 提交护理人员申请 ==========
Mock.mock(/\/api\/v1\/caregivers\/apply/, 'post', (options) => {
  const idempotencyKey = options.headers?.['Idempotency-Key'] || options.headers?.['idempotency-key']
  const body = JSON.parse(options.body)
  console.log(`[Mock] 护理人员申请 → 真实姓名: ${body.realName}，手机号: ${body.phone}`)

  // 验证幂等键
  if (!idempotencyKey) {
    return { code: 1000, message: '缺少幂等键', data: null }
  }

  // 生成护理人员ID
  const caregiverId = 50000 + caregivers.size + 1

  // 创建护理人员数据
  const caregiver = {
    caregiverId,
    userId: 10000 + caregiverId,
    phone: body.phone,
    realName: body.realName,
    gender: body.gender,
    idCard: body.idCard,
    avatar: '',
    auditStatus: 'PENDING',
    skills: body.skills || [],
    serviceAreas: body.serviceAreas || [],
    workYears: body.workYears || 0,
    certificates: body.certificates || [],
    available: false,
    merchantId: null,
    schedule: [],
    createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    updateTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    version: 0,
  }

  caregivers.set(caregiverId, caregiver)

  return {
    code: 0,
    message: '申请已提交，等待审核',
    data: {
      caregiverId,
      auditStatus: 'PENDING',
    },
  }
})

// ========== 2. 获取申请审核状态 ==========
Mock.mock(/\/api\/v1\/caregivers\/application-status/, 'get', () => {
  console.log(`[Mock] 查询申请审核状态`)

  // 模拟返回第一个护理人员的状态
  const caregiver = caregivers.get(50001)

  return {
    code: 0,
    message: 'success',
    data: {
      caregiverId: caregiver.caregiverId,
      status: caregiver.auditStatus,
      rejectReason: null,
      submittedAt: caregiver.createTime,
    },
  }
})

// ========== 3. 获取护理人员档案 ==========
Mock.mock(/\/api\/v1\/caregivers\/profile/, 'get', () => {
  console.log(`[Mock] 获取护理人员档案`)

  // 模拟返回已通过审核的护理人员
  const caregiver = caregivers.get(50002)

  return {
    code: 0,
    message: 'success',
    data: buildCaregiverResponse(caregiver),
  }
})

// ========== 4. 更新护理人员档案 ==========
Mock.mock(/\/api\/v1\/caregivers\/profile/, 'patch', (options) => {
  const body = JSON.parse(options.body)
  console.log(`[Mock] 更新护理人员档案`)

  const caregiver = caregivers.get(50002)
  if (!caregiver) {
    return { code: 2004, message: '护理人员不存在', data: null }
  }

  // 更新档案
  Object.assign(caregiver, body, {
    updateTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
  })
  caregivers.set(caregiver.caregiverId, caregiver)

  return {
    code: 0,
    message: '更新成功',
    data: buildCaregiverResponse(caregiver),
  }
})

// ========== 5. 获取服务技能列表 ==========
Mock.mock(/\/api\/v1\/caregivers\/skills/, 'get', () => {
  console.log(`[Mock] 获取服务技能列表`)

  const caregiver = caregivers.get(50002)

  return {
    code: 0,
    message: 'success',
    data: {
      list: caregiver.skills,
      total: caregiver.skills.length,
    },
  }
})

// ========== 6. 更新服务技能 ==========
Mock.mock(/\/api\/v1\/caregivers\/skills/, 'put', (options) => {
  const body = JSON.parse(options.body)
  console.log(`[Mock] 更新服务技能 → 技能: ${body.skills.join(',')}`)

  const caregiver = caregivers.get(50002)
  if (!caregiver) {
    return { code: 2004, message: '护理人员不存在', data: null }
  }

  caregiver.skills = body.skills
  caregivers.set(caregiver.caregiverId, caregiver)

  return {
    code: 0,
    message: '更新成功',
    data: {
      skills: caregiver.skills,
    },
  }
})

// ========== 7. 获取服务区域列表 ==========
Mock.mock(/\/api\/v1\/caregivers\/service-areas/, 'get', () => {
  console.log(`[Mock] 获取服务区域列表`)

  const caregiver = caregivers.get(50002)

  return {
    code: 0,
    message: 'success',
    data: {
      list: caregiver.serviceAreas,
      total: caregiver.serviceAreas.length,
    },
  }
})

// ========== 8. 更新服务区域 ==========
Mock.mock(/\/api\/v1\/caregivers\/service-areas/, 'put', (options) => {
  const body = JSON.parse(options.body)
  console.log(`[Mock] 更新服务区域 → 区域: ${body.areas.join(',')}`)

  const caregiver = caregivers.get(50002)
  if (!caregiver) {
    return { code: 2004, message: '护理人员不存在', data: null }
  }

  caregiver.serviceAreas = body.areas
  caregivers.set(caregiver.caregiverId, caregiver)

  return {
    code: 0,
    message: '更新成功',
    data: {
      serviceAreas: caregiver.serviceAreas,
    },
  }
})

// ========== 9. 获取排班信息 ==========
Mock.mock(/\/api\/v1\/caregivers\/schedule/, 'get', (options) => {
  console.log(`[Mock] 获取排班信息`)

  const caregiver = caregivers.get(50002)

  return {
    code: 0,
    message: 'success',
    data: {
      list: caregiver.schedule,
    },
  }
})

// ========== 10. 更新排班状态 ==========
Mock.mock(/\/api\/v1\/caregivers\/schedule/, 'patch', (options) => {
  const body = JSON.parse(options.body)
  console.log(`[Mock] 更新排班状态 → 日期: ${body.date}，状态: ${body.status}`)

  const caregiver = caregivers.get(50002)
  if (!caregiver) {
    return { code: 2004, message: '护理人员不存在', data: null }
  }

  // 查找并更新排班
  const scheduleIndex = caregiver.schedule.findIndex(s => s.date === body.date)
  if (scheduleIndex !== -1) {
    caregiver.schedule[scheduleIndex].status = body.status
  } else {
    caregiver.schedule.push({ date: body.date, status: body.status })
  }

  caregivers.set(caregiver.caregiverId, caregiver)

  return {
    code: 0,
    message: '更新成功',
    data: {
      date: body.date,
      status: body.status,
    },
  }
})

// ========== 11. 设置可接单状态 ==========
Mock.mock(/\/api\/v1\/caregivers\/available/, 'patch', (options) => {
  const body = JSON.parse(options.body)
  console.log(`[Mock] 设置可接单状态 → 可接单: ${body.available}`)

  const caregiver = caregivers.get(50002)
  if (!caregiver) {
    return { code: 2004, message: '护理人员不存在', data: null }
  }

  caregiver.available = body.available
  caregivers.set(caregiver.caregiverId, caregiver)

  return {
    code: 0,
    message: '更新成功',
    data: {
      available: caregiver.available,
    },
  }
})

export default {
  caregivers,
}
/**
 * Mock — 商户模块（merchant-service）
 *
 * 覆盖 Person B 职责域：
 * - 商户入驻申请 / 资料管理
 * - 商户服务管理（CRUD + 审核 + 上下架）
 * - 商户护理人员管理
 * - 商户订单管理
 * - 派单管理
 */
import Mock from 'mockjs'

const Random = Mock.Random

// ========== 模拟数据存储 ==========
const merchants = new Map()
const merchantServices = new Map()
const merchantCaregivers = new Map()
const merchantOrders = new Map()
const dispatchRecords = new Map()
const merchantMembersStore = new Map()

// 全局自增 ID
let merchantIdSeq = 20001
let serviceIdSeq = 40001
let assignmentIdSeq = 60001

// ========== 预设商户数据 ==========
const presetMerchant = {
  merchantId: 20001,
  name: '康护佳护理服务有限公司',
  shortName: '康护佳',
  contactPhone: '13800138002',
  contactName: '张经理',
  businessLicense: 'https://cdn.nursing.com/mock/license_20001.jpg',
  licenseNo: '91310105MA1FL12X3K',
  address: '上海市浦东新区张江路168号',
  description: '康护佳致力于为家庭提供专业护理服务，拥有10年以上行业经验，覆盖居家护理、康复护理、母婴护理等多个领域。旗下护理人员均持证上岗，服务品质有保障。',
  auditStatus: 1, // 已通过
  auditOpinion: '资质齐全，准予入驻',
  status: 0,
  createTime: '2026-06-01T08:00:00+08:00',
  updateTime: '2026-07-10T14:30:00+08:00',
}
merchants.set(20001, presetMerchant)
merchantIdSeq = 20002

// 预设商户成员
merchantMembersStore.set(20001, [
  { memberId: 1, userId: 10003, merchantId: 20001, name: '张经理', phone: '138****8002', role: 'OWNER', status: 0, joinTime: '2026-06-01T08:00:00+08:00' },
  { memberId: 2, userId: 10004, merchantId: 20001, name: '李调度', phone: '138****8003', role: 'DISPATCHER', status: 0, joinTime: '2026-07-01T09:00:00+08:00' },
  { memberId: 3, userId: 10005, merchantId: 20001, name: '王运营', phone: '138****8005', role: 'OPERATOR', status: 0, joinTime: '2026-07-05T10:00:00+08:00' },
])

// ========== 预设商户服务数据 ==========
const presetServices = [
  {
    itemId: 40001, merchantId: 20001, categoryId: 1, categoryName: '居家护理',
    name: '术后伤口护理', description: '## 服务介绍\n\n专业护理人员上门为术后患者提供伤口换药、拆线、引流管护理等服务。\n\n## 服务内容\n- 伤口评估与换药\n- 拆线护理\n- 引流管维护\n- 康复指导',
    coverImage: 'https://cdn.nursing.com/mock/service_40001_cover.jpg',
    images: ['https://cdn.nursing.com/mock/service_40001_1.jpg', 'https://cdn.nursing.com/mock/service_40001_2.jpg'],
    serviceArea: '上海市浦东新区、徐汇区、静安区',
    specs: [
      { specId: 50001, name: '基础护理包', price: 19900, originalPrice: 25000, duration: 60, qualification: '护士执业证' },
      { specId: 50002, name: '全面护理包', price: 35800, originalPrice: 45000, duration: 90, qualification: '护师及以上' },
    ],
    qualifications: ['护士执业证', '伤口护理培训证书'],
    status: 4, // 已上架
    auditOpinion: '服务内容专业，准予上架',
    version: 2,
    createTime: '2026-07-01T10:00:00+08:00',
    updateTime: '2026-07-10T09:00:00+08:00',
  },
  {
    itemId: 40002, merchantId: 20001, categoryId: 1, categoryName: '居家护理',
    name: '压疮护理',
    description: '## 服务介绍\n\n针对长期卧床患者的压疮预防与护理服务，包含创面评估、清创换药、体位管理等。',
    coverImage: 'https://cdn.nursing.com/mock/service_40002_cover.jpg',
    images: [],
    serviceArea: '上海市浦东新区',
    specs: [
      { specId: 50003, name: '压疮评估+换药', price: 16800, originalPrice: 20000, duration: 45, qualification: '护士执业证' },
    ],
    qualifications: ['护士执业证', '伤口造口护理证书'],
    status: 4,
    auditOpinion: null,
    version: 1,
    createTime: '2026-07-05T14:00:00+08:00',
    updateTime: '2026-07-08T16:00:00+08:00',
  },
  {
    itemId: 40003, merchantId: 20001, categoryId: 2, categoryName: '康复护理',
    name: '脑卒中康复训练',
    description: '## 服务介绍\n\n由专业康复治疗师上门为脑卒中患者提供肢体功能训练、言语康复、日常生活能力训练。',
    coverImage: 'https://cdn.nursing.com/mock/service_40003_cover.jpg',
    images: ['https://cdn.nursing.com/mock/service_40003_1.jpg'],
    serviceArea: '上海市全区',
    specs: [
      { specId: 50004, name: '单次康复训练', price: 29800, originalPrice: 35000, duration: 60, qualification: '康复治疗师证' },
    ],
    qualifications: ['康复治疗师证', '神经康复培训证书'],
    status: 1, // 待审核
    auditOpinion: null,
    version: 1,
    createTime: '2026-07-12T08:00:00+08:00',
    updateTime: '2026-07-12T08:00:00+08:00',
  },
  {
    itemId: 40004, merchantId: 20001, categoryId: 3, categoryName: '母婴护理',
    name: '产后康复护理',
    description: '## 服务介绍\n\n专业产后康复师上门提供盆底肌修复、腹直肌分离修复、乳腺疏通等服务。',
    coverImage: 'https://cdn.nursing.com/mock/service_40004_cover.jpg',
    images: [],
    serviceArea: '上海市浦东新区、徐汇区',
    specs: [
      { specId: 50005, name: '盆底肌修复', price: 38800, originalPrice: 45000, duration: 60, qualification: '产后康复师证' },
      { specId: 50006, name: '乳腺疏通', price: 25800, originalPrice: 30000, duration: 45, qualification: '催乳师证' },
    ],
    qualifications: ['产后康复师证', '催乳师证'],
    status: 0, // 草稿
    auditOpinion: null,
    version: 1,
    createTime: '2026-07-14T11:00:00+08:00',
    updateTime: '2026-07-14T11:00:00+08:00',
  },
  {
    itemId: 40005, merchantId: 20001, categoryId: 1, categoryName: '居家护理',
    name: '糖尿病足护理',
    description: '糖尿病足专项护理',
    coverImage: '',
    images: [],
    serviceArea: '上海市浦东新区',
    specs: [
      { specId: 50007, name: '基础护理', price: 15000, originalPrice: 18000, duration: 45, qualification: '护士执业证' },
    ],
    qualifications: ['护士执业证', '糖尿病足护理培训'],
    status: 3, // 已驳回
    auditOpinion: '服务介绍过于简单，请补充详细服务内容、注意事项和禁忌症说明',
    version: 1,
    createTime: '2026-07-13T09:00:00+08:00',
    updateTime: '2026-07-13T15:00:00+08:00',
  },
]
presetServices.forEach((s) => {
  merchantServices.set(s.itemId, s)
})
serviceIdSeq = 40006

// ========== 预设护理人员数据 ==========
const presetCaregivers = [
  {
    caregiverId: 50001, merchantId: 20001, name: '李护士', phone: '138****8004',
    gender: 1, age: 32, avatar: '',
    skills: ['伤口护理', '压疮护理', '导管护理'],
    serviceArea: '上海市浦东新区',
    qualifications: [
      { name: '护士执业证', certNo: '20193210001', issuer: '上海市卫生健康委员会', validUntil: '2028-12-31', status: 1 },
      { name: '伤口造口护理证书', certNo: 'WC2025001', issuer: '中华护理学会', validUntil: '2027-06-30', status: 1 },
    ],
    schedule: { mode: 'available', leaveUntil: null },
    status: 0, // 在职
    currentTaskCount: 1,
    totalServiceCount: 128,
    avgRating: 4.8,
    joinTime: '2026-06-15T08:00:00+08:00',
  },
  {
    caregiverId: 50002, merchantId: 20001, name: '王护理师', phone: '138****8006',
    gender: 0, age: 28, avatar: '',
    skills: ['产后康复', '乳腺疏通', '新生儿护理'],
    serviceArea: '上海市徐汇区、静安区',
    qualifications: [
      { name: '护士执业证', certNo: '20223210002', issuer: '上海市卫生健康委员会', validUntil: '2027-12-31', status: 1 },
      { name: '产后康复师证', certNo: 'PP2026001', issuer: '中国妇幼保健协会', validUntil: '2028-03-31', status: 1 },
      { name: '催乳师证', certNo: 'LC2026001', issuer: '中国妇幼保健协会', validUntil: '2028-03-31', status: 1 },
    ],
    schedule: { mode: 'leave', leaveUntil: '2026-07-20T00:00:00+08:00' },
    status: 0, // 在职
    currentTaskCount: 0,
    totalServiceCount: 86,
    avgRating: 4.9,
    joinTime: '2026-07-01T08:00:00+08:00',
  },
  {
    caregiverId: 50003, merchantId: 20001, name: '赵康复师', phone: '138****8007',
    gender: 1, age: 35, avatar: '',
    skills: ['康复训练', '运动疗法', '作业治疗'],
    serviceArea: '上海市全区',
    qualifications: [
      { name: '康复治疗师证', certNo: 'KF2025001', issuer: '上海市卫生健康委员会', validUntil: '2029-06-30', status: 1 },
      { name: '神经康复培训证书', certNo: 'SN2025001', issuer: '中国康复医学会', validUntil: '2027-12-31', status: 1 },
    ],
    schedule: { mode: 'available', leaveUntil: null },
    status: 0, // 在职
    currentTaskCount: 0,
    totalServiceCount: 56,
    avgRating: 4.7,
    joinTime: '2026-06-20T08:00:00+08:00',
  },
  {
    caregiverId: 50004, merchantId: 20001, name: '孙护士', phone: '138****8008',
    gender: 0, age: 26, avatar: '',
    skills: ['基础护理', '静脉采血', '生命体征监测'],
    serviceArea: '上海市浦东新区',
    qualifications: [
      { name: '护士执业证', certNo: '20233210004', issuer: '上海市卫生健康委员会', validUntil: '2028-12-31', status: 1 },
    ],
    schedule: { mode: 'available', leaveUntil: null },
    status: 0, // 在职
    currentTaskCount: 2,
    totalServiceCount: 42,
    avgRating: 4.5,
    joinTime: '2026-07-10T08:00:00+08:00',
  },
  {
    caregiverId: 50005, merchantId: 20001, name: '周护师', phone: '138****8009',
    gender: 0, age: 30, avatar: '',
    skills: ['老年护理', '慢病管理', '用药指导'],
    serviceArea: '上海市浦东新区、徐汇区',
    qualifications: [
      { name: '护师执业证', certNo: '20213210005', issuer: '上海市卫生健康委员会', validUntil: '2029-12-31', status: 1 },
      { name: '老年护理培训证书', certNo: 'GC2026001', issuer: '中华护理学会', validUntil: '2026-12-31', status: 3 }, // 即将过期
    ],
    schedule: { mode: 'available', leaveUntil: null },
    status: 1, // 已停用
    currentTaskCount: 0,
    totalServiceCount: 95,
    avgRating: 4.6,
    joinTime: '2026-05-01T08:00:00+08:00',
  },
]
presetCaregivers.forEach((c) => {
  merchantCaregivers.set(c.caregiverId, c)
})

// ========== 预设商户订单数据 ==========
const presetMerchantOrders = [
  {
    orderId: 30001, orderNo: 'N202607150001', merchantId: 20001,
    customerName: '测试用户', customerPhone: '138****8000',
    serviceItemName: '术后伤口护理', specName: '全面护理包',
    totalAmount: 35800, paidAmount: 35800,
    serviceDate: '2026-07-20', serviceTimeSlot: 'MORNING',
    addressDetail: '上海市浦东新区张江高科技园区博云路2号 3楼301室',
    orderStatus: 'WAITING_DISPATCH', paymentStatus: 'PAID', dispatchStatus: 'UNASSIGNED',
    caregiverId: null, caregiverName: null,
    remark: '患者刚做完腿部手术，需要专业伤口护理',
    createTime: '2026-07-15T08:30:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '测试用户', eventTime: '2026-07-15T08:30:00+08:00', remark: '订单已创建' },
      { eventType: 'PAYMENT_COMPLETED', operatorType: 'CUSTOMER', operatorName: '测试用户', eventTime: '2026-07-15T08:31:00+08:00', remark: '已支付 ¥358.00' },
    ],
  },
  {
    orderId: 30002, orderNo: 'N202607150002', merchantId: 20001,
    customerName: '赵女士', customerPhone: '139****9001',
    serviceItemName: '压疮护理', specName: '压疮评估+换药',
    totalAmount: 16800, paidAmount: 16800,
    serviceDate: '2026-07-18', serviceTimeSlot: 'AFTERNOON',
    addressDetail: '上海市浦东新区花木路500弄 12号602室',
    orderStatus: 'WAITING_SERVICE', paymentStatus: 'PAID', dispatchStatus: 'WAITING_ACCEPT',
    caregiverId: 50001, caregiverName: '李护士',
    remark: '长期卧床患者，需要定期压疮护理',
    createTime: '2026-07-15T09:00:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '赵女士', eventTime: '2026-07-15T09:00:00+08:00', remark: '订单已创建' },
      { eventType: 'PAYMENT_COMPLETED', operatorType: 'CUSTOMER', operatorName: '赵女士', eventTime: '2026-07-15T09:02:00+08:00', remark: '已支付 ¥168.00' },
      { eventType: 'DISPATCHED', operatorType: 'MERCHANT', operatorName: '张经理', eventTime: '2026-07-15T09:10:00+08:00', remark: '已派单给李护士' },
    ],
  },
  {
    orderId: 30003, orderNo: 'N202607140003', merchantId: 20001,
    customerName: '钱先生', customerPhone: '137****9002',
    serviceItemName: '术后伤口护理', specName: '基础护理包',
    totalAmount: 19900, paidAmount: 19900,
    serviceDate: '2026-07-16', serviceTimeSlot: 'MORNING',
    addressDetail: '上海市静安区南京西路1266号 恒隆广场8楼',
    orderStatus: 'WAITING_SERVICE', paymentStatus: 'PAID', dispatchStatus: 'ACCEPTED',
    caregiverId: 50004, caregiverName: '孙护士',
    remark: '',
    createTime: '2026-07-14T10:00:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '钱先生', eventTime: '2026-07-14T10:00:00+08:00', remark: '订单已创建' },
      { eventType: 'PAYMENT_COMPLETED', operatorType: 'CUSTOMER', operatorName: '钱先生', eventTime: '2026-07-14T10:05:00+08:00', remark: '已支付 ¥199.00' },
      { eventType: 'DISPATCHED', operatorType: 'MERCHANT', operatorName: '李调度', eventTime: '2026-07-14T10:30:00+08:00', remark: '已派单给孙护士' },
      { eventType: 'CAREGIVER_ACCEPTED', operatorType: 'CAREGIVER', operatorName: '孙护士', eventTime: '2026-07-14T10:35:00+08:00', remark: '护理人员已接单' },
    ],
  },
  {
    orderId: 30004, orderNo: 'N202607140004', merchantId: 20001,
    customerName: '测试用户', customerPhone: '138****8000',
    serviceItemName: '压疮护理', specName: '压疮评估+换药',
    totalAmount: 16800, paidAmount: 16800,
    serviceDate: '2026-07-17', serviceTimeSlot: 'EVENING',
    addressDetail: '上海市浦东新区碧波路690号 2号楼5层',
    orderStatus: 'WAITING_DISPATCH', paymentStatus: 'PAID', dispatchStatus: 'REJECTED',
    caregiverId: null, caregiverName: null,
    remark: '',
    createTime: '2026-07-14T14:00:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '测试用户', eventTime: '2026-07-14T14:00:00+08:00', remark: '订单已创建' },
      { eventType: 'PAYMENT_COMPLETED', operatorType: 'CUSTOMER', operatorName: '测试用户', eventTime: '2026-07-14T14:02:00+08:00', remark: '已支付 ¥168.00' },
      { eventType: 'DISPATCHED', operatorType: 'MERCHANT', operatorName: '李调度', eventTime: '2026-07-14T14:10:00+08:00', remark: '已派单给王护理师' },
      { eventType: 'CAREGIVER_REJECTED', operatorType: 'CAREGIVER', operatorName: '王护理师', eventTime: '2026-07-14T14:15:00+08:00', remark: '拒绝原因：当日已有其他排班，无法安排时间' },
    ],
  },
  {
    orderId: 30005, orderNo: 'N202607130005', merchantId: 20001,
    customerName: '孙爷爷', customerPhone: '136****9003',
    serviceItemName: '术后伤口护理', specName: '全面护理包',
    totalAmount: 35800, paidAmount: 35800,
    serviceDate: '2026-07-15', serviceTimeSlot: 'MORNING',
    addressDetail: '上海市浦东新区张江路368号 11号楼203',
    orderStatus: 'IN_SERVICE', paymentStatus: 'PAID', dispatchStatus: 'ACCEPTED',
    caregiverId: 50001, caregiverName: '李护士',
    remark: '老人行动不便，需要耐心',
    createTime: '2026-07-13T08:00:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '孙爷爷', eventTime: '2026-07-13T08:00:00+08:00', remark: '订单已创建' },
      { eventType: 'PAYMENT_COMPLETED', operatorType: 'CUSTOMER', operatorName: '孙爷爷', eventTime: '2026-07-13T08:15:00+08:00', remark: '已支付 ¥358.00' },
      { eventType: 'DISPATCHED', operatorType: 'MERCHANT', operatorName: '张经理', eventTime: '2026-07-13T09:00:00+08:00', remark: '已派单给李护士' },
      { eventType: 'CAREGIVER_ACCEPTED', operatorType: 'CAREGIVER', operatorName: '李护士', eventTime: '2026-07-13T09:10:00+08:00', remark: '护理人员已接单' },
      { eventType: 'CAREGIVER_DEPARTED', operatorType: 'CAREGIVER', operatorName: '李护士', eventTime: '2026-07-15T08:30:00+08:00', remark: '已出发' },
      { eventType: 'CAREGIVER_CHECKED_IN', operatorType: 'CAREGIVER', operatorName: '李护士', eventTime: '2026-07-15T08:55:00+08:00', remark: '已到达签到' },
      { eventType: 'SERVICE_STARTED', operatorType: 'CAREGIVER', operatorName: '李护士', eventTime: '2026-07-15T09:00:00+08:00', remark: '开始服务' },
    ],
  },
  {
    orderId: 30006, orderNo: 'N202607120006', merchantId: 20001,
    customerName: '李阿姨', customerPhone: '135****9004',
    serviceItemName: '压疮护理', specName: '压疮评估+换药',
    totalAmount: 16800, paidAmount: 16800,
    serviceDate: '2026-07-13', serviceTimeSlot: 'AFTERNOON',
    addressDetail: '上海市徐汇区漕溪北路595号 上海体育馆附近',
    orderStatus: 'WAITING_CONFIRM', paymentStatus: 'PAID', dispatchStatus: 'ACCEPTED',
    caregiverId: 50004, caregiverName: '孙护士',
    remark: '',
    createTime: '2026-07-12T16:00:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '李阿姨', eventTime: '2026-07-12T16:00:00+08:00', remark: '订单已创建' },
      { eventType: 'PAYMENT_COMPLETED', operatorType: 'CUSTOMER', operatorName: '李阿姨', eventTime: '2026-07-12T16:05:00+08:00', remark: '已支付 ¥168.00' },
      { eventType: 'DISPATCHED', operatorType: 'MERCHANT', operatorName: '李调度', eventTime: '2026-07-12T16:20:00+08:00', remark: '已派单给孙护士' },
      { eventType: 'CAREGIVER_ACCEPTED', operatorType: 'CAREGIVER', operatorName: '孙护士', eventTime: '2026-07-12T16:25:00+08:00', remark: '已接单' },
      { eventType: 'CAREGIVER_DEPARTED', operatorType: 'CAREGIVER', operatorName: '孙护士', eventTime: '2026-07-13T13:30:00+08:00', remark: '已出发' },
      { eventType: 'CAREGIVER_CHECKED_IN', operatorType: 'CAREGIVER', operatorName: '孙护士', eventTime: '2026-07-13T13:55:00+08:00', remark: '已到达签到' },
      { eventType: 'SERVICE_STARTED', operatorType: 'CAREGIVER', operatorName: '孙护士', eventTime: '2026-07-13T14:00:00+08:00', remark: '开始服务' },
      { eventType: 'SERVICE_FINISHED', operatorType: 'CAREGIVER', operatorName: '孙护士', eventTime: '2026-07-13T14:50:00+08:00', remark: '服务记录已提交' },
    ],
  },
  {
    orderId: 30007, orderNo: 'N202607100007', merchantId: 20001,
    customerName: '周先生', customerPhone: '134****9005',
    serviceItemName: '术后伤口护理', specName: '基础护理包',
    totalAmount: 19900, paidAmount: 19900,
    serviceDate: '2026-07-11', serviceTimeSlot: 'MORNING',
    addressDetail: '上海市静安区愚园路168号',
    orderStatus: 'COMPLETED', paymentStatus: 'PAID', dispatchStatus: 'ACCEPTED',
    caregiverId: 50001, caregiverName: '李护士',
    remark: '',
    createTime: '2026-07-10T10:00:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '周先生', eventTime: '2026-07-10T10:00:00+08:00', remark: '订单已创建' },
      { eventType: 'PAYMENT_COMPLETED', operatorType: 'CUSTOMER', operatorName: '周先生', eventTime: '2026-07-10T10:03:00+08:00', remark: '已支付 ¥199.00' },
      { eventType: 'DISPATCHED', operatorType: 'MERCHANT', operatorName: '张经理', eventTime: '2026-07-10T11:00:00+08:00', remark: '已派单给李护士' },
      { eventType: 'CAREGIVER_ACCEPTED', operatorType: 'CAREGIVER', operatorName: '李护士', eventTime: '2026-07-10T11:10:00+08:00', remark: '已接单' },
      { eventType: 'CAREGIVER_DEPARTED', operatorType: 'CAREGIVER', operatorName: '李护士', eventTime: '2026-07-11T08:30:00+08:00', remark: '已出发' },
      { eventType: 'SERVICE_FINISHED', operatorType: 'CAREGIVER', operatorName: '李护士', eventTime: '2026-07-11T09:30:00+08:00', remark: '服务完成' },
      { eventType: 'CUSTOMER_CONFIRMED', operatorType: 'CUSTOMER', operatorName: '周先生', eventTime: '2026-07-11T10:00:00+08:00', remark: '已确认完成' },
    ],
  },
  {
    orderId: 30008, orderNo: 'N202607090008', merchantId: 20001,
    customerName: '吴女士', customerPhone: '133****9006',
    serviceItemName: '压疮护理', specName: '压疮评估+换药',
    totalAmount: 16800, paidAmount: 16800,
    serviceDate: '2026-07-12', serviceTimeSlot: 'AFTERNOON',
    addressDetail: '上海市浦东新区杨高南路1998号',
    orderStatus: 'COMPLETED', paymentStatus: 'PAID', dispatchStatus: 'ACCEPTED',
    caregiverId: 50003, caregiverName: '赵康复师',
    remark: '需要一次评估看是否需要康复训练',
    createTime: '2026-07-09T09:00:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '吴女士', eventTime: '2026-07-09T09:00:00+08:00', remark: '订单已创建' },
      { eventType: 'PAYMENT_COMPLETED', operatorType: 'CUSTOMER', operatorName: '吴女士', eventTime: '2026-07-09T09:05:00+08:00', remark: '已支付 ¥168.00' },
      { eventType: 'DISPATCHED', operatorType: 'MERCHANT', operatorName: '李调度', eventTime: '2026-07-09T10:00:00+08:00', remark: '已派单给赵康复师' },
      { eventType: 'CAREGIVER_ACCEPTED', operatorType: 'CAREGIVER', operatorName: '赵康复师', eventTime: '2026-07-09T10:20:00+08:00', remark: '已接单' },
      { eventType: 'SERVICE_FINISHED', operatorType: 'CAREGIVER', operatorName: '赵康复师', eventTime: '2026-07-12T14:30:00+08:00', remark: '服务完成' },
      { eventType: 'CUSTOMER_CONFIRMED', operatorType: 'CUSTOMER', operatorName: '吴女士', eventTime: '2026-07-12T15:00:00+08:00', remark: '已确认完成' },
    ],
  },
  {
    orderId: 30009, orderNo: 'N202607080009', merchantId: 20001,
    customerName: '郑老先生', customerPhone: '132****9007',
    serviceItemName: '术后伤口护理', specName: '全面护理包',
    totalAmount: 35800, paidAmount: 0,
    serviceDate: '2026-07-19', serviceTimeSlot: 'MORNING',
    addressDetail: '上海市浦东新区碧云路299号',
    orderStatus: 'CREATED', paymentStatus: 'UNPAID', dispatchStatus: 'UNASSIGNED',
    caregiverId: null, caregiverName: null,
    remark: '',
    createTime: '2026-07-08T11:00:00+08:00',
    events: [
      { eventType: 'ORDER_CREATED', operatorType: 'CUSTOMER', operatorName: '郑老先生', eventTime: '2026-07-08T11:00:00+08:00', remark: '订单已创建' },
    ],
  },
]
presetMerchantOrders.forEach((o) => {
  merchantOrders.set(o.orderId, o)
})

// ========== 预设派单记录 ==========
dispatchRecords.set(30002, [
  { assignmentId: 60001, orderId: 30002, merchantId: 20001, caregiverId: 50001, caregiverName: '李护士', status: 'WAITING_ACCEPT', assignedAt: '2026-07-15T09:10:00+08:00', acceptDeadline: '2026-07-15T09:20:00+08:00', rejectReason: null },
])
dispatchRecords.set(30003, [
  { assignmentId: 60002, orderId: 30003, merchantId: 20001, caregiverId: 50004, caregiverName: '孙护士', status: 'ACCEPTED', assignedAt: '2026-07-14T10:30:00+08:00', acceptDeadline: '2026-07-14T10:40:00+08:00', rejectReason: null },
])
dispatchRecords.set(30004, [
  { assignmentId: 60003, orderId: 30004, merchantId: 20001, caregiverId: 50002, caregiverName: '王护理师', status: 'REJECTED', assignedAt: '2026-07-14T14:10:00+08:00', acceptDeadline: '2026-07-14T14:20:00+08:00', rejectReason: '当日已有其他排班，无法安排时间' },
])
dispatchRecords.set(30005, [
  { assignmentId: 60004, orderId: 30005, merchantId: 20001, caregiverId: 50001, caregiverName: '李护士', status: 'ACCEPTED', assignedAt: '2026-07-13T09:00:00+08:00', acceptDeadline: '2026-07-13T09:10:00+08:00', rejectReason: null },
])
dispatchRecords.set(30006, [
  { assignmentId: 60005, orderId: 30006, merchantId: 20001, caregiverId: 50004, caregiverName: '孙护士', status: 'ACCEPTED', assignedAt: '2026-07-12T16:20:00+08:00', acceptDeadline: '2026-07-12T16:30:00+08:00', rejectReason: null },
])
dispatchRecords.set(30007, [
  { assignmentId: 60006, orderId: 30007, merchantId: 20001, caregiverId: 50001, caregiverName: '李护士', status: 'ACCEPTED', assignedAt: '2026-07-10T11:00:00+08:00', acceptDeadline: '2026-07-10T11:10:00+08:00', rejectReason: null },
])
dispatchRecords.set(30008, [
  { assignmentId: 60007, orderId: 30008, merchantId: 20001, caregiverId: 50003, caregiverName: '赵康复师', status: 'ACCEPTED', assignedAt: '2026-07-09T10:00:00+08:00', acceptDeadline: '2026-07-09T10:10:00+08:00', rejectReason: null },
])

// ========== 工具函数 ==========
function getTokenUserId(options) {
  const auth = options.headers?.Authorization || ''
  const token = auth.replace('Bearer ', '')
  const match = token.match(/mock_jwt_(\d+)/)
  return match ? parseInt(match[1]) : 10001
}

function getMyMerchant(userId) {
  // 商户账号（13800138002）返回预设商户
  for (const m of merchants.values()) {
    const members = merchantMembersStore.get(m.merchantId) || []
    if (members.some((mb) => mb.userId === userId)) return m
  }
  return null
}

// ============================================================
// 1. 获取我的商户信息
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my$/, 'get', (options) => {
  const userId = getTokenUserId(options)
  const merchant = getMyMerchant(userId)
  if (!merchant) {
    return { code: 1005, message: '未找到商户信息', data: null }
  }
  return { code: 0, message: 'success', data: { ...merchant } }
})

// ============================================================
// 2. 提交商户入驻申请
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/apply$/, 'post', (options) => {
  const body = JSON.parse(options.body || '{}')
  const { name, shortName, contactPhone, contactName, businessLicense, licenseNo, address, description } = body
  if (!name || !contactPhone || !contactName) {
    return { code: 1000, message: '商户名称、联系电话和联系人姓名为必填项', data: null }
  }
  if (!businessLicense) {
    return { code: 1000, message: '请上传营业执照', data: null }
  }
  const newMerchant = {
    merchantId: merchantIdSeq++,
    name,
    shortName: shortName || name,
    contactPhone,
    contactName,
    businessLicense,
    licenseNo: licenseNo || '',
    address: address || '',
    description: description || '',
    auditStatus: 0, // 审核中
    auditOpinion: null,
    status: 0,
    createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    updateTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
  }
  merchants.set(newMerchant.merchantId, newMerchant)
  merchantMembersStore.set(newMerchant.merchantId, [])
  console.log(`[Mock] 商户入驻申请已提交: ${name} → merchantId=${newMerchant.merchantId}`)
  return { code: 0, message: '申请已提交，请等待审核', data: { merchantId: newMerchant.merchantId, auditStatus: 0 } }
})

// ============================================================
// 2b. 重新提交申请（PUT）
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/apply$/, 'put', (options) => {
  const userId = getTokenUserId(options)
  const merchant = getMyMerchant(userId)
  if (!merchant) {
    return { code: 1005, message: '未找到商户信息', data: null }
  }
  if (merchant.auditStatus !== 2) {
    return { code: 1007, message: '仅驳回状态可重新提交', data: null }
  }
  const body = JSON.parse(options.body || '{}')
  Object.assign(merchant, body, {
    auditStatus: 0,
    auditOpinion: null,
    updateTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
  })
  console.log(`[Mock] 商户申请已重新提交: ${merchant.name}`)
  return { code: 0, message: '申请已重新提交', data: { merchantId: merchant.merchantId, auditStatus: 0 } }
})

// ============================================================
// 3. 更新商户资料
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my$/, 'patch', (options) => {
  const userId = getTokenUserId(options)
  const merchant = getMyMerchant(userId)
  if (!merchant) {
    return { code: 1005, message: '未找到商户信息', data: null }
  }
  const body = JSON.parse(options.body || '{}')
  const updatable = ['name', 'shortName', 'contactPhone', 'contactName', 'address', 'description', 'businessLicense', 'licenseNo']
  updatable.forEach((k) => {
    if (body[k] !== undefined) merchant[k] = body[k]
  })
  merchant.updateTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  console.log(`[Mock] 商户资料已更新: ${merchant.name}`)
  return { code: 0, message: '修改成功', data: { ...merchant } }
})

// ============================================================
// 4. 商户服务列表
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/items$/, 'get', (options) => {
  const userId = getTokenUserId(options)
  const merchant = getMyMerchant(userId)
  if (!merchant) {
    return { code: 1005, message: '未找到商户信息', data: null }
  }
  // 解析查询参数
  const urlParams = new URLSearchParams(options.url.split('?')[1] || '')
  const status = urlParams.get('status')
  const keyword = urlParams.get('keyword')?.toLowerCase()
  const page = parseInt(urlParams.get('page') || '1')
  const size = parseInt(urlParams.get('size') || '20')

  let list = Array.from(merchantServices.values()).filter((s) => s.merchantId === merchant.merchantId)
  if (status !== null && status !== undefined && status !== '') {
    list = list.filter((s) => s.status === parseInt(status))
  }
  if (keyword) {
    list = list.filter((s) => s.name.toLowerCase().includes(keyword) || (s.description || '').toLowerCase().includes(keyword))
  }
  const total = list.length
  const start = (page - 1) * size
  const paginated = list.slice(start, start + size)
  return { code: 0, message: 'success', data: { list: paginated, total, page, size } }
})

// ============================================================
// 5. 商户服务详情
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/items\/(\d+)$/, 'get', (options) => {
  const itemId = parseInt(options.url.match(/\/items\/(\d+)/)[1])
  const service = merchantServices.get(itemId)
  if (!service) {
    return { code: 1005, message: '服务不存在', data: null }
  }
  return { code: 0, message: 'success', data: { ...service } }
})

// ============================================================
// 6. 保存服务草稿（POST 新建 / PUT 编辑）
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/items(\/(\d+))?$/, 'post', (options) => {
  const userId = getTokenUserId(options)
  const merchant = getMyMerchant(userId)
  if (!merchant) {
    return { code: 1005, message: '未找到商户信息', data: null }
  }
  const body = JSON.parse(options.body || '{}')
  const newService = {
    itemId: serviceIdSeq++,
    merchantId: merchant.merchantId,
    categoryId: body.categoryId || null,
    categoryName: body.categoryId === 1 ? '居家护理' : body.categoryId === 2 ? '康复护理' : body.categoryId === 3 ? '母婴护理' : '',
    name: body.name || '',
    description: body.description || '',
    coverImage: body.coverImage || '',
    images: body.images || [],
    serviceArea: body.serviceArea || '',
    specs: (body.specs || []).map((s, i) => ({ ...s, specId: s.specId || (50010 + i) })),
    qualifications: body.qualifications || [],
    status: 0, // 草稿
    auditOpinion: null,
    version: 1,
    createTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    updateTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
  }
  merchantServices.set(newService.itemId, newService)
  console.log(`[Mock] 服务草稿已保存: ${newService.name} → itemId=${newService.itemId}`)
  return { code: 0, message: '保存成功', data: { itemId: newService.itemId, status: newService.status } }
})

Mock.mock(/\/api\/v1\/merchants\/my\/items\/(\d+)$/, 'put', (options) => {
  const itemId = parseInt(options.url.match(/\/items\/(\d+)/)[1])
  const service = merchantServices.get(itemId)
  if (!service) {
    return { code: 1005, message: '服务不存在', data: null }
  }
  const body = JSON.parse(options.body || '{}')
  const updatable = ['categoryId', 'name', 'description', 'coverImage', 'images', 'serviceArea', 'specs', 'qualifications']
  updatable.forEach((k) => {
    if (body[k] !== undefined) service[k] = body[k]
  })
  service.version = (service.version || 1) + 1
  service.updateTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  console.log(`[Mock] 服务草稿已更新: ${service.name}`)
  return { code: 0, message: '更新成功', data: { itemId: service.itemId, status: service.status } }
})

// ============================================================
// 7. 提交服务审核
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/items\/(\d+)\/submit/, 'post', (options) => {
  const itemId = parseInt(options.url.match(/\/items\/(\d+)\/submit/)[1])
  const service = merchantServices.get(itemId)
  if (!service) {
    return { code: 1005, message: '服务不存在', data: null }
  }
  if (service.status !== 0 && service.status !== 3) {
    return { code: 1007, message: '仅草稿或驳回状态可提交审核', data: null }
  }
  if (!service.name || !service.description || !service.serviceArea || !service.specs?.length) {
    return { code: 1000, message: '请完善服务信息后再提交审核', data: null }
  }
  service.status = 1 // 待审核
  service.auditOpinion = null
  service.updateTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  console.log(`[Mock] 服务已提交审核: ${service.name}`)
  return { code: 0, message: '已提交审核', data: { itemId, status: 1 } }
})

// ============================================================
// 8. 上架服务
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/items\/(\d+)\/list/, 'post', (options) => {
  const itemId = parseInt(options.url.match(/\/items\/(\d+)\/list/)[1])
  const service = merchantServices.get(itemId)
  if (!service) return { code: 1005, message: '服务不存在', data: null }
  if (service.status !== 2) return { code: 1007, message: '仅审核通过状态可上架', data: null }
  service.status = 4
  service.updateTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  console.log(`[Mock] 服务已上架: ${service.name}`)
  return { code: 0, message: '上架成功', data: { itemId, status: 4 } }
})

// ============================================================
// 9. 下架服务
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/items\/(\d+)\/unlist/, 'post', (options) => {
  const itemId = parseInt(options.url.match(/\/items\/(\d+)\/unlist/)[1])
  const service = merchantServices.get(itemId)
  if (!service) return { code: 1005, message: '服务不存在', data: null }
  if (service.status !== 4) return { code: 1007, message: '仅已上架状态可下架', data: null }
  service.status = 5
  service.updateTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00')
  console.log(`[Mock] 服务已下架: ${service.name}`)
  return { code: 0, message: '下架成功', data: { itemId, status: 5 } }
})

// ============================================================
// 10. 护理人员列表
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/caregivers$/, 'get', (options) => {
  const userId = getTokenUserId(options)
  const merchant = getMyMerchant(userId)
  if (!merchant) return { code: 1005, message: '未找到商户信息', data: null }
  const urlParams = new URLSearchParams(options.url.split('?')[1] || '')
  const status = urlParams.get('status')
  const keyword = urlParams.get('keyword')?.toLowerCase()
  const page = parseInt(urlParams.get('page') || '1')
  const size = parseInt(urlParams.get('size') || '20')

  let list = Array.from(merchantCaregivers.values()).filter((c) => c.merchantId === merchant.merchantId)
  if (status !== null && status !== undefined && status !== '') {
    list = list.filter((c) => c.status === parseInt(status))
  }
  if (keyword) {
    list = list.filter((c) => c.name.toLowerCase().includes(keyword) || c.skills.some((s) => s.includes(keyword)))
  }
  const total = list.length
  const start = (page - 1) * size
  const paginated = list.slice(start, start + size)
  return { code: 0, message: 'success', data: { list: paginated, total, page, size } }
})

// ============================================================
// 11. 护理人员详情
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/caregivers\/(\d+)$/, 'get', (options) => {
  const caregiverId = parseInt(options.url.match(/\/caregivers\/(\d+)/)[1])
  const caregiver = merchantCaregivers.get(caregiverId)
  if (!caregiver) return { code: 1005, message: '护理人员不存在', data: null }
  return { code: 0, message: 'success', data: { ...caregiver } }
})

// ============================================================
// 12. 邀请护理人员
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/caregivers\/invite/, 'post', (options) => {
  const { phone } = JSON.parse(options.body || '{}')
  if (!phone || !/^1\d{10}$/.test(phone)) {
    return { code: 1000, message: '手机号格式不正确', data: null }
  }
  console.log(`[Mock] 邀请护理人员: ${phone}`)
  return { code: 0, message: '邀请已发送', data: { inviteId: Date.now() } }
})

// ============================================================
// 13. 确认护理人员加入
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/caregivers\/(\d+)\/confirm/, 'post', (options) => {
  const caregiverId = parseInt(options.url.match(/\/caregivers\/(\d+)\/confirm/)[1])
  const caregiver = merchantCaregivers.get(caregiverId)
  if (!caregiver) return { code: 1005, message: '护理人员不存在', data: null }
  caregiver.status = 0
  console.log(`[Mock] 已确认护理人员加入: ${caregiver.name}`)
  return { code: 0, message: '已确认加入', data: { caregiverId } }
})

// ============================================================
// 14-16. 启用/停用/移出护理人员
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/caregivers\/(\d+)\/enable/, 'post', (options) => {
  const caregiverId = parseInt(options.url.match(/\/caregivers\/(\d+)\/enable/)[1])
  const c = merchantCaregivers.get(caregiverId)
  if (!c) return { code: 1005, message: '护理人员不存在', data: null }
  c.status = 0
  return { code: 0, message: '已启用', data: { caregiverId } }
})

Mock.mock(/\/api\/v1\/merchants\/my\/caregivers\/(\d+)\/disable/, 'post', (options) => {
  const caregiverId = parseInt(options.url.match(/\/caregivers\/(\d+)\/disable/)[1])
  const c = merchantCaregivers.get(caregiverId)
  if (!c) return { code: 1005, message: '护理人员不存在', data: null }
  c.status = 1
  return { code: 0, message: '已停用', data: { caregiverId } }
})

Mock.mock(/\/api\/v1\/merchants\/my\/caregivers\/(\d+)$/, 'delete', (options) => {
  const caregiverId = parseInt(options.url.match(/\/caregivers\/(\d+)/)[1])
  const c = merchantCaregivers.get(caregiverId)
  if (!c) return { code: 1005, message: '护理人员不存在', data: null }
  c.status = 2
  console.log(`[Mock] 护理人员已移出: ${c.name}`)
  return { code: 0, message: '已移出', data: { caregiverId } }
})

// ============================================================
// 17. 商户订单列表
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/orders$/, 'get', (options) => {
  const userId = getTokenUserId(options)
  const merchant = getMyMerchant(userId)
  if (!merchant) return { code: 1005, message: '未找到商户信息', data: null }
  const urlParams = new URLSearchParams(options.url.split('?')[1] || '')
  const status = urlParams.get('status')
  const dispatchStatus = urlParams.get('dispatchStatus')
  const keyword = urlParams.get('keyword')?.toLowerCase()
  const page = parseInt(urlParams.get('page') || '1')
  const size = parseInt(urlParams.get('size') || '20')

  let list = Array.from(merchantOrders.values()).filter((o) => o.merchantId === merchant.merchantId)
  if (status) list = list.filter((o) => o.orderStatus === status)
  if (dispatchStatus) list = list.filter((o) => o.dispatchStatus === dispatchStatus)
  if (keyword) list = list.filter((o) => o.orderNo.toLowerCase().includes(keyword) || o.customerName.includes(keyword) || o.serviceItemName.includes(keyword))

  // 按创建时间倒序
  list.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

  const total = list.length
  const start = (page - 1) * size
  const paginated = list.slice(start, start + size)

  const stats = {
    total,
    waitingDispatch: list.filter((o) => o.dispatchStatus === 'UNASSIGNED').length,
    waitingAccept: list.filter((o) => o.dispatchStatus === 'WAITING_ACCEPT').length,
    waitingService: list.filter((o) => o.orderStatus === 'WAITING_SERVICE' && o.dispatchStatus === 'ACCEPTED').length,
    inService: list.filter((o) => o.orderStatus === 'IN_SERVICE').length,
    abnormal: list.filter((o) => o.orderStatus === 'DISPUTED' || o.orderStatus === 'CLOSED').length,
  }

  return { code: 0, message: 'success', data: { list: paginated, total, page, size, stats } }
})

// ============================================================
// 18. 商户订单详情
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/orders\/(\d+)$/, 'get', (options) => {
  const orderId = parseInt(options.url.match(/\/orders\/(\d+)/)[1])
  const order = merchantOrders.get(orderId)
  if (!order) return { code: 1005, message: '订单不存在', data: null }
  const records = dispatchRecords.get(orderId) || []
  return { code: 0, message: 'success', data: { ...order, dispatchRecords: records } }
})

// ============================================================
// 19. 查询候选护理人员
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/orders\/(\d+)\/candidates/, 'get', (options) => {
  const orderId = parseInt(options.url.match(/\/orders\/(\d+)\/candidates/)[1])
  const order = merchantOrders.get(orderId)
  if (!order) return { code: 1005, message: '订单不存在', data: null }
  // 返回在职且非请假状态的护理人员，附匹配信息
  const candidates = Array.from(merchantCaregivers.values())
    .filter((c) => c.merchantId === order.merchantId && c.status === 0 && c.schedule?.mode !== 'leave')
    .map((c) => ({
      caregiverId: c.caregiverId,
      name: c.name,
      avatar: c.avatar,
      skills: c.skills,
      serviceArea: c.serviceArea,
      currentTaskCount: c.currentTaskCount,
      avgRating: c.avgRating,
      totalServiceCount: c.totalServiceCount,
      skillMatch: c.skills.some((s) => (order.serviceItemName || '').includes(s.replace('护理', '')) || s.includes(order.serviceItemName?.slice(0, 2) || '')),
      distance: Random.float(0.5, 5, 1, 1),
    }))
  // 技能匹配的排前面
  candidates.sort((a, b) => (b.skillMatch ? 1 : 0) - (a.skillMatch ? 1 : 0))
  return { code: 0, message: 'success', data: { candidates } }
})

// ============================================================
// 20. 派单
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/orders\/(\d+)\/dispatch$/, 'post', (options) => {
  const orderId = parseInt(options.url.match(/\/orders\/(\d+)\/dispatch/)[1])
  const order = merchantOrders.get(orderId)
  if (!order) return { code: 1005, message: '订单不存在', data: null }
  const { caregiverId } = JSON.parse(options.body || '{}')
  const caregiver = merchantCaregivers.get(caregiverId)
  if (!caregiver) return { code: 1005, message: '护理人员不存在', data: null }

  // 检查是否已有未完成的派单
  const existing = dispatchRecords.get(orderId) || []
  const active = existing.find((r) => r.status === 'WAITING_ACCEPT' || r.status === 'ACCEPTED')
  if (active) return { code: 1007, message: '该订单已有有效派单，请先取消后再重新派单', data: null }

  const assignment = {
    assignmentId: assignmentIdSeq++,
    orderId,
    merchantId: order.merchantId,
    caregiverId,
    caregiverName: caregiver.name,
    status: 'WAITING_ACCEPT',
    assignedAt: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    acceptDeadline: new Date(Date.now() + 10 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    rejectReason: null,
  }
  const records = dispatchRecords.get(orderId) || []
  records.push(assignment)
  dispatchRecords.set(orderId, records)

  // 更新订单状态
  order.dispatchStatus = 'WAITING_ACCEPT'
  order.caregiverId = caregiverId
  order.caregiverName = caregiver.name
  order.orderStatus = order.orderStatus === 'WAITING_DISPATCH' ? 'WAITING_SERVICE' : order.orderStatus
  order.events.push({
    eventType: 'DISPATCHED',
    operatorType: 'MERCHANT',
    operatorName: '商户调度',
    eventTime: assignment.assignedAt,
    remark: `已派单给${caregiver.name}`,
  })

  console.log(`[Mock] 派单成功: 订单${orderId} → ${caregiver.name}`)
  return { code: 0, message: '派单成功', data: { assignment } }
})

// ============================================================
// 21. 取消派单
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/orders\/(\d+)\/dispatch\/cancel/, 'post', (options) => {
  const orderId = parseInt(options.url.match(/\/orders\/(\d+)\/dispatch\/cancel/)[1])
  const order = merchantOrders.get(orderId)
  if (!order) return { code: 1005, message: '订单不存在', data: null }
  const { assignmentId } = JSON.parse(options.body || '{}')
  const records = dispatchRecords.get(orderId) || []
  const assignment = records.find((r) => r.assignmentId === assignmentId)
  if (!assignment) return { code: 1005, message: '派单记录不存在', data: null }
  if (assignment.status !== 'WAITING_ACCEPT') return { code: 1007, message: '仅等待接单状态可取消派单', data: null }

  assignment.status = 'CANCELED'
  order.dispatchStatus = 'UNASSIGNED'
  order.caregiverId = null
  order.caregiverName = null
  order.orderStatus = order.orderStatus === 'WAITING_SERVICE' ? 'WAITING_DISPATCH' : order.orderStatus
  order.events.push({
    eventType: 'DISPATCH_CANCELED',
    operatorType: 'MERCHANT',
    operatorName: '商户调度',
    eventTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    remark: '已取消派单',
  })
  console.log(`[Mock] 派单已取消: 订单${orderId}`)
  return { code: 0, message: '派单已取消', data: { assignmentId, status: 'CANCELED' } }
})

// ============================================================
// 22. 改派
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/orders\/(\d+)\/dispatch\/reassign/, 'post', (options) => {
  const orderId = parseInt(options.url.match(/\/orders\/(\d+)\/dispatch\/reassign/)[1])
  const order = merchantOrders.get(orderId)
  if (!order) return { code: 1005, message: '订单不存在', data: null }
  const { caregiverId } = JSON.parse(options.body || '{}')
  const caregiver = merchantCaregivers.get(caregiverId)
  if (!caregiver) return { code: 1005, message: '护理人员不存在', data: null }

  // 取消当前有效派单
  const records = dispatchRecords.get(orderId) || []
  const active = records.find((r) => r.status === 'WAITING_ACCEPT' || r.status === 'ACCEPTED')
  if (active) {
    active.status = 'CANCELED'
    order.events.push({
      eventType: 'DISPATCH_CANCELED',
      operatorType: 'MERCHANT',
      operatorName: '商户调度',
      eventTime: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
      remark: '改派：取消原派单',
    })
  }

  // 创建新派单
  const assignment = {
    assignmentId: assignmentIdSeq++,
    orderId,
    merchantId: order.merchantId,
    caregiverId,
    caregiverName: caregiver.name,
    status: 'WAITING_ACCEPT',
    assignedAt: new Date().toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    acceptDeadline: new Date(Date.now() + 10 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, '+08:00'),
    rejectReason: null,
  }
  records.push(assignment)
  dispatchRecords.set(orderId, records)

  order.dispatchStatus = 'WAITING_ACCEPT'
  order.caregiverId = caregiverId
  order.caregiverName = caregiver.name
  order.events.push({
    eventType: 'DISPATCHED',
    operatorType: 'MERCHANT',
    operatorName: '商户调度',
    eventTime: assignment.assignedAt,
    remark: `改派给${caregiver.name}`,
  })

  console.log(`[Mock] 改派成功: 订单${orderId} → ${caregiver.name}`)
  return { code: 0, message: '改派成功', data: { assignment } }
})

// ============================================================
// 23. 获取派单记录
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/orders\/(\d+)\/dispatch-records/, 'get', (options) => {
  const orderId = parseInt(options.url.match(/\/orders\/(\d+)\/dispatch-records/)[1])
  const records = dispatchRecords.get(orderId) || []
  return { code: 0, message: 'success', data: { records } }
})

// ============================================================
// 24. 商户成员列表
// ============================================================
Mock.mock(/\/api\/v1\/merchants\/my\/members/, 'get', (options) => {
  const userId = getTokenUserId(options)
  const merchant = getMyMerchant(userId)
  if (!merchant) return { code: 1005, message: '未找到商户信息', data: null }
  const members = merchantMembersStore.get(merchant.merchantId) || []
  return { code: 0, message: 'success', data: { list: members, total: members.length } }
})

console.log('[Mock] 商户模块已加载 (merchant-service v1.0)')

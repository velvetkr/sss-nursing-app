/**
 * Mock 数据入口 — 仅开发环境加载
 * 后端未就绪时模拟所有 API 响应
 *
 * 模块覆盖：
 * - user-service:     用户认证、个人信息、文件上传
 * - catalog-service:  服务分类、服务项目、搜索
 * - order-service:    订单、地址、支付
 * - feedback-service: 评价、投诉
 * - caregiver-service: 护理人员认证、档案、技能、排班 (Person C)
 * - work-order-service: 护理工作单、接单、履约 (Person C)
 * - admin-service:    管理员审核、异常监管、投诉处理 (Person C)
 */
import Mock from 'mockjs'
import './user.js'
import './service.js'
import './address.js'
import './order.js'
import './review.js'
import './complaint.js'
// Person C: 护理人员和管理员 Mock 模块
import './caregiver.js'
import './work-order.js'
import './admin.js'

// 全局 Mock 配置
Mock.setup({
  timeout: '200-500', // 模拟网络延迟 200-500ms
})

console.log('[Mock] 全部模块已启用 — 拦截所有 API 请求')

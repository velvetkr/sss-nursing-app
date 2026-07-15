/**
 * 商户 Store 单元测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMerchantStore, MERCHANT_AUDIT_STATUS, SERVICE_STATUS, CAREGIVER_STATUS, DISPATCH_STATUS } from './merchant.js'

describe('Merchant Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ===== 常量测试 =====
  describe('常量', () => {
    it('MERCHANT_AUDIT_STATUS 包含三种审核状态', () => {
      expect(MERCHANT_AUDIT_STATUS.PENDING).toBe(0)
      expect(MERCHANT_AUDIT_STATUS.APPROVED).toBe(1)
      expect(MERCHANT_AUDIT_STATUS.REJECTED).toBe(2)
    })

    it('SERVICE_STATUS 包含完整生命周期', () => {
      expect(SERVICE_STATUS.DRAFT).toBe(0)
      expect(SERVICE_STATUS.PENDING_REVIEW).toBe(1)
      expect(SERVICE_STATUS.APPROVED).toBe(2)
      expect(SERVICE_STATUS.REJECTED).toBe(3)
      expect(SERVICE_STATUS.LISTED).toBe(4)
      expect(SERVICE_STATUS.UNLISTED).toBe(5)
    })

    it('CAREGIVER_STATUS 包含三种人员状态', () => {
      expect(CAREGIVER_STATUS.ACTIVE).toBe(0)
      expect(CAREGIVER_STATUS.DISABLED).toBe(1)
      expect(CAREGIVER_STATUS.LEFT).toBe(2)
    })

    it('DISPATCH_STATUS 包含完整派单流转状态', () => {
      expect(DISPATCH_STATUS.UNASSIGNED).toBe('UNASSIGNED')
      expect(DISPATCH_STATUS.WAITING_ACCEPT).toBe('WAITING_ACCEPT')
      expect(DISPATCH_STATUS.ACCEPTED).toBe('ACCEPTED')
      expect(DISPATCH_STATUS.REJECTED).toBe('REJECTED')
      expect(DISPATCH_STATUS.EXPIRED).toBe('EXPIRED')
      expect(DISPATCH_STATUS.CANCELED).toBe('CANCELED')
    })
  })

  // ===== 初始状态测试 =====
  describe('初始状态', () => {
    it('所有列表初始为空', () => {
      const store = useMerchantStore()
      expect(store.currentMerchant).toBeNull()
      expect(store.services).toEqual([])
      expect(store.caregivers).toEqual([])
      expect(store.merchantOrders).toEqual([])
      expect(store.candidates).toEqual([])
      expect(store.members).toEqual([])
    })

    it('所有 loading 状态初始为 false', () => {
      const store = useMerchantStore()
      expect(store.merchantLoading).toBe(false)
      expect(store.servicesLoading).toBe(false)
      expect(store.caregiversLoading).toBe(false)
      expect(store.merchantOrdersLoading).toBe(false)
      expect(store.candidatesLoading).toBe(false)
    })

    it('hasMerchant 无商户时为 false', () => {
      const store = useMerchantStore()
      expect(store.hasMerchant).toBe(false)
      expect(store.isMerchantApproved).toBe(false)
    })
  })

  // ===== 工具方法测试 =====
  describe('工具方法', () => {
    it('getMerchantAuditStatusText 返回正确文案', () => {
      const store = useMerchantStore()
      expect(store.getMerchantAuditStatusText(0)).toBe('审核中')
      expect(store.getMerchantAuditStatusText(1)).toBe('已通过')
      expect(store.getMerchantAuditStatusText(2)).toBe('已驳回')
      expect(store.getMerchantAuditStatusText(999)).toBe('未知')
    })

    it('getServiceStatusText 返回正确文案', () => {
      const store = useMerchantStore()
      expect(store.getServiceStatusText(0)).toBe('草稿')
      expect(store.getServiceStatusText(1)).toBe('待审核')
      expect(store.getServiceStatusText(4)).toBe('已上架')
      expect(store.getServiceStatusText(999)).toBe('未知')
    })

    it('getCaregiverStatusText 返回正确文案', () => {
      const store = useMerchantStore()
      expect(store.getCaregiverStatusText(0)).toBe('在职')
      expect(store.getCaregiverStatusText(1)).toBe('已停用')
      expect(store.getCaregiverStatusText(2)).toBe('已离职')
    })

    it('getDispatchStatusText 返回正确文案', () => {
      const store = useMerchantStore()
      expect(store.getDispatchStatusText('UNASSIGNED')).toBe('待派单')
      expect(store.getDispatchStatusText('WAITING_ACCEPT')).toBe('等待接单')
      expect(store.getDispatchStatusText('ACCEPTED')).toBe('已接单')
    })
  })

  // ===== 服务草稿测试 =====
  describe('服务草稿', () => {
    it('initServiceDraft 返回空草稿', () => {
      const store = useMerchantStore()
      const draft = store.initServiceDraft()
      expect(draft.categoryId).toBeNull()
      expect(draft.name).toBe('')
      expect(draft.specs).toEqual([])
      expect(draft.images).toEqual([])
      expect(draft.qualifications).toEqual([])
    })

    it('populateServiceDraft 从已有服务填充', () => {
      const store = useMerchantStore()
      const service = {
        itemId: 40001,
        categoryId: 1,
        name: '术后护理',
        description: '测试',
        coverImage: 'cover.jpg',
        images: ['img1.jpg'],
        serviceArea: '浦东',
        specs: [{ specId: 1, name: '基础包', price: 100 }],
        qualifications: ['护士证'],
      }
      const draft = store.populateServiceDraft(service)
      expect(draft.itemId).toBe(40001)
      expect(draft.name).toBe('术后护理')
      expect(draft.specs.length).toBe(1)
      expect(draft.qualifications).toContain('护士证')
    })
  })

  // ===== reset 测试 =====
  describe('reset()', () => {
    it('reset 清空所有状态', () => {
      const store = useMerchantStore()
      // 设置一些状态
      store.currentMerchant.value = { merchantId: 1, name: 'Test' }
      store.services.value = [{ itemId: 1 }]
      store.caregivers.value = [{ caregiverId: 1 }]
      store.merchantOrders.value = [{ orderId: 1 }]

      store.reset()

      expect(store.currentMerchant).toBeNull()
      expect(store.services).toEqual([])
      expect(store.caregivers).toEqual([])
      expect(store.merchantOrders).toEqual([])
      expect(store.servicesTotal).toBe(0)
      expect(store.caregiversTotal).toBe(0)
    })
  })
})

<template>
  <view class="schedule-page">
    <!-- 月份选择 -->
    <view class="month-selector">
      <view class="selector-left" @tap="prevMonth">
        <text class="arrow">‹</text>
      </view>
      <view class="selector-center">
        <text class="month-text">{{ currentMonthText }}</text>
      </view>
      <view class="selector-right" @tap="nextMonth">
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 日历头部 -->
    <view class="calendar-header">
      <view
        v-for="day in weekDays"
        :key="day"
        class="header-item"
      >
        {{ day }}
      </view>
    </view>

    <!-- 日历内容 -->
    <view class="calendar-body">
      <view
        v-for="(item, index) in calendarDays"
        :key="index"
        class="day-item"
        :class="{
          'other-month': item.otherMonth,
          'today': item.isToday,
          'selected': item.date === selectedDate,
          'has-schedule': item.hasSchedule,
          'on-leave': item.onLeave,
        }"
        @tap="selectDate(item)"
      >
        <text class="day-number">{{ item.day }}</text>
        <view v-if="item.hasSchedule" class="schedule-dot"></view>
        <view v-if="item.onLeave" class="leave-tag">休</view>
      </view>
    </view>

    <!-- 选中日期的排班信息 -->
    <view class="schedule-info">
      <view class="info-header">
        <text class="info-date">{{ selectedDateText }}</text>
        <button class="edit-btn" @tap="editSchedule">编辑</button>
      </view>

      <!-- 排班状态 -->
      <view class="status-card">
        <view class="status-item">
          <text class="status-label">排班状态</text>
          <text class="status-value" :class="scheduleStatus.class">
            {{ scheduleStatus.text }}
          </text>
        </view>
        <view class="status-item">
          <text class="status-label">可接单状态</text>
          <text class="status-value">{{ canAcceptOrder ? '可接单' : '不可接单' }}</text>
        </view>
      </view>

      <!-- 时间段设置 -->
      <view class="time-slots">
        <view class="slots-header">
          <text class="slots-title">服务时间段</text>
        </view>
        <view class="slots-list">
          <view
            v-for="(slot, index) in timeSlots"
            :key="index"
            class="slot-item"
            :class="{ 'slot-active': slot.active }"
          >
            <text class="slot-time">{{ slot.label }}</text>
            <text class="slot-status">{{ slot.active ? '可服务' : '休息' }}</text>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view v-if="scheduleNote" class="schedule-note">
        <text class="note-label">备注：</text>
        <text class="note-text">{{ scheduleNote }}</text>
      </view>
    </view>

    <!-- 排班编辑弹窗 -->
    <view v-if="showEditModal" class="modal-mask" @tap="closeEditModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">编辑排班</text>
          <text class="modal-close" @tap="closeEditModal">✕</text>
        </view>
        
        <view class="modal-body">
          <!-- 排班状态 -->
          <view class="form-item">
            <text class="form-label">排班状态</text>
            <view class="form-options">
              <view
                class="option-item"
                :class="{ 'option-active': editForm.status === 'WORKING' }"
                @tap="editForm.status = 'WORKING'"
              >
                上班
              </view>
              <view
                class="option-item"
                :class="{ 'option-active': editForm.status === 'LEAVE' }"
                @tap="editForm.status = 'LEAVE'"
              >
                请假
              </view>
            </view>
          </view>

          <!-- 时间段选择 -->
          <view v-if="editForm.status === 'WORKING'" class="form-item">
            <text class="form-label">服务时间段</text>
            <view class="form-checkboxes">
              <view
                v-for="(slot, index) in editForm.timeSlots"
                :key="index"
                class="checkbox-item"
                :class="{ 'checkbox-active': slot.active }"
                @tap="slot.active = !slot.active"
              >
                {{ slot.label }}
              </view>
            </view>
          </view>

          <!-- 备注 -->
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea
              v-model="editForm.note"
              class="form-textarea"
              placeholder="请输入备注（选填）"
              placeholder-class="placeholder"
              maxlength="100"
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="btn-cancel" @tap="closeEditModal">取消</button>
          <button class="btn-confirm" @tap="saveSchedule">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCaregiverStore } from '@/store/caregiver.js'

// Store
const caregiverStore = useCaregiverStore()

// 当前年月
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

// 选中日期
const selectedDate = ref(formatDate(new Date()))

// 编辑弹窗
const showEditModal = ref(false)

// 编辑表单
const editForm = ref({
  status: 'WORKING',
  timeSlots: [
    { label: '上午 (8:00-12:00)', value: 'MORNING', active: true },
    { label: '下午 (14:00-18:00)', value: 'AFTERNOON', active: true },
    { label: '晚上 (19:00-21:00)', value: 'EVENING', active: false },
  ],
  note: '',
})

// 排班数据（模拟）
const scheduleData = ref({
  [formatDate(new Date())]: {
    status: 'WORKING',
    timeSlots: ['MORNING', 'AFTERNOON'],
    note: '',
    canAcceptOrder: true,
  },
})

// 星期
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 当前月份文本
const currentMonthText = computed(() => {
  return `${currentYear.value}年${currentMonth.value + 1}月`
})

// 选中日期文本
const selectedDateText = computed(() => {
  const date = new Date(selectedDate.value)
  return `${date.getMonth() + 1}月${date.getDate()}日 星期${weekDays[date.getDay()]}`
})

// 日历天数
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  
  // 上月补充天数
  const firstDayOfWeek = firstDay.getDay()
  if (firstDayOfWeek > 0) {
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      const date = formatDate(new Date(year, month - 1, day))
      days.push({
        day,
        date,
        otherMonth: true,
        isToday: false,
        hasSchedule: scheduleData.value[date]?.status === 'WORKING',
        onLeave: scheduleData.value[date]?.status === 'LEAVE',
      })
    }
  }
  
  // 当月天数
  const today = formatDate(new Date())
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = formatDate(new Date(year, month, i))
    days.push({
      day: i,
      date,
      otherMonth: false,
      isToday: date === today,
      hasSchedule: scheduleData.value[date]?.status === 'WORKING',
      onLeave: scheduleData.value[date]?.status === 'LEAVE',
    })
  }
  
  // 下月补充天数
  const lastDayOfWeek = lastDay.getDay()
  if (lastDayOfWeek < 6) {
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const date = formatDate(new Date(year, month + 1, i))
      days.push({
        day: i,
        date,
        otherMonth: true,
        isToday: false,
        hasSchedule: scheduleData.value[date]?.status === 'WORKING',
        onLeave: scheduleData.value[date]?.status === 'LEAVE',
      })
    }
  }
  
  return days
})

// 排班状态
const scheduleStatus = computed(() => {
  const data = scheduleData.value[selectedDate.value]
  if (!data) {
    return { text: '未设置', class: '' }
  }
  if (data.status === 'LEAVE') {
    return { text: '请假', class: 'status-leave' }
  }
  return { text: '上班', class: 'status-working' }
})

// 可接单状态
const canAcceptOrder = computed(() => {
  const data = scheduleData.value[selectedDate.value]
  return data?.canAcceptOrder || false
})

// 时间段
const timeSlots = computed(() => {
  const data = scheduleData.value[selectedDate.value]
  const slots = [
    { label: '上午 (8:00-12:00)', value: 'MORNING', active: false },
    { label: '下午 (14:00-18:00)', value: 'AFTERNOON', active: false },
    { label: '晚上 (19:00-21:00)', value: 'EVENING', active: false },
  ]
  
  if (data?.timeSlots) {
    data.timeSlots.forEach(slot => {
      const found = slots.find(s => s.value === slot)
      if (found) found.active = true
    })
  }
  
  return slots
})

// 排班备注
const scheduleNote = computed(() => {
  const data = scheduleData.value[selectedDate.value]
  return data?.note || ''
})

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 上个月
function prevMonth() {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
}

// 下个月
function nextMonth() {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
}

// 选择日期
function selectDate(item) {
  if (item.otherMonth) return
  selectedDate.value = item.date
}

// 编辑排班
function editSchedule() {
  const data = scheduleData.value[selectedDate.value]
  if (data) {
    editForm.value.status = data.status
    editForm.value.note = data.note || ''
    editForm.value.timeSlots.forEach(slot => {
      slot.active = data.timeSlots?.includes(slot.value) || false
    })
  } else {
    editForm.value.status = 'WORKING'
    editForm.value.note = ''
    editForm.value.timeSlots = [
      { label: '上午 (8:00-12:00)', value: 'MORNING', active: true },
      { label: '下午 (14:00-18:00)', value: 'AFTERNOON', active: true },
      { label: '晚上 (19:00-21:00)', value: 'EVENING', active: false },
    ]
  }
  showEditModal.value = true
}

// 关闭编辑弹窗
function closeEditModal() {
  showEditModal.value = false
}

// 保存排班
async function saveSchedule() {
  const activeSlots = editForm.value.timeSlots
    .filter(s => s.active)
    .map(s => s.value)
  
  scheduleData.value[selectedDate.value] = {
    status: editForm.value.status,
    timeSlots: editForm.value.status === 'WORKING' ? activeSlots : [],
    note: editForm.value.note,
    canAcceptOrder: editForm.value.status === 'WORKING' && activeSlots.length > 0,
  }
  
  uni.showToast({
    title: '保存成功',
    icon: 'success',
  })
  
  closeEditModal()
}

// 页面加载
onMounted(() => {
  // 初始化数据
})
</script>

<style lang="scss" scoped>
.schedule-page {
  min-height: 100vh;
  background: #f5f6fa;
}

/* 月份选择 */
.month-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 30rpx;
  border-bottom: 1rpx solid #eeeeee;
  
  .selector-left,
  .selector-right {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .arrow {
      font-size: 40rpx;
      color: #667eea;
    }
  }
  
  .selector-center {
    .month-text {
      font-size: 34rpx;
      color: #333333;
      font-weight: bold;
    }
  }
}

/* 日历头部 */
.calendar-header {
  display: flex;
  background: #ffffff;
  padding: 20rpx 10rpx;
  border-bottom: 1rpx solid #eeeeee;
  
  .header-item {
    flex: 1;
    text-align: center;
    font-size: 26rpx;
    color: #999999;
  }
}

/* 日历内容 */
.calendar-body {
  display: flex;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 10rpx;
  
  .day-item {
    width: calc(100% / 7);
    height: 100rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    
    &.other-month {
      .day-number {
        color: #cccccc;
      }
    }
    
    &.today {
      .day-number {
        color: #667eea;
        font-weight: bold;
      }
    }
    
    &.selected {
      background: #f0f5ff;
      border-radius: 8rpx;
    }
    
    &.has-schedule {
      .schedule-dot {
        width: 8rpx;
        height: 8rpx;
        background: #4caf50;
        border-radius: 50%;
        margin-top: 6rpx;
      }
    }
    
    &.on-leave {
      .leave-tag {
        font-size: 18rpx;
        color: #ff9800;
        background: #fff3e0;
        padding: 2rpx 8rpx;
        border-radius: 10rpx;
        margin-top: 6rpx;
      }
    }
    
    .day-number {
      font-size: 28rpx;
      color: #333333;
    }
  }
}

/* 排班信息 */
.schedule-info {
  background: #ffffff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  
  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .info-date {
      font-size: 32rpx;
      color: #333333;
      font-weight: bold;
    }
    
    .edit-btn {
      font-size: 26rpx;
      color: #667eea;
      background: transparent;
      padding: 10rpx 20rpx;
      border: 1rpx solid #667eea;
      border-radius: 30rpx;
    }
  }
}

/* 状态卡片 */
.status-card {
  display: flex;
  background: #f5f6fa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  .status-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .status-label {
      font-size: 24rpx;
      color: #999999;
    }
    
    .status-value {
      font-size: 28rpx;
      color: #333333;
      font-weight: bold;
      margin-top: 8rpx;
      
      &.status-working {
        color: #4caf50;
      }
      
      &.status-leave {
        color: #ff9800;
      }
    }
  }
}

/* 时间段设置 */
.time-slots {
  .slots-header {
    margin-bottom: 16rpx;
    
    .slots-title {
      font-size: 28rpx;
      color: #333333;
    }
  }
  
  .slots-list {
    .slot-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 20rpx;
      background: #f5f6fa;
      border-radius: 8rpx;
      margin-bottom: 10rpx;
      
      &.slot-active {
        background: #e8f5e9;
      }
      
      .slot-time {
        font-size: 26rpx;
        color: #333333;
      }
      
      .slot-status {
        font-size: 24rpx;
        color: #999999;
      }
    }
  }
}

/* 备注 */
.schedule-note {
  margin-top: 20rpx;
  padding: 16rpx;
  background: #f5f6fa;
  border-radius: 8rpx;
  
  .note-label {
    font-size: 24rpx;
    color: #999999;
  }
  
  .note-text {
    font-size: 26rpx;
    color: #666666;
    margin-left: 8rpx;
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
    
    .form-item {
      margin-bottom: 30rpx;
      
      .form-label {
        display: block;
        font-size: 28rpx;
        color: #333333;
        margin-bottom: 16rpx;
      }
      
      .form-options {
        display: flex;
        gap: 20rpx;
        
        .option-item {
          flex: 1;
          text-align: center;
          padding: 20rpx;
          background: #f5f6fa;
          border-radius: 8rpx;
          font-size: 28rpx;
          color: #666666;
          
          &.option-active {
            background: #667eea;
            color: #ffffff;
          }
        }
      }
      
      .form-checkboxes {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        
        .checkbox-item {
          padding: 16rpx 24rpx;
          background: #f5f6fa;
          border-radius: 8rpx;
          font-size: 26rpx;
          color: #666666;
          
          &.checkbox-active {
            background: #e8f5e9;
            color: #4caf50;
          }
        }
      }
      
      .form-textarea {
        width: 100%;
        height: 150rpx;
        background: #f5f6fa;
        border-radius: 8rpx;
        padding: 16rpx;
        font-size: 26rpx;
        color: #333333;
      }
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
<template>
  <view class="audit-actions">
    <!-- 审核意见输入 -->
    <view class="comment-section">
      <view class="comment-header">
        <text class="comment-label">审核意见</text>
        <text v-if="required" class="required-tag">*必填</text>
      </view>
      <textarea
        v-model="comment"
        class="comment-input"
        :placeholder="placeholder"
        placeholder-class="placeholder"
        :maxlength="maxLength"
        :disabled="disabled"
      />
      <view class="comment-footer">
        <text v-if="showHistory" class="history-link" @tap="showHistoryModal = true">
          查看历史记录
        </text>
        <text class="char-count">{{ comment.length }}/{{ maxLength }}</text>
      </view>
    </view>

    <!-- 快捷意见 -->
    <view v-if="showQuickComments" class="quick-section">
      <text class="section-title">快捷意见</text>
      <view class="quick-list">
        <view
          v-for="(item, index) in quickComments"
          :key="index"
          class="quick-item"
          @tap="selectQuickComment(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 审核按钮 -->
    <view class="action-section">
      <button
        v-if="showRejectBtn"
        class="btn-reject"
        :disabled="disabled || rejectLoading"
        @tap="handleReject"
      >
        <text v-if="rejectLoading" class="loading-icon">⏳</text>
        <text v-else>{{ rejectText }}</text>
      </button>
      <button
        v-if="showApproveBtn"
        class="btn-approve"
        :disabled="disabled || approveLoading"
        @tap="handleApprove"
      >
        <text v-if="approveLoading" class="loading-icon">⏳</text>
        <text v-else>{{ approveText }}</text>
      </button>
    </view>

    <!-- 历史记录弹窗 -->
    <view v-if="showHistoryModal" class="modal-mask" @tap="showHistoryModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">审核历史</text>
          <text class="modal-close" @tap="showHistoryModal = false">✕</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <view
            v-for="(record, index) in historyRecords"
            :key="index"
            class="record-item"
          >
            <view class="record-header">
              <view class="record-status" :class="getStatusClass(record.action)">
                {{ getStatusText(record.action) }}
              </view>
              <text class="record-time">{{ formatTime(record.time) }}</text>
            </view>
            <view class="record-body">
              <text class="record-user">审核人：{{ record.userName }}</text>
              <text v-if="record.comment" class="record-comment">
                意见：{{ record.comment }}
              </text>
            </view>
          </view>
          <view v-if="historyRecords.length === 0" class="empty-records">
            暂无审核记录
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '请输入审核意见（驳回时必填）',
  },
  maxLength: {
    type: Number,
    default: 200,
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showApproveBtn: {
    type: Boolean,
    default: true,
  },
  showRejectBtn: {
    type: Boolean,
    default: true,
  },
  approveText: {
    type: String,
    default: '通过',
  },
  rejectText: {
    type: String,
    default: '驳回',
  },
  showQuickComments: {
    type: Boolean,
    default: true,
  },
  quickComments: {
    type: Array,
    default: () => [
      '资料齐全，符合要求',
      '资质证书已过期',
      '信息填写不完整',
      '需要补充材料',
    ],
  },
  showHistory: {
    type: Boolean,
    default: false,
  },
  historyRecords: {
    type: Array,
    default: () => [],
  },
  approveLoading: {
    type: Boolean,
    default: false,
  },
  rejectLoading: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['update:modelValue', 'approve', 'reject'])

// 审核意见
const comment = ref(props.modelValue)

// 历史记录弹窗
const showHistoryModal = ref(false)

// 监听值变化
watch(
  () => props.modelValue,
  (val) => {
    comment.value = val
  }
)

watch(comment, (val) => {
  emit('update:modelValue', val)
})

// 选择快捷意见
function selectQuickComment(text) {
  comment.value = text
}

// 通过
function handleApprove() {
  emit('approve', comment.value)
}

// 驳回
function handleReject() {
  if (!comment.value.trim()) {
    uni.showToast({
      title: '请输入驳回原因',
      icon: 'none',
    })
    return
  }
  emit('reject', comment.value)
}

// 获取状态样式
function getStatusClass(status) {
  const classMap = {
    APPROVED: 'status-approved',
    REJECTED: 'status-rejected',
  }
  return classMap[status] || ''
}

// 获取状态文本
function getStatusText(status) {
  const textMap = {
    APPROVED: '已通过',
    REJECTED: '已驳回',
  }
  return textMap[status] || '未知'
}

// 格式化时间
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.audit-actions {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
}

/* 审核意见输入 */
.comment-section {
  margin-bottom: 30rpx;
  
  .comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    .comment-label {
      font-size: 28rpx;
      color: #333333;
      font-weight: bold;
    }
    
    .required-tag {
      font-size: 22rpx;
      color: #f44336;
      margin-left: 10rpx;
    }
  }
  
  .comment-input {
    width: 100%;
    height: 200rpx;
    background: #f5f6fa;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333333;
  }
  
  .comment-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10rpx;
    
    .history-link {
      font-size: 24rpx;
      color: #667eea;
    }
    
    .char-count {
      font-size: 24rpx;
      color: #999999;
    }
  }
}

/* 快捷意见 */
.quick-section {
  margin-bottom: 30rpx;
  
  .section-title {
    display: block;
    font-size: 26rpx;
    color: #666666;
    margin-bottom: 16rpx;
  }
  
  .quick-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    
    .quick-item {
      font-size: 24rpx;
      color: #667eea;
      background: #f0f5ff;
      padding: 10rpx 20rpx;
      border-radius: 20rpx;
      
      &:active {
        background: #667eea;
        color: #ffffff;
      }
    }
  }
}

/* 审核按钮 */
.action-section {
  display: flex;
  gap: 20rpx;
  
  button {
    flex: 1;
    height: 96rpx;
    font-size: 34rpx;
    font-weight: bold;
    border: none;
    border-radius: 12rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .loading-icon {
      font-size: 32rpx;
    }
  }
  
  .btn-reject {
    background: #ffebee;
    color: #f44336;
    
    &:disabled {
      background: #f5f5f5;
      color: #bdbdbd;
    }
  }
  
  .btn-approve {
    background: #667eea;
    color: #ffffff;
    
    &:disabled {
      background: #c5cae9;
    }
  }
}

.placeholder {
  color: #999999;
}

/* 历史记录弹窗 */
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
  width: 640rpx;
  max-height: 70vh;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eeeeee;
    flex-shrink: 0;
    
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
    flex: 1;
    padding: 20rpx 30rpx;
    max-height: 60vh;
  }
}

.record-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
    
    .record-status {
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 4rpx;
      
      &.status-approved {
        background: #e8f5e9;
        color: #4caf50;
      }
      
      &.status-rejected {
        background: #ffebee;
        color: #f44336;
      }
    }
    
    .record-time {
      font-size: 22rpx;
      color: #999999;
    }
  }
  
  .record-body {
    display: flex;
    flex-direction: column;
    
    .record-user {
      font-size: 26rpx;
      color: #666666;
    }
    
    .record-comment {
      font-size: 24rpx;
      color: #999999;
      margin-top: 8rpx;
    }
  }
}

.empty-records {
  text-align: center;
  padding: 60rpx 0;
  font-size: 28rpx;
  color: #999999;
}
</style>
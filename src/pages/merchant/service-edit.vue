<template>
  <view class="page-shell">
    <view class="form-card">
      <text class="form-title">{{ isEdit ? '编辑服务' : '新建服务' }}</text>

      <u-form :model="draft" labelWidth="0">
        <!-- 服务名称 -->
        <view class="form-group">
          <text class="label">服务名称 <text class="required">*</text></text>
          <u-input v-model="draft.name" placeholder="请输入服务名称" border="surround" maxlength="30" />
        </view>

        <!-- 分类 -->
        <view class="form-group">
          <text class="label">服务分类 <text class="required">*</text></text>
          <view class="cat-picker" @click="showCat = true">
            <text :class="{ placeholder: !selectedCatName }">{{ selectedCatName || '请选择分类' }}</text>
            <u-icon name="arrow-right" size="16" color="#98A5B3" />
          </view>
        </view>

        <!-- 服务区域 -->
        <view class="form-group">
          <text class="label">服务区域 <text class="required">*</text></text>
          <u-input v-model="draft.serviceArea" placeholder="如：上海市浦东新区" border="surround" maxlength="100" />
        </view>

        <!-- 封面图 -->
        <view class="form-group">
          <text class="label">封面图片</text>
          <view class="upload-box" @click="uploadCover">
            <image v-if="draft.coverImage" :src="draft.coverImage" mode="aspectFill" class="cover-img" />
            <view v-else class="upload-placeholder"><u-icon name="plus" size="32" color="#98A5B3" /><text>上传封面</text></view>
          </view>
        </view>

        <!-- 轮播图 -->
        <view class="form-group">
          <text class="label">轮播图片</text>
          <view class="images-row">
            <view v-for="(img, i) in draft.images" :key="i" class="img-item">
              <image :src="img" mode="aspectFill" class="item-img" />
              <view class="img-remove" @click="removeImage(i)"><u-icon name="close" size="14" color="#fff" /></view>
            </view>
            <view class="img-add" @click="uploadImage" v-if="draft.images.length < 6">
              <u-icon name="plus" size="28" color="#98A5B3" />
            </view>
          </view>
        </view>

        <!-- 服务介绍 -->
        <view class="form-group">
          <text class="label">服务介绍 <text class="required">*</text></text>
          <u-textarea v-model="draft.description" placeholder="支持Markdown格式，详细介绍服务内容、流程、注意事项等" maxlength="2000" autoHeight border="surround" />
        </view>

        <!-- 规格管理 -->
        <view class="form-group">
          <view class="spec-header">
            <text class="label">服务规格 <text class="required">*</text></text>
            <button class="btn-add-spec" @click="addSpec">+ 添加规格</button>
          </view>
          <view v-if="!draft.specs.length" class="no-specs">暂无规格，请点击上方按钮添加</view>
          <view v-for="(spec, i) in draft.specs" :key="i" class="spec-card">
            <view class="spec-top">
              <text class="spec-index">规格 {{ i + 1 }}</text>
              <button class="btn-remove-spec" @click="removeSpec(i)">删除</button>
            </view>
            <view class="spec-row"><text class="sl">名称</text><u-input v-model="spec.name" placeholder="如：基础护理包" border="surround" /></view>
            <view class="spec-row"><text class="sl">价格（元）</text><u-input v-model="spec.price" placeholder="实际售价" border="surround" type="digit" /></view>
            <view class="spec-row"><text class="sl">原价（元）</text><u-input v-model="spec.originalPrice" placeholder="划线原价" border="surround" type="digit" /></view>
            <view class="spec-row"><text class="sl">时长（分钟）</text><u-input v-model="spec.duration" placeholder="预计服务时长" border="surround" type="number" /></view>
            <view class="spec-row"><text class="sl">资质要求</text><u-input v-model="spec.qualification" placeholder="如：护士执业证" border="surround" /></view>
          </view>
        </view>

        <!-- 资质要求 -->
        <view class="form-group">
          <text class="label">服务资质要求</text>
          <view class="qual-tags">
            <view v-for="(q, i) in draft.qualifications" :key="i" class="qual-tag">
              <text>{{ q }}</text>
              <u-icon name="close" size="14" color="#98A5B3" @click="draft.qualifications.splice(i, 1)" />
            </view>
            <view class="qual-add" @click="showQualInput = true"><u-icon name="plus" size="16" color="#3A7BF7" /><text>添加</text></view>
          </view>
        </view>
      </u-form>

      <button class="btn-save" :loading="saving" @click="handleSave">保存草稿</button>
    </view>

    <!-- 分类选择器 -->
    <u-action-sheet :show="showCat" :actions="catActions" title="选择分类" @close="showCat = false" @select="onCatSelect" />

    <!-- 资质输入弹窗 -->
    <u-modal :show="showQualInput" title="添加资质要求" @confirm="onQualConfirm" @cancel="showQualInput = false" confirmText="确定">
      <view style="padding:20rpx"><u-input v-model="qualInputText" placeholder="如：护士执业证" border="surround" /></view>
    </u-modal>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMerchantStore } from '@/store/merchant.js'
import { useUserStore } from '@/store/user.js'
import { useServiceStore } from '@/store/service.js'

const store = useMerchantStore()
const userStore = useUserStore()
const serviceStore = useServiceStore()

const isEdit = ref(false)
const saving = ref(false)
const draft = reactive(store.initServiceDraft())
const showCat = ref(false)
const showQualInput = ref(false)
const qualInputText = ref('')
const categories = ref([])

const selectedCatName = computed(() => {
  const cat = categories.value.find(c => c.categoryId === draft.categoryId)
  return cat?.name || ''
})

const catActions = computed(() =>
  categories.value.map(c => ({ name: c.name, value: c.categoryId }))
)

onLoad(async (options) => {
  // 加载分类
  try { categories.value = await serviceStore.fetchCategories() } catch { /* use mock default */ }
  if (options?.id) {
    isEdit.value = true
    await store.fetchMyServiceDetail(parseInt(options.id))
    if (store.currentService) {
      store.populateServiceDraft(store.currentService)
      Object.assign(draft, store.serviceDraft)
    }
  }
})

function onCatSelect(e) {
  draft.categoryId = e.value
  showCat.value = false
}

function addSpec() {
  draft.specs.push({ name: '', price: '', originalPrice: '', duration: '', qualification: '' })
}
function removeSpec(i) { draft.specs.splice(i, 1) }

async function uploadCover() {
  try {
    const res = await uni.chooseImage({ count: 1, sizeType: ['compressed'] })
    uni.showLoading({ title: '上传中...' })
    const result = await userStore.uploadFile(res.tempFilePaths[0], 'service_cover')
    draft.coverImage = result.fileUrl
    uni.hideLoading()
  } catch { uni.hideLoading() }
}

async function uploadImage() {
  try {
    const res = await uni.chooseImage({ count: 1, sizeType: ['compressed'] })
    uni.showLoading({ title: '上传中...' })
    const result = await userStore.uploadFile(res.tempFilePaths[0], 'service_image')
    draft.images.push(result.fileUrl)
    uni.hideLoading()
  } catch { uni.hideLoading() }
}
function removeImage(i) { draft.images.splice(i, 1) }

function onQualConfirm() {
  if (qualInputText.value.trim()) {
    draft.qualifications.push(qualInputText.value.trim())
  }
  qualInputText.value = ''
  showQualInput.value = false
}

async function handleSave() {
  if (!draft.name.trim()) { uni.showToast({ title: '请输入服务名称', icon: 'none' }); return }
  if (!draft.categoryId) { uni.showToast({ title: '请选择分类', icon: 'none' }); return }
  if (!draft.serviceArea.trim()) { uni.showToast({ title: '请输入服务区域', icon: 'none' }); return }
  if (!draft.specs.length) { uni.showToast({ title: '请至少添加一个规格', icon: 'none' }); return }
  saving.value = true
  try {
    await store.saveServiceDraft()
    uni.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  } catch { /* handled */ }
  finally { saving.value = false }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: 100vh; padding: 16rpx $spacing-base 60rpx; background: $page-gradient; }
.form-card { padding: 32rpx 28rpx; border-radius: 28rpx; background: $surface-gradient; border: $glass-border-soft; box-shadow: $shadow-sm; }
.form-title { display: block; font-size: $font-size-lg; font-weight: 700; color: $text-color; margin-bottom: 20rpx; }
.form-group { margin-bottom: 28rpx; }
.label { display: block; margin-bottom: 8rpx; font-size: $font-size-sm; font-weight: 600; color: $text-color; }
.required { color: $error-color; }

.cat-picker { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 20rpx; border: 1rpx solid $border-color; border-radius: $radius-base; background: #fff; font-size: $font-size-sm; }
.cat-picker .placeholder { color: $text-color-hint; }

.upload-box { margin-top: 6rpx; }
.upload-placeholder { width: 200rpx; height: 140rpx; border: 2rpx dashed $border-color; border-radius: $radius-md; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6rpx; font-size: $font-size-xs; color: $text-color-hint; background: $bg-color-grey; }
.cover-img { width: 200rpx; height: 140rpx; border-radius: $radius-md; }

.images-row { display: flex; flex-wrap: wrap; gap: 12rpx; }
.img-item { position: relative; }
.item-img { width: 140rpx; height: 100rpx; border-radius: $radius-base; }
.img-remove { position: absolute; top: -8rpx; right: -8rpx; width: 36rpx; height: 36rpx; border-radius: 50%; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; }
.img-add { width: 140rpx; height: 100rpx; border: 2rpx dashed $border-color; border-radius: $radius-base; display: flex; align-items: center; justify-content: center; background: $bg-color-grey; }

.spec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.btn-add-spec { height: 48rpx; padding: 0 16rpx; margin: 0; border: 1rpx solid $primary-color; border-radius: $radius-round; background: #fff; color: $primary-color; font-size: $font-size-xs; line-height: 46rpx; }
.btn-add-spec::after { border: none; }
.no-specs { padding: 32rpx; text-align: center; color: $text-color-hint; font-size: $font-size-sm; background: $bg-color-grey; border-radius: $radius-base; }

.spec-card { padding: 20rpx; margin-bottom: 14rpx; border: 1rpx solid $border-color; border-radius: $radius-md; background: #fff; }
.spec-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.spec-index { font-size: $font-size-xs; font-weight: 600; color: $primary-color; }
.btn-remove-spec { height: 40rpx; padding: 0 12rpx; margin: 0; border: none; background: transparent; color: $error-color; font-size: $font-size-xs; line-height: 40rpx; }
.btn-remove-spec::after { border: none; }
.spec-row { display: flex; align-items: center; gap: 12rpx; margin-bottom: 10rpx; }
.sl { width: 140rpx; flex-shrink: 0; font-size: $font-size-xs; color: $text-color-secondary; }

.qual-tags { display: flex; flex-wrap: wrap; gap: 10rpx; }
.qual-tag { display: flex; align-items: center; gap: 6rpx; padding: 6rpx 14rpx; border-radius: $radius-round; background: $primary-bg; font-size: $font-size-xs; color: $primary-color; }
.qual-add { display: flex; align-items: center; gap: 4rpx; padding: 6rpx 14rpx; border: 1rpx dashed $primary-color; border-radius: $radius-round; font-size: $font-size-xs; color: $primary-color; }

.btn-save { width: 100%; height: 88rpx; border: none; border-radius: $radius-round; background: $primary-gradient; color: #fff; font-size: $font-size-base; font-weight: 600; margin-top: 16rpx; box-shadow: $shadow-glow; }
.btn-save::after { border: none; }
</style>

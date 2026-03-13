<template>
  <div class="order-coordinator-container">
    <button class="close-btn" @click="handleClose">×</button>

    <div class="info-row">
      <div class="info-item">
        <label>订单号：</label>
        <span>{{ inputID || '---' }}</span>
      </div>

      <div class="info-item">
        <label>客户名称：</label>
        <span>{{ currentOrder?.customer || '---' }}</span>
      </div>

      <div class="info-item">
        <label>版本号：</label>
        <select v-model="selectedVer" class="version-dropdown">
          <option v-for="ver in availableVersions" :key="ver" :value="ver">
            {{ ver }}
          </option>
        </select>
      </div>
    </div>

    <hr />

    <div class="action-row">
      <button class="btn-primary" @click="handleOpenOrder" :disabled="!currentOrder">
        打开版本订单 ({{ selectedVer }})
      </button>
      <button class="btn-secondary" @click="handleOpenWorkOrder" :disabled="!currentOrder">
        打开版本工单
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { IOrder } from '@/types/Order'

// 1. 接收来自 Page_ADM 的参数
const props = defineProps<{
  inputID: string
  inputGroup: IOrder[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 2. 状态管理
const selectedVer = ref('')

// 3. 初始化：默认选中第一个版本的版本号
onMounted(() => {
  // 使用 ?. 访问元素，如果不存在则返回 undefined，最后由 || '' 提供默认值
  selectedVer.value = props.inputGroup?.[0]?.order_ver || ''
})

// 监听 props 变化（防止同一个组件实例被复用时数据不更新）
watch(
  () => props.inputGroup,
  (newGroup) => {
    // 使用可选链 newGroup?.[0] 优雅地处理潜在的 undefined
    if (newGroup && newGroup.length > 0) {
      selectedVer.value = newGroup[0]?.order_ver || ''
    }
  },
  { immediate: true },
)

/**
 * 计算属性：获取当前选中版本的订单对象
 */
const currentOrder = computed(() => {
  return props.inputGroup.find((o) => o.order_ver === selectedVer.value) || props.inputGroup[0]
})

/**
 * 获取所有可用的版本号
 */
const availableVersions = computed(() => {
  return props.inputGroup.map((o) => o.order_ver || 'N/A')
})

// --- 逻辑处理 ---

const handleClose = () => {
  emit('close')
}

const handleOpenOrder = () => {
  if (!currentOrder.value) return
  console.log('正在查看订单详情:', currentOrder.value.order_unique)
  // 这里可以触发另一个 Modal 或者路由跳转
}

const handleOpenWorkOrder = () => {
  if (!currentOrder.value) return
  const workUnique = `${currentOrder.value.order_id}_W_${currentOrder.value.order_ver}`
  console.log('正在调取工单:', workUnique)
}
</script>

<style scoped>
.order-coordinator-container {
  padding: 30px;
  background: white;
  position: relative; /* 为关闭按钮定位 */
  border-radius: 8px;
  min-height: 200px;
}

/* 右上角关闭按钮样式 */
.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
}

.close-btn:hover {
  color: #ef4444;
}

.info-row {
  display: flex;
  gap: 40px;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 10px;
}

.info-item label {
  font-weight: bold;
  color: #475569;
  margin-right: 8px;
}

.version-dropdown {
  padding: 5px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background-color: #f8fafc;
  cursor: pointer;
}

.action-row {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

button.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

button.btn-secondary {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

hr {
  border: 0;
  border-top: 1px solid #e2e8f0;
  margin: 20px 0;
}
</style>

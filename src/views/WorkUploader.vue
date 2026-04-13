<template>
  <div class="uploader-wrapper">
    <div v-if="!showCreator" class="list-container">
      <div class="header-bar">
        <div class="title-group">
          <h2 class="main-title">工程指令中心</h2>
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="通过工单号/客户名检索..."
              class="styled-input"
            />
          </div>
        </div>
        <button class="primary-btn" @click="openForEdit(null)">
          <span class="plus-icon">+</span> 创建工单
        </button>
      </div>

      <div class="table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th width="150" @click="handleSort('workorderstatus')" class="sortable">
                状态码 {{ getSortIcon('workorderstatus') }}
              </th>
              <th width="180" @click="handleSort('zhiDanShiJian')" class="sortable">
                制单时间 {{ getSortIcon('zhiDanShiJian') }}
              </th>
              <th width="150" @click="handleSort('work_id')" class="sortable">
                工单号 {{ getSortIcon('work_id') }}
              </th>
              <th width="150" @click="handleSort('gongDanLeiXing')" class="sortable">
                工单类型 {{ getSortIcon('gongDanLeiXing') }}
              </th>
              <th @click="handleSort('customer')" class="sortable">
                客户 {{ getSortIcon('customer') }}
              </th>
              <th width="100" style="text-align: center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="work in processedOrders" :key="work.work_id + work.work_ver">
              <!-- <td>
                <span :class="['status-badge', work.workorderstatus]">
                  {{ work.workorderstatus }}
                </span>
              </td> -->

              <td>
                <span
                  class="status-badge"
                  :style="{ color: WorkStatusColor[work.workorderstatus] }"
                >
                  {{ work.workorderstatus }}
                </span>
              </td>

              <td class="time-text">{{ work.zhiDanShiJian }}</td>
              <td class="bold-text">
                {{ work.work_id }} <small class="ver-text">v{{ work.work_ver }}</small>
              </td>
              <td>{{ work.gongDanLeiXing || '-' }}</td>
              <td class="customer-name">{{ work.customer }}</td>
              <td class="action-cell">
                <button
                  v-if="
                    work.workorderstatus === WorkOrderStatus.DRAFT ||
                    work.workorderstatus === WorkOrderStatus.REJECTED
                  "
                  class="text-btn edit-style"
                  @click="openForEdit(work)"
                >
                  制单
                </button>

                <button
                  v-else-if="
                    work.workorderstatus === WorkOrderStatus.APPROVED ||
                    work.workorderstatus === WorkOrderStatus.COMPLETED ||
                    work.workorderstatus === WorkOrderStatus.IN_PRODUCTION ||
                    work.workorderstatus === WorkOrderStatus.CANCELLED ||
                    work.workorderstatus === WorkOrderStatus.PENDING_REVIEW
                  "
                  class="text-btn view-style"
                  @click="openForView(work)"
                >
                  查看
                </button>
              </td>
            </tr>
            <tr v-if="processedOrders.length === 0">
              <td colspan="6" class="empty-state">没有找到相关的工程记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- <WorkOrderInfo v-else @close="showCreator = false" /> -->
    <WorkOrderInfo
      v-else
      :mode="activeMode"
      :initialData="selectedOrder"
      @close="showCreator = false"
      @submit="handleOrderUpload"
    />

    <!-- <OrderInfo
      v-else
      :mode="activeMode"
      :initialData="selectedOrder"
      @close="showCreator = false"
      @submit="handleOrderUpload"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  addAuditLog,
  formatFullTime,
  prepareWorkOrderForSubmit,
  WorkOrderStatus,
  WorkStatusColor,
  type IWorkOrder,
} from '@/types/WorkOrder'
// 核心：导入你的创建器组件
import WorkOrderInfo, { PageMode } from './WorkOrderInfo.vue'
import request, { FindWorkOrdersByClerk, FindWorkOrdersWithStatus } from '@/stores/request'

const activeMode = ref<PageMode>(PageMode.VIEW)
const isUploading = ref(false)
const showCreator = ref(false)
const searchQuery = ref<string>('')
const workOrders = ref<IWorkOrder[]>([])
const selectedOrder = ref<IWorkOrder | null>(null)
//onMounted 会在组件加载完成、渲染到页面上时自动运行。
onMounted(async () => {
  console.log('订单上传页面初始化，正在获取 admin 的订单列表...')
  await fetchOrdersData()
})

/**
 * 获取订单列表的逻辑封装
 */
const fetchOrdersData = async () => {
  try {
    // 调用你在 request.ts 里写的函数，扒拉 admin 的数据
    const [draftWorkOrder, myWorkOrder] = await Promise.all([
      FindWorkOrdersWithStatus(WorkOrderStatus.DRAFT),
      FindWorkOrdersByClerk('admin'),
    ])

    // 将拿到的数组赋值给响应式变量 orders
    // processedOrders 会根据这个数据的变化自动重新计算过滤和排序
    const combined = [...draftWorkOrder, ...myWorkOrder]

    // 2. 利用 Map 进行去重
    // 以 order_id 作为 Key，如果 ID 重复，后面的会覆盖前面的
    const uniqueMap = new Map()
    combined.forEach((item) => {
      // 假设唯一标识符是 order_id，如果你的字段名不同请替换
      uniqueMap.set(item.work_unique, item)
    })

    // 3. 将 Map 的值转回数组并赋值
    workOrders.value = Array.from(uniqueMap.values())

    console.log('订单加载成功:', draftWorkOrder.length, '条记录')
  } catch (err) {
    console.error('获取列表失败:', err)
    // 实际项目中这里可以加个通知提示
  }
}

type SortKey = keyof IWorkOrder
const sortConfig = ref<{ key: SortKey; order: 'asc' | 'desc' }>({
  key: 'zhiDanShiJian',
  order: 'desc',
})

// 搜索过滤与排序逻辑
const processedOrders = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const filtered = workOrders.value.filter(
    (w) => w.work_id.toLowerCase().includes(q) || (w.customer?.toLowerCase().includes(q) ?? false),
  )

  const { key, order } = sortConfig.value
  return [...filtered].sort((a, b) => {
    const valA = (a[key] instanceof Date ? (a[key] as Date).getTime() : a[key]) ?? ''
    const valB = (b[key] instanceof Date ? (b[key] as Date).getTime() : b[key]) ?? ''
    if (valA < valB) return order === 'asc' ? -1 : 1
    if (valA > valB) return order === 'asc' ? 1 : -1
    return 0
  })
})

const handleSort = (key: SortKey) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.order = sortConfig.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.order = 'asc'
  }
}

const getSortIcon = (key: SortKey) => {
  if (sortConfig.value.key !== key) return '↕️'
  return sortConfig.value.order === 'asc' ? '🔼' : '🔽'
}

/**
 * 逻辑：打开编辑模式
 * 如果是“创建工单”按钮触发，传入 null
 * 如果是列表行触发，传入该行数据
 */

const openForEdit = (work: IWorkOrder | null = null) => {
  activeMode.value = PageMode.EDIT
  selectedOrder.value = work
  showCreator.value = true
}

/**
 * 逻辑：打开查看模式
 */
const openForView = (work: IWorkOrder) => {
  activeMode.value = PageMode.VIEW
  selectedOrder.value = work
  showCreator.value = true
}

/**
 * 处理订单提交
 */
const handleOrderUpload = async (wd: IWorkOrder) => {
  if (isUploading.value) return
  isUploading.value = true

  wd.work_unique = wd.work_id + '_' + wd.work_ver
  wd.workorderstatus = WorkOrderStatus.PENDING_REVIEW
  wd.clerkDate = formatFullTime(new Date())
  if (wd.intermedia && wd.intermedia.length > 0) {
    wd.intermedia.forEach((item, index) => {
      item.intermediaID = index // 如果你希望从0开始，去掉 +1 即可
    })
  }
  addAuditLog(wd)
  const fd = prepareWorkOrderForSubmit(wd)

  try {
    await request.post('/workOrders/create', fd)
    alert('订单已成功提交审核！')
    showCreator.value = false
    fetchOrdersData() // 这里可以刷新列表
  } catch (err) {
    console.error('后端响应错误:', err)
    alert('发送失败，请检查网络或后端服务')
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
/* 保持你原本的 CSS 样式 */
.uploader-wrapper {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: sans-serif;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.title-group {
  display: flex;
  align-items: center;
  gap: 24px;
}
.main-title {
  font-size: 22px;
  color: #1e293b;
  font-weight: 700;
  margin: 0;
}
.styled-input {
  padding: 10px 12px 10px 36px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 280px;
}
.primary-btn {
  background-color: #0f172a;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.table-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.modern-table {
  width: 100%;
  border-collapse: collapse;
}
.modern-table th {
  background-color: #f1f5f9;
  padding: 14px;
  text-align: left;
  font-size: 13px;
  color: #475569;
}
.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable:hover {
  background-color: #e2e8f0;
}
.modern-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
}
.time-text {
  font-family: 'Courier New', Courier, monospace;
  color: #64748b;
}
.bold-text {
  font-weight: 700;
  color: #1e293b;
}
.ver-text {
  color: #94a3b8;
  font-weight: 400;
  font-size: 12px;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
}
.IN_PRODUCTION {
  background: #fef9c3;
  color: #854d0e;
}
.PENDING_REVIEW {
  background: #dbeafe;
  color: #1e40af;
}
.APPROVED {
  background: #dcfce7;
  color: #15803d;
}
.DRAFT {
  background: #f1f5f9;
  color: #475569;
}
.REJECTED {
  background: #fee2e2;
  color: #b91c1c;
}
.text-btn {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 500;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
</style>

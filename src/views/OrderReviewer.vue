<template>
  <div class="uploader-wrapper">
    <div v-if="!selectedOrder" class="tab-header">
      <div
        :class="['tab-item', currentTab === 'PENDING' ? 'active' : '']"
        @click="currentTab = 'PENDING'"
      >
        未审核订单
        <span class="badge" v-if="pendingOrdersSource.length">{{
          pendingOrdersSource.length
        }}</span>
      </div>

      <div
        :class="['tab-item', currentTab === 'REVIEWED' ? 'active' : '']"
        @click="currentTab = 'REVIEWED'"
      >
        已审核订单
      </div>
    </div>

    <div v-if="!selectedOrder" class="list-container">
      <div class="header-bar">
        <div class="title-group">
          <h2 class="main-title">{{ currentTab === 'PENDING' ? '未审核订单' : '已审核订单' }}</h2>

          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="通过订单号/客户名检索..."
              class="styled-input"
            />
          </div>
        </div>
      </div>

      <div class="table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th
                v-if="currentTab === 'REVIEWED'"
                width="120"
                @click="handleSort('orderstatus')"
                class="sortable"
              >
                状态 {{ getSortIcon('orderstatus') }}
              </th>

              <th width="180" @click="handleSort('submitTime')" class="sortable">
                提交时间 {{ getSortIcon('submitTime') }}
              </th>

              <th width="150" @click="handleSort('order_id')" class="sortable">
                订单号 {{ getSortIcon('order_id') }}
              </th>

              <th @click="handleSort('customer')" class="sortable">
                客户 {{ getSortIcon('customer') }}
              </th>

              <th width="150" @click="handleSort('chuHuoRiqiRequired')" class="sortable">
                截止日期 {{ getSortIcon('chuHuoRiqiRequired') }}
              </th>

              <th width="100" style="text-align: center">操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="order in processedOrders" :key="order.order_id || Math.random().toString()">
              <!-- <td v-if="currentTab === 'REVIEWED'">
                <span :class="['status-badge', order.orderstatus]">
                  {{ order.orderstatus === OrderStatus.APPROVED ? '已通过' : '已驳回' }}
                </span>
              </td> -->

              <td v-if="currentTab === 'REVIEWED'">
                <span class="status-badge" :style="{ color: OrderStatusColor[order.orderstatus] }">
                  {{ order.orderstatus }}
                </span>
              </td>

              <td class="time-text">{{ order.salesDate }}</td>
              <!-- <td class="time-text">{{ getFirstAuditTime(order) }}</td> -->
              <td class="bold-text">{{ order.order_id || '未分配' }}</td>

              <td class="customer-name">{{ order.customer }}</td>

              <td>{{ order.chuHuoRiqiRequired }}</td>

              <td class="action-cell">
                <button class="view-btn" @click="handleView(order)">
                  {{ currentTab === 'PENDING' ? '审核' : '查看' }}
                </button>
              </td>
            </tr>

            <tr v-if="processedOrders.length === 0">
              <td :colspan="currentTab === 'REVIEWED' ? 6 : 5" class="empty-state">
                没有找到相关的记录
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="detail-container">
      <div class="header-bar">
        <button class="back-link" @click="selectedOrder = null">← 返回列表</button>
        <h2 class="main-title">订单详情：{{ selectedOrder.order_id }}</h2>
      </div>

      <div class="table-card" style="padding: 24px">
        <p>这里是订单 [{{ selectedOrder.order_id }}] 的详细审核/查看界面...</p>
        <p>当前模式：{{ currentTab === 'PENDING' ? '审批流程中' : '历史记录查阅' }}</p>
      </div>
    </div>
    <OrderInfo
      v-if="selectedOrder"
      :mode="activeMode"
      :initialData="selectedOrder"
      @close="selectedOrder = null"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  formatYMD,
  type IOrder,
  OrderStatus,
  type IAuditLog as orderlog,
  formatFullTime,
  OrderStatusColor,
} from '@/types/Order'
import request, {
  AddOrderAuditInfo,
  AddOrderAuditLog,
  ChangeOrderStatusTo,
  FindOrdersByAudit,
  FindOrdersWithStatus,
} from '@/stores/request'
import OrderInfo, { PageMode } from './OrderInfo.vue' // 确保能拿到导出的 PageMode
import { prepareWorkOrderForSubmit, WorkOrderStatus, type IWorkOrder } from '@/types/WorkOrder'
const activeMode = computed(() => {
  // 如果当前在“未审核”标签，则进入“审核模式”，否则仅为“查看模式”
  return currentTab.value === 'PENDING' ? PageMode.REVIEW : PageMode.VIEW
})
// --- 1. 状态定义 ---
const currentTab = ref<'PENDING' | 'REVIEWED'>('PENDING')
const searchQuery = ref<string>('')
const selectedOrder = ref<IOrder | null>(null)
const isUploading = ref(false)
// 排序配置
type SortKey = 'submitTime' | 'order_id' | 'customer' | 'chuHuoRiqiRequired' | 'orderstatus'
const sortConfig = ref<{ key: SortKey; order: 'asc' | 'desc' }>({
  key: 'submitTime',
  order: 'desc',
})

/**
 * 一步到位创建完整的工单初始对象
 * 消除嵌套函数调用，直接声明所有默认值
 */
const createWorkOrderFromOrder = (sourceOrder: IOrder): IWorkOrder => ({
  // 1. 系统索引与基础信息

  work_id: sourceOrder.order_id + '_W',
  work_ver: sourceOrder.order_ver || '',
  work_unique: sourceOrder.order_id + '_W_' + sourceOrder.order_ver,
  work_clerk: 'admin',
  work_audit: '',
  gongDanLeiXing: '',
  caiLiao: '',
  chanPinLeiXing: '',
  zhiDanShiJian: formatFullTime(new Date()),
  customer: sourceOrder.customer || '',
  customerPO: sourceOrder.customerPO || '',
  productName: sourceOrder.productName || '',
  chanPinGuiGe: '',

  // 2. 从订单过继的数值字段
  dingDanShuLiang: sourceOrder.dingDanShuLiang || 0,
  chuYangShuLiang: sourceOrder.chuYangShuLiang || 0,
  chaoBiLiShuLiang: sourceOrder.chaoBiLiShuLiang || 0,
  benChangFangSun: 0,
  chuYangRiqiRequired: sourceOrder.chuyangRiqiRequired || '',
  chuHuoRiqiRequired: sourceOrder.chuHuoRiqiRequired || '',

  // 3. 直接初始化中间物料详单的第一行（一步到位）
  intermedia: [
    {
      buJianMingCheng: '',
      yinShuaYanSe: '',
      wuLiaoMingCheng: '',
      pinPai: '',
      caiLiaoGuiGe: '',
      FSC: '',
      kaiShu: 0,
      shangJiChiCun: '',
      paiBanMuShu: 0,
      yinChuShu: 0,
      yinSun: 0,
      lingLiaoShu: 0,
      biaoMianChuLi: '',
      yinShuaBanShu: 0,
      shengChanLuJing: '',
      paiBanFangShi: '',
      kaiShiRiQi: '',
      yuQiJieShu: '',
      dangQianJinDu: 0,
    },
  ],

  // 4. 状态与日志
  workorderstatus: WorkOrderStatus.DRAFT,
  auditLogs: [],
  attachments: [],
})

const handleApprove = async (curOrder: IOrder, curComment: string) => {
  console.log('正在处理审核通过并保存数据...')
  if (isUploading.value) return
  isUploading.value = true

  //if (!selectedOrder.value) return

  const newWorkOrder = reactive<IWorkOrder>(createWorkOrderFromOrder(curOrder) as IWorkOrder)
  curOrder.orderstatus = OrderStatus.APPROVED

  const fd = prepareWorkOrderForSubmit(newWorkOrder)

  // 关键点：先把 ID 存起来，防止在 await 期间 selectedOrder 被意外清空
  const targetId = curOrder.order_unique
  if (!targetId) {
    alert('订单唯一标识缺失，无法更新状态')
    return
  }

  try {
    await request.post('/workOrders/create', fd)
    alert('工程单已成功提交审核！')
    //showCreator.value = false

    await ChangeOrderStatusTo(targetId, OrderStatus.APPROVED)

    await AddOrderAuditInfo(targetId, 'admin', formatYMD(new Date()))
    const tempLog = (): orderlog => ({
      time: formatFullTime(new Date()),
      operator: 'admin',
      action: 'approve',
      comment: curComment,
    })
    await AddOrderAuditLog(targetId, tempLog())
    fetchOrdersData() // 这里可以刷新列表
  } catch (err) {
    console.error('后端响应错误:', err)
    alert('发送失败，请检查网络或后端服务')
  } finally {
    isUploading.value = false
  }
  selectedOrder.value = null
  await fetchOrdersData() // 刷新列表
}

// 处理驳回
const handleReject = async (curOrder: IOrder, curComment: string) => {
  console.log('订单已被驳回')

  if (isUploading.value || !curOrder) return

  // 关键点：先把 ID 存起来，防止在 await 期间 selectedOrder 被意外清空
  const targetId = curOrder.order_unique
  if (!targetId) {
    alert('订单唯一标识缺失，无法更新状态')
    return
  }

  try {
    await ChangeOrderStatusTo(targetId, OrderStatus.REJECTED)
    await AddOrderAuditInfo(targetId, 'admin', formatYMD(new Date()))
    const tempLog = (): orderlog => ({
      time: formatFullTime(new Date()),
      operator: 'admin',
      action: 'reject',
      comment: curComment,
    })
    await AddOrderAuditLog(targetId, tempLog())
  } catch (err) {
    console.error('后端响应错误:', err)
    alert('发送失败，请检查网络或后端服务')
  }
  selectedOrder.value = null
  await fetchOrdersData()
}

// --- 2. 两个独立的数据源 ---
const pendingOrdersSource = ref<IOrder[]>([]) // 对应“未审核”标签
const reviewedOrdersSource = ref<IOrder[]>([]) // 对应“已审核”标签

// 初始化加载
onMounted(async () => {
  console.log('正在初始化审核页面数据...')
  await fetchOrdersData()
})

/**
 * 分别从两个接口获取数据
 */

const fetchOrdersData = async () => {
  try {
    // 逻辑 A: 获取所有待审核订单（不分审单员）
    const pendingData = await FindOrdersWithStatus(OrderStatus.PENDING_REVIEW)
    pendingOrdersSource.value = pendingData

    // 逻辑 B: 获取 admin 已经处理过的订单历史
    const reviewedData = await FindOrdersByAudit('admin')
    reviewedOrdersSource.value = reviewedData

    console.log('数据同步完成：待审', pendingData.length, '条，已审', reviewedData.length, '条')
  } catch (err) {
    console.error('数据获取失败:', err)
  }
}

// --- 3. 核心计算属性：处理展示逻辑 ---

const getFirstAuditTime = (order: IOrder): string => {
  // 如果 logs[0] 存在则取 time，否则返回 '-'
  return order.auditLogs?.[0]?.time ?? '-'
}

/**
 * 根据当前选中的 Tab，决定对哪一个数组进行“搜索”和“排序”
 */

// 3. 排序逻辑
const processedOrders = computed<IOrder[]>(() => {
  // 1. 明确 source 类型，解决 source 报错
  const source: IOrder[] =
    currentTab.value === 'PENDING' ? pendingOrdersSource.value : reviewedOrdersSource.value

  if (!source) return []

  // 2. 搜索过滤
  const q = searchQuery.value.trim().toLowerCase()
  const filtered = source.filter((o: IOrder) => {
    if (!q) return true
    return (
      (o.order_id?.toLowerCase().includes(q) ?? false) ||
      (o.customer?.toLowerCase().includes(q) ?? false)
    )
  })

  // 3. 排序逻辑
  const { key, order: direction } = sortConfig.value

  // 使用解构副本，保持原数组纯净
  return [...filtered].sort((a: IOrder, b: IOrder) => {
    let valA: string | number | boolean = ''
    let valB: string | number | boolean = ''

    if (key === 'submitTime') {
      valA = getFirstAuditTime(a)
      valB = getFirstAuditTime(b)
    } else {
      /**
       * 核心修复：使用 keyof IOrder 配合索引访问
       * 我们明确 key 是 IOrder 的键名，从而安全地提取值
       */
      const field = key as keyof IOrder

      // 提取值并提供默认回退，确保 valA/valB 始终是可比较的类型
      const rawA = a[field]
      const rawB = b[field]

      // 转换为基础类型以便比较 (处理可能的 undefined/null)
      valA =
        typeof rawA === 'string' || typeof rawA === 'number' || typeof rawA === 'boolean'
          ? rawA
          : ''
      valB =
        typeof rawB === 'string' || typeof rawB === 'number' || typeof rawB === 'boolean'
          ? rawB
          : ''
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1
    if (valA > valB) return direction === 'asc' ? 1 : -1
    return 0
  })
})

// --- 4. 交互函数 ---

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

const handleView = (order: IOrder) => {
  selectedOrder.value = order
}
</script>

<style scoped>
/* 样式部分保持不变... */
.uploader-wrapper {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: sans-serif;
}
.tab-header {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}
.tab-item {
  padding: 12px 4px;
  font-size: 16px;
  color: #64748b;
  cursor: pointer;
  position: relative;
  font-weight: 500;
}
.tab-item.active {
  color: #2563eb;
  font-weight: 700;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #2563eb;
}
.badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
  vertical-align: middle;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title-group {
  display: flex;
  align-items: center;
  gap: 20px;
}
.main-title {
  font-size: 20px;
  color: #1e293b;
}
.styled-input {
  padding: 8px 12px 8px 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 280px;
  outline: none;
}
.search-container {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.table-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.modern-table {
  width: 100%;
  border-collapse: collapse;
}
.modern-table th {
  background-color: #f8fafc;
  padding: 14px;
  text-align: left;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
}
.modern-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
}
.time-text {
  font-family: 'Courier New', monospace;
  color: #64748b;
  font-weight: 600;
}
.bold-text {
  font-weight: 700;
  color: #0f172a;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.APPROVED {
  background: #dcfce7;
  color: #15803d;
}
.REJECTED {
  background: #fee2e2;
  color: #b91c1c;
}
.view-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
}
.back-link {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 16px;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
</style>

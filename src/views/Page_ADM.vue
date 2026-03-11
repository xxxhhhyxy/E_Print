<template>
  <div class="adm-page">
    <div class="adm-header">
      <h2>订单追踪</h2>
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="搜索订单号或客户..." class="styled-input" />
        <button @click="fetchApprovedOrders" class="btn-refresh">刷新数据</button>
      </div>
    </div>

    <div class="table-container">
      <table class="adm-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>客户</th>
            <th>版本</th>
            <th>订单详情</th>
            <th>工程单详情</th>
            <th>采购进度</th>
            <th>外发进度</th>
            <th>生产进度</th>
            <th>发货状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredOrders" :key="item.order_id! + item.order_ver!">
            <td class="bold">{{ item.order_id }}</td>
            <td>{{ item.customer }}</td>
            <td>v{{ item.order_ver }}</td>
            <td>
              <button class="btn-action" @click="openOrder(item)">查看订单</button>
            </td>
            <td>
              <button
                class="btn-action secondary"
                @click="openWorkOrder(item.order_id!, item.order_ver!)"
              >
                查看工单
              </button>
            </td>
            <td class="status-empty">--</td>
            <td class="status-empty">--</td>
            <td class="status-empty">--</td>
            <td class="status-empty">--</td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="9" class="no-data">暂无已审核订单</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showOrderModal" class="modal-overlay">
      <div class="modal-content large">
        <OrderInfo
          :initialData="selectedOrder"
          :mode="OrderPageMode.VIEW"
          @close="showOrderModal = false"
        />
        <button class="close-modal-btn" @click="showOrderModal = false">关闭</button>
      </div>
    </div>

    <div v-if="showWorkModal" class="modal-overlay">
      <div class="modal-content large">
        <WorkOrderInfo
          :initialData="selectedWork"
          :mode="WorkPageMode.VIEW"
          @close="showWorkModal = false"
        />
        <button class="close-modal-btn" @click="showWorkModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

import WorkOrderInfo, { PageMode as WorkPageMode } from './WorkOrderInfo.vue'
import OrderInfo, { PageMode as OrderPageMode } from './OrderInfo.vue'
import { OrderStatus, type IOrder } from '@/types/Order'
import { FindOrdersWithStatus, FindWorkOrderByID } from '@/stores/request'
import type { IWorkOrder } from '@/types/WorkOrder'

// 页面状态控制
const orders = ref<IOrder[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

// 弹窗控制
const showOrderModal = ref(false)
const showWorkModal = ref(false)
const selectedOrder = ref<IOrder | null>(null)
const selectedWork = ref<IWorkOrder | null>(null)

// 1. 初始化加载：获取所有已审核(APPROVED)的订单
onMounted(async () => {
  await fetchApprovedOrders()
})

async function fetchApprovedOrders() {
  try {
    isLoading.value = true
    // 使用你现有的函数从服务器获取数据
    const data = await FindOrdersWithStatus(OrderStatus.APPROVED)
    // 赋值给响应式变量
    // 如果提示类型不匹配，可以使用 data as IOrder[]
    orders.value = data
  } catch (error) {
    console.error('加载订单失败:', error)
    // 这里可以添加一个 UI 提示，比如 message.error('加载失败')
  } finally {
    isLoading.value = false
  }
}

// 2. 搜索过滤
const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value
  const q = searchQuery.value.toLowerCase()
  return orders.value.filter(
    (o) => o.order_id?.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q),
  )
})

// 3. 打开详情页面的逻辑
const openOrder = (input: IOrder) => {
  selectedOrder.value = input
  showOrderModal.value = true
}

const openWorkOrder = async (id: string, ver: string) => {
  const tempWorkUnique = id + '_W_' + ver
  selectedWork.value = await FindWorkOrderByID(tempWorkUnique)
  showWorkModal.value = true
}
</script>
<style scoped>
.adm-page {
  padding: 20px;
  background: #f4f7f9;
  min-height: 100vh;
}
.adm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.adm-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.adm-table th {
  background: #334155;
  color: white;
  padding: 12px;
  text-align: left;
}

.adm-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.bold {
  font-weight: bold;
  color: #1e293b;
}

.btn-action {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-action.secondary {
  background: #10b981;
}

.status-empty {
  color: #94a3b8;
  font-style: italic;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content.large {
  background: white;
  width: 90%;
  height: 90%;
  overflow-y: auto;
  position: relative;
  border-radius: 8px;
}
.close-modal-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  z-index: 1001;
}
</style>

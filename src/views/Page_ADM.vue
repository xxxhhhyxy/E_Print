<template>
  <div class="adm-page">
    <div class="adm-header">
      <h2>跟单系统</h2>
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
            <th>跟单细节</th>
            <th>订单表</th>
            <th>工单表</th>
            <th>采购进度</th>
            <th>外发进度</th>
            <th>生产进度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(group, inputID) in groupedOrders" :key="inputID">
            <td class="bold">{{ inputID }}</td>
            <td>{{ group[0]?.customer }}</td>
            <td>
              <button class="btn-action" @click="openCoordinator(inputID, group)">跟单细节</button>
            </td>
            <td>
              <button class="btn-action" @click="group[0] && openOrder(group[0])">查看订单</button>
            </td>
            <td>
              <button
                class="btn-action secondary"
                @click="group[0] && openWorkOrder(group[0].order_id!, group[0].order_ver!)"
              >
                查看工单
              </button>
            </td>
            <td class="status-empty">--</td>
            <td class="status-empty">--</td>
            <td class="status-empty">--</td>
          </tr>
          <tr v-if="Object.keys(groupedOrders).length === 0">
            <td colspan="9" class="no-data">暂无匹配的订单数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCoordinator" class="modal-overlay">
      <div class="modal-content large">
        <OrderCoordinator
          :inputID="selectedID"
          :inputGroup="selectedGroup"
          @close="showCoordinator = false"
        />
      </div>
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
import OrderCoordinator from './OrderCoordinator.vue'

// 状态
const orders = ref<IOrder[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const selectedID = ref<string>('')
const selectedGroup = ref<IOrder[]>([]) // 新增：用于存储传递给组件的数组
const showOrderModal = ref(false)
const showWorkModal = ref(false)
const showCoordinator = ref(false)
const selectedOrder = ref<IOrder | null>(null)
const selectedWork = ref<IWorkOrder | null>(null)

onMounted(async () => {
  await fetchApprovedOrders()
})

async function fetchApprovedOrders() {
  try {
    isLoading.value = true
    const data = await FindOrdersWithStatus(OrderStatus.APPROVED)
    orders.value = data
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 1. 过滤逻辑：匹配单号或客户
const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value
  const q = searchQuery.value.toLowerCase()
  return orders.value.filter(
    (o) =>
      (o.order_id && o.order_id.toLowerCase().includes(q)) ||
      (o.customer && o.customer.toLowerCase().includes(q)),
  )
})

// 2. 归组逻辑：仅用于合并重复单号
const groupedOrders = computed(() => {
  const groups: Record<string, IOrder[]> = {}
  filteredOrders.value.forEach((order) => {
    const id = order.order_id
    if (id) {
      if (!groups[id]) groups[id] = []
      groups[id].push(order)
    }
  })
  return groups
})

const openOrder = (input: IOrder) => {
  selectedOrder.value = input
  showOrderModal.value = true
}

// 修改后的 openCoordinator 函数
const openCoordinator = (id: string, group: IOrder[]) => {
  selectedID.value = id
  selectedGroup.value = group // 存储对应的 IOrder 数组
  showCoordinator.value = true
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
.styled-input {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  width: 280px;
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
  padding: 14px 12px;
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
  padding: 6px 14px;
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
  width: 95%;
  height: 92%;
  overflow-y: auto;
  position: relative;
  border-radius: 12px;
}
.close-modal-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1001;
}
</style>

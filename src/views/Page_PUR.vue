<template>
  <div class="page-container">
    <header class="page-header">
      <h2>采购部任务列表 (PUR)</h2>
      <button class="btn-refresh" @click="fetchOrders" :disabled="isLoading">
        {{ isLoading ? '刷新中...' : '刷新数据' }}
      </button>
    </header>

    <div class="table-wrapper">
      <table class="standard-table">
        <thead>
          <tr class="bg-gray">
            <th width="60">序号</th>
            <th>客户名称</th>
            <th width="80">版本</th>
            <th width="150">过审日期</th>
            <th>任务详情</th>
            <th width="120">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(order, index) in orderList" :key="order.work_id" class="hover-row">
            <td class="col-center">{{ index + 1 }}</td>
            <td class="col-left">{{ order.customer }}</td>
            <td class="col-center">
              <span class="ver-badge">V{{ order.work_ver }}</span>
            </td>
            <td class="col-center">{{ order.auditDate || '---' }}</td>
            <td>{{ order.intermedia }}</td>
            <td class="col-center"></td>
          </tr>

          <tr v-if="orderList.length === 0">
            <td colspan="6" class="empty-text">暂无待处理订单</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FindWorkOrdersWithStatus } from '@/stores/request'
import { WorkOrderStatus, type IWorkOrder } from '@/types/WorkOrder'

const orderList = ref<IWorkOrder[]>([])
const isLoading = ref(false)

// 获取数据
const fetchOrders = async () => {
  isLoading.value = true
  try {
    // 假设采购部只处理已审核(PASS)状态的工程单
    const data = await FindWorkOrdersWithStatus(WorkOrderStatus.IN_PRODUCTION)
    orderList.value = data.filter((work) => work.intermedia.length > 0)
  } catch (error) {
    console.error('获取订单失败:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #fdfdfd;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 复用你的标准表格样式 */
.standard-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  background: #fff;
}

.standard-table th,
.standard-table td {
  border: 1px solid #000;
  padding: 10px;
}

.bg-gray {
  background-color: #f1f5f9;
  font-weight: bold;
}

.col-center {
  text-align: center;
}
.col-left {
  text-align: left;
  padding-left: 15px;
}

.font-bold {
  font-weight: bold;
}

.ver-badge {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.btn-action {
  background: #0f172a;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 2px;
}

.btn-action:hover {
  background: #334155;
}

.hover-row:hover {
  background-color: #f8fafc;
}

.empty-text {
  text-align: center;
  padding: 40px !important;
  color: #94a3b8;
}
</style>

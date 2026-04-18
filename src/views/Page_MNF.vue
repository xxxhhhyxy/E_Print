<template>
  <div class="page-container">
    <header class="page-header">
      <h2>生产部装订任务列表 (MNF)</h2>
      <div class="header-actions">
        <button class="btn-refresh" @click="fetchOrders" :disabled="isLoading">
          {{ isLoading ? '刷新中...' : '刷新数据' }}
        </button>
      </div>
    </header>

    <div class="table-wrapper">
      <table class="standard-table">
        <thead>
          <tr class="bg-gray">
            <th width="140">工单号 (Unique)</th>
            <th>客户</th>
            <th>产品名称</th>
            <th width="120">装订开始</th>
            <th width="250">进度一览</th>
            <th width="250">结束日期/进度同步</th>
            <!-- <th width="250">装订进度 (已装订/订单数)</th> -->
            <th width="100">状态</th>
          </tr>
        </thead>
        <tbody v-for="order in orderList" :key="order.work_unique" class="hover-row">
          <tr>
            <td rowspan="2" class="col-center font-bold">{{ order.work_unique }}</td>
            <td rowspan="2" class="col-center">{{ order.customer }}</td>
            <td rowspan="2" class="col-center">{{ order.productName }}</td>
            <td rowspan="2" class="col-center">
              <input type="date" v-model="order.zhuangDingStart" class="cell-input" />
            </td>

            <td class="progress-td">
              <div class="progress-track">
                <div
                  class="bar-fill time-flow"
                  :style="{
                    width: `${calculateTimeProgress(order.zhuangDingStart || '', order.zhuangDingEnd || '')}%`,
                  }"
                >
                  <span
                    v-if="
                      calculateTimeProgress(
                        order.zhuangDingStart || '',
                        order.zhuangDingEnd || '',
                      ) > 5
                    "
                    class="bar-label"
                  >
                    {{
                      calculateTimeProgress(order.zhuangDingStart || '', order.zhuangDingEnd || '')
                    }}%
                  </span>
                </div>
              </div>
            </td>
            <td class="col-center">
              <input type="date" v-model="order.zhuangDingEnd" class="cell-input" />
            </td>

            <td
              rowspan="2"
              :style="{ color: TaskStatusColors[getTaskStatus_Mnf(order)], fontWeight: 'bold' }"
            >
              {{ getTaskStatus_Mnf(order) }}
            </td>
          </tr>
          <tr>
            <td class="progress-td">
              <div class="progress-track">
                <div
                  class="bar-fill production-flow"
                  :style="{
                    width:
                      Math.min(
                        100,
                        Math.max(
                          0,
                          ((order.zhuangDingJianShu || 0) / (order.dingDanShuLiang || 0)) * 100,
                        ),
                      ) + '%',
                  }"
                >
                  <span
                    v-if="((order.zhuangDingJianShu || 0) / (order.dingDanShuLiang || 0)) * 100 > 5"
                    class="bar-label"
                  >
                    {{
                      (
                        ((order.zhuangDingJianShu || 0) / (order.dingDanShuLiang || 0)) *
                        100
                      ).toFixed(2)
                    }}%
                  </span>
                </div>
              </div>
            </td>
            <td class="col-center">
              <div class="qty-input-group">
                <input
                  type="number"
                  v-model.number="order.zhuangDingJianShu"
                  class="input-mini"
                  placeholder="0"
                />
                <span class="divider">/</span>
                <span class="total-num">{{ order.dingDanShuLiang || 0 }}</span>
                <button
                  @click="syncMnfProgress(order)"
                  :class="{ 'btn-active': order.zhuangDingJianShu !== order.lastSyncedQty }"
                  :disabled="order.zhuangDingJianShu === order.lastSyncedQty"
                >
                  同步
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="orderList.length === 0">
            <td colspan="6" class="empty-text">暂无装订任务</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
// 注意：此处假设你有 UpdateProgress_Mnf 接口，如果没有请修改为实际接口名
import { FindWorkOrdersWithStatus, UpdateProgress_Mnf } from '@/stores/request'
import {
  calculateTimeProgress,
  getTaskStatus_Mnf,
  TaskStatusColors,
  WorkOrderStatus,
  type IWorkOrder,
} from '@/types/WorkOrder'

// 1. 扩展 IWorkOrder 类型，增加记录原始值的字段用于 UI 交互
interface IWorkOrderExtended extends IWorkOrder {
  lastSyncedQty?: number
}

const orderList = ref<IWorkOrderExtended[]>([])
const isLoading = ref(false)

// 3. 检查是否有未保存的修改
const hasUnsavedChanges = computed(() => {
  return orderList.value.some((order) => order.zhuangDingJianShu !== order.lastSyncedQty)
})

// 4. 获取数据
const fetchOrders = async () => {
  isLoading.value = true
  try {
    const data = await FindWorkOrdersWithStatus(WorkOrderStatus.IN_PRODUCTION)
    orderList.value = data.map((order) => ({
      ...order,
      lastSyncedQty: order.zhuangDingJianShu || 0,
    }))
  } catch (error) {
    console.error('获取任务失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 5. 同步进度
const syncMnfProgress = async (order: IWorkOrderExtended) => {
  const newQty = order.zhuangDingJianShu
  if (newQty === undefined || newQty === null) return

  try {
    // 调用更新接口：传入唯一ID和新的装订件数
    await UpdateProgress_Mnf(order.work_unique, newQty)
    order.lastSyncedQty = newQty
    alert('装订进度同步成功')
  } catch (error) {
    console.error('同步失败:', error)
    alert('同步失败')
  }
}

// 6. 路由与浏览器拦截 (保持与 PUR 页面一致)
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    if (window.confirm('您有装订进度尚未同步，确定要离开吗？')) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  fetchOrders()
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
/* 继承自 Page_PUR 的标准样式 */
.page-container {
  padding: 20px;
  background: #fdfdfd;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 10px;
}
.standard-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  background: #fff;
}
.standard-table th,
.standard-table td {
  border: 1px solid #000;
  padding: 8px;
  font-size: 14px;
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
  padding-left: 12px;
}
.font-bold {
  font-weight: bold;
}

/* 进度列样式 */
.qty-input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.input-mini {
  width: 80px;
  padding: 4px;
  border: 1px solid #94a3b8;
  border-radius: 4px;
  text-align: center;
}
.divider {
  color: #94a3b8;
  font-weight: bold;
}
.total-num {
  font-weight: 600;
  color: #334155;
}

/* 按钮状态 */
button {
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #eee;
}
.btn-active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}
.btn-refresh {
  background: #0f172a;
  color: white;
  border: none;
  padding: 8px 16px;
}

.status-badge {
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.product-info {
  display: flex;
  flex-direction: column;
}
.customer-tag {
  font-size: 11px;
  color: #64748b;
}
.product-name {
  margin: 0;
  font-weight: 500;
}
.empty-text {
  text-align: center;
  padding: 50px !important;
  color: #94a3b8;
}
.progress-td {
  padding: 8px 12px !important;
  background-color: #fafafa;
}

.progress-track {
  width: 100%;
  height: 20px;
  background: #eee;
  border: 1px solid #333; /* 延续你的工业风黑边 */
  box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  align-items: center;
}

.bar-fill {
  height: 100%;
  transition: width 0.8s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
/* 生产进度感：绿色调 */
.production-flow {
  background: linear-gradient(to right, #ffffff, #00eaff);
}
/* 时间流逝感：深色调 */
.time-flow {
  background: linear-gradient(to right, #ffffff, #8cff00);
}
.progress-td {
  padding: 8px 12px !important;
  background-color: #fafafa;
}

.progress-track {
  width: 100%;
  height: 20px;
  background: #eee;
  border: 1px solid #333; /* 延续你的工业风黑边 */
  box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  align-items: center;
}
</style>

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

    <div class="tab-container">
      <button
        class="tab-item"
        :class="{ active: currentTab === 'pending' }"
        @click="currentTab = 'pending'"
      >
        待领取任务 ({{ pendingTasks.length }})
      </button>
      <button
        class="tab-item"
        :class="{ active: currentTab === 'active' }"
        @click="currentTab = 'active'"
      >
        已领取任务 ({{ activeTasks.length }})
      </button>
    </div>

    <div class="table-wrapper">
      <table v-if="currentTab === 'pending'" class="standard-table">
        <thead>
          <tr class="bg-gray">
            <th width="140">工单号 (Unique)</th>
            <th>客户</th>
            <th>产品名称</th>
            <th width="120">装订开始</th>
            <th width="120">装订结束</th>
            <th width="100">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in pendingTasks" :key="order.work_unique" class="hover-row">
            <td class="col-center font-bold">{{ order.work_unique }}</td>
            <td class="col-center">{{ order.customer || '-' }}</td>
            <td class="col-center">{{ order.productName || '-' }}</td>
            <td class="col-center">{{ order.zhuangDingStart || '未设置' }}</td>
            <td class="col-center">{{ order.zhuangDingEnd || '未设置' }}</td>
            <td class="col-center">
              <button class="btn-claim" @click="takeTask_Mnf(order)">
                <template v-if="order.head_MNF">
                  {{ currentUser.name }}
                </template>
                <template v-else>认领</template>
              </button>
            </td>
          </tr>
          <tr v-if="pendingTasks.length === 0">
            <td colspan="6" class="empty-text">暂无待认领任务</td>
          </tr>
        </tbody>
      </table>

      <table v-else class="standard-table">
        <thead>
          <tr class="bg-gray">
            <th width="140">工单号 (Unique)</th>
            <th>客户</th>
            <th>产品名称</th>
            <th width="120">装订开始</th>
            <th width="250">进度一览</th>
            <th width="250">结束日期/进度同步</th>
            <th width="100">状态</th>
          </tr>
        </thead>
        <template v-for="order in activeTasks" :key="order.work_unique">
          <tbody class="hover-row-group">
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
                        calculateTimeProgress(
                          order.zhuangDingStart || '',
                          order.zhuangDingEnd || '',
                        )
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
                class="col-center"
                :style="{ color: TaskStatusColors[getTaskStatus_Mnf(order)], fontWeight: 'bold' }"
              >
                {{ getTaskStatus_Mnf(order) }}
              </td>
            </tr>
            <tr>
              <td class="progress-td">
                <div class="progress-track">
                  <div
                    class="bar-fill zhuangDing-flow"
                    :style="{
                      width:
                        Math.min(
                          100,
                          Math.max(
                            0,
                            ((order.zhuangDingJianShu || 0) / (order.dingDanShuLiang || 1)) * 100,
                          ),
                        ) + '%',
                    }"
                  >
                    <span
                      v-if="
                        ((order.zhuangDingJianShu || 0) / (order.dingDanShuLiang || 1)) * 100 > 5
                      "
                      class="bar-label"
                    >
                      {{
                        (
                          ((order.zhuangDingJianShu || 0) / (order.dingDanShuLiang || 1)) *
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
          </tbody>
        </template>
        <tbody v-if="activeTasks.length === 0">
          <tr>
            <td colspan="7" class="empty-text">暂无已认领任务</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { AddHead_Mnf, FindWorkOrdersWithStatus, UpdateProgress_Mnf } from '@/stores/request'
import { useUserStore } from '@/stores/userStore'
import {
  calculateTimeProgress,
  getTaskStatus_Mnf,
  TaskStatusColors,
  WorkOrderStatus,
  type IWorkOrder,
} from '@/types/WorkOrder'

interface IWorkOrderExtended extends IWorkOrder {
  lastSyncedQty?: number
}

const orderList = ref<IWorkOrderExtended[]>([])
const isLoading = ref(false)
const currentTab = ref<'pending' | 'active'>('pending') // 默认显示未领取

// 逻辑过滤：待领取 = 无人认领；已领取 = 当前用户认领的（不显示别人的任务）
const pendingTasks = computed(() => orderList.value.filter((o) => !o.head_MNF))
const activeTasks = computed(() => orderList.value.filter((o) => o.head_MNF === currentUser.value.name))

const hasUnsavedChanges = computed(() => {
  return activeTasks.value.some((order) => order.zhuangDingJianShu !== order.lastSyncedQty)
})

const fetchOrders = async () => {
  isLoading.value = true
  try {
    // 第一步：获取生产中的工单
    const data = await FindWorkOrdersWithStatus(WorkOrderStatus.IN_PRODUCTION)

    // 第二步：筛选出 intermedia 中所有 IIM 元素的 dangQianJinDu 都 >= 100 的工单
    const DataForMNF = data.filter((order) => {
      // 确保 intermedia 存在且其内部所有工序进度均为 100
      return (
        order.intermedia &&
        order.intermedia.length > 0 &&
        order.intermedia.every((item) => (item.dangQianJinDu || 0) >= 100)
      )
    })

    // 第三步：核对 head_MNF 并映射数据
    // 注意：由于组件内部使用了 pendingTasks 和 activeTasks 这两个基于 orderList 的计算属性，
    // 我们只需要正确填充 orderList 即可。
    orderList.value = DataForMNF.map((order) => ({
      ...order,
      // 初始化同步比对值
      lastSyncedQty: order.zhuangDingJianShu || 0,
    }))

    // 说明：
    // 1. 如果 order.head_MNF === currentUser.value.name，计算属性 activeTasks 会自动提取它。
    // 2. 如果 order.head_MNF 为空或不匹配，计算属性 pendingTasks 会自动提取它。
  } catch (error) {
    console.error('获取任务失败:', error)
  } finally {
    isLoading.value = false
  }
}

const userStore = useUserStore()
const currentUser = computed(() => ({ name: userStore.userName }))
// 认领函数
const takeTask_Mnf = async (order: IWorkOrderExtended) => {
  if (order.head_MNF) return

  const confirmMsg = '确认认领该任务吗?'
  if (!window.confirm(confirmMsg)) return

  try {
    await AddHead_Mnf(order.work_unique, currentUser.value.name)
    // 本地即时更新 + 重新拉取，认领后任务立刻进入"已领取"标签（无需手动刷新）
    order.head_MNF = currentUser.value.name
    await fetchOrders()
    console.log('认领成功，负责人已变更为:', currentUser.value.name)
  } catch (error) {
    console.error('认领失败:', error)
    alert('认领失败，请稍后重试')
  }
}

const syncMnfProgress = async (order: IWorkOrderExtended) => {
  const newQty = order.zhuangDingJianShu
  if (newQty === undefined || newQty === null) return
  try {
    await UpdateProgress_Mnf(order.work_unique, newQty)
    order.lastSyncedQty = newQty
    alert('装订进度同步成功')
  } catch (error) {
    console.error('获取任务失败:', error)
  }
}

// 路由与生命周期处理...
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    if (window.confirm('您有装订进度尚未同步，确定要离开吗？')) next()
    else next(false)
  } else next()
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
/* 保持原有样式并增加 Tab 样式 */
.tab-container {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.tab-item {
  padding: 10px 20px;
  background: #f1f5f9;
  border: 1px solid #ccc;
  border-bottom: none;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s;
}

.tab-item.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
  font-weight: bold;
}

.btn-claim {
  background-color: #10b981; /* 绿色表示领取 */
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
}

.hover-row-group:hover {
  background-color: #f8fafc;
}

/* 之前原有的 CSS 保持不变... */
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
.progress-track {
  width: 100%;
  height: 20px;
  background: #eee;
  border: 1px solid #333;
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
.production-flow {
  background: linear-gradient(to right, #ffffff, #00eaff);
}
.time-flow {
  background: linear-gradient(to right, #ffffff, #8cff00);
}
.bar-label {
  font-size: 10px;
  font-weight: bold;
  padding-right: 4px;
  color: #333;
}
.cell-input {
  width: 95%;
  border: none;
  text-align: center;
  background: transparent;
  cursor: pointer;
}

.zhuangDing-flow {
  background: linear-gradient(to right, #ffffff, #ff00ea);
}
</style>

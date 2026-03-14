<template>
  <div class="page-container">
    <header class="page-header">
      <h2>采购部任务列表 (PUR)</h2>
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
            <th width="140">工单号</th>
            <th width="120">过审时间</th>
            <th>物料名称</th>
            <th>品牌</th>
            <th>材料规格</th>
            <th width="180">采购数量 (已到货/目标数)</th>
            <th width="100">状态</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="order in orderList" :key="order.work_id">
            <tr v-for="(item, idx) in order.intermedia" :key="idx" class="hover-row">
              <td class="col-center font-bold">
                {{ order.work_id }}
              </td>

              <td class="col-center">
                {{ order.auditDate || '---' }}
              </td>

              <td class="col-left">{{ item.wuLiaoMingCheng || '-' }}</td>
              <td class="col-center">{{ item.pinPai || '-' }}</td>
              <td class="col-center">{{ item.caiLiaoGuiGe || '-' }}</td>

              <td class="col-center">
                <div class="qty-input-group">
                  <input
                    type="number"
                    v-model.number="yiGouJianShuMap[`${order.work_id}_${idx}`]"
                    class="input-mini"
                    placeholder="0"
                  />
                  <span class="divider">/</span>
                  <span class="total-num">{{ item.lingLiaoShu || 0 }}</span>
                </div>
              </td>

              <td class="col-center">
                <span
                  class="status-badge"
                  :style="{
                    backgroundColor: getPurStatus(order.work_id, idx, item.lingLiaoShu || 0).color,
                  }"
                >
                  {{ getPurStatus(order.work_id, idx, item.lingLiaoShu || 0).text }}
                </span>
              </td>
            </tr>
          </template>

          <tr v-if="orderList.length === 0">
            <td colspan="7" class="empty-text">暂无待采购物料任务</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { FindWorkOrdersWithStatus } from '@/stores/request'
import { WorkOrderStatus, type IWorkOrder } from '@/types/WorkOrder'

const orderList = ref<IWorkOrder[]>([])
const isLoading = ref(false)

const yiGouJianShuMap = reactive<Record<string, number>>({})

/** * 状态判断逻辑
 * @param orderId 工单ID
 * @param index 物料索引
 * @param total 需领料总数
 */
const getPurStatus = (orderId: string, index: number, total: number) => {
  const key = `${orderId}_${index}`
  const purchased = yiGouJianShuMap[key] || 0

  // 判断逻辑：已购 / 总数 >= 1
  if (total > 0 && purchased >= total) {
    return { text: '已完成', color: '#008800' } // 绿色
  }
  return { text: '未完成', color: '#ff0000' } // 红色
}

// 获取数据后可以初始化（如果需要从后端现有的进度加载初值）
const fetchOrders = async () => {
  isLoading.value = true
  try {
    const data = await FindWorkOrdersWithStatus(WorkOrderStatus.IN_PRODUCTION)
    orderList.value = data.filter((work) => work.intermedia && work.intermedia.length > 0)

    // 初始化 map (可选：如果想把已有的 dangQianJinDu 作为初始已购数显示)
    orderList.value.forEach((order) => {
      order.intermedia.forEach((item, idx) => {
        const key = `${order.work_id}_${idx}`
        yiGouJianShuMap[key] = item.dangQianJinDu || 0
      })
    })
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
  border-bottom: 2px solid #0f172a;
  padding-bottom: 10px;
}

/* 标准表格样式 */
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

/* 数量输入组 */
.qty-input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.input-mini {
  width: 70px;
  padding: 4px;
  border: 1px solid #94a3b8;
  border-radius: 4px;
  text-align: center;
  outline-color: #0f172a;
}

.divider {
  color: #94a3b8;
  font-weight: bold;
}

.total-num {
  font-weight: 600;
  color: #334155;
}

/* 状态标签 */
.status-badge {
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}

.btn-refresh {
  background: #0f172a;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: opacity 0.2s;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hover-row:hover {
  background-color: #f8fafc;
}

.empty-text {
  text-align: center;
  padding: 50px !important;
  color: #94a3b8;
}
</style>

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
                    v-model.number="item.yiGouJianShu"
                    class="input-mini"
                    placeholder="0"
                  />
                  <!-- <input
                    type="number"
                    v-model.number="item.yiGouJianShu"
                    class="input-mini"
                    placeholder="0"
                  />
                   -->
                  <span class="divider">/</span>
                  <span class="total-num">{{ item.lingLiaoShu || 0 }}</span>
                  <button
                    @click="syncPurProgress(order, item, idx)"
                    :class="{ 'btn-active': item.yiGouJianShu !== item.lastSyncedQty }"
                    :disabled="item.yiGouJianShu === item.lastSyncedQty"
                  >
                    同步
                  </button>
                </div>
              </td>

              <!-- <td class="col-center">
                <span
                  class="status-badge"
                  :style="{
                    backgroundColor: getPurStatus(order.work_unique, idx, item.lingLiaoShu || 0)
                      .color,
                  }"
                >
                  {{ getPurStatus(order.work_unique, idx, item.lingLiaoShu || 0).text }}
                </span>
              </td> -->
              <td class="col-center">
                <span
                  class="status-badge"
                  :style="{
                    backgroundColor: getPurStatus(item.yiGouJianShu || 0, item.lingLiaoShu || 0)
                      .color,
                  }"
                >
                  {{ getPurStatus(item.yiGouJianShu || 0, item.lingLiaoShu || 0).text }}
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router' // 引入路由守卫
import { FindWorkOrdersWithStatus, UpdateProgress_Out, UpdateProgress_Pur } from '@/stores/request'
import { formatYMD, WorkOrderStatus, type IIM, type IWorkOrder } from '@/types/WorkOrder'

// 1. 扩展 IIM 类型，增加记录原始值的字段
interface IIMExtended extends IIM {
  lastSyncedQty?: number // 记录上一次同步后的数量
}

interface IWorkOrderExtended extends Omit<IWorkOrder, 'intermedia'> {
  intermedia: IIMExtended[]
}

const orderList = ref<IWorkOrderExtended[]>([])
// const orderList = ref<IWorkOrder[]>([])
const isLoading = ref(false)

// const yiGouJianShuMap = reactive<Record<string, number>>({})

/** * 状态判断逻辑
 * @param orderId 工单ID
 * @param index 物料索引
 * @param total 需领料总数
 */
// const getPurStatus = (orderId: string, index: number, total: number) => {
//   const key = `${orderId}_${index}`
//   const purchased = yiGouJianShuMap[key] || 0

//   // 判断逻辑：已购 / 总数 >= 1
//   if (total > 0 && purchased >= total) {
//     return { text: '已完成', color: '#008800' } // 绿色
//   }
//   return { text: '未完成', color: '#ff0000' } // 红色
// }

// 2. 计算属性：检查全局是否有任何行未同步 (用于离开页面时的弹窗)
const hasUnsavedChanges = computed(() => {
  return orderList.value.some((order) =>
    order.intermedia.some((item) => item.yiGouJianShu !== item.lastSyncedQty),
  )
})

const getPurStatus = (purchased: number, total: number) => {
  if (total > 0 && purchased >= total) {
    return { text: '已完成', color: '#008800' }
  }
  return { text: '未完成', color: '#ff0000' }
}
// 获取数据后可以初始化（如果需要从后端现有的进度加载初值）
const fetchOrders = async () => {
  isLoading.value = true
  try {
    const data = await FindWorkOrdersWithStatus(WorkOrderStatus.IN_PRODUCTION)
    // 获取数据时，初始化 lastSyncedQty 为当前的 yiGouJianShu
    orderList.value = data
      .filter((work) => work.intermedia && work.intermedia.length > 0)
      .map((order) => ({
        ...order,
        intermedia: order.intermedia.map((item) => ({
          ...item,
          // 假设后端返回的初始值是 yiGouJianShu 或 dangQianJinDu
          lastSyncedQty: item.yiGouJianShu || 0,
        })),
      }))
  } finally {
    isLoading.value = false
  }
}
const syncPurProgress = async (work: IWorkOrder, item: IIMExtended, idx: number) => {
  const newQty = item.yiGouJianShu
  // if (newQty === undefined || newQty === null) {
  //   alert('请输入有效的数量')
  //   return
  // }
  if (newQty === undefined) {
    alert('未定义')
    return
  }
  if (newQty === null) {
    alert('空')
    return
  }
  try {
    await UpdateProgress_Pur(work.work_unique, idx, newQty)
    // 同步成功后，更新该行的 lastSyncedQty，使按钮重新变回失活状态
    item.lastSyncedQty = newQty

    if ((item.yiGouJianShu || 0) >= (item.lingLiaoShu || 0)) {
      await UpdateProgress_Out(
        work.work_unique,
        idx,
        formatYMD(new Date()),
        formatYMD(work.chuHuoRiqiRequired),
        0,
      )
    }
    alert('同步成功')
  } catch (error) {
    console.error('同步失败:', error)
    alert('同步失败')
  }
}
// 3. 路由守卫：拦截 Vue Router 内部的跳转
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('您的修改尚未保存或同步，确定要离开页面吗？')
    if (answer) {
      next()
    } else {
      next(false) // 取消跳转
    }
  } else {
    next()
  }
})
// 4. 浏览器拦截：处理用户直接关闭标签页或刷新浏览器的情况
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = '' // 现代浏览器标准写法
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

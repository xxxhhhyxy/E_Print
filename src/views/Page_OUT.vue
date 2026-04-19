<template>
  <div class="page-container">
    <header class="page-header">
      <h2>外发部任务列表 (OUT)</h2>
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
      <div v-if="currentTab === 'pending' || currentTab === 'active'">
        <div
          v-for="task in currentTab === 'pending' ? pendingTasks : activeTasks"
          :key="`${task.workOrder.work_unique}_${task.item.intermediaID}`"
          class="item-space"
        >
          <table v-if="currentTab === 'pending'" class="standard-table">
            <tbody>
              <tr>
                <td colspan="2" class="bg-gray">工单类型</td>
                <td>{{ task.workOrder.gongDanLeiXing }}</td>
                <td class="bg-gray">材料</td>
                <td>{{ task.workOrder.caiLiao }}</td>
                <td class="bg-gray">产品类型</td>
                <td>{{ task.workOrder.chanPinLeiXing }}</td>
                <td class="bg-gray">制单时间</td>
                <td colspan="2">{{ task.workOrder.zhiDanShiJian }}</td>
              </tr>
              <tr class="bg-gray align-center">
                <td>客户</td>
                <td>客户PO</td>
                <td>成品名称</td>
                <td>产品规格</td>
                <td>订单数量</td>
                <td>出样数</td>
                <td>超比例数</td>
                <td>本厂放损</td>
                <td>出样日期</td>
                <td>出货日期</td>
              </tr>
              <tr>
                <td>{{ task.workOrder.customer }}</td>
                <td>{{ task.workOrder.customerPO }}</td>
                <td>{{ task.workOrder.productName }}</td>
                <td>{{ task.workOrder.chanPinGuiGe }}</td>
                <td>{{ task.workOrder.dingDanShuLiang }}</td>
                <td>{{ task.workOrder.chuYangShuLiang }}</td>
                <td>{{ task.workOrder.chaoBiLiShuLiang }}</td>
                <td>{{ task.workOrder.benChangFangSun }}</td>
                <td>{{ task.workOrder.chuYangRiqiRequired }}</td>
                <td>{{ task.workOrder.chuHuoRiqiRequired }}</td>
              </tr>
            </tbody>
          </table>

          <table class="standard-table">
            <thead>
              <tr class="bg-gray">
                <th width="40">序号</th>
                <th>部件名称</th>
                <th>印刷颜色</th>
                <th>物料名称</th>
                <th>品牌</th>
                <th>规格</th>
                <th>FSC</th>
                <th>开数</th>
                <th>上机尺寸</th>
                <th>排版模数</th>
                <th>印出数</th>
                <th>印损</th>
                <th>领料数</th>
                <th>表面处理</th>
                <th>印刷板数</th>
                <th>生产路径</th>
                <th>排版方式</th>
                <th width="80">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr class="main-params-row">
                <td class="align-center bg-index">{{ task.item.intermediaID }}</td>
                <td>{{ task.item.buJianMingCheng }}</td>
                <td>{{ task.item.yinShuaYanSe }}</td>
                <td>{{ task.item.wuLiaoMingCheng }}</td>
                <td>{{ task.item.pinPai }}</td>
                <td>{{ task.item.caiLiaoGuiGe }}</td>
                <td>{{ task.item.FSC }}</td>
                <td>{{ task.item.kaiShu }}</td>
                <td>{{ task.item.shangJiChiCun }}</td>
                <td>{{ task.item.paiBanMuShu }}</td>
                <td>{{ task.item.yinChuShu }}</td>
                <td>{{ task.item.yinSun }}</td>
                <td>{{ task.item.lingLiaoShu }}</td>
                <td>{{ task.item.biaoMianChuLi }}</td>
                <td>{{ task.item.yinShuaBanShu }}</td>
                <td>{{ task.item.shengChanLuJing }}</td>
                <td>{{ task.item.paiBanFangShi }}</td>
                <td class="align-center">
                  <template v-if="currentTab === 'pending'">
                    <button
                      class="btn-take"
                      :class="{ 'is-taken': !!task.item.head_OUT }"
                      @click="takeTask_Out(task.workOrder.work_unique, task.item)"
                      :disabled="!!task.item.head_OUT"
                    >
                      {{ task.item.head_OUT ? task.item.head_OUT : '认领' }}
                    </button>
                  </template>

                  <template v-else>
                    <span
                      :style="{
                        color: TaskStatusColors[getTaskStatus_Out(task.item)],
                        fontWeight: 'bold',
                      }"
                    >
                      {{ getTaskStatus_Out(task.item) }}
                    </span>
                  </template>
                </td>
              </tr>
              <template v-if="currentTab === 'active'">
                <tr>
                  <td>开始日期</td>
                  <td>{{ formatYMD(task.item.kaiShiRiQi) || '未设定' }}</td>
                  <td colspan="14" class="progress-td">
                    <div class="progress-track">
                      <div
                        class="bar-fill time-flow"
                        :style="{
                          width: `${calculateTimeProgress(task.item.kaiShiRiQi || '', task.item.yuQiJieShu || '')}%`,
                        }"
                      >
                        <span
                          v-if="
                            calculateTimeProgress(
                              task.item.kaiShiRiQi || '',
                              task.item.yuQiJieShu || '',
                            ) > 5
                          "
                          class="bar-label"
                        >
                          {{
                            calculateTimeProgress(
                              task.item.kaiShiRiQi || '',
                              task.item.yuQiJieShu || '',
                            )
                          }}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{{ formatYMD(task.item.yuQiJieShu) || '未设定' }}</td>
                  <td>预计结束</td>
                </tr>
                <tr>
                  <td>当前进度</td>
                  <td><input v-model.number="task.item.dangQianJinDu" /></td>
                  <td colspan="14" class="progress-td">
                    <div class="progress-track">
                      <div
                        class="bar-fill production-flow"
                        :style="{
                          width: Math.min(100, Math.max(0, task.item.dangQianJinDu || 0)) + '%',
                        }"
                      >
                        <span v-if="(task.item.dangQianJinDu || 0) > 5" class="bar-label">
                          {{ task.item.dangQianJinDu }}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td colspan="2">
                    <button @click="syncOutProgress(task)">同步到云端</button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div v-if="currentTab === 'pending' && pendingTasks.length === 0" class="empty-text">
          暂无待领取的外发任务
        </div>
        <div v-if="currentTab === 'active' && activeTasks.length === 0" class="empty-text">
          您目前没有已领取的任务
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AddHead_Out, FindWorkOrdersWithStatus, UpdateProgress_Out } from '@/stores/request'
import {
  calculateTimeProgress,
  formatYMD,
  getTaskStatus_Out,
  TaskStatusColors,
  WorkOrderStatus,
  type IIM,
  type IWorkOrder,
} from '@/types/WorkOrder'

// 1. 修改状态定义
// 定义一个接口来承载 订单信息+物料信息，方便模板渲染
interface IOutTask {
  workOrder: IWorkOrder // 原始工单信息（用于显示表头）
  item: IIM // 具体对应的物料/工序信息
}

const pendingTasks = ref<IOutTask[]>([])
const activeTasks = ref<IOutTask[]>([])
const isLoading = ref(false)
const currentTab = ref<'pending' | 'active'>('pending') // 默认显示待领取
const currentUser = ref({ name: 'admin' })

// 获取数据逻辑 (保持不变)
// 2. 修改获取数据逻辑
const fetchOrders = async () => {
  isLoading.value = true
  try {
    // 第一步：获取生产中的工单
    const data = await FindWorkOrdersWithStatus(WorkOrderStatus.IN_PRODUCTION)

    // 清空旧数据
    const pending: IOutTask[] = []
    const active: IOutTask[] = []

    // 第二步 & 第三步：遍历数据并按 head_OUT 筛选
    data.forEach((work) => {
      if (work.intermedia && work.intermedia.length > 0) {
        work.intermedia.forEach((im) => {
          // 筛选条件：进度 < 100 (因为 >=100 通常代表已完成，外发部不再处理)
          // 注意：根据你的描述“dangQianJinDu < 100”才需要被处理
          if ((im.dangQianJinDu || 0) < 100) {
            const taskPayload: IOutTask = {
              workOrder: work,
              item: im,
            }

            // 判断归属：如果 head_OUT 等于当前用户，进入 active，否则进入 pending
            if (im.head_OUT === currentUser.value.name) {
              active.push(taskPayload)
            } else {
              pending.push(taskPayload)
            }
          }
        })
      }
    })

    pendingTasks.value = pending
    activeTasks.value = active
  } catch (error) {
    console.error('获取任务失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 认领逻辑 (保持不变)
const takeTask_Out = async (workUnique: string, item: IIM) => {
  if (item.head_OUT) return

  const confirmMsg = `工单:${workUnique}\n加工部件:${item.buJianMingCheng || '未命名'}\n确认认领该任务吗？`
  if (!window.confirm(confirmMsg)) return

  try {
    await AddHead_Out(workUnique, item.intermediaID ?? 0, currentUser.value.name)
    // 前端即时更新状态显示
    item.head_OUT = currentUser.value.name
    console.log('认领成功')
  } catch (error) {
    console.error('认领失败:', error)
    alert('认领失败，请稍后重试')
  }
}

onMounted(() => {
  fetchOrders()
})

const syncOutProgress = async (input: IOutTask) => {
  if (input === null) {
    alert('空')
    return
  }

  try {
    await UpdateProgress_Out(
      input.workOrder.work_unique,
      input.item.intermediaID || 0,
      input.item.kaiShiRiQi || '',
      input.item.yuQiJieShu || '',
      input.item.dangQianJinDu || 0,
    )

    alert('同步成功')
  } catch (error) {
    console.error('同步失败:', error)
    alert('同步失败')
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #fdfdfd;
}

/* Tab 样式 */
.tab-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #0f172a;
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
.tab-item {
  padding: 8px 24px;
  border: 1px solid #0f172a;
  border-bottom: none;
  background: #f1f5f9;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
}

.tab-item.active {
  background: #0f172a;
  color: white;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

/* 现有表格样式 */
.standard-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  background: #fff;
  font-size: 12px;
  margin-bottom: 4px;
}

.standard-table th,
.standard-table td {
  border: 1px solid #000;
  padding: 6px;
  text-align: center;
}

.bg-gray {
  background-color: #f1f5f9;
  font-weight: bold;
}

.item-space {
  margin-bottom: 30px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 10px;
}

/* 按钮样式 */
.btn-refresh {
  background: #0f172a;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
}

.btn-take {
  padding: 4px 12px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-take.is-taken {
  background-color: #94a3b8;
  cursor: not-allowed;
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
.empty-text {
  text-align: center;
  padding: 50px;
  color: #94a3b8;
}

.align-center {
  text-align: center;
}
</style>

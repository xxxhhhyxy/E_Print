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

    <template v-for="order in orderList" :key="order.work_id">
      <div
        v-for="(item, idx) in order.intermedia"
        :key="`${order.work_id}_${idx}`"
        class="item-space"
      >
        <table class="standard-table">
          <tbody>
            <tr>
              <td colspan="2" class="bg-gray">工单类型</td>
              <td>{{ order.gongDanLeiXing }}</td>
              <td class="bg-gray">材料</td>
              <td>{{ order.caiLiao }}</td>
              <td class="bg-gray">产品类型</td>
              <td>{{ order.chanPinLeiXing }}</td>
              <td class="bg-gray">制单时间</td>
              <td colspan="2">{{ order.zhiDanShiJian }}</td>
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
              <td>{{ order.customer }}</td>
              <td>{{ order.customerPO }}</td>
              <td>{{ order.productName }}</td>
              <td>{{ order.chanPinGuiGe }}</td>
              <td>{{ order.dingDanShuLiang }}</td>
              <td>{{ order.chuYangShuLiang }}</td>
              <td>{{ order.chaoBiLiShuLiang }}</td>
              <td>{{ order.benChangFangSun }}</td>
              <td>{{ order.chuYangRiqiRequired }}</td>
              <td>{{ order.chuHuoRiqiRequired }}</td>
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
              <th width="40">操作</th>
            </tr>
          </thead>

          <tr class="main-params-row">
            <td class="align-center bg-index"></td>
            <td>
              {{ item.buJianMingCheng }}
            </td>
            <td>{{ item.yinShuaYanSe }}</td>
            <td>
              {{ item.wuLiaoMingCheng }}
            </td>
            <td>{{ item.pinPai }}</td>
            <td>{{ item.caiLiaoGuiGe }}</td>
            <td>{{ item.FSC }}</td>
            <td>
              {{ item.kaiShu }}
            </td>
            <td>{{ item.shangJiChiCun }}</td>
            <td>
              {{ item.paiBanMuShu }}
            </td>
            <td>
              {{ item.yinChuShu }}
            </td>
            <td>
              {{ item.yinSun }}
            </td>
            <td>
              {{ item.lingLiaoShu }}
            </td>
            <td>{{ item.biaoMianChuLi }}</td>
            <td>
              {{ item.yinShuaBanShu }}
            </td>
            <td>
              {{ item.shengChanLuJing }}
            </td>
            <td>{{ item.paiBanFangShi }}</td>
            <td>
              <button
                :class="[
                  'btn-take',
                  {
                    'is-ready': getPreStatus(item) === PreStatus.NotAssign,
                    'is-taken': getPreStatus(item) === PreStatus.Assigned,
                    'is-not-ready': getPreStatus(item) === PreStatus.NotReady,
                    'is-done': getPreStatus(item) === PreStatus.Done,
                  },
                ]"
                @click="takeOutTask(order.work_unique, item)"
                :disabled="getPreStatus(item) !== PreStatus.NotAssign"
              >
                <template v-if="getPreStatus(item) === PreStatus.Assigned">
                  {{ currentUser.name }}
                </template>
                <template v-else-if="getPreStatus(item) === PreStatus.NotReady"> 未就绪 </template>
                <template v-else-if="getPreStatus(item) === PreStatus.Done"> 已完成 </template>
                <template v-else> 认领 </template>
              </button>
            </td>
          </tr>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { AddHead_Out, FindWorkOrdersWithStatus } from '@/stores/request'
import { PreStatus, WorkOrderStatus, type IIM, type IWorkOrder } from '@/types/WorkOrder'

const orderList = ref<IWorkOrder[]>([])
const isLoading = ref(false)

const yiGouJianShuMap = reactive<Record<string, number>>({})

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
const currentUser = ref({ name: 'admin' })
const takeOutTask = async (workUnique: string, item: IIM) => {
  // 1. 如果已有负责人，则拦截
  if (item.head_OUT) return

  // 2. 交互确认
  const confirmMsg = `工单:${workUnique}\n加工部件:${item.buJianMingCheng || '未命名'}\n确认认领该任务吗？`
  if (!window.confirm(confirmMsg)) return

  try {
    // 3. 这里通常会调用 API 同步到后端
    // await PostTakeOutTask({ work_id: workId, buJian: item.buJianMingCheng, user: currentUser.value.name })

    // 4. 前端响应式更新：将当前用户名赋值给 head_OUT
    // item.head_OUT = currentUser.value.name
    await AddHead_Out(workUnique, item.intermediaID ?? 0, currentUser.value.name)
    console.log('认领成功，负责人已变更为:', currentUser.value.name)
  } catch (error) {
    console.error('认领失败:', error)
    alert('认领失败，请稍后重试')
  }
}
/**
 * 获取任务的前置状态
 */
const getPreStatus = (item: IIM): PreStatus => {
  // 判定 Done：进度达到100
  if ((item.dangQianJinDu || 0) >= 100) {
    return PreStatus.Done
  }

  // 判定 Assigned：负责人 head_OUT 已存在
  if (item.head_OUT) {
    return PreStatus.Assigned
  }

  // 判定 NotReady：已购数 < 领料数 (物料还没准备好)
  // 注意：这里需要确保 yiGouJianShu 和 lingLiaoShu 是有效的数值
  if ((item.yiGouJianShu || 0) < (item.lingLiaoShu || 0)) {
    return PreStatus.NotReady
  }

  // 默认判定为 NotAssign：物料齐了且没人领
  return PreStatus.NotAssign
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

.standard-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 12px;
}
.standard-table th,
.standard-table td {
  border: 1px solid #000;
  height: 32px;
  padding: 0;
}
.standard-table input,
.standard-table textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 4px;
  box-sizing: border-box;
  text-align: center;
  background: transparent;
}

/* 认领按钮基础样式 */
.btn-take {
  min-width: 80px;
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

/* 1. 未分配 (可交互) - 亮蓝色 */
.btn-take.is-ready {
  background-color: #2563eb;
  color: white;
}

/* 2. 未就绪 - 红色边框或浅红 */
.btn-take.is-not-ready {
  background-color: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
  cursor: not-allowed;
}

/* 3. 已分配 - 灰色背景 */
.btn-take.is-taken {
  background-color: #f1f5f9;
  color: #64748b;
  border-color: #cbd5e1;
  cursor: not-allowed;
}

/* 4. 已完成 - 绿色背景 */
.btn-take.is-done {
  background-color: #dcfce7;
  color: #16a34a;
  border-color: #86efac;
  cursor: not-allowed;
}

.item-space {
  margin-bottom: 20px; /* 设置你需要的间隔高度 */
}
</style>

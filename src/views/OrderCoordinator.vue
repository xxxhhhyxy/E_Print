<template>
  <div class="order-coordinator-container">
    <button class="close-btn" @click="handleClose">×</button>

    <div class="info-row">
      <div class="info-item">
        <label>订单号：</label>
        <span>{{ inputID || '---' }}</span>
      </div>

      <div class="info-item">
        <label>客户名称：</label>
        <span>{{ currentOrder?.customer || '---' }}</span>
      </div>

      <div class="info-item">
        <label>版本号：</label>
        <select v-model="selectedVer" class="version-dropdown">
          <option v-for="ver in availableVersions" :key="ver" :value="ver">
            {{ ver }}
          </option>
        </select>
      </div>
    </div>

    <hr />

    <div class="action-row">
      <button class="btn-primary" @click="handleOpenOrder" :disabled="!currentOrder">
        打开版本订单 ({{ selectedVer }})
      </button>
      <button class="btn-secondary" @click="handleOpenWorkOrder" :disabled="!currentOrder">
        打开版本工单并追单
      </button>
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
    <hr />

    <div v-if="selectedWork">
      <!-- <fieldset :disabled="true"> -->
      <table class="standard-table">
        <tbody>
          <tr>
            <td colspan="2" class="bg-gray">工单类型</td>
            <td><input :value="selectedWork.gongDanLeiXing" /></td>
            <td class="bg-gray">材料</td>
            <td><input :value="selectedWork.caiLiao" /></td>
            <td class="bg-gray">产品类型</td>
            <td><input :value="selectedWork.chanPinLeiXing" /></td>
            <td class="bg-gray">制单时间</td>
            <td colspan="2"><input type="date" :value="selectedWork.zhiDanShiJian" /></td>
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
            <td><textarea :value="selectedWork.customer"></textarea></td>
            <td><textarea :value="selectedWork.customerPO"></textarea></td>
            <td><textarea :value="selectedWork.productName"></textarea></td>
            <td><textarea :value="selectedWork.chanPinGuiGe"></textarea></td>
            <td><input type="number" :value="selectedWork.dingDanShuLiang" /></td>
            <td><input type="number" :value="selectedWork.chuYangShuLiang" /></td>
            <td><input type="number" :value="selectedWork.chaoBiLiShuLiang" /></td>
            <td><input type="number" :value="selectedWork.benChangFangSun" /></td>
            <td><input type="date" :value="selectedWork.chuYangRiqiRequired" /></td>
            <td><input type="date" :value="selectedWork.chuHuoRiqiRequired" /></td>
          </tr>
        </tbody>
      </table>
      <!-- </fieldset> -->
      <table class="standard-table process-table">
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

        <tbody v-for="(item, index) in selectedWork.intermedia" :key="index" class="process-body">
          <tr class="main-params-row">
            <td class="align-center bg-index">{{ index + 1 }}</td>
            <td>
              <input v-model="item.buJianMingCheng" :disabled="true" />
            </td>
            <td><input v-model="item.yinShuaYanSe" :disabled="true" /></td>
            <td>
              <input v-model="item.wuLiaoMingCheng" :disabled="true" />
            </td>
            <td><input v-model="item.pinPai" :disabled="true" /></td>
            <td><input v-model="item.caiLiaoGuiGe" :disabled="true" /></td>
            <td><input v-model="item.FSC" :disabled="true" /></td>
            <td>
              <input v-model.number="item.kaiShu" type="number" :disabled="true" />
            </td>
            <td><input v-model="item.shangJiChiCun" :disabled="true" /></td>
            <td>
              <input v-model.number="item.paiBanMuShu" type="number" :disabled="true" />
            </td>
            <td>
              <input v-model.number="item.yinChuShu" type="number" :disabled="true" />
            </td>
            <td>
              <input v-model.number="item.yinSun" type="number" :disabled="true" />
            </td>
            <td>
              <input v-model.number="item.lingLiaoShu" type="number" :disabled="true" />
            </td>
            <td><input v-model="item.biaoMianChuLi" :disabled="true" /></td>
            <td>
              <input v-model.number="item.yinShuaBanShu" type="number" :disabled="true" />
            </td>
            <td>
              <input v-model="item.shengChanLuJing" :disabled="true" />
            </td>
            <td><input v-model="item.paiBanFangShi" :disabled="true" /></td>
          </tr>

          <tr>
            <td>采购部</td>
            <td></td>
            <td>
              <input
                v-model.number="tempInputMap[index]"
                style="width: 50px; text-align: right; padding-right: 4px"
              />/{{ item.lingLiaoShu }}
            </td>
            <td colspan="11" class="progress-td">
              <div class="progress-track">
                <div
                  class="bar-fill production-flow"
                  :style="{
                    width:
                      Math.min(
                        100,
                        Math.max(0, ((tempInputMap[index] || 0) / (item.lingLiaoShu || 1)) * 100),
                      ) + '%',
                  }"
                >
                  <span
                    v-if="(tempInputMap[index] || 0) / (item.lingLiaoShu || 1) > 5"
                    class="bar-label"
                  >
                    (tempInputMap[index] || 0) / (item.lingLiaoShu || 1)
                  </span>
                </div>
              </div>
            </td>
            <td>负责人</td>
            <td>PUR</td>
            <td></td>
          </tr>

          <tr>
            <td rowspan="2">外发部</td>
            <td>开始日期</td>
            <td><input type="date" v-model="item.kaiShiRiQi" /></td>
            <td colspan="11" class="progress-td">
              <div class="progress-track">
                <div
                  class="bar-fill time-flow"
                  :style="{ width: `${calculateTimeProgress(item)}%` }"
                >
                  <span v-if="calculateTimeProgress(item) > 5" class="bar-label">
                    {{ calculateTimeProgress(item) }}%
                  </span>
                </div>
              </div>
            </td>
            <td><input type="date" v-model="item.yuQiJieShu" /></td>
            <td>预计结束</td>
            <td
              rowspan="2"
              :style="{ color: TaskStatusColors[getTaskStatus(item)], fontWeight: 'bold' }"
            >
              {{ getTaskStatus(item) }}
            </td>
            <!-- <td rowspan="2"></td> -->
          </tr>

          <tr>
            <td>当前进度</td>
            <td>
              <input
                v-model.number="item.dangQianJinDu"
                style="width: 50px; text-align: right; padding-right: 4px"
              />%
            </td>
            <td colspan="11" class="progress-td">
              <div class="progress-track">
                <div
                  class="bar-fill production-flow"
                  :style="{ width: Math.min(100, Math.max(0, item.dangQianJinDu || 0)) + '%' }"
                >
                  <span v-if="(item.dangQianJinDu || 0) > 5" class="bar-label">
                    {{ item.dangQianJinDu }}%
                  </span>
                </div>
              </div>
            </td>
            <td>负责人</td>
            <td>OUT</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div v-else>
      <p>正在努力加载工单详情，如果长时间不显示，请检查后台是否存在该版本的工单记录...</p>
    </div> -->
    <hr />
    生产部
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { IOrder } from '@/types/Order'
import WorkOrderInfo, { PageMode as WorkPageMode } from './WorkOrderInfo.vue'
import OrderInfo, { PageMode as OrderPageMode } from './OrderInfo.vue'
import {
  calculateTimeProgress,
  getTaskStatus,
  TaskStatusColors,
  type IWorkOrder,
} from '@/types/WorkOrder'
import { FindWorkOrderByID } from '@/stores/request'
const selectedOrder = ref<IOrder | null>(null)
const selectedWork = ref<IWorkOrder | null>(null)
const showOrderModal = ref(false)
const showWorkModal = ref(false)

// 1. 创建一个临时的物料采购数目存储容器
const tempInputMap = ref<Record<number, number>>({})
// 2. 状态管理
const selectedVer = ref('') //选中的版本
// 1. 接收来自 Page_ADM 的参数
const props = defineProps<{
  inputID: string
  inputGroup: IOrder[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 1. 移除 onMounted 钩子
/**
 * 计算属性：获取当前选中版本的订单对象
 */
const currentOrder = computed(() => {
  return props.inputGroup.find((o) => o.order_ver === selectedVer.value) || props.inputGroup[0]
})
// 定义处理函数
const OnUpdateDP = async (ver: string) => {
  if (!ver) return
  if (!currentOrder.value) return
  console.log('OnUpdateDP 触发，当前版本:', ver)

  const targetOrder = props.inputGroup.find((o) => o.order_ver === ver)
  if (!targetOrder) {
    console.error('找不到该版本的订单数据')
    return
  }

  // 此处编写你的业务逻辑
  const orderId = targetOrder.order_id || props.inputID
  const workUnique = `${orderId}_W_${ver}`
  try {
    // 3. 这里的 FindWorkOrderByID 必须 await
    const res = await FindWorkOrderByID(workUnique)

    if (res) {
      console.log('请求成功，数据内容:', res)
      selectedWork.value = res
    } else {
      console.warn('后端返回了空对象，可能是该订单还没生成工单记录')
      // 【关键修复】：如果工单不存在，我们手动创建一个包含基础信息的对象
      // 这样至少第一个表格能显示出订单里的基础信息
    }
  } catch (error) {
    console.error('获取工单失败:', error)
    selectedWork.value = null // 出错时重置，防止显示旧数据
  }
}
// 2. 合并并精简监听逻辑
watch(
  () => props.inputGroup,
  (newGroup) => {
    // 只有当传入的数组有效且有内容时才操作
    if (newGroup && newGroup.length > 0) {
      // 自动设置默认版本，这会触发 selectedVer 的监听，进而执行 OnUpdateDP
      selectedVer.value = newGroup[0]?.order_ver || ''
      console.log('数据组已更新，默认版本设为:', selectedVer.value)
      OnUpdateDP(selectedVer.value)
    }
  },
  { immediate: true }, // 确保组件一加载就执行逻辑
)

// 3. 保持对 selectedVer 的监听来触发 API 调用
watch(
  () => selectedVer.value,
  (newVer) => {
    if (newVer) {
      OnUpdateDP(newVer)
    }
  },
  // 这里不需要 immediate，因为 props 的 watch 会修改 selectedVer 从而触发它
)

/**
 * 获取所有可用的版本号
 */
const availableVersions = computed(() => {
  return props.inputGroup.map((o) => o.order_ver || 'N/A')
})

// --- 逻辑处理 ---

const handleClose = () => {
  emit('close')
}

const handleOpenOrder = () => {
  if (!currentOrder.value) return
  selectedOrder.value = currentOrder.value
  showOrderModal.value = true
  console.log('正在查看订单详情:', currentOrder.value.order_unique)
  // 这里可以触发另一个 Modal 或者路由跳转
}
// const calculateTimeProgress = (item: IIM): number => {
//   // 增加健壮性检查：确保日期字符串存在
//   if (!item.kaiShiRiQi || !item.yuQiJieShu) return 0

//   const start: number = new Date(item.kaiShiRiQi).getTime()
//   const end: number = new Date(item.yuQiJieShu).getTime()

//   // 2026年当前的实时时间
//   const now: number = Date.now()

//   // 边界处理
//   if (now <= start) return 0
//   if (now >= end) return 100

//   const total: number = end - start
//   const elapsed: number = now - start

//   // 使用 Math.min/max 确保结果严格在 0-100 之间
//   return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
// }
const handleOpenWorkOrder = () => {
  if (!currentOrder.value) return
  showWorkModal.value = true
  // const workUnique = `${currentOrder.value.order_id}_W_${currentOrder.value.order_ver}`
  console.log('正在调取工单:', selectedWork.value?.work_unique)
}
</script>

<style scoped>
.order-coordinator-container {
  padding: 30px;
  background: white;
  position: relative; /* 为关闭按钮定位 */
  border-radius: 8px;
  min-height: 200px;
}

/* 右上角关闭按钮样式 */
.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
}

.close-btn:hover {
  color: #ef4444;
}

.info-row {
  display: flex;
  gap: 40px;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 10px;
}

.info-item label {
  font-weight: bold;
  color: #475569;
  margin-right: 8px;
}

.version-dropdown {
  padding: 5px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background-color: #f8fafc;
  cursor: pointer;
}

.action-row {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

button.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
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
button.btn-secondary {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

hr {
  border: 0;
  border-top: 1px solid #e2e8f0;
  margin: 20px 0;
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
/* 关键修正：增加类名权重，覆盖 standard-table input 的居中设置 */
.process-table .task-input {
  flex: 1;
  margin-right: 10px;
  text-align: left !important; /* 使用 !important 强制覆盖 center */
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-width: 0;
  background: #fff; /* 确保背景色不透明，增加对比度 */
  height: 32px; /* 固定高度 */
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
</style>

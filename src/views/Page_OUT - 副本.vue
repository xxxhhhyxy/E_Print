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
        待领取任务
      </button>
      <button
        class="tab-item"
        :class="{ active: currentTab === 'active' }"
        @click="currentTab = 'active'"
      >
        已领取任务
      </button>
    </div>

    <div class="table-wrapper">
      <div v-if="currentTab === 'pending'">
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
                  <th width="80">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr class="main-params-row">
                  <td class="align-center bg-index">{{ item.intermediaID }}</td>
                  <td>{{ item.buJianMingCheng }}</td>
                  <td>{{ item.yinShuaYanSe }}</td>
                  <td>{{ item.wuLiaoMingCheng }}</td>
                  <td>{{ item.pinPai }}</td>
                  <td>{{ item.caiLiaoGuiGe }}</td>
                  <td>{{ item.FSC }}</td>
                  <td>{{ item.kaiShu }}</td>
                  <td>{{ item.shangJiChiCun }}</td>
                  <td>{{ item.paiBanMuShu }}</td>
                  <td>{{ item.yinChuShu }}</td>
                  <td>{{ item.yinSun }}</td>
                  <td>{{ item.lingLiaoShu }}</td>
                  <td>{{ item.biaoMianChuLi }}</td>
                  <td>{{ item.yinShuaBanShu }}</td>
                  <td>{{ item.shengChanLuJing }}</td>
                  <td>{{ item.paiBanFangShi }}</td>
                  <td class="align-center">
                    <button
                      class="btn-take"
                      :class="{ 'is-taken': item.head_OUT }"
                      @click="takeTask_Out(order.work_unique, item)"
                      :disabled="!!item.head_OUT"
                    >
                      <template v-if="item.head_OUT">
                        {{ item.head_OUT === currentUser.name ? '本人已领' : item.head_OUT }}
                      </template>
                      <template v-else> 认领 </template>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <div v-if="orderList.length === 0" class="empty-text">暂无待领取的外发任务</div>
      </div>

      <div v-else-if="currentTab === 'active'">
        <div class="empty-text">已领取任务功能开发中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AddHead_Out, FindWorkOrdersWithStatus } from '@/stores/request'
import { WorkOrderStatus, type IIM, type IWorkOrder } from '@/types/WorkOrder'

// 状态控制
const orderList = ref<IWorkOrder[]>([])
const isLoading = ref(false)
const currentTab = ref<'pending' | 'active'>('pending') // 默认显示待领取
const currentUser = ref({ name: 'admin' })

// 获取数据逻辑 (保持不变)
const fetchOrders = async () => {
  isLoading.value = true
  try {
    const data = await FindWorkOrdersWithStatus(WorkOrderStatus.IN_PRODUCTION)
    // 过滤出含有中间物料的工单
    orderList.value = data.filter((work) => work.intermedia && work.intermedia.length > 0)
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

.empty-text {
  text-align: center;
  padding: 50px;
  color: #94a3b8;
}

.align-center {
  text-align: center;
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

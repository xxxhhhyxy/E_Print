<template>
  <div class="creator-wrapper">
    <div class="top-nav">
      <div class="left-panel">
        <div class="attachment-manager">
          <div class="manager-header">
            <span class="label">相关附件</span>
            <button class="add-file-btn" @click="addFileRow">+ 添加文件</button>
          </div>
          <table class="standard-table mini-table" v-if="WorkOrderData.attachments?.length">
            <thead>
              <tr class="bg-gray">
                <th width="100">分类</th>
                <th>文件名</th>
                <th width="40">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(attr, idx) in WorkOrderData.attachments" :key="idx">
                <td><input v-model="attr.category" placeholder="类型" class="cell-input" /></td>
                <td class="file-cell">
                  <div class="file-trigger-wrapper">
                    <input
                      type="file"
                      :id="'file-input-' + idx"
                      style="display: none"
                      @change="onFileSelected($event, idx)"
                    />
                    <button class="btn-browse" @click="triggerRowFile(idx)">
                      {{ attr.fileName ? '更换' : '浏览' }}
                    </button>
                    <span class="file-name-text">{{ attr.fileName || '未选择' }}</span>
                  </div>
                </td>
                <td class="align-center">
                  <button class="remove-btn" @click="WorkOrderData.attachments?.splice(idx, 1)">
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="button-group">
        <button class="btn btn-secondary" @click="$emit('close')">返回列表</button>
        <button class="btn btn-primary" @click="handleSubmitOrder">提交工单</button>
      </div>
    </div>

    <header class="doc-header">
      <h1 class="main-title">印刷工程单</h1>
      <div class="version-badge">版本：{{ WorkOrderData.work_ver }}</div>
    </header>

    <hr class="heavy-divider" />

    <section class="table-section">
      <fieldset :disabled="props.mode !== PageMode.EDIT">
        <table class="standard-table">
          <tbody>
            <tr>
              <td colspan="2" class="bg-gray">工单类型</td>
              <td><input v-model="WorkOrderData.gongDanLeiXing" /></td>
              <td class="bg-gray">材料</td>
              <td><input v-model="WorkOrderData.caiLiao" /></td>
              <td class="bg-gray">产品类型</td>
              <td><input v-model="WorkOrderData.chanPinLeiXing" /></td>
              <td class="bg-gray">制单时间</td>
              <td colspan="2"><input type="date" v-model="WorkOrderData.zhiDanShiJian" /></td>
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
              <td><textarea v-model="WorkOrderData.customer"></textarea></td>
              <td><textarea v-model="WorkOrderData.customerPO"></textarea></td>
              <td><textarea v-model="WorkOrderData.productName"></textarea></td>
              <td><textarea v-model="WorkOrderData.chanPinGuiGe"></textarea></td>
              <td><input type="number" v-model.number="WorkOrderData.dingDanShuLiang" /></td>
              <td><input type="number" v-model.number="WorkOrderData.chuYangShuLiang" /></td>
              <td><input type="number" v-model.number="WorkOrderData.chaoBiLiShuLiang" /></td>
              <td><input type="number" v-model.number="WorkOrderData.benChangFangSun" /></td>
              <td><input type="date" v-model="WorkOrderData.chuYangRiqiRequired" /></td>
              <td><input type="date" v-model="WorkOrderData.chuHuoRiqiRequired" /></td>
            </tr>
          </tbody>
        </table>
      </fieldset>

      <div class="table-scroll-container">
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

          <tbody
            v-for="(item, index) in WorkOrderData.intermedia"
            :key="index"
            class="process-body"
          >
            <tr class="main-params-row">
              <td class="align-center bg-index">{{ index + 1 }}</td>
              <td><input v-model="item.buJianMingCheng" /></td>
              <td><input v-model="item.yinShuaYanSe" /></td>
              <td><input v-model="item.wuLiaoMingCheng" /></td>
              <td><input v-model="item.pinPai" /></td>
              <td><input v-model="item.caiLiaoGuiGe" /></td>
              <td><input v-model="item.FSC" /></td>
              <td><input v-model.number="item.kaiShu" type="number" /></td>
              <td><input v-model="item.shangJiChiCun" /></td>
              <td><input v-model.number="item.paiBanMuShu" type="number" /></td>
              <td><input v-model.number="item.yinChuShu" type="number" /></td>
              <td><input v-model.number="item.yinSun" type="number" /></td>
              <td><input v-model.number="item.lingLiaoShu" type="number" /></td>
              <td><input v-model="item.biaoMianChuLi" /></td>
              <td><input v-model.number="item.yinShuaBanShu" type="number" /></td>
              <td><input v-model="item.shengChanLuJing" /></td>
              <td><input v-model="item.paiBanFangShi" /></td>
              <td class="align-center">
                <button class="remove-btn" @click="removeRow(index)">×</button>
              </td>
            </tr>

            <tr class="extra-detail-row">
              <td colspan="18">
                <fieldset :disabled="props.mode === PageMode.VIEW" class="detail-fieldset">
                  <td>开始日期</td>
                  <td>当前进度</td>
                  <td>预计结束</td>
                </fieldset>
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <td colspan="18" class="add-row-container">
                <button class="add-row-full-btn" @click="addNewRow">+ 增加一道生产工序模块</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="audit-info-footer">
        <div class="auditlog-related">
          <td>制单员:</td>
          <td><input v-model="WorkOrderData.work_clerk" class="cell-input" /></td>
          <td>时间：</td>
          <td><input type="date" v-model="WorkOrderData.zhiDanShiJian" class="cell-input" /></td>
        </div>
        <fieldset :disabled="props.mode !== PageMode.REVIEW" class="auditlog-related">
          <td>审核员:</td>
          <td><input v-model="WorkOrderData.work_audit" class="cell-input" /></td>
          <td>时间：</td>
          <td><input type="date" class="cell-input" /></td>
        </fieldset>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
export enum PageMode {
  EDIT = 'edit',
  VIEW = 'view',
  REVIEW = 'review',
  PRODUCTION = 'production',
}
</script>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import {
  type IWorkOrder,
  WorkOrderStatus,
  formatYMD,
  initializeAuditLog,
  prepareWorkOrderForSubmit,
} from '@/types/WorkOrder'

const emit = defineEmits(['close', 'submit'])
const props = defineProps<{
  mode: PageMode
  initialData?: IWorkOrder | null
}>()

const createEmptyProcess = () => ({
  buJianMingCheng: '',
  yinShuaYanSe: '',
  wuLiaoMingCheng: '',
  pinPai: '',
  caiLiaoGuiGe: '',
  FSC: '',
  kaiShu: undefined,
  shangJiChiCun: '',
  paiBanMuShu: undefined,
  yinChuShu: undefined,
  yinSun: undefined,
  lingLiaoShu: undefined,
  biaoMianChuLi: '',
  yinShuaBanShu: undefined,
  shengChanLuJing: '',
  paiBanFangShi: '',
  dangQianJinDu: '待产',
  // 扩展字段
  memo: '',
  qcRequest: '',
  packWay: '',
  isLocked: false,
})

const createEmptyWorkOrder = (): Partial<IWorkOrder> => ({
  work_id: '',
  work_ver: '1.0',
  work_clerk: '',
  work_audit: '',
  gongDanLeiXing: '',
  caiLiao: '',
  zhiDanShiJian: formatYMD(new Date()),
  customer: '',
  productName: '',
  intermedia: [createEmptyProcess()],
  workorderstatus: WorkOrderStatus.DRAFT,
  attachments: [],
})

const WorkOrderData = reactive<IWorkOrder>(createEmptyWorkOrder() as IWorkOrder)

const resetToDefault = () => {
  const empty = createEmptyWorkOrder()
  Object.assign(WorkOrderData, empty)
  WorkOrderData.intermedia = [createEmptyProcess()]
}

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      Object.assign(WorkOrderData, JSON.parse(JSON.stringify(newVal)))
    } else {
      resetToDefault()
    }
  },
  { immediate: true, deep: true },
)

const removeRow = (index: number) => {
  if (WorkOrderData.intermedia && WorkOrderData.intermedia.length > 1) {
    WorkOrderData.intermedia.splice(index, 1)
  }
}

const addNewRow = () => {
  WorkOrderData.intermedia?.push(createEmptyProcess())
}

const addFileRow = () => {
  if (!WorkOrderData.attachments) WorkOrderData.attachments = []
  WorkOrderData.attachments.push({ category: '', fileName: '', file: undefined })
}

const triggerRowFile = (index: number) => {
  document.getElementById(`file-input-${index}`)?.click()
}

const onFileSelected = (e: Event, index: number) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0] && WorkOrderData.attachments?.[index]) {
    WorkOrderData.attachments[index].fileName = target.files[0].name
    WorkOrderData.attachments[index].file = target.files[0]
  }
}

const handleSubmitOrder = async () => {
  if (!WorkOrderData.customer) return alert('请填写客户')
  WorkOrderData.work_unique = WorkOrderData.work_id + '_' + WorkOrderData.work_ver
  initializeAuditLog(WorkOrderData)
  emit('submit', prepareWorkOrderForSubmit(WorkOrderData))
}
</script>

<style scoped>
/* 核心表格基础 */
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

/* 工序模块样式 */
.process-body {
  border: 2px solid #000; /* 给每个 tbody 增加重边框，强化模块感 */
}
.bg-index {
  background: #0f172a;
  color: #fff;
  font-weight: bold;
}

/* 扩展详情行样式 */
.extra-detail-row td {
  background: #f8fafc;
  padding: 10px !important;
  border-top: none; /* 视觉上与上一行连接 */
}

.detail-fieldset {
  border: 1px dashed #cbd5e1;
  padding: 10px;
  position: relative;
}

.detail-content-wrapper {
  display: flex;
  gap: 20px;
  min-height: 80px;
}

.detail-left {
  flex: 2;
}
.detail-right {
  flex: 1;
  border-left: 1px solid #e2e8f0;
  padding-left: 20px;
}

.detail-label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #64748b;
}
.detail-left textarea {
  width: 100%;
  height: 60px;
  border: 1px solid #e2e8f0 !important;
  background: #fff !important;
  text-align: left !important;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.info-item {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.info-item input {
  border-bottom: 1px solid #ccc !important;
  width: 100px;
  text-align: left;
}

.status-tag {
  background: #000;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
}

/* 锁定层 */
.module-lock {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #ef4444;
  z-index: 5;
}

/* 辅助 */
.creator-wrapper {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}
.bg-gray {
  background-color: #f1f5f9;
  font-weight: bold;
  text-align: center;
}
.align-center {
  text-align: center;
}
.heavy-divider {
  border-top: 2px solid #000;
  margin: 20px 0;
}
.add-row-full-btn {
  width: 100%;
  padding: 10px;
  background: #f1f5f9;
  cursor: pointer;
  border: none;
  font-weight: bold;
}
.remove-btn {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.attachment-manager {
  margin-bottom: 20px;
}
.mini-table {
  width: auto;
  min-width: 400px;
}
.auditlog-related {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-right: 30px;
  margin-top: 20px;
}
</style>

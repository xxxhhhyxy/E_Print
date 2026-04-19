<template>
  <div class="creator-wrapper">
    <div class="top-nav">
      <div class="upload-section-main">
        <div class="upload-row main-upload">
          <span class="label">PDF 智能导入</span>
          <div class="control-item">
            <input
              type="file"
              id="order-pdf-input-main"
              class="hidden-input"
              accept=".pdf"
              @change="onMainFileBrowse"
            />
            <button class="btn-browse" @click="triggerMainFile">选择 PDF 文件</button>
            <span class="file-name-text" v-if="mainFile.fileName">{{ mainFile.fileName }}</span>
          </div>

          <div class="button-group-mini">
            <button class="btn-send" @click="ParseOrderFile" :disabled="!mainFile.file">
              AI 解析并填充
            </button>
          </div>
        </div>
      </div>

      <div v-if="isParsing" class="parsing-overlay">
        <div class="parsing-card">
          <div class="loader-spinner"></div>
          <p>等待服务器解析...</p>
          <small>正在智能识别工单字段并自动填充表单</small>
        </div>
      </div>
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
                <td>
                  <input v-model.trim="attr.category" placeholder="类型" class="cell-input" />
                </td>
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
        <button
          v-if="props.mode === PageMode.EDIT"
          class="btn btn-primary"
          @click="handleSubmitOrder"
        >
          提交工单
        </button>
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
              <td><input v-model.trim="WorkOrderData.gongDanLeiXing" /></td>
              <td class="bg-gray">材料</td>
              <td><input v-model.trim="WorkOrderData.caiLiao" /></td>
              <td class="bg-gray">产品类型</td>
              <td><input v-model.trim="WorkOrderData.chanPinLeiXing" /></td>
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
              <td><textarea v-model.trim="WorkOrderData.customer"></textarea></td>
              <td><textarea v-model.trim="WorkOrderData.customerPO"></textarea></td>
              <td><textarea v-model.trim="WorkOrderData.productName"></textarea></td>
              <td><textarea v-model.trim="WorkOrderData.chanPinGuiGe"></textarea></td>
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

      <!-- <table v-if="props.mode == PageMode.PRODUCTION" class="standard-table process-table">
        <tbody>
          <tr>
            <th width="120">部门</th>
            <th>编辑任务清单</th>
            <th width="180">操作</th>
          </tr>
          <tr>
            <td class="col-center">采购(PUR)</td>
            <td class="col-left">
              <div v-for="(task, index) in purTasks" :key="index" class="task-item-row">
                <span class="task-index">{{ index + 1 }}.</span>
                <input v-model="purTasks[index]" placeholder="输入任务项..." class="task-input" />
                <button class="btn-ctrl add" @click="addItem(purTasks)">+</button>
                <button class="btn-ctrl del" @click="removeItem(purTasks, index)">-</button>
              </div>
            </td>
            <td class="col-center">
              <button class="btn-mini" @click="sendTaskToPUR">向采购部发配任务</button>
            </td>
          </tr>
          <tr>
            <td class="col-center">外发(OUT)</td>
            <td class="col-left">
              <div v-for="(task, index) in outTasks" :key="index" class="task-item-row">
                <span class="task-index">{{ index + 1 }}.</span>
                <input v-model="outTasks[index]" placeholder="输入任务项..." class="task-input" />
                <button class="btn-ctrl add" @click="addItem(outTasks)">+</button>
                <button class="btn-ctrl del" @click="removeItem(outTasks, index)">-</button>
              </div>
            </td>
            <td class="col-center">
              <button class="btn-mini" @click="sendTaskToOUT">向外发部发配任务</button>
            </td>
          </tr>
          <tr>
            <td class="col-center">生产(MNF)</td>
            <td class="col-left">
              <div v-for="(task, index) in mnfTasks" :key="index" class="task-item-row">
                <span class="task-index">{{ index + 1 }}.</span>
                <input v-model="mnfTasks[index]" placeholder="输入任务项..." class="task-input" />
                <button class="btn-ctrl add" @click="addItem(mnfTasks)">+</button>
                <button class="btn-ctrl del" @click="removeItem(mnfTasks, index)">-</button>
              </div>
            </td>
            <td class="col-center">
              <button class="btn-mini" @click="sendTaskToMNF">向生产部发配任务</button>
            </td>
          </tr>
        </tbody>
      </table> -->

      <!-- <fieldset class="table-scroll-container" :disabled="props.mode !== PageMode.EDIT"> -->
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

        <tbody v-for="(item, index) in WorkOrderData.intermedia" :key="index" class="process-body">
          <tr class="main-params-row">
            <td class="align-center bg-index">{{ index + 1 }}</td>
            <td>
              <input v-model.trim="item.buJianMingCheng" :disabled="props.mode !== PageMode.EDIT" />
            </td>
            <td>
              <input v-model.trim="item.yinShuaYanSe" :disabled="props.mode !== PageMode.EDIT" />
            </td>
            <td>
              <input v-model.trim="item.wuLiaoMingCheng" :disabled="props.mode !== PageMode.EDIT" />
            </td>
            <td><input v-model.trim="item.pinPai" :disabled="props.mode !== PageMode.EDIT" /></td>
            <td>
              <input v-model.trim="item.caiLiaoGuiGe" :disabled="props.mode !== PageMode.EDIT" />
            </td>
            <td><input v-model.trim="item.FSC" :disabled="props.mode !== PageMode.EDIT" /></td>
            <td>
              <input
                v-model.number="item.kaiShu"
                type="number"
                :disabled="props.mode !== PageMode.EDIT"
              />
            </td>
            <td>
              <input v-model.trim="item.shangJiChiCun" :disabled="props.mode !== PageMode.EDIT" />
            </td>
            <td>
              <input
                v-model.number="item.paiBanMuShu"
                type="number"
                :disabled="props.mode !== PageMode.EDIT"
              />
            </td>
            <td>
              <input
                v-model.number="item.yinChuShu"
                type="number"
                :disabled="props.mode !== PageMode.EDIT"
              />
            </td>
            <td>
              <input
                v-model.number="item.yinSun"
                type="number"
                :disabled="props.mode !== PageMode.EDIT"
              />
            </td>
            <td>
              <input
                v-model.number="item.lingLiaoShu"
                type="number"
                :disabled="props.mode !== PageMode.EDIT"
              />
            </td>
            <td>
              <input v-model.trim="item.biaoMianChuLi" :disabled="props.mode !== PageMode.EDIT" />
            </td>
            <td>
              <input
                v-model.number="item.yinShuaBanShu"
                type="number"
                :disabled="props.mode !== PageMode.EDIT"
              />
            </td>
            <td>
              <input v-model.trim="item.shengChanLuJing" :disabled="props.mode !== PageMode.EDIT" />
            </td>
            <td>
              <input v-model.trim="item.paiBanFangShi" :disabled="props.mode !== PageMode.EDIT" />
            </td>
            <td class="align-center" v-if="props.mode === PageMode.EDIT">
              <button class="remove-btn" @click="removeRow(index)">×</button>
            </td>
          </tr>

          <!-- <tr v-if="mode === PageMode.PRODUCTION">
            <td rowspan="2">外发部</td>
            <td>开始日期</td>
            <td><input type="date" v-model.trim="item.kaiShiRiQi" /></td>
            <td colspan="12" class="progress-td">
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
            <td><input type="date" v-model.trim="item.yuQiJieShu" /></td>
            <td>预计结束</td>
          </tr> -->
          <!-- <tr v-if="mode === PageMode.PRODUCTION">
            <td>当前进度</td>
            <td><input v-model.number="item.dangQianJinDu" />%</td>
            <td colspan="12" class="progress-td">
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
            <td colspan="2">
            </td>
            <td></td>
          </tr> -->
        </tbody>

        <tfoot>
          <tr>
            <td colspan="18" class="add-row-container" v-if="props.mode === PageMode.EDIT">
              <button class="add-row-full-btn" @click="addNewRow">+ 增加一道生产工序模块</button>
            </td>
          </tr>
        </tfoot>
      </table>
      <!-- </fieldset> -->

      <fieldset
        :disabled="props.mode !== PageMode.REVIEW"
        v-if="props.mode !== PageMode.EDIT"
        class="audit-section"
      >
        <div class="section-label" style="margin-bottom: 10px">审核决策</div>
        <table class="production-table audit-table">
          <tbody>
            <tr>
              <td class="label" width="100">审核意见</td>
              <td>
                <textarea
                  v-model.trim="auditRemark"
                  class="cell-input audit-textarea"
                  placeholder="请输入审核处理意见（如拒绝原因等）..."
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="audit-actions">
          <button class="btn-audit approve" @click="handleApprove">
            <span class="icon">通过</span>
          </button>
          <button class="btn-audit reject" @click="handleReject">
            <span class="icon">驳回</span>
          </button>
        </div>
      </fieldset>
      <fieldset :disabled="props.mode !== PageMode.EDIT">
        <div class="audit-info-footer">
          <div class="auditlog-related">
            <div>制单员:</div>
            <div><input v-model.trim="WorkOrderData.work_clerk" class="cell-input" /></div>
            <div>时间：</div>
            <div>
              <input type="date" v-model="WorkOrderData.zhiDanShiJian" class="cell-input" />
            </div>
          </div>
          <div class="auditlog-related">
            <div>审核员:</div>
            <div>
              <input
                :disabled="props.mode !== PageMode.REVIEW"
                v-model.trim="WorkOrderData.work_audit"
                class="cell-input"
              />
            </div>
            <div>时间：</div>
            <div>
              <input
                :disabled="props.mode !== PageMode.REVIEW"
                type="date"
                class="cell-input"
                v-model="WorkOrderData.auditDate"
              />
            </div>
          </div>
        </div>
      </fieldset>
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
import { reactive, ref, watch } from 'vue'
import { type IIM, type IWorkOrder, WorkOrderStatus, formatYMD } from '@/types/WorkOrder'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', wd: IWorkOrder): void // 提交 FormData 给父组件
  (e: 'approve', wd: IWorkOrder, comment: string): void
  (e: 'reject', wd: IWorkOrder, comment: string): void
}>()
// --- 审核意见---
const auditRemark = ref('')
const props = defineProps<{
  mode: PageMode
  initialData?: IWorkOrder | null
}>()

const createEmptyProcess = (): Partial<IIM> => ({
  intermediaID: 0, // 初始序号
  buJianMingCheng: '',
  yinShuaYanSe: '',
  wuLiaoMingCheng: '',
  pinPai: '',
  caiLiaoGuiGe: '',
  FSC: '',
  kaiShu: 0,
  shangJiChiCun: '',
  paiBanMuShu: 0,
  yinChuShu: 0,
  yinSun: 0,
  lingLiaoShu: 0,
  biaoMianChuLi: '',
  yinShuaBanShu: 0,
  shengChanLuJing: '',
  paiBanFangShi: '',

  // IIM 生产/采购追踪字段
  yiGouJianShu: 0,
  head_PUR: '',
  kaiShiRiQi: '',
  yuQiJieShu: '',
  dangQianJinDu: 0,
  head_OUT: '',
})

const createEmptyWorkOrder = (): Partial<IWorkOrder> => ({
  work_id: '',
  work_ver: 1,
  work_unique: '', //唯一索引，order审核通过的时候自动创建，work_id+"_"+work_ver
  work_clerk: '',
  clerkDate: '',
  work_audit: '',
  auditDate: '',
  gongDanLeiXing: '',
  caiLiao: '',
  chanPinLeiXing: '', //产品类型
  zhiDanShiJian: formatYMD(new Date()),
  customer: '',
  productName: '',
  customerPO: '', //客户PO
  chanPinGuiGe: '', //产品规格：似乎是页面大小

  //似乎都可以从Order.ts里直接过继过来
  dingDanShuLiang: 0, //订单数量
  chuYangShuLiang: 0, //出样数量
  chaoBiLiShuLiang: 0, //超比例数量
  benChangFangSun: 0, //本厂放损
  chuYangRiqiRequired: '', //出样日期要求
  chuHuoRiqiRequired: '', //出货日期要求

  intermedia: [createEmptyProcess()],
  workorderstatus: WorkOrderStatus.DRAFT,
  zhuangDingJianShu: 0,
  zhuangDingStart: '',
  zhuangDingEnd: '',
  head_MNF: '', // 生产部负责人
  attachments: [],
  auditLogs: [], // 审批日志：记录“单子是怎么过的” (用于查看审核记录), OrderState不是Audit的时候不再更新
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
// 1. 定义状态变量
const isParsing = ref(false)
const mainFile = reactive({
  fileName: '',
  file: null as File | null,
})

// 2. 触发文件选择
const triggerMainFile = () => {
  document.getElementById('order-pdf-input-main')?.click()
}

// 3. 处理文件选择
const onMainFileBrowse = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    mainFile.file = target.files[0]
    mainFile.fileName = target.files[0].name
  }
}

// 4. 核心解析函数 (修改 API 路径和数据结构)
async function ParseOrderFile() {
  if (!mainFile.file) return
  try {
    isParsing.value = true
    const formData = new FormData()
    formData.append('file', mainFile.file)

    // 调用你后端的解析接口，此处需确保接口支持 WorkOrder 的解析
    const response = await fetch('/api/workorder/parse-pdf', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('解析失败')

    const result: IWorkOrder = await response.json()

    // 覆盖数据：将解析结果合并到当前响应式对象中
    Object.assign(WorkOrderData, result)
    alert('解析成功，工单已自动填充')
  } catch (error) {
    console.error('Parsing error:', error)
    alert('解析失败，请检查文件格式或手动填写')
  } finally {
    isParsing.value = false
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

  emit('submit', WorkOrderData)
  emit('close')
}

const handleApprove = () => {
  if (!auditRemark.value.trim()) {
    alert('拒绝订单时请填写审核意见')
    return
  }

  if (!confirm(`确定要通过该工程单吗？`)) return

  try {
    // 构造审核数据
    const auditPayload = {
      orderId: WorkOrderData.work_unique,
      passed: true,
      remark: auditRemark.value,
      auditor: 'admin', // 或者当前登录用户
    }

    // 调用后端接口（示例路径）
    // await request.post('/orders/audit', auditPayload)

    console.log('提交审核结果:', auditPayload)
    alert(`订单已通过`)

    // if (isPass) {

    //const newWorkOrder = reactive<IWorkOrder>(createWorkOrderFromOrder(orderData) as IWorkOrder)
    //const fd = prepareWorkOrderForSubmit(WorkOrderData)
    emit('approve', WorkOrderData, auditRemark.value)
    // } else {
    //   emit('reject')
    // }
    emit('close')
  } catch (err) {
    console.error('审核操作失败', err)
    alert('操作失败，请重试')
  }
}

const handleReject = () => {
  if (!auditRemark.value.trim()) {
    alert('拒绝订单时请填写审核意见')
    return
  }
  if (!confirm(`确定要驳回该工程单吗？`)) return
  try {
    // 构造审核数据
    const auditPayload = {
      orderId: WorkOrderData.work_unique,
      passed: false,
      remark: auditRemark.value,
      auditor: 'admin', // 或者当前登录用户
    }

    emit('reject', WorkOrderData, auditRemark.value)
    emit('close')
  } catch (err) {
    console.error('审核操作失败', err)
    alert('操作失败，请重试')
  }
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
  background: linear-gradient(to right, #10b981, #059669);
}

/* 时间流逝感：深色调 */
.time-flow {
  background: linear-gradient(to right, #475569, #0f172a);
}

.bar-label {
  color: white;
  font-size: 11px;
  padding-right: 5px;
  font-weight: bold;
  white-space: nowrap;
}

.btn-ctrl {
  margin-left: 5px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-ctrl.add {
  background-color: #67c23a;
  color: white;
}

.btn-ctrl.del {
  background-color: #f56c6c;
  color: white;
}

.btn-send {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

/* 1. 确保中间列的 TD 容器本身是左对齐 */
.col-left {
  text-align: left !important;
  padding: 10px 15px !important; /* 增加 padding 确保不紧贴边框 */
  vertical-align: middle;
}
.parsing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.parsing-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
}

.loader-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.hidden-input {
  display: none;
}
.task-item-row {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 强制子元素从左对齐 */
  width: 100%;
  margin-bottom: 8px;
}

/* 4. 辅助：强制第一列和最后一列居中 */
.col-center {
  text-align: center !important;
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

/* 行号微调 */
.task-index {
  min-width: 25px; /* 改用 min-width 确保空间 */
  text-align: right;
  margin-right: 10px;
  font-family: monospace; /* 等宽字体让行号更整齐 */
  color: #666;
}
</style>

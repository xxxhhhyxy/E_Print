export interface IWorkOrder {
  work_id: string //工程单号，order审核通过的时候自动创建,order_id+"_W"
  work_ver: number //版本号，order审核通过的时候自动创建,和order_ver相同
  work_unique: string //唯一索引，order审核通过的时候自动创建，work_id+"_"+work_ver
  work_clerk?: string //制单员名称或者工号
  clerkDate?: string //工程单提交日期
  work_audit?: string //工程单审核员名称或者工号
  auditDate?: string //工程单过审日期
  gongDanLeiXing?: string //工单类型
  caiLiao?: string //普通材料
  chanPinLeiXing?: string //产品类型
  zhiDanShiJian?: string //制单时间
  customer?: string //客户
  customerPO?: string //客户PO
  productName?: string //成品名称
  chanPinGuiGe?: string //产品规格：似乎是页面大小

  //似乎都可以从Order.ts里直接过继过来
  dingDanShuLiang?: number //订单数量
  chuYangShuLiang?: number //出样数量
  chaoBiLiShuLiang?: number //超比例数量
  benChangFangSun?: number //本厂放损
  chuYangRiqiRequired?: string //出样日期要求
  chuHuoRiqiRequired?: string //出货日期要求
  intermedia: IIM[] //中间物料详单

  //表格上没有的
  workorderstatus: WorkOrderStatus //订单状态
  zhuangDingJianShu?: number //已经装订的件数
  zhuangDingStart?: string //装订开始时间
  zhuangDingEnd?: string //装订结束时间
  head_MNF?: string //生产部负责人

  auditLogs?: IAuditLog[] // 审批日志：记录“单子是怎么过的” (用于查看审核记录), OrderState不是Audit的时候不再更新
  attachments?: IAttachment[] //创建订单时上传的附件
  // baoZhuangJianShu?:number//包装件数
  //任务集群
  //task_pur?: string[]
  //task_out?: string[]
  //task_mfg?: string[]
}

export enum WorkOrderStatus {
  DRAFT = '草稿',
  PENDING_REVIEW = '待审核',
  APPROVED = '通过',
  REJECTED = '驳回',
  IN_PRODUCTION = '生产中',
  COMPLETED = '完成',
  CANCELLED = '取消',
}

//intermediate material
export interface IIM {
  intermediaID?: number //这个外发工序在工程单里的序号
  buJianMingCheng?: string //部件名称
  yinShuaYanSe?: string //印刷颜色
  wuLiaoMingCheng?: string //物料名称
  pinPai?: string //品牌
  caiLiaoGuiGe?: string //材料规格
  FSC?: string //FSC
  kaiShu?: number //开数
  shangJiChiCun?: string //上机尺寸
  paiBanMuShu?: number //排版模数
  yinChuShu?: number //印出数
  yinSun?: number //印损
  lingLiaoShu?: number //领料数（张）
  biaoMianChuLi?: string //表面处理
  yinShuaBanShu?: number //印刷版数目
  shengChanLuJing?: string //生产路径
  paiBanFangShi?: string //排版方式

  //表格上没有的
  yiGouJianShu?: number //number：已经采购的件数，caiGouJianShu/lingLiaoShu=采购进度
  head_PUR?: string //string: 该工序的采购负责人

  kaiShiRiQi?: string //工序开始日期
  yuQiJieShu?: string //工序预期结束日期
  dangQianJinDu?: number //工序当前进度，由技工手动输入
  head_OUT?: string //工序负责人
}

export const calculateTimeProgress = (item: IIM): number => {
  // 增加健壮性检查：确保日期字符串存在
  if (!item.kaiShiRiQi || !item.yuQiJieShu) return 0

  const start: number = new Date(item.kaiShiRiQi).getTime()
  const end: number = new Date(item.yuQiJieShu).getTime()

  // 2026年当前的实时时间
  const now: number = Date.now()

  // 边界处理
  if (now <= start) return 0
  if (now >= end) return 100

  const total: number = end - start
  const elapsed: number = now - start

  // 使用 Math.min/max 确保结果严格在 0-100 之间
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

/** 附件条目接口 */
export interface IAttachment {
  category: string // 附件分类
  fileName: string // 文件名
  file?: File // 可选：用于本地上传阶段的 File 对象
  url?: string // 可选：用于查看阶段的服务器下载链接
}
//审核记录
export interface IAuditLog {
  time: string
  operator: string //业务员或者审核人，后期以工号替代
  action: string
  comment?: string
}
/**
 * 将工单数据和附件封装为 FormData 格式
 * @param rawOrder 页面上的响应式数据对象
 * @returns 准备好发送给后端的 FormData
 */

/** 统一日期处理：返回 yyyy-mm-dd */
export function formatYMD(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 格式化完整时间：yyyy-mm-dd HH:mm:ss */
export function formatFullTime(date: Date): string {
  const ymd = formatYMD(date)
  const hms = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((v) => String(v).padStart(2, '0'))
    .join(':')
  return `${ymd} ${hms}`
}

// ============ 业务逻辑 ============

export function addAuditLog(orderData: Partial<IWorkOrder>): void {
  const firstLog: IAuditLog = {
    time: formatFullTime(new Date()),
    operator: orderData.work_clerk || '未知业务员',
    action: 'submit',
    comment: '业务员提交订单，发起审核流程',
  }
  orderData.auditLogs = orderData.auditLogs || []
  orderData.auditLogs.push(firstLog)
  //
}

/**
 * 将工单数据和附件封装为 FormData 格式（严格类型版）
 */
export const prepareWorkOrderForSubmit = (rawOrder: Partial<IWorkOrder>): FormData => {
  const formData = new FormData()

  // 1. 处理文件附件
  rawOrder.attachments?.forEach((attr) => {
    if (attr.file) {
      // 将文件加入 FormData，后端通常通过 'files' 键接收
      formData.append('files', attr.file)
    }
  })

  // 2. 深度克隆业务数据（为了不修改 UI 层的数据）
  const orderCopy = JSON.parse(JSON.stringify(rawOrder)) as IWorkOrder

  // 3. 清洗数据：移除附件中的 File 对象（因为 File 不能被序列化为 JSON）
  if (orderCopy.attachments) {
    orderCopy.attachments = orderCopy.attachments.map((attr) => ({
      category: attr.category,
      fileName: attr.fileName,
      url: attr.url, // 保留已有的 URL，去掉 file 实体
    }))
  }

  // 4. 清洗中间物料详单 (过滤掉空行)
  if (orderCopy.intermedia && Array.isArray(orderCopy.intermedia)) {
    orderCopy.intermedia = orderCopy.intermedia.filter((item: IIM): boolean => {
      const hasComponent = !!(item.buJianMingCheng && item.buJianMingCheng.trim())
      const hasMaterial = !!(item.wuLiaoMingCheng && item.wuLiaoMingCheng.trim())
      return hasComponent || hasMaterial
    })
  }

  // 5. 【关键缺失】：将清洗后的 JSON 数据也塞进 FormData
  // 后端通常需要从 'orderData' 字段解析字符串化的 JSON
  formData.append('workOrderData', JSON.stringify(orderCopy))

  return formData
}

// 建立 状态 -> 颜色 的直接映射
export const WorkStatusColor: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.DRAFT]: '#000000', // 灰色
  [WorkOrderStatus.PENDING_REVIEW]: '#00FFFF', // 橙色
  [WorkOrderStatus.APPROVED]: '#008800', // 绿色
  [WorkOrderStatus.REJECTED]: '#FF0000', // 红色
  [WorkOrderStatus.IN_PRODUCTION]: '#8000ff', // 蓝色
  [WorkOrderStatus.COMPLETED]: '#000000', // 绿色
  [WorkOrderStatus.CANCELLED]: '#808080', // 灰色
}

export enum TaskStatus {
  Ahead = '先于进度',
  Behind = '落后进度',
  Late = '超过工期',
  Done = '已经完成',
}
export const TaskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.Ahead]: '#1aff00', // 深亮绿 (更适合白底文字)
  [TaskStatus.Behind]: '#a3a900', // 深黄色/琥珀色
  [TaskStatus.Late]: '#ff0000', // 红色
  [TaskStatus.Done]: '#878787', // 灰色
}
//前序任务是否完成，以及当前任务是否分配
export enum PreStatus {
  NotReady = '未就绪',
  NotAssign = '未分配',
  Assigned = '已分配',
  Done = '已完成',
}
/**
 * 根据日期进度和实际进度计算工序状态
 * @param item 传入的中间物料详单条目
 * @returns TaskStatus 枚举值
 */
export const getTaskStatus = (item: IIM): TaskStatus => {
  // 1. 首先检查是否完成：只要当前进度达到 100，即为 Done
  if ((item.dangQianJinDu || 0) >= 100) {
    return TaskStatus.Done
  }

  // 获取当前的日期进度 (0-100)
  const timeProgress = calculateTimeProgress(item)

  // 获取当前时间戳和预期结束时间戳
  const now = Date.now()
  const deadline = item.yuQiJieShu ? new Date(item.yuQiJieShu).getTime() : 0

  // 2. 检查是否超过工期：当前时间已超过预期结束日期（且未完成）
  if (deadline > 0 && now > deadline) {
    return TaskStatus.Late
  }

  // 实际填写的进度
  const actualProgress = item.dangQianJinDu || 0

  // 3. 先于进度：实际进度 > 日期进度
  if (actualProgress > timeProgress) {
    return TaskStatus.Ahead
  }

  // 4. 落后进度：实际进度 < 日期进度，且当前时间还未超过预期结束日期
  // (由于上面已经拦截了 now > deadline，此处只需判断进度大小)
  if (actualProgress < timeProgress) {
    return TaskStatus.Behind
  }

  // 默认返回（例如两者相等时），可归类为正常或 Behind
  return TaskStatus.Behind
}

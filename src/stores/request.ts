import type { IAuditLog as orderlog, IOrder, OrderStatus } from '@/types/Order'
import type { IAuditLog as worklog, IWorkOrder, WorkOrderStatus } from '@/types/WorkOrder'
import axios from 'axios'

// 1. 创建实例
const service = axios.create({
  baseURL: 'http://localhost:3000/api', // 这里换成你后端的真实地址
  timeout: 10000, // 10秒超时
})

// 2. 请求拦截器 (发包裹前检查一下)
service.interceptors.request.use(
  (config) => {
    // 比如：如果本地有 Token，就带上
    // config.headers['Authorization'] = 'Bearer ' + token
    return config
  },
  (error) => Promise.reject(error),
)

// 3. 响应拦截器 (拆包裹前检查一下)
service.interceptors.response.use(
  (response) => {
    // 如果后端返回的状态码是 200，直接给数据
    return response.data
  },
  (error) => {
    // 在这里统一处理错误：比如弹出通知栏提示“服务器冒烟了”
    console.error('网络请求出错:', error)
    return Promise.reject(error)
  },
)

/**
 * 通过业务员姓名获取订单列表
 * @param salesName 业务员名字
 */
export const FindOrdersBySales = (salesName: string): Promise<IOrder[]> => {
  return service.get('/orders/findBySales', {
    params: { sales: salesName }, // 后端接收 string 的参数名
  })
}

export const FindOrdersByAudit = (auditName: string): Promise<IOrder[]> => {
  return service.get('/orders/findByAudit', {
    params: { audit: auditName }, // 后端接收 string 的参数名
  })
}

// 1. 根据 ID 查询单个订单
export const FindOrderByID = (orderId: string): Promise<IOrder> => {
  return service.get('/orders/findById', {
    params: { order_id: orderId },
  })
}

// 2. 根据状态查询订单列表 (如查询所有“待审核”的单子)
export const FindOrdersWithStatus = (status: OrderStatus): Promise<IOrder[]> => {
  return service.get('/orders/status', {
    params: { orderstatus: status },
  })
}

// 3. 修改订单状态 (审核通过、驳回)
export const ChangeOrderStatusTo = (orderunique: string, status: OrderStatus) => {
  return service.post('/orders/updateStatus', {
    order_unique: orderunique, //订单索引
    orderstatus: status,
  })
}
//添加审核员信息
export const AddOrderAuditInfo = (orderUnique: string, auditName: string, date: string) => {
  return service.post('/orders/addAuditInfo', {
    order_unique: orderUnique, //订单索引
    audit: auditName, //审核员
    auditDate: date, //审核日期
  })
}
//添加审核记录
export const AddOrderAuditLog = (orderUnique: string, log: orderlog) => {
  return service.post('/orders/addAuditLog', { order_unique: orderUnique, auditLogs: log })
}

//以下是工程单
export const FindWorkOrdersByClerk = (clerkName: string): Promise<IWorkOrder[]> => {
  return service.get('/workOrders/findByClerk', {
    params: { work_clerk: clerkName }, // 后端接收 string 的参数名
  })
}
export const FindWorkOrdersByAudit = (auditName: string): Promise<IWorkOrder[]> => {
  return service.get('/workOrders/findByAudit', {
    params: { work_audit: auditName }, // 后端接收 string 的参数名
  })
}

export const FindWorkOrderByID = (workunique: string): Promise<IWorkOrder> => {
  return service.get('/workOrders/findById', {
    params: { work_unique: workunique },
  })
}

// 5. 查询所有待处理的工单
export const FindWorkOrdersWithStatus = (status: WorkOrderStatus): Promise<IWorkOrder[]> => {
  return service.get('/workOrders/findWithStatus', {
    params: { workorderstatus: status },
  })
}

// 6. 修改工单状态
export const ChangeWorkOrderStatusTo = (workunique: string, status: WorkOrderStatus) => {
  return service.post('/workOrders/updateStatus', {
    work_unique: workunique,
    workorderstatus: status,
  })
}

//添加审核记录
export const AddWorkAuditLog = (workUnique: string, log: worklog) => {
  return service.post('/workOrders/addAuditLog', { work_unique: workUnique, auditLogs: log })
}

/**
 * 采购部认领任务/指定负责人
 * @param workUnique 工程单唯一索引 (work_id + "_" + work_ver)
 * @param iimID intermedia 数组中的序号 (即 idx)
 * @param head 负责人姓名 (head_pur)
 */
export const AddHead_Pur = (workUnique: string, iimID: number, head: string) => {
  return service.post('/workOrders/updateHeadPur', {
    work_unique: workUnique,
    intermediaID: iimID, // 对应你前端传入的 idx,是intermedia的序号
    head_PUR: head,
  })
}
export const UpdateProgress_Pur = (workUnique: string, iimID: number, progress: number) => {
  return service.post('/workOrders/updateProgressPur', {
    work_unique: workUnique,
    intermediaID: iimID,
    yiGouJianShu: progress,
  })
}

/**
 * 外发部认领任务/指定负责人
 * @param workUnique 工程单唯一索引 (work_id + "_" + work_ver)
 * @param iimID intermedia 数组中的序号 (即 idx)
 * @param head 负责人姓名 (head_pur)
 */
export const AddHead_Out = (workUnique: string, iimID: number, head: string) => {
  return service.post('/workOrders/updateHeadOut', {
    work_unique: workUnique,
    intermediaID: iimID, // 对应你前端传入的 idx,是intermedia的序号
    head_OUT: head,
  })
}
export const UpdateProgress_Out = (
  workUnique: string,
  iimID: number,
  start: string,
  end: string,
  progress: number,
) => {
  return service.post('/workOrders/updateProgressOut', {
    work_unique: workUnique,
    intermediaID: iimID,
    kaiShiRiQi: start, //工序开始日期
    yuQiJieShu: end, //工序预期结束日期
    dangQianJinDu: progress,
  })
}

export const AddHead_Mnf = (workUnique: string, head: string) => {
  return service.post('/workOrders/updateHeadMnf', {
    work_unique: workUnique,
    head_MNF: head,
  })
}

export const UpdateProgress_Mnf = (workUnique: string, progress: number) => {
  return service.post('/workOrders/updateProgressMnf', {
    work_unique: workUnique,
    zhuangDingJianShu: progress,
  })
}
// export const AddHead_Out = (workUnique: string, iimID: number, head: string) => {
//   return service.post('/workOrder/addHead_Out')
// }
// export const AddHead_Mnf = (workUnique: string, iimID: number, head: string) => {
//   return service.post('/workOrder/addHead_Mnf')
// }

// export interface ITaskResponse {
//   work_unique: string // 匹配上传时的字段
//   tasks: string[] // 匹配上传时的字段 (finalTasks)
// }
// export const FindTasksPur = (): Promise<ITaskResponse[]> => {
//   return service.get('/workOrders/pur')
// }
// export const FindTasksOUT = (): Promise<ITaskResponse[]> => {
//   return service.get('/workOrders/out')
// }
// export const FindTasksMGF = (): Promise<ITaskResponse[]> => {
//   return service.get('/workOrders/mnf')
// }

//添加审核员信息
export const AddWorkAuditInfo = (workUnique: string, auditName: string, date: string) => {
  return service.post('/workOrders/addAuditInfo', {
    work_unique: workUnique, //订单索引
    work_audit: auditName, //审核员
    auditDate: date, //审核日期
  })
}

export default service

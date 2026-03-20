export interface IUser {
  // ======== 基础账号信息 ========
  userId: string // string: 用户唯一标识符 (UUID或工号)
  username: string // string: 登录账号名
  email: string // string: 电子邮箱
  passwordHash: string // string: 加密后的密码哈希值 (前端不存储明文)
  fullName: string // string: 用户真实姓名
  isActive: boolean // boolean: 账号是否启用

  // ======== 提交与审核权限 (流程控制) ========
  order_submit: boolean // boolean: 订单提交权限 (业务员)
  order_audit: boolean // boolean: 订单审核权限 (审单员/主管)
  work_submit: boolean // boolean: 工程单提交权限 (制单员)
  work_audit: boolean // boolean: 工程单审核权限 (工程主管)

  // ======== 查看和修改权限 (模块准入) ========
  order_check: boolean // boolean: 订单查看权限
  work_check: boolean // boolean: 工程单查看权限
  pmc_check: boolean // boolean: PMC(生产排期)查看权限
  pmc_edit: boolean // boolean: PMC(生产排期)修改权限

  // ======== 查看和修改发货 (物流权限) ========
  delieve_check: boolean // boolean: 发货/出库记录查看权限
  delieve_edit: boolean // boolean: 发货/出库单据编辑权限

  isSAL: boolean //boolean: 是否能查看销售部页面
  isPUR: boolean //boolean: 是否能查看采购部页面
  isOUT: boolean //boolean: 是否能查看外发部页面
  isMNF: boolean //boolean: 是否能查看生产部页面
  isADM: boolean //boolean: 是否能查看办公室页面

  // ======== 系统辅助字段 ========
  lastLogin?: string // string: 最后登录时间 (yyyy-mm-dd HH:mm:ss)
}

//部门，确保每个部门的英语首字母不同，SPOMA
export enum Department {
  SAL = '销售部',
  PUR = '采购部',
  OUT = '外发部',
  MNF = '生产部',
  ADM = '办公室',
}
/**
 * 创建一个默认的空用户对象
 * 用于表单初始化或新用户创建
 */
/**
 * 根据已有的 userId 初始化一个基础用户对象
 * 确保所有布尔权限默认为 false，防止权限溢出
 */
export function initUserWithId(userId: string): IUser {
  return {
    userId: userId,
    username: '',
    email: '',
    passwordHash: '',
    fullName: '新用户',
    isActive: true,

    // 默认关闭所有流程权限 (E_Print 系统安全考量)
    order_submit: false,
    order_audit: false,
    work_submit: false,
    work_audit: false,

    // 默认关闭所有查看权限
    order_check: false,
    work_check: false,
    pmc_check: false,
    pmc_edit: false,

    // 默认关闭物流权限
    delieve_check: false,
    delieve_edit: false,

    // 默认关闭部门页面准入
    isSAL: false,
    isPUR: false,
    isOUT: false,
    isMNF: false,
    isADM: false,
  }
}

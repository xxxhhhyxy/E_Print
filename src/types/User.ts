//IUser基础接口，和后端做信息交互
export interface IUserBase {
  userId: string
  username: string
  email: string
  passwordHash: string
  fullName: string
  role: UserRole
  isActive: boolean
}

enum UserRole {
  Sales = '业务员',
  Audit = '审核员',
  PMC = '调度员',
  Admin = '管理员',
}
//IUser前端实际接口
export interface IUser extends IUserBase {
  //提交与审核权限
  order_submit: boolean
  order_audit: boolean
  work_submit: boolean
  work_audit: boolean

  //查看和修改权限
  order_check: boolean
  work_check: boolean
  pmc_check: boolean
  pmc_edit: boolean

  //查看和修改发货
  delieve_check: boolean
  delieve_edit: boolean
}

export function createUser(input: Pick<IUser, 'fullName' | 'role'> & Partial<IUser>): IUser {
  const { fullName, role, ...rest } = input

  // 初始化基础字段和默认权限
  const user: IUser = {
    userId: '',
    username: '',
    email: '',
    passwordHash: '',
    fullName,
    role,
    isActive: true,

    // 提交 / 审核权限
    order_submit: false,
    order_audit: false,
    work_submit: false,
    work_audit: false,

    // 查看 / 修改权限
    order_check: false,
    work_check: false,
    pmc_check: false,
    pmc_edit: false,

    // 查看和修改发货
    delieve_check: false,
    delieve_edit: false,

    ...rest, // 覆盖额外字段
  }

  // 根据 role 给权限赋值
  switch (role) {
    case UserRole.Sales:
      user.order_submit = true
      break
    case UserRole.Audit:
      user.order_audit = true
      user.work_audit = true
      break
    case UserRole.PMC:
      user.pmc_check = true
      user.pmc_edit = true
      break
    case UserRole.Admin:
      user.order_submit = true
      user.order_audit = true
      user.work_submit = true
      user.work_audit = true
      user.order_check = true
      user.work_check = true
      user.pmc_check = true
      user.pmc_edit = true
      user.delieve_check = true
      user.delieve_edit = true
      break
  }

  return user
}

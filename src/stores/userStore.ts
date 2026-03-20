import { defineStore } from 'pinia'
import type { IUser } from '../types/User' // 导入你定义的接口
import { initUserWithId } from '../types/User'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 初始状态为一个空的或基础的用户对象
    currentUser: null as IUser | null,
    isLoggedIn: false,
  }),

  actions: {
    // 登录成功后调用，初始化全局用户
    loginUser(userId: string) {
      this.currentUser = initUserWithId(userId)
      this.isLoggedIn = true
      // 可以在这里扩展：从后端 API 获取该 ID 的完整权限并覆盖
    },

    // 退出登录
    logout() {
      this.currentUser = null
      this.isLoggedIn = false
    },
  },

  // Getter 用于快速判断权限，方便在组件里直接使用
  getters: {
    canAuditOrder: (state) => state.currentUser?.order_audit ?? false,
    isProductionDept: (state) => state.currentUser?.isMNF ?? false,
  },
})

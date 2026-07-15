import { defineStore } from 'pinia'
import type { IUser } from '../types/User' // 导入你定义的接口
import { initUserWithId } from '../types/User'

const STORAGE_KEY = 'eprint_current_user'

/** 从 localStorage 恢复登录态（F5 刷新不掉线） */
function restoreUser(): IUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as IUser) : null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => {
    const restored = restoreUser()
    return {
      currentUser: restored as IUser | null,
      isLoggedIn: restored !== null,
    }
  },

  actions: {
    // 登录成功后调用，初始化全局用户
    loginUser(userId: string) {
      this.currentUser = initUserWithId(userId)
      this.currentUser.username = userId
      this.isLoggedIn = true
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser))
      // 可以在这里扩展：从后端 API 获取该 ID 的完整权限并覆盖
    },

    // 退出登录
    logout() {
      this.currentUser = null
      this.isLoggedIn = false
      localStorage.removeItem(STORAGE_KEY)
    },
  },

  // Getter 用于快速判断权限，方便在组件里直接使用
  getters: {
    canAuditOrder: (state) => state.currentUser?.order_audit ?? false,
    isProductionDept: (state) => state.currentUser?.isMNF ?? false,
    /** 当前登录用户名，未登录时回退 admin（兼容旧数据） */
    userName: (state) => state.currentUser?.username || 'admin',
  },
})

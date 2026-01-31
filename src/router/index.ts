import { createRouter, createWebHistory } from 'vue-router'
import DataUploader from '@/views/DataUploader.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/order-uploader', // 浏览器访问的地址
      name: 'order-uploader',
      component: DataUploader,
    },
  ],
})

export default router

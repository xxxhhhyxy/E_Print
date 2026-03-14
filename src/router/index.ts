import { createRouter, createWebHistory } from 'vue-router'
import OrderUploader from '@/views/OrderUploader.vue'
import WorkUploader from '@/views/WorkUploader.vue'
import OrderReviewer from '@/views/OrderReviewer.vue'
import WorkReviewer from '@/views/WorkReviewer.vue'
import Page_OUT from '@/views/Page_OUT.vue'
import Page_PUR from '@/views/Page_PUR.vue'
import Page_ADM from '@/views/Page_ADM.vue'
// import Page_MNF from '@/views/Page_MNF.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/order-uploader', // 浏览器访问的地址
      name: 'order-uploader',
      component: OrderUploader,
    },
    {
      path: '/work-uploader', // 浏览器访问的地址
      name: 'work-uploader',
      component: WorkUploader,
    },
    {
      path: '/order-reviewer', // 浏览器访问的地址
      name: 'order-reviewer',
      component: OrderReviewer,
    },
    {
      path: '/work-reviewer', // 浏览器访问的地址
      name: 'work-reviewer',
      component: WorkReviewer,
    },
    {
      path: '/page-PUR', // 浏览器访问的地址
      name: 'page-PUR',
      component: Page_PUR,
    },
    {
      path: '/page-OUT', // 浏览器访问的地址
      name: 'page-OUT',
      component: Page_OUT,
    },
    // {
    //   path: '/page-MNF', // 浏览器访问的地址
    //   name: 'page-MNF',
    //   component: Page_MNF,
    // },
    {
      path: '/page-ADM', // 浏览器访问的地址
      name: 'page-ADM',
      component: Page_ADM,
    },
  ],
})

export default router

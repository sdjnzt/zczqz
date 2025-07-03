import { createRouter, createWebHistory } from 'vue-router'

// 预加载关键路由组件
import Layout from '@/views/layout/index.vue'
import Dashboard from '@/views/dashboard/index.vue'
import Login from '@/views/login/index.vue'

const router = createRouter({
  history: createWebHistory('/zczqz/'),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard,
          meta: { title: '首页', icon: 'House' }
        },
        {
          path: 'user',
          name: 'User',
          component: () => import(/* webpackChunkName: "user" */ '@/views/user/index.vue'),
          meta: { title: '用户管理', icon: 'User' }
        },
        {
          path: 'agriculture',
          name: 'Agriculture',
          component: () => import(/* webpackChunkName: "agriculture" */ '@/views/agriculture/index.vue'),
          meta: { title: '农业产业信息化', icon: 'Platform' }
        },
        {
          path: 'public-service',
          name: 'PublicService',
          component: () => import(/* webpackChunkName: "public-service" */ '@/views/public-service/index.vue'),
          meta: { title: '政务便民服务', icon: 'OfficeBuilding' }
        },
        {
          path: 'village',
          name: 'Village',
          component: () => import(/* webpackChunkName: "village" */ '@/views/village/index.vue'),
          meta: { title: '村务管理', icon: 'HomeFilled' }
        },
        {
          path: 'grid',
          name: 'Grid',
          component: () => import(/* webpackChunkName: "grid" */ '@/views/grid/index.vue'),
          meta: { title: '网格化管理', icon: 'Menu' }
        },
        {
          path: 'emergency',
          name: 'Emergency',
          component: () => import(/* webpackChunkName: "emergency" */ '@/views/emergency/index.vue'),
          meta: { title: '应急指挥', icon: 'Warning' }
        },
        {
          path: 'monitor',
          name: 'Monitor',
          component: () => import('@/views/monitor/index.vue'),
          meta: { title: '监控告警', icon: 'Warning' }
        },
        {
          path: 'system',
          name: 'System',
          component: () => import('@/views/system/index.vue'),
          meta: { title: '业务系统', icon: 'Cpu' }
        },
        // {
        //   path: 'device',
        //   name: 'Device',
        //   component: () => import('@/views/device/index.vue'),
        //   meta: { title: '设备管理', icon: 'Monitor' }
        // },
        // {
        //   path: 'resource',
        //   name: 'Resource',
        //   component: () => import('@/views/resource/index.vue'),
        //   meta: { title: '资源管理', icon: 'Connection' }
        // },
        // {
        //   path: 'data',
        //   name: 'Data',
        //   component: () => import('@/views/data/index.vue'),
        //   meta: { title: '数据服务', icon: 'DataLine' }
        // },
        // {
        //   path: 'health',
        //   name: 'Health',
        //   component: () => import('@/views/health/index.vue'),
        //   meta: { title: '服务健康', icon: 'CircleCheck' }
        // },
        // {
        //   path: 'energy',
        //   name: 'Energy',
        //   component: () => import('@/views/energy/index.vue'),
        //   meta: { title: '能耗监控', icon: 'PieChart' }
        // },
        {
          path: 'backup',
          name: 'Backup',
          component: () => import('@/views/backup/index.vue'),
          meta: { title: '备份任务', icon: 'DocumentCopy' }
        },
        // {
        //   path: 'hardware',
        //   name: 'Hardware',
        //   component: () => import('@/views/hardware/index.vue'),
        //   meta: { title: '硬件资源管理', icon: 'Connection' }
        // }
      ]
    }
  ]
})

export default router 

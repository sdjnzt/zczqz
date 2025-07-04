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
          path: 'policy',
          name: 'Policy',
          redirect: '/policy/index',
          meta: { title: '政策法规', icon: 'DocumentChecked' },
          children: [
            {
              path: 'index',
              name: 'PolicyIndex',
              component: () => import(/* webpackChunkName: "policy" */ '@/views/policy/index.vue'),
              meta: { title: '政策概览' }
            },
            {
              path: 'list',
              name: 'PolicyList',
              component: () => import(/* webpackChunkName: "policy-list" */ '@/views/policy/list.vue'),
              meta: { title: '政策列表' }
            },
            {
              path: 'category',
              name: 'PolicyCategory',
              component: () => import(/* webpackChunkName: "policy-category" */ '@/views/policy/category.vue'),
              meta: { title: '政策分类' }
            },
            {
              path: 'detail/:id',
              name: 'PolicyDetail',
              component: () => import(/* webpackChunkName: "policy-detail" */ '@/views/policy/detail.vue'),
              meta: { title: '政策详情', hidden: true }
            }
          ]
        },
        {
          path: 'document',
          name: 'Document',
          component: () => import(/* webpackChunkName: "document" */ '@/views/document/index.vue'),
          meta: { title: '公文流转', icon: 'Document' }
        },
        // {
        //   path: 'meeting',
        //   name: 'Meeting',
        //   component: () => import(/* webpackChunkName: "meeting" */ '@/views/meeting/index.vue'),
        //   meta: { title: '会议安排', icon: 'Calendar' }
        // },
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
        {
          path: 'backup',
          name: 'Backup',
          component: () => import('@/views/backup/index.vue'),
          meta: { title: '备份任务', icon: 'DocumentCopy' }
        }
      ]
    }
  ]
})

export default router 

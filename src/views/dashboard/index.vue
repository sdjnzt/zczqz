<template>
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="dashboard-title">邹城市城前镇人民政府云定制化项目</h1>
      </div>
      
      <!-- 顶部统计卡片 -->
      <el-row :gutter="20" class="stat-row">
        <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
          <el-card shadow="hover" class="stat-card" :class="item.type">
            <template #header>
              <div class="card-header">
                <span>{{ item.title }}</span>
                <el-tag :type="item.tagType">{{ item.tagText }}</el-tag>
              </div>
            </template>
            <div class="stat-content">
              <el-icon class="stat-icon"><component :is="item.icon" /></el-icon>
              <div class="stat-info">
                <div class="stat-number">{{ item.value }}</div>
                <div class="stat-label">{{ item.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 业务系统状态 -->
      <el-card class="system-status" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Operation /></el-icon>
              <span>业务系统状态</span>
              <el-tag type="success" effect="dark" class="ml-10">全部正常</el-tag>
            </div>
            <div class="header-actions">
              <el-tooltip content="数据为实时同步">
                <span class="sync-time">最后同步: {{ formatTime(new Date()) }}</span>
              </el-tooltip>
              <el-button type="primary" size="small" :icon="Refresh" @click="refreshSystemStatus">刷新</el-button>
              <el-button type="success" size="small" :icon="Document" @click="generateReport">报表</el-button>
            </div>
          </div>
        </template>
        
        <el-row :gutter="20" class="system-summary">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card running">
              <div class="summary-icon"><el-icon><VideoPlay /></el-icon></div>
              <div class="summary-info">
                <div class="summary-title">运行中</div>
                <div class="summary-value">{{ systemList.filter(s => s.status === '运行中').length }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card maintenance">
              <div class="summary-icon"><el-icon><Tools /></el-icon></div>
              <div class="summary-info">
                <div class="summary-title">维护中</div>
                <div class="summary-value">{{ systemList.filter(s => s.status === '维护中').length }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card warning">
              <div class="summary-icon"><el-icon><WarningFilled /></el-icon></div>
              <div class="summary-info">
                <div class="summary-title">告警</div>
                <div class="summary-value">{{ systemList.filter(s => s.status === '告警').length }}</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card offline">
              <div class="summary-icon"><el-icon><CircleClose /></el-icon></div>
              <div class="summary-info">
                <div class="summary-title">离线</div>
                <div class="summary-value">{{ systemList.filter(s => s.status === '离线').length }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <el-table 
          :data="systemList" 
          style="width: 100%" 
          :max-height="400"
          border
          stripe
          highlight-current-row
          v-loading="tableLoading"
        >
          <el-table-column prop="systemName" label="系统名称" min-width="180">
            <template #default="{ row }">
              <div class="system-name">
                <el-icon class="system-icon" :class="getSystemIconClass(row)">
                  <component :is="getSystemIcon(row)" />
                </el-icon>
                <span>{{ row.systemName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="负责人" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusType(row.status)"
                effect="dark"
                size="small"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180" />
          <el-table-column prop="usage" label="使用率" width="180">
            <template #default="{ row }">
              <el-progress 
                :percentage="row.usage || 0"
                :status="row.usage > 80 ? 'exception' : row.usage > 60 ? 'warning' : 'success'"
                :stroke-width="8"
                :format="(p: number) => `${p}%`"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-tooltip content="查看详情" placement="top">
                  <el-button type="primary" :icon="View" circle size="small" @click="viewSystemDetail(row)"></el-button>
                </el-tooltip>
                <el-tooltip content="系统设置" placement="top">
                  <el-button type="warning" :icon="Setting" circle size="small" @click="configSystem(row)"></el-button>
                </el-tooltip>
                <el-tooltip content="重启系统" placement="top">
                  <el-button type="danger" :icon="RefreshRight" circle size="small" @click="restartSystem(row)"></el-button>
                </el-tooltip>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- 硬件资源监控 -->
      <el-row :gutter="20" class="monitor-row">
        <el-col :xs="24" :md="12">
          <el-card class="monitor-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon><TrendCharts /></el-icon>
                  <span>资源使用趋势</span>
                </div>
                <el-radio-group v-model="timeRange" size="small">
                  <el-radio-button label="day">24小时</el-radio-button>
                  <el-radio-button label="week">7天</el-radio-button>
                  <el-radio-button label="month">30天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card class="monitor-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon><Warning /></el-icon>
                  <span>系统告警</span>
                </div>
                <el-button type="primary" size="small" :icon="Refresh" @click="refreshAlarms">刷新</el-button>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="(alarm, index) in alarmList"
                :key="index"
                :type="alarm.type"
                :timestamp="alarm.time"
                :hollow="alarm.type === 'info'"
              >
                <div class="alarm-content">{{ alarm.content }}</div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 网格化管理 -->
      <el-card class="grid-management" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><Grid /></el-icon>
              <span>网格化管理概况</span>
            </div>
            <el-button type="primary" size="small" @click="viewGridDetail">查看详情</el-button>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(grid, index) in gridData" :key="index">
            <div class="grid-card" :class="`grid-type-${grid.type}`">
              <div class="grid-header">
                <span class="grid-name">{{ grid.name }}</span>
                <el-tag size="small" :type="grid.status === '正常' ? 'success' : 'warning'">{{ grid.status }}</el-tag>
              </div>
              <div class="grid-content">
                <div class="grid-row">
                  <span class="label">网格员:</span>
                  <span class="value">{{ grid.manager }}</span>
                </div>
                <div class="grid-row">
                  <span class="label">覆盖范围:</span>
                  <span class="value">{{ grid.area }}</span>
                </div>
                <div class="grid-row">
                  <span class="label">户数:</span>
                  <span class="value">{{ grid.households }}</span>
                </div>
                <div class="grid-row">
                  <span class="label">人口:</span>
                  <span class="value">{{ grid.population }}</span>
                </div>
                <div class="grid-row">
                  <span class="label">事件数:</span>
                  <span class="value">{{ grid.events }}</span>
                </div>
              </div>
              <div class="grid-footer">
                <el-progress 
                  :percentage="grid.completion" 
                  :color="grid.completion > 80 ? '#67C23A' : '#E6A23C'"
                  :stroke-width="5"
                  :format="(p: number) => `${p}%完成率`"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 重点项目进展 -->
      <el-card class="projects-progress" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon><DataAnalysis /></el-icon>
              <span>重点项目进展</span>
            </div>
            <div class="header-actions">
              <span class="update-time">更新时间: {{ formatTime(new Date()) }}</span>
              <el-button type="primary" size="small" @click="viewAllProjects">查看全部</el-button>
            </div>
          </div>
        </template>
        
        <el-table :data="projectList" style="width: 100%" :max-height="400" border stripe>
          <el-table-column prop="name" label="项目名称" min-width="220" />
          <el-table-column prop="manager" label="负责人" width="100" />
          <el-table-column prop="department" label="所属部门" width="150" />
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="endDate" label="计划完成日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getProjectStatusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="进度" min-width="200">
            <template #default="{ row }">
              <el-progress 
                :percentage="row.progress" 
                :status="getProgressStatus(row.progress, row.status)"
                :stroke-width="10" 
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
  // import { useRouter } from 'vue-router'
  import * as echarts from 'echarts'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { 
    Operation, 
    TrendCharts, 
    Warning, 
    WarningFilled,
    Refresh,
    RefreshRight,
    View,
    Setting,
    Document,
    Tools,
    VideoPlay,
    CircleClose,
    Grid,
    DataAnalysis
  } from '@element-plus/icons-vue'
  
  // 使用路由
  // const router = useRouter()
  
  // 统计卡片数据
  const statCards = [
    {
      title: '政务便民服务',
      icon: 'Tickets',
      value: '6',
      label: '系统总数',
      tagText: '运行中',
      tagType: 'success',
      type: 'primary'
    },
    {
      title: '村务管理',
      icon: 'HomeFilled',
      value: '4',
      label: '资源总数',
      tagText: '正常',
      tagType: 'primary',
      type: 'success'
    },
    {
      title: '农业产业信息化',
      icon: 'Crop',
      value: '9TB',
      label: '已用/20TB',
      tagText: '使用中',
      tagType: 'warning',
      type: 'warning'
    },
    {
      title: '应急指挥',
      icon: 'FirstAidKit',
      value: '65%',
      label: 'CPU使用率',
      tagText: '实时',
      tagType: 'info',
      type: 'danger'
    }
  ]
  
  // 时间范围选择
  const timeRange = ref('day')
  
  // 系统列表数据
  const systemList = ref([
    { id: 1, systemName: '政务便民服务平台', owner: '王晓强', status: '运行中', updateTime: '2025-06-01 09:00', usage: 78, type: 'public' },
    { id: 2, systemName: '村务管理系统', owner: '李文娜', status: '运行中', updateTime: '2025-06-01 08:30', usage: 65, type: 'village' },
    { id: 3, systemName: '农业信息化平台', owner: '刘志洋', status: '运行中', updateTime: '2025-06-22 17:00', usage: 42, type: 'agriculture' },
    { id: 4, systemName: '应急指挥系统', owner: '张丽敏', status: '运行中', updateTime: '2025-06-22 16:00', usage: 30, type: 'emergency' }
  ])
  
  // 告警列表
  const alarmList = ref([
    { type: 'warning', time: '2025-06-01 10:30', content: '存储空间使用率超过70%' },
    { type: 'info', time: '2025-06-01 09:15', content: '系统例行维护完成' },
    { type: 'success', time: '2025-06-01 08:00', content: '数据备份任务完成' }
  ])

  // 网格数据
  const gridData = ref([
    { name: '西区网格1', type: 1, status: '正常', manager: '张明', area: '西部片区', households: 256, population: 768, events: 12, completion: 95 },
    { name: '西区网格2', type: 1, status: '正常', manager: '李芳', area: '西部片区', households: 312, population: 936, events: 8, completion: 88 },
    { name: '东区网格1', type: 2, status: '正常', manager: '王伟', area: '东部片区', households: 189, population: 567, events: 5, completion: 92 },
    { name: '东区网格2', type: 2, status: '待处理', manager: '刘红', area: '东部片区', households: 276, population: 828, events: 15, completion: 75 },
    { name: '中心区网格', type: 3, status: '正常', manager: '赵鑫', area: '中心区域', households: 423, population: 1269, events: 7, completion: 90 },
    { name: '南区网格', type: 4, status: '待处理', manager: '孙艺', area: '南部片区', households: 203, population: 609, events: 18, completion: 65 }
  ])

  // 重点项目数据
  const projectList = ref([
    { 
      name: '城前镇智慧农业示范基地建设', 
      manager: '李大勇', 
      department: '农业发展科', 
      startDate: '2025-01-15', 
      endDate: '2025-12-31', 
      status: '进行中',
      progress: 45
    },
    { 
      name: '村民服务中心智能化升级项目', 
      manager: '王建国', 
      department: '民政科', 
      startDate: '2025-06-01',
      endDate: '2025-08-31', 
      status: '进行中',
      progress: 68
    },
    { 
      name: '城前镇应急指挥系统升级工程', 
      manager: '张丽敏', 
      department: '应急管理办', 
      startDate: '2025-02-10', 
      endDate: '2025-07-15', 
      status: '进行中',
      progress: 85
    },
    { 
      name: '农村道路智能监控系统建设', 
      manager: '陈明辉', 
      department: '交通科', 
      startDate: '2025-04-01', 
      endDate: '2025-10-31', 
      status: '延期',
      progress: 32
    },
    { 
      name: '镇村公共服务一体化平台建设', 
      manager: '周雪梅', 
      department: '信息科', 
      startDate: '2025-06-15',
      endDate: '2025-09-30', 
      status: '进行中',
      progress: 52
    }
  ])
  
  // 加载状态
  const tableLoading = ref(false)
  
  // 刷新方法
  const refreshSystemStatus = () => {
    tableLoading.value = true
    
    // 模拟API请求
    setTimeout(() => {
      // 这里可以增加一些随机状态变化来模拟真实环境
      const statusList = ['运行中', '维护中', '告警', '离线']
      const randomStatus = () => statusList[Math.floor(Math.random() * statusList.length)]
      
      // 随机更新一些系统状态
      systemList.value = systemList.value.map(system => ({
        ...system,
        status: Math.random() > 0.7 ? randomStatus() : system.status,
        usage: Math.min(100, system.usage + Math.floor(Math.random() * 10) - 5),
        updateTime: formatTime(new Date())
      }))
      
      tableLoading.value = false
      ElMessage.success('系统状态已刷新')
    }, 1000)
  }
  
  // 刷新告警方法
  const refreshAlarms = () => {
    // 模拟刷新告警数据
    ElMessage({
      message: '正在加载最新告警信息...',
      duration: 0,
      type: 'info'
    })
    
    setTimeout(() => {
      // 随机生成一些新告警
      const newAlertTypes = ['success', 'warning', 'info', 'error']
      const newAlertContents = [
        '系统内存使用率达到临界值',
        '备份任务完成',
        '网络连接异常',
        'CPU使用率过高',
        '存储空间不足',
        '安全漏洞检测完成'
      ]
      
      // 添加1-3个新告警
      const newAlertsCount = Math.floor(Math.random() * 3) + 1
      const now = new Date()
      
      for (let i = 0; i < newAlertsCount; i++) {
        const type = newAlertTypes[Math.floor(Math.random() * newAlertTypes.length)]
        const content = newAlertContents[Math.floor(Math.random() * newAlertContents.length)]
        const time = formatTime(new Date(now.getTime() - i * 60000)) // 每条告警间隔1分钟
        
        alarmList.value.unshift({
          type,
          time,
          content
        })
      }
      
      // 保持告警列表不超过10条
      if (alarmList.value.length > 10) {
        alarmList.value = alarmList.value.slice(0, 10)
      }
      
      // 关闭loading消息
      setTimeout(() => {
        ElMessage.closeAll()
        ElMessage.success('告警信息已更新')
      }, 500)
    }, 1200)
  }

  // 生成报表
  const generateReport = () => {
    ElMessage.info('正在生成系统状态报表...')
    setTimeout(() => {
      ElMessage.success('系统状态报表已生成')
      // 这里可以添加下载或查看报表的逻辑
    }, 1500)
  }
  
  // 查看系统详情
  const viewSystemDetail = (row: any) => {
    ElMessageBox.alert(
      `<div class="system-detail-popup">
        <h3>${row.systemName}</h3>
        <p><strong>ID:</strong> ${row.id}</p>
        <p><strong>负责人:</strong> ${row.owner}</p>
        <p><strong>状态:</strong> ${row.status}</p>
        <p><strong>更新时间:</strong> ${row.updateTime}</p>
        <p><strong>使用率:</strong> ${row.usage}%</p>
        <p><strong>类型:</strong> ${row.type}</p>
      </div>`,
      '系统详情',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭'
      }
    )
  }
  
  // 配置系统
  const configSystem = (row: any) => {
    ElMessage.info(`正在打开${row.systemName}的配置页面...`)
    setTimeout(() => {
      ElMessage.success(`已打开${row.systemName}的配置页面`)
    }, 1000)
  }
  
  // 重启系统
  const restartSystem = (row: any) => {
    ElMessageBox.confirm(
      `确定要重启 ${row.systemName} 吗？重启过程中系统将暂时不可用。`,
      '重启确认',
      {
        confirmButtonText: '确定重启',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        ElMessage({
          type: 'info',
          message: `${row.systemName} 正在重启中，请稍候...`
        })
        
        // 模拟重启过程
        setTimeout(() => {
          // 更新系统状态
          const index = systemList.value.findIndex(s => s.id === row.id)
          if (index !== -1) {
            systemList.value[index].status = '维护中'
          }
          
          // 再次模拟重启完成
          setTimeout(() => {
            if (index !== -1) {
              systemList.value[index].status = '运行中'
              systemList.value[index].usage = Math.floor(30 + Math.random() * 20)
              systemList.value[index].updateTime = formatTime(new Date())
            }
            ElMessage.success(`${row.systemName} 已成功重启`)
          }, 3000)
        }, 2000)
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '已取消重启操作'
        })
      })
  }
  
  // 查看网格详情
  const viewGridDetail = () => {
    ElMessage.info('正在跳转到网格管理页面...')
    setTimeout(() => {
      ElMessage.success('已跳转到网格管理页面')
    }, 1000)
  }
  
  // 查看所有项目
  const viewAllProjects = () => {
    ElMessage.info('正在跳转到项目管理页面...')
    setTimeout(() => {
      ElMessage.success('已跳转到项目管理页面')
    }, 1000)
  }
  
  const trendChartRef = ref<HTMLElement | null>(null)
  let trendChart: echarts.ECharts | null = null
  
  const getTrendData = () => {
    // 根据 timeRange 返回不同的模拟数据
    if (timeRange.value === 'day') {
      return {
        x: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        cpu: [65, 60, 62, 66, 68, 72, 69, 70, 68, 67, 66, 65, 64, 63, 62, 61, 60, 62, 64, 66, 68, 70, 72, 74],
        mem: [78, 75, 76, 77, 79, 81, 78, 77, 76, 75, 74, 73, 72, 71, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88],
        storage: [45, 44, 44, 45, 45, 46, 46, 47, 47, 48, 48, 49, 49, 50, 50, 51, 51, 52, 52, 53, 53, 54, 54, 55]
      }
    } else if (timeRange.value === 'week') {
      return {
        x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        cpu: [65, 60, 70, 66, 68, 72, 69],
        mem: [78, 75, 80, 77, 79, 81, 78],
        storage: [45, 44, 46, 45, 47, 48, 45]
      }
    } else {
      return {
        x: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
        cpu: Array.from({ length: 30 }, () => Math.floor(60 + Math.random() * 15)),
        mem: Array.from({ length: 30 }, () => Math.floor(70 + Math.random() * 20)),
        storage: Array.from({ length: 30 }, () => Math.floor(40 + Math.random() * 15))
      }
    }
  }
  
  const renderTrendChart = () => {
    nextTick(() => {
      if (!trendChartRef.value) return
      if (trendChart) {
        trendChart.dispose()
      }
      trendChart = echarts.init(trendChartRef.value)
      const data = getTrendData()
      const option = {
        tooltip: { 
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: { 
          data: ['CPU', '内存', '存储'],
          right: 10,
          top: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: 'category', 
          data: data.x,
          boundaryGap: false
        },
        yAxis: { 
          type: 'value', 
          axisLabel: { formatter: '{value}%' } 
        },
        series: [
          { 
            name: 'CPU', 
            type: 'line', 
            data: data.cpu, 
            smooth: true,
            lineStyle: {
              width: 3
            },
            itemStyle: {
              borderWidth: 2
            },
            areaStyle: {
              opacity: 0.1
            }
          },
          { 
            name: '内存', 
            type: 'line', 
            data: data.mem, 
            smooth: true,
            lineStyle: {
              width: 3
            },
            itemStyle: {
              borderWidth: 2
            },
            areaStyle: {
              opacity: 0.1
            }
          },
          { 
            name: '存储', 
            type: 'line', 
            data: data.storage, 
            smooth: true,
            lineStyle: {
              width: 3
            },
            itemStyle: {
              borderWidth: 2
            },
            areaStyle: {
              opacity: 0.1
            }
          }
        ]
      }
      trendChart.setOption(option)
    })
  }
  
  onMounted(() => {
    renderTrendChart()
    window.addEventListener('resize', () => trendChart?.resize())
  })
  onBeforeUnmount(() => {
    trendChart?.dispose()
    window.removeEventListener('resize', () => trendChart?.resize())
  })
  watch(timeRange, () => {
    renderTrendChart()
  })

  // 添加业务系统相关函数和变量
  const getStatusType = (status: string) => {
    switch (status) {
      case '运行中': return 'success'
      case '维护中': return 'info'
      case '告警': return 'warning'
      case '离线': return 'danger'
      default: return 'info'
    }
  }

  const getSystemIcon = (row: any) => {
    switch (row.type) {
      case 'public': return 'Tickets'
      case 'village': return 'HomeFilled'
      case 'agriculture': return 'Crop'
      case 'emergency': return 'FirstAidKit'
      default: return 'Document'
    }
  }

  const getSystemIconClass = (row: any) => {
    switch (row.type) {
      case 'public': return 'icon-public'
      case 'village': return 'icon-village'
      case 'agriculture': return 'icon-agriculture'
      case 'emergency': return 'icon-emergency'
      default: return ''
    }
  }

  // 格式化时间函数
  const formatTime = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  // 获取项目状态样式
  const getProjectStatusType = (status: string) => {
    switch (status) {
      case '已完成': return 'success'
      case '进行中': return 'primary'
      case '延期': return 'warning'
      case '暂停': return 'info'
      default: return 'info'
    }
  }

  // 获取进度状态
  const getProgressStatus = (progress: number, status: string) => {
    if (status === '延期') return 'exception'
    if (status === '暂停') return 'warning'
    if (progress === 100) return 'success'
    return ''
  }
  </script>
  
  <style scoped>
  .dashboard-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
  }
  
  .dashboard-header {
    margin-bottom: 24px;
    background: linear-gradient(to right, #1976d2, #2196f3);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .dashboard-title {
    font-size: 24px;
    margin: 0;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  .stat-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    margin-bottom: 20px;
    border-radius: 8px;
    transition: all 0.3s;
    overflow: hidden;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  .stat-card.primary .stat-icon {
    color: #409EFF;
  }
  
  .stat-card.success .stat-icon {
    color: #67C23A;
  }
  
  .stat-card.warning .stat-icon {
    color: #E6A23C;
  }
  
  .stat-card.danger .stat-icon {
    color: #F56C6C;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .header-left .el-icon {
    margin-right: 8px;
    font-size: 18px;
  }
  
  .stat-content {
    display: flex;
    align-items: center;
  }
  
  .stat-icon {
    font-size: 48px;
    margin-right: 16px;
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-number {
    font-size: 28px;
    font-weight: bold;
    line-height: 1.2;
    color: #303133;
  }
  
  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }
  
  .system-status {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .monitor-row {
    margin-bottom: 20px;
  }
  
  .monitor-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  }
  
  .chart-container {
    height: 350px;
  }
  
  .alarm-content {
    padding: 8px;
    background-color: #f8f8f8;
    border-radius: 4px;
    margin-bottom: 8px;
  }
  
  :deep(.el-card__header) {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-timeline-item__node) {
    box-shadow: 0 0 0 2px #fff;
  }
  
  :deep(.el-table th) {
    background-color: #f5f7fa !important;
  }
  
  .system-summary {
    margin-bottom: 20px;
  }
  
  .summary-card {
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    transition: all 0.3s;
  }
  
  .summary-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .summary-card.running {
    background-color: rgba(103, 194, 58, 0.1);
    border: 1px solid rgba(103, 194, 58, 0.2);
  }
  
  .summary-card.maintenance {
    background-color: rgba(144, 147, 153, 0.1);
    border: 1px solid rgba(144, 147, 153, 0.2);
  }
  
  .summary-card.warning {
    background-color: rgba(230, 162, 60, 0.1);
    border: 1px solid rgba(230, 162, 60, 0.2);
  }
  
  .summary-card.offline {
    background-color: rgba(245, 108, 108, 0.1);
    border: 1px solid rgba(245, 108, 108, 0.2);
  }
  
  .summary-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border-radius: 50%;
    margin-right: 15px;
  }
  
  .summary-card.running .summary-icon {
    background-color: #67C23A;
    color: white;
  }
  
  .summary-card.maintenance .summary-icon {
    background-color: #909399;
    color: white;
  }
  
  .summary-card.warning .summary-icon {
    background-color: #E6A23C;
    color: white;
  }
  
  .summary-card.offline .summary-icon {
    background-color: #F56C6C;
    color: white;
  }
  
  .summary-info {
    flex: 1;
  }
  
  .summary-title {
    font-size: 14px;
    color: #606266;
    margin-bottom: 5px;
  }
  
  .summary-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
  }
  
  .system-name {
    display: flex;
    align-items: center;
  }
  
  .system-icon {
    margin-right: 8px;
    font-size: 18px;
  }
  
  .icon-public {
    color: #409EFF;
  }
  
  .icon-village {
    color: #67C23A;
  }
  
  .icon-agriculture {
    color: #E6A23C;
  }
  
  .icon-emergency {
    color: #F56C6C;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .sync-time {
    font-size: 13px;
    color: #909399;
  }
  
  .ml-10 {
    margin-left: 10px;
  }
  
  @media (max-width: 768px) {
    .dashboard-container {
      padding: 10px;
    }
    
    .dashboard-header {
      padding: 15px;
    }
    
    .stat-icon {
      font-size: 36px;
      margin-right: 12px;
    }
    
    .stat-number {
      font-size: 22px;
    }
    
    .chart-container {
      height: 280px;
    }
  }

  /* 网格化管理样式 */
  .grid-management {
    margin-bottom: 20px;
  }

  .grid-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    padding: 16px;
    margin-bottom: 20px;
    border-top: 3px solid #409EFF;
    height: 100%;
    transition: all 0.3s;
  }

  .grid-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .grid-card.grid-type-1 {
    border-top-color: #409EFF;
  }

  .grid-card.grid-type-2 {
    border-top-color: #67C23A;
  }

  .grid-card.grid-type-3 {
    border-top-color: #E6A23C;
  }

  .grid-card.grid-type-4 {
    border-top-color: #F56C6C;
  }

  .grid-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #EBEEF5;
    margin-bottom: 12px;
  }

  .grid-name {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
  }

  .grid-content {
    margin-bottom: 15px;
  }

  .grid-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .grid-row .label {
    color: #909399;
  }

  .grid-row .value {
    color: #606266;
    font-weight: 500;
  }

  /* 重点项目进展样式 */
  .projects-progress {
    margin-bottom: 20px;
  }

  .update-time {
    margin-right: 10px;
    color: #909399;
    font-size: 13px;
  }
  </style>

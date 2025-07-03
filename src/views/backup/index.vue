<template>
  <div class="backup-container">
    <!-- 顶部统计卡片（新版） -->
    <el-row :gutter="20" class="backup-stats">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card total">
          <div class="card-content">
            <div class="icon-block"><el-icon><DocumentCopy /></el-icon></div>
            <div class="stat-content">
              <div class="stat-title">总任务数</div>
              <div class="stat-value">{{ stat.total }}</div>
              <div class="stat-trend up">
                <el-icon><Top /></el-icon>
                较上月增长 5%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card running">
          <div class="card-content">
            <div class="icon-block"><el-icon><Loading /></el-icon></div>
            <div class="stat-content">
              <div class="stat-title">运行中</div>
              <div class="stat-value">{{ stat.running }}</div>
              <div class="stat-trend up">
                <el-icon><Top /></el-icon>
                预计 {{ getEstimatedTime() }} 完成
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card completed">
          <div class="card-content">
            <div class="icon-block"><el-icon><CircleCheck /></el-icon></div>
            <div class="stat-content">
              <div class="stat-title">已完成</div>
              <div class="stat-value">{{ stat.completed }}</div>
              <div class="stat-trend up">
                <el-icon><Top /></el-icon>
                完成率 {{ getCompletionRate() }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card failed">
          <div class="card-content">
            <div class="icon-block"><el-icon><CircleClose /></el-icon></div>
            <div class="stat-content">
              <div class="stat-title">失败</div>
              <div class="stat-value">{{ stat.failed }}</div>
              <div class="stat-trend down">
                <el-icon><Bottom /></el-icon>
                失败率 {{ getFailureRate() }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 存储容量摘要 -->
    <el-card shadow="hover" class="storage-summary">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><DataLine /></el-icon>
            <span>存储容量摘要</span>
          </div>
          <el-button type="primary" size="small" @click="refreshStorageInfo">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="storage-item">
            <div class="storage-title">总容量</div>
            <div class="storage-value">{{ storageInfo.total }}TB</div>
            <el-progress :percentage="100" status="success" :format="() => storageInfo.total + 'TB'" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="storage-item">
            <div class="storage-title">已用空间</div>
            <div class="storage-value">{{ storageInfo.used }}TB</div>
            <el-progress 
              :percentage="getUsedPercentage()" 
              :status="getUsedPercentage() > 80 ? 'exception' : getUsedPercentage() > 60 ? 'warning' : 'success'"
              :format="() => storageInfo.used + 'TB (' + getUsedPercentage() + '%)'" 
            />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8">
          <div class="storage-item">
            <div class="storage-title">可用空间</div>
            <div class="storage-value">{{ storageInfo.available }}TB</div>
            <el-progress 
              :percentage="getFreePercentage()" 
              :status="getFreePercentage() < 20 ? 'exception' : getFreePercentage() < 40 ? 'warning' : 'success'"
              :format="() => storageInfo.available + 'TB (' + getFreePercentage() + '%)'" 
            />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 搜索和操作栏 -->
    <div class="operation-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input v-model="searchForm.keyword" placeholder="任务名称/负责人/目标路径" clearable @keyup.enter="handleSearch">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.type" placeholder="备份类型" clearable>
            <el-option label="全量备份" value="full" />
            <el-option label="增量备份" value="incremental" />
            <el-option label="差异备份" value="differential" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="运行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="等待中" value="waiting" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><RefreshLeft /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新建备份任务
        </el-button>
        <el-button type="success" @click="exportBackupData">
          <el-icon><Download /></el-icon>导出报表
        </el-button>
      </div>
    </div>

    <!-- 备份任务列表 -->
    <el-card class="backup-list" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><List /></el-icon>
            <span>备份任务列表</span>
          </div>
          <div class="list-actions">
            <el-button type="warning" size="small" @click="handleBatchStop" :disabled="!hasRunningSelection">
              <el-icon><VideoPlay /></el-icon>停止所选
            </el-button>
            <el-button type="danger" size="small" @click="handleBatchDelete" :disabled="!hasSelection">
              <el-icon><Delete /></el-icon>删除所选
            </el-button>
          </div>
        </div>
      </template>
      <el-table 
        :data="backupList" 
        border 
        stripe
        highlight-current-row
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="name" label="任务名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="owner" label="负责人" min-width="100" />
        <el-table-column prop="type" label="类型" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'full' ? 'primary' : row.type === 'incremental' ? 'success' : 'warning'">
              {{ row.type === 'full' ? '全量备份' : row.type === 'incremental' ? '增量备份' : '差异备份' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="120">
          <template #default="{ row }">
            <div class="status-cell">
              <el-tag :type="row.status === 'running' ? 'primary' : row.status === 'completed' ? 'success' : row.status === 'failed' ? 'danger' : 'info'">
                {{ row.status === 'running' ? '运行中' : row.status === 'completed' ? '已完成' : row.status === 'failed' ? '失败' : '等待中' }}
              </el-tag>
              <div v-if="row.status === 'running'" class="progress-bar">
                <el-progress :percentage="row.progress" :stroke-width="5" />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="lastRunTime" label="备份时间" min-width="160" sortable />
        <el-table-column prop="schedule" label="执行计划" min-width="120">
          <template #default="{ row }">
            <div class="schedule-tag">
              <el-tag type="info" effect="plain">
                {{ row.schedule === 'daily' ? '每天' : row.schedule === 'weekly' ? '每周' : row.schedule === 'monthly' ? '每月' : '自定义' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-tooltip content="执行备份" placement="top">
                <el-button type="primary" size="small" circle :icon="VideoPlay" @click="handleRun(row)" :disabled="row.status === 'running'"></el-button>
              </el-tooltip>
              <el-tooltip content="查看日志" placement="top">
                <el-button type="info" size="small" circle :icon="Document" @click="viewLogs(row)"></el-button>
              </el-tooltip>
              <el-tooltip content="编辑任务" placement="top">
                <el-button type="warning" size="small" circle :icon="Edit" @click="handleEdit(row)"></el-button>
              </el-tooltip>
              <el-tooltip content="删除任务" placement="top">
                <el-button type="danger" size="small" circle :icon="Delete" @click="handleDelete(row)"></el-button>
              </el-tooltip>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 备份任务表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新建备份任务' : '编辑备份任务'" width="600px">
      <el-form ref="backupFormRef" :model="backupForm" :rules="backupRules" label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="backupForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="backupForm.owner" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="backupForm.type" placeholder="请选择备份类型" style="width: 100%">
            <el-option label="全量备份" value="full" />
            <el-option label="增量备份" value="incremental" />
            <el-option label="差异备份" value="differential" />
          </el-select>
        </el-form-item>
        <el-form-item label="源路径" prop="source">
          <el-input v-model="backupForm.source" placeholder="请输入源路径" />
        </el-form-item>
        <el-form-item label="目标路径" prop="target">
          <el-input v-model="backupForm.target" placeholder="请输入目标路径" />
        </el-form-item>
        <el-form-item label="执行计划" prop="schedule">
          <el-select v-model="backupForm.schedule" placeholder="请选择执行计划" style="width: 100%">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="backupForm.schedule === 'custom'" label="自定义时间" prop="customTime">
          <el-time-picker v-model="backupForm.customTime" format="HH:mm" placeholder="选择时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="backupForm.desc" type="textarea" rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看日志对话框 -->
    <el-dialog v-model="logDialogVisible" title="备份任务日志" width="800px">
      <div class="log-header">
        <div class="log-info">
          <div class="log-task-name">{{ currentLog.taskName }}</div>
          <div class="log-task-time">{{ currentLog.lastRunTime }}</div>
        </div>
        <el-tag :type="currentLog.status === 'completed' ? 'success' : currentLog.status === 'failed' ? 'danger' : 'primary'">
          {{ currentLog.status === 'completed' ? '成功' : currentLog.status === 'failed' ? '失败' : '运行中' }}
        </el-tag>
      </div>
      <div class="log-content">
        <div v-for="(log, index) in currentLog.logs" :key="index" class="log-item" :class="{ 'log-error': log.type === 'error', 'log-warning': log.type === 'warning', 'log-info': log.type === 'info' }">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type" :class="{ 'error-type': log.type === 'error', 'warning-type': log.type === 'warning', 'info-type': log.type === 'info' }">
            [{{ log.type.toUpperCase() }}]
          </span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="logDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownloadLogs">
          <el-icon><Download /></el-icon>下载日志
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { 
  DocumentCopy, 
  Loading, 
  CircleCheck, 
  CircleClose, 
  Top, 
  Bottom, 
  DataLine, 
  Refresh, 
  Search,
  RefreshLeft,
  Plus,
  Download,
  List,
  VideoPlay,
  Delete,
  Document,
  Edit
} from '@element-plus/icons-vue'

interface BackupItem {
  id: number;
  name: string;
  owner: string;
  type: 'full' | 'incremental' | 'differential';
  source: string;
  target: string;
  schedule: string;
  status: 'running' | 'completed' | 'failed' | 'waiting';
  progress: number;
  lastRunTime: string;
  desc: string;
  customTime?: string;
}

interface LogItem {
  time: string;
  type: 'info' | 'warning' | 'error';
  message: string;
}

interface LogData {
  taskName: string;
  status: 'completed' | 'failed' | 'running';
  lastRunTime: string;
  logs: LogItem[];
}

// 统计数据
const stat = reactive({
  total: 5,
  running: 1,
  completed: 3,
  failed: 1
})

// 存储信息
const storageInfo = reactive({
  total: 20,
  used: 9.5,
  available: 10.5
})

// 备份列表数据
const originalBackupList = ref<BackupItem[]>([
  { id: 1, name: '政务服务数据全量备份', owner: '王晓强', type: 'full', source: '/gov/data', target: '/backup/gov/full', schedule: 'daily', status: 'completed', progress: 100, lastRunTime: '2025-06-01 02:00', desc: '每日凌晨全量备份政务服务平台数据' },
  { id: 2, name: '村务管理系统增量备份', owner: '李文娜', type: 'incremental', source: '/village/manage', target: '/backup/village/incremental', schedule: 'weekly', status: 'running', progress: 45, lastRunTime: '2025-06-03 03:00', desc: '村务管理系统每周增量备份' },
  { id: 3, name: '农业信息化平台差异备份', owner: '刘志洋', type: 'differential', source: '/agri/platform', target: '/backup/agri/diff', schedule: 'monthly', status: 'failed', progress: 60, lastRunTime: '2025-06-05 04:00', desc: '农业信息化平台每月差异备份' },
  { id: 4, name: '应急指挥系统全量备份', owner: '张丽敏', type: 'full', source: '/emergency/command', target: '/backup/emergency/full', schedule: 'daily', status: 'waiting', progress: 0, lastRunTime: '2025-06-07 02:00', desc: '应急指挥系统每日全量备份' },
  { id: 5, name: '网格化管理平台增量备份', owner: '赵明', type: 'incremental', source: '/grid/manage', target: '/backup/grid/incremental', schedule: 'weekly', status: 'completed', progress: 100, lastRunTime: '2025-06-09 03:00', desc: '网格化管理平台每周增量备份' },
  { id: 6, name: '镇村资产数据全量备份', owner: '宋倩', type: 'full', source: '/asset/town', target: '/backup/asset/full', schedule: 'monthly', status: 'completed', progress: 100, lastRunTime: '2025-06-11 01:30', desc: '镇村资产数据每月全量备份' },
  { id: 7, name: '农业生产数据差异备份', owner: '周伟', type: 'differential', source: '/agri/production', target: '/backup/agri/production/diff', schedule: 'weekly', status: 'running', progress: 70, lastRunTime: '2025-06-13 04:30', desc: '农业生产数据每周差异备份' },
  { id: 8, name: '硬件资源管理平台增量备份', owner: '刘强', type: 'incremental', source: '/hardware/resource', target: '/backup/hardware/incremental', schedule: 'daily', status: 'completed', progress: 100, lastRunTime: '2025-06-15 02:30', desc: '硬件资源管理平台每日增量备份' },
  { id: 9, name: '数据服务平台全量备份', owner: '冯媛', type: 'full', source: '/data/service', target: '/backup/data/full', schedule: 'monthly', status: 'failed', progress: 20, lastRunTime: '2025-06-17 05:00', desc: '数据服务平台每月全量备份' },
  { id: 10, name: '应急预案文档差异备份', owner: '许静', type: 'differential', source: '/emergency/plans', target: '/backup/emergency/plans/diff', schedule: 'weekly', status: 'completed', progress: 100, lastRunTime: '2025-06-19 03:30', desc: '应急预案文档每周差异备份' }
])

const backupList = ref<BackupItem[]>([])
const loading = ref(false)

// 选中项
const selectedItems = ref<BackupItem[]>([])
const hasSelection = computed(() => selectedItems.value.length > 0)
const hasRunningSelection = computed(() => selectedItems.value.some(item => item.status === 'running'))

// 处理选择变更
const handleSelectionChange = (items: BackupItem[]) => {
  selectedItems.value = items
}

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const backupFormRef = ref<FormInstance>()
const backupForm = reactive<BackupItem>({
  id: 0,
  name: '',
  owner: '',
  type: 'full',
  source: '',
  target: '',
  schedule: 'daily',
  status: 'waiting',
  progress: 0,
  lastRunTime: '',
  desc: ''
})

// 添加表单校验规则
const backupRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  owner: [
    { required: true, message: '请输入负责人', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择备份类型', trigger: 'change' }
  ],
  source: [
    { required: true, message: '请输入源路径', trigger: 'blur' }
  ],
  target: [
    { required: true, message: '请输入目标路径', trigger: 'blur' }
  ],
  schedule: [
    { required: true, message: '请选择执行计划', trigger: 'change' }
  ]
}

// 日志对话框
const logDialogVisible = ref(false)
const currentLog = reactive<LogData>({
  taskName: '',
  status: 'completed',
  lastRunTime: '',
  logs: []
})

// 计算统计数据
const getCompletionRate = () => {
  return stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
}

const getFailureRate = () => {
  return stat.total > 0 ? Math.round((stat.failed / stat.total) * 100) : 0
}

const getEstimatedTime = () => {
  return '30分钟'
}

// 计算存储百分比
const getUsedPercentage = () => {
  return Math.round((storageInfo.used / storageInfo.total) * 100)
}

const getFreePercentage = () => {
  return Math.round((storageInfo.available / storageInfo.total) * 100)
}

// 刷新存储信息
const refreshStorageInfo = () => {
  // 实际应用中这里会调用API获取最新存储信息
  ElMessage.success('存储信息已刷新')
}

// 处理搜索
const handleSearch = () => {
  loading.value = true
  // 模拟API请求延迟
  setTimeout(() => {
    backupList.value = originalBackupList.value.filter(item => {
      const matchKeyword = !searchForm.keyword || 
        item.name.includes(searchForm.keyword) || 
        item.owner.includes(searchForm.keyword) || 
        item.target.includes(searchForm.keyword)
      
      const matchType = !searchForm.type || item.type === searchForm.type
      const matchStatus = !searchForm.status || item.status === searchForm.status
      
      return matchKeyword && matchType && matchStatus
    })
    total.value = backupList.value.length
    loading.value = false
  }, 500)
}

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

// 导出备份数据
const exportBackupData = () => {
  ElMessage.success('备份任务报表已导出')
}

// 批量操作
const handleBatchStop = () => {
  ElMessageBox.confirm('确定要停止所选的运行中任务吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已停止所选任务')
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm('确定要删除所选任务吗? 此操作不可恢复!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已删除所选任务')
  }).catch(() => {})
}

// 查看日志
const viewLogs = (row: BackupItem) => {
  currentLog.taskName = row.name
  currentLog.status = row.status as 'completed' | 'failed' | 'running'
  currentLog.lastRunTime = row.lastRunTime
  
  // 模拟日志数据
  currentLog.logs = [
    { time: '08:00:01', type: 'info', message: '开始备份任务: ' + row.name },
    { time: '08:00:05', type: 'info', message: '正在扫描源文件: ' + row.source },
    { time: '08:01:30', type: 'info', message: '已扫描文件数: 1205' },
    { time: '08:02:45', type: 'warning', message: '部分文件访问受限，已跳过' },
    { time: '08:05:10', type: 'info', message: '正在传输数据至目标位置: ' + row.target },
    { time: '08:12:35', type: 'info', message: '数据传输完成' }
  ]
  
  if (row.status === 'failed') {
    currentLog.logs.push({ time: '08:13:02', type: 'error', message: '校验失败: 目标空间不足' })
    currentLog.logs.push({ time: '08:13:10', type: 'error', message: '备份任务失败' })
  } else if (row.status === 'completed') {
    currentLog.logs.push({ time: '08:13:05', type: 'info', message: '备份数据校验成功' })
    currentLog.logs.push({ time: '08:13:30', type: 'info', message: '备份任务完成' })
  }
  
  logDialogVisible.value = true
}

// 运行任务
const handleRun = (row: BackupItem) => {
  ElMessageBox.confirm(`确定要执行备份任务"${row.name}"吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('备份任务已启动')
    // 在实际应用中，这里会调用API启动备份任务
  }).catch(() => {})
}

// 新增备份任务
const handleAdd = () => {
  dialogType.value = 'add'
  backupForm.id = 0
  backupForm.name = ''
  backupForm.owner = ''
  backupForm.type = 'full'
  backupForm.source = ''
  backupForm.target = ''
  backupForm.schedule = 'daily'
  backupForm.status = 'waiting'
  backupForm.progress = 0
  backupForm.lastRunTime = ''
  backupForm.desc = ''
  backupForm.customTime = ''
  
  dialogVisible.value = true
}

// 编辑备份任务
const handleEdit = (row: BackupItem) => {
  dialogType.value = 'edit'
  backupForm.id = row.id
  backupForm.name = row.name
  backupForm.owner = row.owner
  backupForm.type = row.type
  backupForm.source = row.source || ''
  backupForm.target = row.target || ''
  backupForm.schedule = row.schedule
  backupForm.status = row.status
  backupForm.progress = row.progress
  backupForm.lastRunTime = row.lastRunTime
  backupForm.desc = row.desc || ''
  backupForm.customTime = row.customTime || ''
  
  dialogVisible.value = true
}

// 删除备份任务
const handleDelete = (row: BackupItem) => {
  ElMessageBox.confirm(`确定要删除备份任务"${row.name}"吗？此操作不可恢复!`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 在实际应用中，这里会调用API删除备份任务
    const index = originalBackupList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      originalBackupList.value.splice(index, 1)
      handleSearch() // 刷新列表
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 提交表单
const handleSubmit = () => {
  if (!backupFormRef.value) return
  
  backupFormRef.value!.validate((valid: boolean): void => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 在实际应用中，这里会调用API新增备份任务
        const newId = Math.max(...originalBackupList.value.map(item => item.id)) + 1
        const now = new Date()
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        
        const newBackup: BackupItem = {
          id: newId,
          name: backupForm.name,
          owner: backupForm.owner,
          type: backupForm.type,
          source: backupForm.source,
          target: backupForm.target,
          schedule: backupForm.schedule,
          status: 'waiting',
          progress: 0,
          lastRunTime: formattedDate,
          desc: backupForm.desc,
          customTime: backupForm.customTime
        }
        
        originalBackupList.value.push(newBackup)
        ElMessage.success('添加成功')
      } else {
        // 在实际应用中，这里会调用API更新备份任务
        const index = originalBackupList.value.findIndex(item => item.id === backupForm.id)
        if (index !== -1) {
          originalBackupList.value[index] = { ...originalBackupList.value[index], ...backupForm }
          ElMessage.success('更新成功')
        }
      }
      
      dialogVisible.value = false
      handleSearch() // 刷新列表
    } else {
      ElMessage.error('表单验证失败，请检查输入')
    }
  })
}

// 下载日志
const handleDownloadLogs = () => {
  ElMessage.success('日志下载中...')
  // 在实际应用中，这里会调用API下载日志文件
}

// 初始化数据
onMounted(() => {
  backupList.value = [...originalBackupList.value]
  total.value = backupList.value.length
  stat.total = backupList.value.length
  stat.running = backupList.value.filter(item => item.status === 'running').length
  stat.completed = backupList.value.filter(item => item.status === 'completed').length
  stat.failed = backupList.value.filter(item => item.status === 'failed').length
})
</script>

<style scoped>
.backup-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.backup-stats {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  padding: 10px;
  align-items: center;
}

.icon-block {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 15px;
}

.total .icon-block {
  background-color: #ecf5ff;
  color: #409EFF;
}

.running .icon-block {
  background-color: #f0f9eb;
  color: #67C23A;
}

.completed .icon-block {
  background-color: #f0f9eb;
  color: #67C23A;
}

.failed .icon-block {
  background-color: #fef0f0;
  color: #F56C6C;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.stat-trend .el-icon {
  margin-right: 4px;
}

.storage-summary {
  margin-bottom: 20px;
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

.storage-item {
  padding: 15px;
  margin-bottom: 10px;
}

.storage-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.storage-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.backup-list {
  margin-bottom: 20px;
}

.list-actions {
  display: flex;
  gap: 10px;
}

.status-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.progress-bar {
  width: 100%;
  margin-top: 5px;
}

.schedule-tag {
  display: inline-block;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 日志查看样式 */
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.log-info {
  display: flex;
  flex-direction: column;
}

.log-task-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.log-task-time {
  font-size: 14px;
  color: #909399;
}

.log-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
}

.log-item {
  padding: 5px 0;
  border-bottom: 1px dashed #ebeef5;
}

.log-time {
  display: inline-block;
  width: 80px;
  color: #909399;
}

.log-type {
  display: inline-block;
  width: 70px;
  margin: 0 10px;
}

.error-type {
  color: #F56C6C;
}

.warning-type {
  color: #E6A23C;
}

.info-type {
  color: #909399;
}

.log-message {
  flex: 1;
}

@media (max-width: 768px) {
  .operation-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    margin-top: 10px;
  }
}
</style> 